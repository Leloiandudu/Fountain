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

function sort(items, by, asc) {
   if (by === null) {
      return items;
   }

   let sort = sortBy(by);
   if (!asc) {
      sort = sort.desc;
   }

   return stable(items, sort);
}

function formatMark(mark) {
   return mark === null ? '' : mark.toFixed(2);
}

function groupBy(items, fnKey, fnValue = x => x) {
   const groups = new Map();
   for (const item of items) {
      const key = fnKey(item);
      let group = groups.get(key);
      if (group === undefined) {
         group = [];
         groups.set(key, group);
      }
      group.push(fnValue(item));
   }
   return groups;
}

export default React.createClass({
   propTypes: {
      editathon: React.PropTypes.object,
   },
   getInitialState() {
      return {
         needLogin: false,
         sortBy: 'total',
         sortAsc: false,
         data: [],
      };
   },
   componentWillMount() {
      this.componentWillReceiveProps(this.props);
   },
   componentWillReceiveProps({ editathon }) {
      if (editathon && editathon.articles && editathon.jury) {
         this.setState({ 
            data: sort(this.getData(editathon.articles, editathon.jury), this.state.sortBy, this.state.sortAsc),
         });
      }
   },
   onAdd(e) {
      if (!Global.user) {
         this.setState({ needLogin: true });
         e.preventDefault();
      }
   },
   getData(articles, jury) {
      const getTotal = (articles) => {
         const marks = articles.map(article => getTotalMark(jury, article.marks)).filter(x => x !== null);
         if (!marks.length) return null;
         return marks.reduce((s, m) => s + m, 0);
      }

      return [...groupBy(articles, a => a.user)].map(([k, v]) => ({
         name: k,
         articles: v,
         total: getTotal(v),
         count: v.length,
      }));
   },
   renderHeader(editathon) {
      var now = moment.utc();
      if (now.isBefore(editathon.start, 'day')) {
         return <div className='header'>
            Марафон начнётся {editathon.start.fromNow()}
         </div>
      }

      const isJury = Global.user && editathon.jury.filter(j => j === Global.user.name)[0];
      let juryButton = isJury && <WikiButton type='progressive'>
         <Link to={`/jury/${this.props.code}`}>Оценить статьи</Link>
      </WikiButton>;

      if (now.isAfter(editathon.finish, 'day')) {
         return <div className='header'>
            Марафон завершён
            {juryButton}
         </div>;
      } else {
         return <div className='header'>
            Марафон закончится {editathon.finish.fromNow()}
            {juryButton}
            <WikiButton type={isJury ? '' : 'progressive'} className='addArticle'>
               <Link to={`/editathons/${this.props.code}/add`} onClick={this.onAdd}>Добавить статью</Link>
            </WikiButton>
         </div>
      }
   },
   render() {
      const { editathon } = this.props;
      if (!editathon || !editathon.jury || !editathon.start || !editathon.start.fromNow || !editathon.finish)
         return <Loader />;
      
      const { data } = this.state;

      return (
         <div className='ArticlesList'>
            {this.renderHeader(editathon)}
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
                     <span className='colorKey' />
                     <WikiLink to={'UT:' + j} />
                  </span>)}
            </div>
            <table>
               <thead>
                  <tr>
                     <th className='expander'></th>
                     <th className='user'>{this.renderSorter('name', 'Участник')}</th>
                     <th className='count'>{this.renderSorter('count', 'Статей')}</th>
                     <th className='total'>{this.renderSorter('total', 'Баллов')}</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className='spacer' />
               </tbody>
               {data.map(user => 
                  <ExpandableRow key={user.name} user={user}>
                     {this.renderArticles(editathon.jury, user)}
                  </ExpandableRow>
               )}
            </table>
         </div>
      );
   },
   renderArticles(jury, user) {
      return (
         <table className='articles'>
            <thead>
               <tr>
                  <th className='article'>Статья</th>
                  <th className='dateAdded'>Добавлено</th>
                  <th className='mark'>Баллов</th>
               </tr>
            </thead>
            <tbody>
               {user.articles.slice().sort(sortBy('dateAdded').desc).map(a => [
                  <tr className='summary'>
                     <td className='article'><WikiLink to={a.name} /></td>
                     <td className='dateAdded'>{moment(a.dateAdded).utc().format('D MMM HH:mm')}</td>
                     <td className='mark'>{formatMark(getTotalMark(jury, a.marks))}</td>
                  </tr>,
                  <tr className='details'>
                     <td colSpan={3}>
                        <ul>
                           {jury
                              .map(jury => getMark(a.marks, jury))
                              .filter(x => x)
                              .map(this.renderMark)}
                        </ul>
                     </td>
                  </tr>
               ])}
            </tbody>
         </table>
      );
   },
   sortBy(sortBy) {
      const sortAsc = sortBy === this.state.sortBy ? !this.state.sortAsc : true;
      this.setState({
         sortBy,
         sortAsc,
         data: sort(this.state.data, sortBy, sortAsc),
      })
   },
   renderSorter(by, title) {
      const { sortBy, sortAsc } = this.state;

      return <button className={classNames({ 
         sorter: true, 
         asc: sortBy === by && sortAsc,
         desc: sortBy === by && !sortAsc,
      })} onClick={() => this.sortBy(by)}>{title}</button>
   },
   renderMark(mark, index) {
      const { sum, parts } = calcMark(mark.marks);

      const details = [];
      let i = 0;
      for (var p in parts) {
         const v = parts[p];
         details.push(<dt>{v && (v > 0 ? '+' : '−') || ''}{Math.abs(v)}</dt>);
         details.push(<dd>{p}</dd>);
      }

      return (
         <li className='mark' key={index}>
            <span className='jury'>{mark.user}</span>{': '}<span className='sum'>{sum}</span>
            <dl className='details'>
               {details}
            </dl>
            {mark.comment && <div className='comment'>
               {mark.comment}
            </div>}
         </li>
      );
   },
});

const ExpandableRow = React.createClass({
   getInitialState() {
      return {
         expanded: false,
      };
   },
   componentWillMount() {
      this.setState({ expanded: Global.user && Global.user.name === this.props.user.name });
   },
   expand() {
      this.setState({ expanded: !this.state.expanded });
   },
   render() {
      const { user } = this.props;
      const { expanded } = this.state;
      return (
         <tbody>
            <tr onClick={this.expand}>
               <td className={classNames({ expander: true, expanded })}>
                  <button onClick={this.expand} />
               </td>
               <td className='user'><WikiLink to={`UT:${user.name}`} /></td>
               <td className='count'>{user.count}</td>
               <td className='total'>{formatMark(user.total)}</td>
            </tr>
            {expanded && <tr className='expanded'>
               <td colSpan={4}>
                  {this.props.children}
               </td>
            </tr>}
         </tbody>
      );
   },
});
