import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import url from './../url'
import sortBy from './../sortBy'
import readRules, { getRulesReqs, RuleFlags } from './../rules';
import getArticleData from './../getArticleData';
import Api, { UnauthorizedHttpError } from './../Api';
import { getMwApi } from './../MwApi';
import { withTranslation } from './../translate';
import WikiButton from './WikiButton';
import WikiLink from './WikiLink';
import ArticleLookup from './ArticleLookup';
import Loader from './Loader';

const RuleMessages = {
   submitterRegistered: (tr, rule, ok) => !ok && tr('submitterRegistered', rule.params.after),
   namespace: (tr, rule, ok) => tr('namespace', ok),
   submitterIsCreator: (tr, rule, ok, stats, wiki) => [ tr('author'), <WikiLink key='link' to={`User:${stats.creator}`} wiki={wiki} /> ],
   articleCreated: (tr, rule, ok, stats) => tr('articleCreated', moment(stats.created).utc()),
   articleSize: (tr, rule, ok, stats) => [
      rule.params.bytes && tr('bytes', stats.bytes), 
      rule.params.chars && tr('chars', stats.chars),
      rule.params.words && tr('words', stats.words),
   ].filter(x => x).join(tr.translate('delimiter')),
};

const AddArticle = React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         title: '',
         updating: false,
         stage: 'pick',
         card: null,
         adding: false,
      };
   },
   async update() {
      let { title, stats } = this.state;

      try {
         if (!stats || title !== stats.title) {
            const what = getRulesReqs(this.getRules());
            const mwApi = getMwApi(this.props.editathon.wiki);
            stats = await getArticleData(mwApi, title, [ 'title', 'card', ...what ]);
            if (stats)
               title = stats.title;
         }
      } catch(e) {
         console.log('error retrieving article info', e);
         stats = null;
      }

      this.setState({
         updating: false,
         title,
         stats,
      });
   },
   async add() {
      const stats = this.state.stats;
      if (!stats || !stats.title)
         return;

      this.setState({ adding: true });

      try {
         await Api.addArticle(this.props.code, stats.title);
         await this.returnToList();
      } catch(e) {
         this.setState({ adding: false })
         if (e instanceof UnauthorizedHttpError) {
            alert(this.tr('unauthorized'));
         } else {
            alert(this.tr('networkError', e.message));
         }
      }
   },
   async returnToList() {
      this.context.router.replace({
         pathname: url(`/editathons/${this.props.code}`),
      });
      this.props.onReloadEditathon && await this.props.onReloadEditathon();
   },
   getRules() {
      return readRules(this.props.editathon.rules);
   },
   render() {
      return (
         <form className='AddArticle' onSubmit={e => e.preventDefault()}>
            {this.renderStage()}
         </form>
      );
   },
   renderStage() {
      return {
         pick: this.renderPickStage,
         approve: this.renderApproveStage,
      }[this.state.stage]().props.children;
   },
   tr(...args) {
      return this.props.translation.tr(...args)
   },
   ruleTr() {
      const tr = (key, ...args) => this.props.translation.tr('Warnings.' + key, ...args);
      tr.translate = this.props.translation.translate;
      return tr;
   },
   renderPickStage() {
      const { translation: { tr }, editathon: { wiki } } = this.props;

      if (!Global.user) {
         this.returnToList();
         return <div />;
      }

      const errors = [];
      const ctx = {
         user: Global.user,
      };
      for (const rule of this.getRules().filter(rule => rule.userOnly && !(rule.flags & RuleFlags.optional))) {
         if (!rule.check(null, ctx)) {
            errors.push(rule);
         }
      }


      if (errors.length) {
         return (
            <div>
               {errors.map(error => <div>{RuleMessages[error.type](this.ruleTr(), error, false, null, wiki)}</div>)}
               <div id='buttons'>
                  <WikiButton onClick={this.returnToList}>{this.tr('back')}</WikiButton>
               </div>
            </div>
         );
      }

      return (
         <div>
            <label htmlFor='title'>{this.tr('articleTitle')}</label>
            <ArticleLookup
               wiki={wiki}
               inputProps={{ id: 'title' }}
               value={this.state.title}
               onChange={title => this.setState({ title })} />
            <div id='buttons'>
               <WikiButton onClick={this.returnToList}>{this.tr('cancel')}</WikiButton>
               <WikiButton disabled={!this.state.title.trim()} type='progressive' submit={true} onClick={() => {
                  this.setState({ stage: 'approve', updating: true });
                  this.update();
               }}>{this.tr('next')}</WikiButton>
            </div>
         </div>
      );
   },
   renderApproveStage() {
      const { editathon } = this.props;
      const stats = this.state.stats;
      const missing = !stats;

      const title = <h2>
         <WikiLink to={stats && stats.title || this.state.title} wiki={editathon.wiki} red={missing} />
      </h2>;

      const addedBy = stats && editathon.articles.filter(a => a.name === stats.title)[0];

      const rules = [];
      let ok = !missing;
      if (!this.state.updating && stats) {
         const ctx = {
            user: Global.user,
         };
         for (const rule of this.getRules().filter(rule => !rule.userOnly)) {
            const result = rule.check(stats, ctx);
            rules.push([rule, result]);
            if (!(rule.flags & RuleFlags.optional)) {
               ok = ok && result;
            }
         }
      }

      return (
         <div>
            {this.state.updating ? <Loader /> : (<div>
               {missing ? 
               <div>
                  {title}
                  <div>{this.tr('notFound')}</div>
               </div> 
               :
               <div className='info'>
                  <div className='stats'>
                     {title}
                     {addedBy && this.renderStat('addedBy', addedBy.user === Global.user.name ? this.tr('youAlreadyAdded') : this.tr('someoneAlreadyAdded'), false, true)}
                     {[...rules].sort(sortBy( // sorting by result (error, warning, ok), then by type
                        ([ rule, result ]) => result, 
                        ([ rule, result ]) => result || (rule.flags & RuleFlags.optional),
                        ([ rule, result ]) => rule.type
                     )).map(([ rule, result ], i) => this.renderStat(
                        i, 
                        RuleMessages[rule.type](this.ruleTr(), rule, result, stats, editathon.wiki), 
                        result, 
                        !(rule.flags & RuleFlags.optional))
                     )}
                  </div>
                  {this.renderCard()}
               </div>}
            </div>).props.children}
            <div id='buttons'>
               <WikiButton onClick={() => this.setState({ stage: 'pick' })}>{this.tr('back')}</WikiButton>
               <WikiButton loading={this.state.adding} disabled={this.state.updating || !ok || addedBy} type='constructive' submit={true} onClick={this.add}>{this.tr('add')}</WikiButton>
            </div>
         </div>
      );
   },
   renderStat(key, name, isOk, isCritical) {
      return <div key={key} className={classNames({ stat: true, error: !isOk && isCritical, warning: !isOk && !isCritical })}>{name}</div>
   },
   renderCard() {
      if (!this.state.stats)
         return null;
      const { extract, thumbnail } = this.state.stats.card;
      return (
         <div className='card'>
            <div className='content'>
               <div className='thumbnail'>
                  {thumbnail && <img src={thumbnail.source} />}
               </div>
               <div className='extract'>{extract}</div>
            </div>
         </div>
      );
   },
});

export default withTranslation(AddArticle, 'AddArticle');
