import React from 'react';
import moment from 'moment';
import Api from './../Api';
import url from './../url';
import Link from './Link';
import WikiLink from './WikiLink';
import WikiButton from './WikiButton';
import ModalDialog from './ModalDialog';
import Loader from './Loader';

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
      const { editathon } = this.props;
      if (!editathon || !editathon.start || !editathon.finish)
         return <Loader />;
      
      var now = moment.utc();
      if (now.isBefore(editathon.start, 'day')) {
         return <h2>Марафон начнётся {editathon.start.fromNow()}</h2>
      }

      let header;
      if (now.isAfter(editathon.finish, 'day')) {
         header = <h2>Марафон завершен</h2>
      } else {
         header = <div className='header'>
            Марафон закончится {editathon.finish.fromNow()}
            <WikiButton type='progressive' className='addArticle'>
               <Link to={`/editathons/${this.props.code}/add`} onClick={this.onAdd}>Добавить статью</Link>
            </WikiButton>
         </div>
      }

      return (
         <div className='ArticlesList'>
            {header}
            <ModalDialog isOpen={this.state.needLogin} className='needLogin'>
               <div className='message'>Для продолжения необходимо авторизоваться.</div>
               <div className='buttons'>
                  <a href={url(`/login?redirectTo=${window.location.pathname}/add`)}>
                     <WikiButton type='progressive'>Войти</WikiButton>
                  </a>
                  <WikiButton onClick={() => this.setState({ needLogin: false })}>Отмена</WikiButton>
               </div>
            </ModalDialog>

            <div className='jury'>
               Жюри: <WikiLink to={'UT:Викиенот'} />, <WikiLink to={'UT:Ле Лой'} />, <WikiLink to={'UT:Люба КБ'} />, <WikiLink to={'UT:НоуФрост'} />, <WikiLink to={'UT:Томасина'} />
            </div>
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
                  {editathon.articles && editathon.articles.map(this.renderRow)}
               </tbody>
            </table>
            {!editathon.articles && <Loader />}
         </div>
      );
   },
   renderRow(article, index) {
      return (
         <tr key={index}>
            <td className='article'><WikiLink to={article.name} /></td>
            <td className='user'><WikiLink to={`UT:${article.user}`} /></td>
            <td className='dateAdded'>{moment(article.dateAdded).utc().format('D MMM HH:mm')}</td>
         </tr>
      );
   },
});
