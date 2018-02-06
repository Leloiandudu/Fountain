import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { setDefault } from '../utils';
import DatePicker from '../DatePicker';
import DropDown from '../DropDown';
import DropDownButton from '../DropDownButton';
import Loader from '../Loader';
import PageLookup from '../PageLookup';
import UserLookup from '../UserLookup';
import Warnings from '../Warnings';
import JuryWarnings from '../Jury/Warnings';
import WikiButton from '../WikiButton';
import WikiLink from '../WikiLink';
import readRules, { getRulesReqs, RuleFlags } from '../../rules';
import getArticleData from '../../getArticleData';
import { getMwApi } from '../../MwApi';
import { withTranslation } from '../../translate';

function setDefaultParams(component, params) {
   const cwm = component.componentWillMount;
   component.componentWillMount = function componentWillMount(...args) {
      if (cwm) {
         cwm.apply(component, args);
      }
      if (Object.keys(component.props.params).length === 0 && component.props.onChange) {
         component.props.onChange({ ...params });
      }
   }
}

class ArticleSizeRule extends React.Component {
   constructor(props) {
      super(props);
      setDefaultParams(this, {
         bytes: { atLeast: '' }
      });
   }

   add(type) {
      const params = { ...this.props.params };
      params[type] = { atLeast: '' };
      this.props.onChange(params);
   }

   changeType(oldType, newType) {
      const { params } = this.props;
      const newParams = {};
      for (const type in params) {
         newParams[type === oldType ? newType : type] = params[type];
      }
      this.props.onChange(newParams);
   }

   changeOp(type, op) {
      const params = { ...this.props.params };
      const param = params[type];
      const value = Object.values(param)[0];
      params[type] = { [op]: value };
      this.props.onChange(params);
   }

   changeValue(type, value) {
      const params = { ...this.props.params };
      const param = params[type];
      const op = Object.keys(param)[0];
      params[type] = { [op]: value };
      this.props.onChange(params);
   }

   remove(type) {
      const params = { ...this.props.params };
      delete params[type];
      this.props.onChange(params);
   }

   renderParam(params, type) {
      const { translation: { tr } } = this.props;
      const param = params[type];
      const op = Object.keys(param)[0];
      return <div className='item' key={type}>
         <DropDown
               items={[ 'atLeast'/* , 'atMost' */ ]}
               renderItem={i => tr(i)}
               value={op}
               getValue={x => x}
               onChange={o => this.changeOp(type, o)}/>
         <input
               className='value'
               value={param[op]}
               onChange={e => this.changeValue(type, e.target.value)} />
         <DropDown
               items={[ 'bytes', 'words', 'chars' ]}
               renderItem={i => tr(i)}
               value={type}
               getValue={x => x}
               onChange={t => this.changeType(type, t)} />
         {Object.keys(params).length > 1 &&
            <WikiButton className='delete' onClick={() => this.remove(type)} />}
      </div>;
   }

   render() {
      const { params } = this.props;
      const { translation: { tr } } = this.props;
      const available = [ 'bytes', 'chars', 'words' ]
         .filter(t => Object.keys(params).indexOf(t) === -1);

      return <div className='ArticleSizeRule'>
         {Object.keys(params).map((type, i) => [
            i === 0 ? null : <span className='or'>{tr('or')}</span>,
            this.renderParam(params, type),
         ])}
         {available.length > 0 &&
            <DropDownButton className='add'
                            items={available}
                            renderItem={t => tr(t)}
                            onClick={t => this.add(t)}>
               {tr('add')}
            </DropDownButton>
         }
      </div>;
   }
}

ArticleSizeRule = withTranslation(ArticleSizeRule, 'EditathonConfig.RulesPage.articleSize');

function createSimple(defaultParams) {
   return class SimpleRule extends React.Component {
      constructor(props) {
         super(props);
         defaultParams && setDefaultParams(this, defaultParams);
      }

      render() {
         const { translation: { tr } } = this.props;
         return <div className='SimpleRule'>
            {tr('description')}
         </div>;
      }
   }
}

let SubmitterIsCreatorRule = withTranslation(createSimple(), 'EditathonConfig.RulesPage.submitterIsCreator');
let NamespaceRule = withTranslation(createSimple({ isIn: [ 0 ] }), 'EditathonConfig.RulesPage.namespace');

class ArticleCreatedRule extends React.Component {
   changeNotBefore(value) {
      const params = { ...this.props.params };
      if (value) {
         params.after = toUtc(value);
      } else {
         delete params.after;
      }
      this.props.onChange(params);
   }

   changeNotAfter(value) {
      const params = { ...this.props.params };
      if (value) {
         params.before = toUtc(moment(value).add(1, 'day'));
      } else {
         delete params.before;
      }

      this.props.onChange(params);
   }

