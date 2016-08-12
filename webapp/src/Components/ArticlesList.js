import React from 'react';
import Api from './../Api';
import Link from './Link';
import WikiLink from './WikiLink';
import WikiButton from './WikiButton';

export default React.createClass({
   propTypes: {
      editathon: React.PropTypes.object,
   },
   render() {
      return (
         <div className='ArticlesList'>
            <WikiButton type='progressive' className='addArticle'>
               <Link to={`/editathons/${this.props.code}/add`}>Добавить статью</Link>
            </WikiButton>

            <table>
               <thead>
                  <tr>
                     <th className='article'>Статья</th>
                     <th className='user'>Участник</th>
                     <th className='dateAdded'>Дата добавления</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className='spacer' />
                  {this.props.editathon && this.props.editathon.articles && this.props.editathon.articles.map(this.renderRow)}
               </tbody>
            </table>
         </div>
      );
   },
   renderRow(article, index) {
      return (
         <tr key={index}>
            <td className='article'><WikiLink href={article.name} /></td>
            <td className='user'><WikiLink href={`UT:${article.user}`} /></td>
            <td className='dateAdded'>{article.dateAdded.format('D MMM HH:mm')}</td>
         </tr>
      );
   },
});
