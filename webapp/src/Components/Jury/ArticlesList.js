import React from 'react';
import classNames from 'classnames';
import Header from './Header';
import { getMark } from './../../jury';

function isGoodMark(marks) {
   const mark = getMark(marks);
   return mark && mark.marks.isGood;
}

export default React.createClass({
   render() {
      return (
         <div className='content-panel'>
            <Header title='Articles'>
               {this.props.children}
            </Header>
            <div id='articles-list' className='block content'>
               <ul>
                  {this.props.articles.map(article => <li className={classNames({
                     nice: article.marks && isGoodMark(article.marks) === true,
                     nasty: article.marks && isGoodMark(article.marks) === false,
                     selected: article.name === this.props.selected,
                     invalid: article.stats && this.props.validators.map(v => v.validate(article.stats)).some(x => !x.valid),
                  })} onClick={() => this.props.onArticleSelected(article.name)} key={article.name}><span title={article.name}>{article.name}</span></li>)}
               </ul>
            </div>
         </div>
      )
   },
});
