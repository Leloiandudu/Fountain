import React from 'react';
import classNames from 'classnames';
import Header from './Header';
import { findMarkOf, calcTotalMark } from './../../jury';

export default React.createClass({
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
   render() {
      return (
         <ul className='ArticlesList'>
            {this.props.editathon.articles.map(article => <li className={classNames({
               selected: article.name === this.props.selected,
               hasMark: this.hasMark(article),
               invalid: article.stats && this.props.validators.map(v => v.validate(article.stats)).some(x => !x.valid),
               conflict: this.hasMark(article) && this.isConflict(article),
            })} key={article.name}>
               <a href='#' title={article.name} onClick={e => this.onItemClick(e, article)}>
                  {article.name}
               </a>
            </li>)}
         </ul>
      )
   },
});
