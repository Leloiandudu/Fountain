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
import UserLookup from './UserLookup';
import Loader from './Loader';

const AddArticle = React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         title: '',
         user: Global.user && Global.user.name,
         regDate: Global.user && Global.user.registered,
         updating: false,
         stage: null,
         card: null,
         adding: false,
         error: false,
      };
   },
   componentWillMount() {
      if (!Global.user) {
         return this.returnToList();
      }

      const isJury = this.props.editathon.jury.filter(j => j === Global.user.name)[0];
      this.setState({ isJury, stage: isJury ? 'user' : 'pick' })
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
      const { stats, user } = this.state;
      if (!stats || !stats.title)
         return;

      this.setState({ adding: true });

      try {
         await Api.addArticle(this.props.editathon.code, stats.title, user);
         await this.returnToList(true);
      } catch(e) {
         this.setState({ adding: false })
         if (e instanceof UnauthorizedHttpError) {
            alert(this.tr('unauthorized'));
         } else {
            alert(this.tr('networkError', e.message));
         }
      }
   },
   async returnToList(reload = false) {
      this.context.router.replace({
         pathname: url(`/editathons/${this.props.editathon.code}`),
      });

      if (reload && this.props.onReloadEditathon) {
         await this.props.onReloadEditathon();
      }
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
      const renderer = {
         user: this.renderUserStage,
         pick: this.renderPickStage,
         approve: this.renderApproveStage,
      }[this.state.stage];
      
      return renderer ? renderer().props.children : null;
   },
   tr(...args) {
      return this.props.translation.tr(...args)
   },
   backButton() {
      const { isJury, stage } = this.state;
      let name, action;

      if (stage === 'user') {
         name = 'cancel';
         action = () => this.returnToList();
      } else if (stage === 'pick') {
         if (isJury) {
            name = 'back';
            action = () => this.setState({ stage: 'user' });
         } else {
            name = 'cancel';
            action = () => this.returnToList();
         }
      } else if (stage === 'approve') {
         name = 'back';
         action = () => this.setState({ stage: 'pick' });
      }

      return <WikiButton onClick={action}>{this.tr(name)}</WikiButton>;
   },
   async pickUser() {
      this.setState({ updating: true, error: false });

      const { user } = this.state;
      let regDate;
      try {
         const mwApi = getMwApi(this.props.editathon.wiki);
         regDate = await mwApi.getUserRegDate(user);
      } catch (e) {
         console.error(e);
      }

      const error = regDate === undefined ? user : false;
      const stage = regDate === undefined ? 'user' : 'pick';
      this.setState({ stage, updating: false, regDate, error });
   },
   renderUserStage() {
      const { translation: { tr }, editathon: { wiki } } = this.props;
      const { user, updating, error } = this.state;

      return <div>
         <label htmlFor='user'>{this.tr('user')}</label>
         <UserLookup wiki={wiki} inputProps={{ id: 'user' }} autoFocus
            value={user} onChange={user => this.setState({ user })} />

         {error && <div className='Warnings'>
            <div className='stat error'>{this.tr('userNotFound', error)}</div>
         </div>}

         <div id='buttons'>
            {this.backButton()}
            <WikiButton loading={updating} disabled={!user.trim()} type='progressive' submit onClick={this.pickUser}>
               {this.tr('next')}
            </WikiButton>
         </div>
      </div>;
   },
   getCtx() {
      return {
         user: {
            name: this.state.user,
            registered: this.state.regDate,
         }
      };
   },
   renderPickStage() {
      const { translation: { tr }, editathon: { wiki } } = this.props;
      const ctx = this.getCtx();
      const rules = this.getRules().filter(rule => rule.userOnly);
      const error = rules
         .filter(rule => !(rule.flags & RuleFlags.optional))
         .some(rule => !rule.check(null, ctx));

      if (error) {
         return (
            <div>
               <Warnings
                     ctx={ctx}
                     rules={rules}
                     stats={null}
                     wiki={wiki} />
               <div id='buttons'>
                  {this.backButton()}
               </div>
            </div>
         );
      }

      return (
         <div>
            <label htmlFor='title'>{this.tr('articleTitle')}</label>
            <Warnings
                  ctx={ctx}
                  rules={rules}
                  stats={null}
                  wiki={wiki} />
            <PageLookup
               wiki={wiki}
               autoFocus
               inputProps={{ id: 'title' }}
               value={this.state.title}
               onChange={title => this.setState({ title })} />
            <div id='buttons'>
               {this.backButton()}
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
      const ctx = this.getCtx();
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
                        {addedBy.user === ctx.user.name ? this.tr('youAlreadyAdded') : this.tr('someoneAlreadyAdded')}
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
               {this.backButton()}
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
