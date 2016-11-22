import React from 'react';
import classNames from 'classnames';
import Header from './Header';
import { findMarkOf, calcTotalMark } from './../../jury';
import { withTranslation } from './../../translate';
import sortBy from './../../sortBy';

const ArticlesList = React.createClass({
   onItemClick(e, article) {
      e.preventDefault();
      this.props.onArticleSelected(article.name);
   },
   hasMark(article) {
      return findMarkOf(article.marks) !== undefined;
   },
   isConflict(article) {
      const { jury, marks, consensualVote } = this.props.editathon;
      if (!consensualVote) return false;
      const mark = calcTotalMark(jury, article.marks, marks);
      return mark && mark.consensual === null;
   },
   getJuryWithMarks(article) {
      const { jury } = this.props.editathon;
      return jury.filter(j => findMarkOf(article.marks, j));      
   },
   renderArticle(article) {
      const { editathon, translation } = this.props;
      const juryWithMarks = this.getJuryWithMarks(article);

      return <li className={classNames({
         selected: article.name === this.props.selected,
         hasMark: this.hasMark(article),
         invalid: article.stats && this.props.validators.map(v => v.validate(article.stats)).some(x => !x.valid),
         conflict: this.hasMark(article) && this.isConflict(article),
      })} key={article.name}>
         <div className='marks' title={juryWithMarks.join(translation.translate('delimiter'))}>
            {editathon.jury.map((j, i) => <div key={i} className={classNames({ hasMark: juryWithMarks.indexOf(j) !== -1 })} />)}
         </div>
         <a href='#' title={article.name} onClick={e => this.onItemClick(e, article)}>
            {article.name}
         </a>
      </li>;
   },
   render() {
      return (
         <ul className='ArticlesList'>
            {this.props.editathon.articles.map(article => this.renderArticle(article))}
         </ul>
      )
   },
});

export default withTranslation(ArticlesList);