   render() {
      const { before, after } = this.props.params;
      const { translation: { tr } } = this.props;
      return <div className='ArticleCreatedRule'>
         <div className='item'>
            <label htmlFor='notBefore'>{tr('notBefore')}</label>
            <DatePicker
                  id='notBefore'
                  value={toLocal(after)}
                  allowEmpty={true}
                  onChange={v => this.changeNotBefore(v)} />
         </div>
         <div className='item'>
            <label htmlFor='notAfter'>{tr('notAfter')}</label>
            <DatePicker
                  id='notAfter'
                  value={before ? toLocal(moment(before).add(-1, 'day')) : before}
                  allowEmpty={true}
                  onChange={v => this.changeNotAfter(v)} />
         </div>
      </div>;
   }
}

ArticleCreatedRule = withTranslation(ArticleCreatedRule, 'EditathonConfig.RulesPage.articleCreated');

class SubmitterRegisteredRule extends React.Component {
   changeNotBefore(value) {
      const params = { ...this.props.params };
      if (value) {
         params.after = toUtc(value);
      } else {
         delete params.after;
      }
      this.props.onChange(params);
   }

   render() {
      const { after } = this.props.params;
      const { translation: { tr } } = this.props;
      return <div className='SubmitterRegisteredRule'>
         <div className='item'>
            <label htmlFor='notBefore'>{tr('notBefore')}</label>
            <DatePicker
                  id='notBefore'
                  value={toLocal(after)}
                  allowEmpty={true}
                  onChange={v => this.changeNotBefore(v)} />
         </div>
      </div>;
   }
}

SubmitterRegisteredRule = withTranslation(SubmitterRegisteredRule, 'EditathonConfig.RulesPage.submitterRegistered');

function toUtc(date) {
   if (!date) return date;
   date = moment(date).startOf('day');
   return moment.utc([ date.year(), date.month(), date.date() ]).toDate();
}

function toLocal(date) {
   if (!date) return date;
   date = moment(date).startOf('day');
   return moment([ date.year(), date.month(), date.date() ]).toDate();
}

function multi(component) {
   component.allowMulti = true;
   return component;
}

function noJury(component) {
   component.noJury = true;
   return component;
}

const Editors = {
   namespace: noJury(NamespaceRule),
   articleSize: multi(ArticleSizeRule),
   articleCreated: ArticleCreatedRule,
   submitterIsCreator: SubmitterIsCreatorRule,
   submitterRegistered: noJury(SubmitterRegisteredRule),
}

class RulesDemo extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         title: '',
         titleText: '',
         user: Global.user.name,
         userText: Global.user.name,
         stats: null,
         ctx: null,
         updating: false,
      };
   }

   componentWillReceiveProps({ rules }) {
      const { title } = this.state;
      if (!title) return;

      this.update(title, rules);
   }

   getReqs(rules) {
      return getRulesReqs(readRules(rules));
   }

   async update(title, rules) {
      // check if update is required
      const newReqs = this.getReqs(rules);
      if (this.state.stats && title.trim() === this.state.title.trim()) {
         const oldReqs = this.getReqs(this.props.rules);
         if (newReqs.every(r => oldReqs.indexOf(r) !== -1)) {
            return;
         }
      }

      // update
      let stats;
      this.setState({ updating: true, stats: null, title });

      try {
         const mwApi = getMwApi(this.props.wiki);
         this._title = title;
         stats = await getArticleData(mwApi, title, [ 'title', ...newReqs ]);
         if (this._title !== title) return;
      } catch(e) {
         console.log('error retrieving article info', e);
         stats = null;
      }

      this.setState({ updating: false, stats });
   }

   async updateCtx(user) {
      if (this.state.ctx && user.trim() === this.state.user.trim()) {
         return;
      }

      let ctx;
      this.setState({ updatingCtx: true, ctx: null, user });

      try {
         const mwApi = getMwApi(this.props.wiki);
         this._user = user;

         const regDate = await mwApi.getUserRegDate(user);
         ctx = { user: { name: user, registered: regDate } };
         if (this._user !== user) return;
      } catch(e) {
         console.log('error retrieving ctx info', e);
         ctx = null;
      }

      this.setState({ updatingCtx: false, ctx });
   }

   refresh() {
      const { titleText, userText } = this.state;
      if (!titleText) {
         this.setState({ title: '' });
         return;
      } else if (!userText) {
         this.setState({ user: '' });
         return;
      }

      const { rules } = this.props;
      this.update(titleText, rules);
      this.updateCtx(userText);
   }

   render() {
      const { wiki, translation: { tr } } = this.props;
      const { userText, titleText, title, user, updating, updatingCtx, stats, ctx } = this.state;
      const rules = readRules(this.props.rules);

      let inner = null;
      if (title && user) {
         if (updating || updatingCtx) {
            inner = <Loader />
         } else {
            const realTitle = stats ? stats.title : title;
            inner = (<div>
               <header>{tr('forUser')}</header>
               <WikiLink to={realTitle} wiki={wiki} red={!stats} />
               {stats && ctx && <Warnings
                     ctx={ctx}
                     rules={rules}
                     stats={stats}
                     title={title}
                     wiki={wiki} />}
               {stats && ctx && <header>{tr('forJury')}</header>}
               {stats && ctx && <div className='Jury'>
                  <JuryWarnings
                     info={stats}
                     rules={rules.filter(r => r.flags & RuleFlags.informational)}
                     article={{
                        user: ctx.user.name,
                        name: realTitle,
                     }}
                     wiki={wiki} />
               </div>}
            </div>).props.children;
         }
      }

      return <form className='RulesDemo' onSubmit={e => e.preventDefault()}>
         <header>{tr('preview')}</header>
         <table className='lookup'>
            <tbody>
               <tr>
                  <td>
                     <label htmlFor='title'>{tr('user')}</label>
                  </td>
                  <td>
                     <UserLookup
                        inputProps={{ id: 'title' }}
                        wiki={wiki}
                        value={userText}
                        onChange={userText => this.setState({ userText })} />
                  </td>
               </tr>
               <tr>
                  <td>
                     <label htmlFor='title'>{tr('article')}</label>
                  </td>
                  <td>
                     <PageLookup
                        inputProps={{ id: 'title' }}
                        wiki={wiki}
                        value={titleText}
                        onChange={titleText => this.setState({ titleText })} />
                  </td>
               </tr>
            </tbody>
         </table>
         <WikiButton className='show' submit={true} onClick={() => this.refresh()}>
            {tr('show')}
         </WikiButton>
         {inner}
      </form>;
   }
}

