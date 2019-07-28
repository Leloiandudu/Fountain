import React from 'react';
import sortBy from './../../sortBy';
import url from './../../url';
import Api from './../../Api';
import { getMwApi } from './../../MwApi';
import readRules, { getRulesReqs, RuleFlags } from './../../rules';
import getArticleData from './../../getArticleData';
import { withTranslation } from './../../translate';
import { findMarkOf } from './../../jury';
import Loader from './../Loader';
import ModalDialog from '../ModalDialog';
import WikiButton from '../WikiButton';
import ArticlesList from './ArticlesList';
import Header from './Header';
import Warnings from './Warnings';
import Preview from './Preview';
import Expander from './Expander';
import Evaluation from './Evaluation';

const Jury = React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         editathon: null,
         changed: false,
         unsavedWarning: null,
         menuOpen: false,
      }
   },

   getCode() {
      return this.props.params && this.props.params.id;
   },

   async componentWillMount() {
      if (!this.getCode() || !Global.user) {
         this.close();
         return;
      }

      const editathon = await Api.getEditathon(this.getCode());
      if (!editathon.jury.filter(j => j === Global.user.name)[0]) {
         this.close()
         return;
      }

      if (!editathon.articles.length) {
         this.close()
         return;
      }

      const marksCount = new Map(editathon.articles.map(article => [ 
         article,
         editathon.jury.filter(j => findMarkOf(article.marks, j)).length
      ]));

      editathon.articles.sort(sortBy(a => marksCount.get(a), 'dateAdded'));

      let article = editathon.articles[0];
      this.setState({
         editathon,
         selected: editathon.articles[0] && editathon.articles[0].name,
         info: article ? undefined : false,
      });
      if (article) {
         if (findMarkOf(article.marks)) {
            article = this.getNextArticle(article) || article;
         }
         this.selectArticle(article.name);
      }
   },

   getArticle(title) {
      return this.state.editathon.articles.filter(article => article.name === title)[0];
   },

   getSelectedArticle() {
      return this.getArticle(this.state.selected);
   },

   async selectArticle(title) {
      if (this.state.changed) {
         if (!await this.unsavedWarning()) {
            return;
         }
      }

      const article = this.getArticle(title);
      this.setState({ selected: title, info: article.info, menuOpen: false, changed: false });

      if (!article.info) {
         let info, userGender;
         try {
            const what = getRulesReqs(this.getRules());
            const mwApi = getMwApi(this.state.editathon.wiki);

            // files
            if (await mwApi.getNamespace(title) === 6) {
               what.push('fileUrl');
            } else {
               what.push('title');
            }

            [ info, userGender ] = await Promise.all([
               getArticleData(mwApi, title, [ ...what, 'html' ]),
               mwApi.getUserGender(article.user)
            ]);
            if (info === null)
               info = false;
            else
               info.userGender = userGender;
            article.info = info;
         } catch (e) {
            info = { error: e };
         }
         if (title === this.state.selected) {
            this.setState({ info });
         }
      }
   },

   getRules() {
      return readRules(this.state.editathon.rules).filter(r => r.flags & (RuleFlags.optional | RuleFlags.informational));
   },

   onChanged() {
      this.setState({ changed: true });
   },

   unsavedWarning() {
      return new Promise((resolve) => {
         this.setState({ 
            unsavedWarning: (result) => {
               this.setState({ unsavedWarning: null });
               resolve(result);
            }
         });
      });
   },

   setMark(article, mark) {
      let m = findMarkOf(article.marks);
      if (!m) {
         m = { user: Global.user.name };
         article.marks.push(m);
      }
      m.marks = mark.marks;
      m.comment = mark.comment;
   },

   moveNext() {
      const next = this.getNextArticle(this.getSelectedArticle());
      if (next) {
         this.selectArticle(next.name);
      }
   },

   getNextArticle(article) {
      const { articles } = this.state.editathon;
      const curentIndex = articles.indexOf(article);
      for (let index = curentIndex; ;) {
         index = (index + 1) % articles.length;
         if (index === curentIndex)
            break;
         if (!findMarkOf(articles[index].marks)) {
            return articles[index];
         }
      }
   },

   async onSaveMark({ comment, marks }) {
      const mark = { marks, comment };
      const article = this.getSelectedArticle();

      try {
         await Api.setMark(this.getCode(), {
            title: article.name,
            marks: mark.marks,
            comment: mark.comment,
         });
         
         this.setMark(article, mark);
         this.setState({
            editathon: this.state.editathon,
            changed: false,
         });
         this.moveNext();
      } catch (err) {
         alert(`Error '${err}' while saving the mark for '${article.name}'.`);
      }
   },

   toggleMenu() {
      this.setState({ menuOpen: !this.state.menuOpen });
   },

   async tryClose() {
      if (this.state.changed && !(await this.unsavedWarning()))
         return;
      this.close();
   },

   close() {
      this.context.router.replace({
         pathname: url(`/editathons/${this.getCode() || ''}`),
      });
   },

   render() {
      const { translation: { translate } } = this.props;
      const { editathon, info  } = this.state;
      if (!editathon)
         return <Loader />;
      const article = this.getSelectedArticle();

      return (
         <div className='Jury'>
            <Header article={article} editathon={editathon} menuOpen={this.state.menuOpen} toggleMenu={this.toggleMenu} onClose={this.tryClose}>
               <Warnings info={info} rules={this.getRules()} article={article} wiki={editathon.wiki} />
            </Header>
            <main>
               <Expander expanded={this.state.menuOpen}>
                  <ArticlesList editathon={editathon} selected={this.state.selected} onArticleSelected={this.selectArticle} />
               </Expander>
               <Preview title={this.state.selected} wiki={editathon.wiki} info={info} />
               <Evaluation onNext={this.moveNext} onSaveMarks={this.onSaveMark} article={article} marks={editathon.marks} mark={findMarkOf(article.marks)} onChanged={this.onChanged} />
            </main>
            <ModalDialog isOpen={this.state.unsavedWarning} className='unsavedWarning'>
               <div className='message'>{translate('UnsavedWarning.message')}</div>
               <div className='buttons'>
                  <WikiButton type='destructive' onClick={() => this.state.unsavedWarning(true)}>{translate('UnsavedWarning.ok')}</WikiButton>
                  <WikiButton onClick={() => this.state.unsavedWarning(false)}>{translate('UnsavedWarning.cancel')}</WikiButton>
               </div>
            </ModalDialog>
         </div>
      )
   },
});

export default withTranslation(Jury, 'Jury');
