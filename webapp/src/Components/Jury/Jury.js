import React from 'react';
import cloneDeep from 'clone-deep';
import url from './../../url';
import Api from './../../Api';
import getArticleInfo from './../../getArticleInfo';
import { getMark } from './../../jury';
import Loader from './../Loader';
import ModalDialog from '../ModalDialog';
import WikiButton from '../WikiButton';
import ArticlesList from './articlesList';
import Warnings from './warnings';
import Preview from './preview';
import Evaluation from './evaluation';

export default React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         editathon: null,
         changed: false,
         unsavedWarning: false,
      }
   },

   getCode() {
      return this.props.params && this.props.params.id;
   },

   async componentWillMount() {
      if (!this.getCode() || !Global.user) {
         this.context.router.replace({
            pathname: url(`/`),
         });
         return;
      }

      const editathon = await Api.getEditathon(this.getCode());
      if (!editathon.jury.filter(j => j === Global.user.name)[0]) {
         this.context.router.replace({
            pathname: url(`/`),
         });
         return;
      }

      let article = editathon.articles[0];
      this.setState({
         editathon,
         selected: editathon.articles[0] && editathon.articles[0].name,
         info: article ? undefined : false,
      });
      if (article) {
         if (getMark(article.marks)) {
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
         this.setState({ unsavedWarning: title });
         return;
      }

      const article = this.getArticle(title);
      this.setState({ selected: title, info: article.info });
      if (!article.info) {
         let info;
         try {
            article.info = info = await getArticleInfo(title, false);
         } catch (e) {
            info = { error: e };
         }
         if (title === this.state.selected) {
            this.setState({ info });
         }
      }
   },

   onChanged() {
      this.setState({ changed: true });
   },

   onDiscard() {
      const title = this.state.unsavedWarning;
      this.state.changed = false;
      this.setState({ unsavedWarning: false, changed: false });
      this.selectArticle(title);
   },

   setMark(article, mark) {
      let m = getMark(article.marks);
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
         if (!getMark(articles[index].marks)) {
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
         unsavedWarning: false
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

   render() {
      const { editathon, info } = this.state;
      if (!editathon)
         return <Loader />;
      const article = this.getSelectedArticle();

      return (
         <div className='Jury'>
            <div id='sidebar'>
               <ArticlesList articles={editathon.articles} selected={this.state.selected} onArticleSelected={this.selectArticle} />
               <Warnings editathon={editathon} info={info} article={article} />
            </div>
            <div id='main-content'>
               <Preview title={this.state.selected} info={info} />
               <Evaluation onNext={this.moveNext} onSaveMarks={this.onSaveMark} article={article} mark={getMark(article.marks)} onChanged={this.onChanged} />
            </div>

            <ModalDialog isOpen={this.state.unsavedWarning} className='unsavedWarning'>
               <div className='message'>Ваши изменения не будут сохранены.</div>
               <div className='buttons'>
                  <WikiButton type='destructive' onClick={this.onDiscard}>Продолжить</WikiButton>
                  <WikiButton onClick={() => this.setState({ unsavedWarning: false })}>Отмена</WikiButton>
               </div>
            </ModalDialog>
         </div>
      )
   },
});
