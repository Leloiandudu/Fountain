import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import stable from 'stable';
import sortBy from './../sortBy';
import Api from './../Api';
import url from './../url';
import { getMark, Marks, calcMark } from './../jury';
import Link from './Link';
import WikiLink from './WikiLink';
import WikiButton from './WikiButton';
import ModalDialog from './ModalDialog';
import Loader from './Loader';

function getTotalMark(jury, marks) {
   const m = jury.map(j => getMark(marks, j)).filter(m => m).map(m => calcMark(m.marks).sum);
   if (m.length == 0)
      return null;
   return m.reduce((a, b) => a + b, 0) / m.length;
}

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
         jury: [],
      };
   },
   componentWillMount() {
      this.componentWillReceiveProps(this.props);
   },
   componentWillReceiveProps(props) {
      if (props.editathon && props.editathon.articles) {
         this.setState({ 
            articles: this.sort(props.editathon.articles, this.state.sortBy, this.state.sortAsc),
            jury: props.editathon.jury.slice().sort(),
         });
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

      const { jury } = this.state;

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
               Жюри: {jury.map(j => 
                  <span key={j}>
                     <span className='colorKey' />
                     <WikiLink to={'UT:' + j} />
                  </span>)}
            </div>
            <table>
               <thead>
                  <tr>
                     <th className='left'>{this.renderSorter('name', 'Статья')}</th>
                     <th className='left'>{this.renderSorter('user', 'Участник')}</th>
                     <th className='right'>{this.renderSorter('dateAdded', 'Добавлено')}</th>
                     {jury.map(j => <th className='mark center' key={j}><span className='colorKey' /></th>)}
                     <th className='mark center'>{this.renderSorter(this.getTotalMark, 'Σ')}</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className='spacer' />
                  {this.state.articles.map((a, i) => this.renderRow(jury, a, i))}
               </tbody>
            </table>
         </div>
      );
   },
   getTotalMark(article) {
      return getTotalMark(this.state.jury, article.marks);
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

      let sort = sortBy(by);
      if (!asc) {
         sort = sort.desc;
      }

      return stable(articles, sort);
   },
   renderSorter(by, title) {
      const { sortBy, sortAsc } = this.state;

      return <button className={classNames({ 
         sorter: true, 
         asc: sortBy === by && sortAsc,
         desc: sortBy === by && !sortAsc,
      })} onClick={() => this.sortBy(by)}>{title}</button>
   },
   renderRow(jury, article, index) {
      const total = this.getTotalMark(article);
      return (
         <tr key={index}>
            <td className='left'><WikiLink to={article.name} /></td>
            <td className='left'><WikiLink to={`UT:${article.user}`} /></td>
            <td className='right'>{moment(article.dateAdded).utc().format('D MMM HH:mm')}</td>
            {jury.map(j => <td key={j} className='center'>{this.renderMark(article.marks, j)}</td>)}
            <td className='mark'>{total !== null && total.toFixed(2)}</td>
         </tr>
      );
   },
   renderMark(marks, jury) {
      const mark = getMark(marks, jury);
      if (!mark) {
         return null;
      }
      
      const { sum, parts } = calcMark(mark.marks);

      const details = [];
      let i = 0;
      for (var p in parts) {
         const v = parts[p];
         details.push(<dt>{v && (v > 0 ? '+' : '−') || ''}{Math.abs(v)}</dt>);
         details.push(<dd>{p}</dd>);
      }

      return <button className='mark'>
         <span>{sum}</span>
         <dl className='details'>
            {details}
         </dl>
      </button>;      
   },
});
