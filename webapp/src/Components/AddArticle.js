import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import url from './../url'
import readRules, { getRulesReqs, RuleSeverity } from './../rules';
import getArticleData from './../getArticleData';
import Api, { UnauthorizedHttpError } from './../Api';
import WikiButton from './WikiButton';
import WikiLink from './WikiLink';
import ArticleLookup from './ArticleLookup';
import Loader from './Loader';

const RuleMessages = {
   submitterRegistered: (rule, ok) => !ok && `В этом марафоне могут соревноваться только участники, зарегистрировавшиеся не ранее ${moment(rule.params.after).format('L')}.`,
   namespace: (rule, ok) => `${ ok ? 'Находится' : 'Не находится'} в основном пространстве статей`,
   submitterIsCreator: (rule, ok, stats) => [ 'Автор статьи: ', <WikiLink key='link' to={`U:${stats.creator}`} /> ],
   articleCreated: (rule, ok, stats) => 'Статья создана ' + moment(stats.created).format('L LT'),
   articleSize: (rule, ok, stats) => [
      rule.params.bytes && `${(stats.bytes / 1024).toFixed()} Кб`, 
      rule.params.chars && `${stats.chars} символов`,
   ].filter(x => x).join(', '),
};

export default React.createClass({
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
            stats = await getArticleData(title, [ 'title', 'card', ...what ]);
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
            alert('Вы не авторзиованы.');
         } else {
            alert('Произошла сетевая ошибка, попробуйте снова:\n' + e.message);
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
      return readRules(this.props.editathon.rules, [ RuleSeverity.requirement, RuleSeverity.warning ]);
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
   renderPickStage() {
      if (!Global.user) {
         this.returnToList();
         return <div />;
      }

      const errors = [];
      const ctx = {
         user: Global.user,
      };
      for (const rule of this.getRules().filter(rule => rule.userOnly && rule.severity == RuleSeverity.requirement)) {
         if (!rule.check(null, ctx)) {
            errors.push(rule);
         }
      }

      if (errors.length) {
         return (
            <div>
               {errors.map(error => <div>{RuleMessages[error.type](error, false)}</div>)}
               <div id='buttons'>
                  <WikiButton onClick={this.returnToList}>Назад</WikiButton>
               </div>
            </div>
         );
      }

      return (
         <div>
            <label htmlFor='title'>Название статьи:</label>
            <ArticleLookup
               inputProps={{ id: 'title' }}
               value={this.state.title}
               onChange={title => this.setState({ title })} />
            <div id='buttons'>
               <WikiButton onClick={this.returnToList}>Отмена</WikiButton>
               <WikiButton disabled={!this.state.title.trim()} type='progressive' submit={true} onClick={() => {
                  this.setState({ stage: 'approve', updating: true });
                  this.update();
               }}>Далее</WikiButton>
            </div>
         </div>
      );
   },
   renderApproveStage() {
      const stats = this.state.stats;
      const missing = !stats;

      const title = <h2>
         <WikiLink to={stats && stats.title || this.state.title} red={missing} />
      </h2>;

      const addedBy = stats && this.props.editathon.articles.filter(a => a.name === stats.title)[0];

      const rules = [];
      let ok = !missing;
      if (!this.state.updating && stats) {
         const ctx = {
            user: Global.user,
         };
         for (const rule of this.getRules().filter(rule => !rule.userOnly)) {
            const result = rule.check(stats, ctx);
            rules.push([rule, result]);
            if (rule.severity == RuleSeverity.requirement) {
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
                  <div>Статья не найдена</div>
               </div> 
               :
               <div className='info'>
                  <div className='stats'>
                     {title}
                     {addedBy && this.renderStat('addedBy', `${addedBy.user === Global.user.name ? 'Вы уже добавили' : 'Другой участник уже добавил' } эту статью в марафон`, false, true)}
                     {rules.map(([ rule, result ]) => this.renderStat(
                        rule.type, 
                        RuleMessages[rule.type](rule, result, stats), 
                        result, 
                        rule.severity === RuleSeverity.requirement)
                     )}
                  </div>
                  {this.renderCard()}
               </div>}
            </div>).props.children}
            <div id='buttons'>
               <WikiButton onClick={() => this.setState({ stage: 'pick' })}>Назад</WikiButton>
               <WikiButton loading={this.state.adding} disabled={this.state.updating || !ok || addedBy} type='constructive' submit={true} onClick={this.add}>Добавить</WikiButton>
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
