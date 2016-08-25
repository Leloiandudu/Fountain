import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import sortBy from 'sort-by';
import stable from 'stable';
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
         sortBy: 'dateAdded',
         sortAsc: false,
         articles: [],
      };
   },
   componentWillMount() {
      const { editathon } = this.props;
      if (editathon && editathon.articles) {
         this.setState({ articles: editathon.articles });
      }
   },
   componentWillReceiveProps(props) {
      if (props.editathon && props.editathon.articles) {
         this.setState({ articles: this.sort(props.editathon.articles, this.state.sortBy, this.state.sortAsc) });
      }
   },
   onAdd(e) {
      if (!Global.user) {
         this.setState({ needLogin: true });
         e.preventDefault();
      }
   },
   render() {
      const { editathon } = this.props;
      if (!editathon || !editathon.jury || !editathon.start || !editathon.start.fromNow || !editathon.finish)
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
            {Global.user && editathon.jury.filter(j => j === Global.user.name)[0] && <WikiButton type='progressive'>
               <Link to={`/jury/${this.props.code}`}>Оценить статьи</Link>
            </WikiButton>}
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
               Жюри: {editathon.jury.slice().sort().map(j => 
                  <span key={j}>
                     <WikiLink to={'UT:' + j} />
                  </span>)}
            </div>
            <table>
               <thead>
                  <tr>
                     <th className='left'>{this.renderSorter('name', 'Статья')}</th>
                     <th className='left'>{this.renderSorter('user', 'Участник')}</th>
                     <th className='right'>{this.renderSorter('dateAdded', 'Добавлено')}</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className='spacer' />
                  {this.state.articles.map(this.renderRow)}
               </tbody>
            </table>
         </div>
      );
   },
   sortBy(sortBy) {
      const sortAsc = sortBy === this.state.sortBy ? !this.state.sortAsc : true;
      this.setState({
         sortBy,
         sortAsc,
         articles: this.sort(this.state.articles, sortBy, sortAsc),
      })
   },
   sort(articles, by, asc) {
      if (by === null) {
         return articles;
      }

      if (!asc) {
         by = '-' + by;
      }

      return stable(articles, sortBy(by));
   },
   renderRow(article, index) {
      return (
         <tr key={index}>
            <td className='left'><WikiLink to={article.name} /></td>
            <td className='left'><WikiLink to={`UT:${article.user}`} /></td>
            <td className='right'>{moment(article.dateAdded).utc().format('D MMM HH:mm')}</td>
         </tr>
      );
   },
   renderSorter(by, title) {
      const { sortBy, sortAsc } = this.state;

      return <button className={classNames({ 
         sorter: true, 
         asc: sortBy === by && sortAsc,
         desc: sortBy === by && !sortAsc,
      })} onClick={() => this.sortBy(by)}>{title}</button>
   },
});
