import React from 'react';
import cloneDeep from 'clone-deep';
import sortBy from './../../sortBy';
import url from './../../url';
import Api from './../../Api';
import { mwApi } from './../../MwApi';
import readRules, { getRulesReqs, RuleSeverity } from './../../rules';
import getArticleData from './../../getArticleData';
import { findMarkOf } from './../../jury';
import Loader from './../Loader';
import ModalDialog from '../ModalDialog';
import WikiButton from '../WikiButton';
import ArticlesList from './articlesList';
import Header from './Header';
import Warnings from './Warnings';
import Preview from './Preview';
import Expander from './Expander';
import Evaluation from './Evaluation';

export default React.createClass({
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

      editathon.articles.sort(sortBy('dateAdded'));

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
            [ info, userGender ] = await Promise.all([
               getArticleData(title, [ ...what, 'html' ]),
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
      return readRules(this.state.editathon.rules, [ RuleSeverity.warning, RuleSeverity.info ]);
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
      this.setMark(article, mark);
      this.setState({
         editathon: this.state.editathon,
         changed: false,
      });

      try {
         await Api.setMark(this.getCode(), {
            title: article.name,
            marks: mark.marks,
            comment: mark.comment,
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
      const { editathon, info } = this.state;
      if (!editathon)
         return <Loader />;
      const article = this.getSelectedArticle();

      return (
         <div className='Jury'>
            <Header title={this.state.selected} menuOpen={this.state.menuOpen} toggleMenu={this.toggleMenu} onClose={this.tryClose}>
               <Warnings info={info} rules={this.getRules()} article={article} />
            </Header>
            <main>
               <Expander expanded={this.state.menuOpen}>
                  <ArticlesList articles={editathon.articles} selected={this.state.selected} onArticleSelected={this.selectArticle} />
               </Expander>
               <Preview title={this.state.selected} info={info} />
               <Evaluation onNext={this.moveNext} onSaveMarks={this.onSaveMark} article={article} marks={editathon.marks} mark={findMarkOf(article.marks)} onChanged={this.onChanged} />
            </main>
            <ModalDialog isOpen={this.state.unsavedWarning} className='unsavedWarning'>
               <div className='message'>Ваши изменения не будут сохранены.</div>
               <div className='buttons'>
                  <WikiButton type='destructive' onClick={() => this.state.unsavedWarning(true)}>Продолжить</WikiButton>
                  <WikiButton onClick={() => this.state.unsavedWarning(false)}>Отмена</WikiButton>
               </div>
            </ModalDialog>
         </div>
      )
   },
});
