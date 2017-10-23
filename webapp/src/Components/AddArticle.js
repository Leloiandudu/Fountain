import React from 'react';
import url from './../url'
import readRules, { getRulesReqs, RuleFlags } from './../rules';
import getArticleData from './../getArticleData';
import Api, { UnauthorizedHttpError } from './../Api';
import { getMwApi } from './../MwApi';
import { withTranslation } from './../translate';
import Warnings from './Warnings';
import WikiButton from './WikiButton';
import WikiLink from './WikiLink';
import PageLookup from './PageLookup';
import Loader from './Loader';

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
         await Api.addArticle(this.props.editathon.code, stats.title);
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
         pathname: url(`/editathons/${this.props.editathon.code}`),
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
   renderPickStage() {
      const { translation: { tr }, editathon: { wiki } } = this.props;

      if (!Global.user) {
         this.returnToList();
         return <div />;
      }

      const ctx = {
         user: Global.user,
      };
      const rules = this.getRules().filter(rule => rule.userOnly);
      const error = rules
         .filter(rule => !(rule.flags & RuleFlags.optional))
         .some(rule => !rule.check(null, ctx));

      if (error) {
         return (
            <div>
               <Warnings
                     ctx={ctx}
                     rules={this.getRules().filter(rule => rule.userOnly)}
                     stats={null}
                     wiki={wiki} />
               <div id='buttons'>
                  <WikiButton onClick={this.returnToList}>{this.tr('back')}</WikiButton>
               </div>
            </div>
         );
      }

      return (
         <div>
            <label htmlFor='title'>{this.tr('articleTitle')}</label>
            <Warnings
                  ctx={ctx}
                  rules={this.getRules().filter(rule => rule.userOnly)}
                  stats={null}
                  wiki={wiki} />
            <PageLookup
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
      const title = stats && stats.title || this.state.title;

      const header = <header>
         <WikiLink to={title} wiki={editathon.wiki} red={missing} />
      </header>;

      const addedBy = stats && editathon.articles.filter(a => a.name === stats.title)[0];
      
      const rules = this.getRules().filter(rule => !rule.userOnly);
      const ctx = { user: Global.user };
      const ok = stats && rules.every(rule => (rule.flags & RuleFlags.optional) || rule.check(stats, ctx));

      return (
         <div>
            {this.state.updating ? <Loader /> : (<div>
               {missing ? 
               <div>
                  {header}
                  <div>{this.tr('notFound')}</div>
               </div> 
               :
               <div className='info'>
                  <div className='Warnings'>
                     {header}
                     {addedBy && <div className='stat error'>
                        {addedBy.user === Global.user.name ? this.tr('youAlreadyAdded') : this.tr('someoneAlreadyAdded')}
                     </div>}
                     <Warnings
                           ctx={ctx}
                           rules={rules}
                           stats={stats}
                           title={stats.title}
                           wiki={editathon.wiki} />
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
