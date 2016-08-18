import React from 'react';
import Api from './../Api';
import url from './../url';
import Link from './Link';
import WikiLink from './WikiLink';
import WikiButton from './WikiButton';
import ModalDialog from './ModalDialog';

export default React.createClass({
   propTypes: {
      editathon: React.PropTypes.object,
   },
   getInitialState() {
      return {
         needLogin: false,
      };
   },
   onAdd(e) {
      if (!Global.user) {
         this.setState({ needLogin: true });
         e.preventDefault();
      }
   },
   render() {
      return (
         <div className='ArticlesList'>
            <WikiButton type='progressive' className='addArticle'>
               <Link to={`/editathons/${this.props.code}/add`} onClick={this.onAdd}>Добавить статью</Link>
            </WikiButton>
            <ModalDialog isOpen={this.state.needLogin} className='needLogin'>
               <div className='message'>Для продолжения необходимо авторизоваться.</div>
               <div className='buttons'>
                  <a href={url(`/login?redirectTo=${window.location.pathname}`)}>
                     <WikiButton type='progressive'>Войти</WikiButton>
                  </a>
                  <WikiButton onClick={() => this.setState({ needLogin: false })}>Отмена</WikiButton>
               </div>
            </ModalDialog>

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
