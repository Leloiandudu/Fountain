import React from 'react';
import classNames from 'classnames';
import Header from './Header';
import { findMarkOf } from './../../jury';

export default React.createClass({
   onItemClick(e, article) {
      e.preventDefault();
      this.props.onArticleSelected(article.name);
   },
   render() {
      return (
         <ul className='ArticlesList'>
            {this.props.articles.map(article => <li className={classNames({
               selected: article.name === this.props.selected,
               hasMark: findMarkOf(article.marks) !== undefined,
               invalid: article.stats && this.props.validators.map(v => v.validate(article.stats)).some(x => !x.valid),
            })} key={article.name}>
               <a href='#' title={article.name} onClick={e => this.onItemClick(e, article)}>
                  {article.name}
               </a>
            </li>)}
         </ul>
      )
   },
});