RulesDemo = withTranslation(RulesDemo, 'EditathonConfig.RulesPage.RulesDemo');

function getDefaultData() {
   return [{
      type: 'namespace',
      params: {},
      flags: 0,
   }];
}

class RulesPage extends React.Component {
   componentWillMount() {
      setDefault(this.props, 'rules', getDefaultData);
   }

   addRule(type) {
      const { value, onChange } = this.props;
      const rules = [ ...value.rules ];
      rules.push({
         type,
         params: {},
         flags: Editors[type].noJury ? 0 : RuleFlags.informational,
      });
      value.rules = rules;
      onChange(value);
   }

   deleteRule(rule) {
      this.replaceRule(rule);
   }

   changeFlag(rule, flag, value) {
      const flags = value
         ? rule.flags | flag
         : rule.flags & ~flag;
      this.replaceRule(rule, { ...rule, flags })
   }

   onParamsChanged(rule, params) {
      this.replaceRule(rule, { ...rule, params });
   }

   replaceRule(rule, newRule) {
      const { value, onChange } = this.props;
      const rules = [ ...value.rules ];
      const index = rules.indexOf(rule);
      if (index !== -1) {
         if (newRule === undefined) {
            rules.splice(index, 1);
         } else {
            rules.splice(index, 1, newRule);
         }
      }
      value.rules = rules;
      onChange(value);
   }

   render() {
      const { translation: { tr } } = this.props;
      const { rules = [] } = this.props.value;
      const available = Object.keys(Editors)
         .filter(t => Editors[t].allowMulti || rules.every(r => r.type !== t));

      return <div className='page RulesPage'>
         {rules.map((r, i) => <div className='rule' key={i}>
            <header>
               <span>{tr(r.type + '.title')}</span>
               <label>
                  <input
                        type='checkbox'
                        checked={r.flags & RuleFlags.optional}
                        onChange={e => this.changeFlag(r, RuleFlags.optional, e.target.checked)} />
                  {tr('optional')}
               </label>
               {!Editors[r.type].noJury && <label>
                  <input
                        type='checkbox'
                        checked={r.flags & RuleFlags.informational}
                        onChange={e => this.changeFlag(r, RuleFlags.informational, e.target.checked)} />
                  {tr('informational')}
               </label>}
               <WikiButton className='delete' onClick={() => this.deleteRule(r)} />
            </header>
            {Editors[r.type] && React.createElement(Editors[r.type], {
               params: r.params,
               onChange: params => this.onParamsChanged(r, params),
            })}
         </div>)}
         <DropDownButton className='add'
                         items={available}
                         renderItem={t => tr(t + '.title')}
                         onClick={t => this.addRule(t)}>
            {tr('add')}
         </DropDownButton>
         <RulesDemo wiki={this.props.value.wiki} rules={rules} />
      </div>;
   }
}

export default withTranslation(RulesPage, 'EditathonConfig.RulesPage');
