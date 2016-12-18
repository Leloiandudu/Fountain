import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import stable from 'stable';
import sortBy from './../sortBy';
import Api from './../Api';
import url from './../url';
import { EditathonFlags } from './../jury';
import { findMarkOf, calcMark, calcTotalMark } from './../jury';
import { withTranslation } from './../translate';
import Link from './Link';
import WikiLink from './WikiLink';
import WikiButton from './WikiButton';
import ModalDialog from './ModalDialog';
import Loader from './Loader';

function getTotalMark(jury, marks, marksConfig, consensualVote) {
   const mark = calcTotalMark(jury, marks, marksConfig);
   return mark && (consensualVote ? mark.consensual : mark.average);
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

const ArticlesList = React.createClass({
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
            data: sort(this.getData(editathon.articles, editathon), this.state.sortBy, this.state.sortAsc),
         });
      }
   },
   onAdd(e) {
      if (!Global.user) {
         this.setState({ needLogin: true });
         e.preventDefault();
      }
   },
   getData(articles, { jury, marks: marksConfig, flags }) {
      const consensualVote = !!(flags & EditathonFlags.consensualVote);
      const getTotal = (articles) => {
         const marks = articles.map(article => getTotalMark(jury, article.marks, marksConfig, consensualVote)).filter(x => x !== null);
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
   tr(...args) {
      return this.props.translation.tr(...args);
   },
   formatNumber(...args) {
      return this.props.translation.translate('formatNumber', ...args);
   },
   formatMark(mark) {
      const consensualVote = this.props.editathon.flags & EditathonFlags.consensualVote;
      return mark === null ? '' : this.formatNumber(mark, { places: consensualVote ? 0 : 2 });
   },
   renderHeader(editathon) {
      const now = moment.utc();
      if (now.isBefore(editathon.start, 'day')) {
         return <div className='header'>
            {this.tr('editathonWillStartIn', editathon.start)}
         </div>
      }

      const isJury = Global.user && editathon.jury.filter(j => j === Global.user.name)[0];
      let juryButton = isJury && <WikiButton type='progressive' disabled={editathon.articles.length === 0}>
         <Link to={`/jury/${this.props.code}`}>{this.tr('juryTool')}</Link>
      </WikiButton>;

      if (now.isAfter(editathon.finish, 'day')) {
         return <div className='header'>
            {this.tr('editathonIsOver')}
            {juryButton}
         </div>;
      } else {
         return <div className='header'>
            {this.tr('editathonWillEndIn', editathon.finish)}
            {juryButton}
            <WikiButton type={isJury ? '' : 'progressive'} className='addArticle'>
               <Link to={`/editathons/${this.props.code}/add`} onClick={this.onAdd}>{this.tr('addArticle')}</Link>
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
               <div className='message'>{this.props.translation.translate('SignInWarning.title')}</div>
               <div className='buttons'>
                  <a href={url(`/login?redirectTo=${window.location.pathname}/add`)}>
                     <WikiButton type='progressive'>{this.props.translation.translate('SignInWarning.ok')}</WikiButton>
                  </a>
                  <WikiButton onClick={() => this.setState({ needLogin: false })}>{this.props.translation.translate('SignInWarning.cancel')}</WikiButton>
               </div>
            </ModalDialog>

            <div className='jury'>
               {this.tr('jury') + ' '}{editathon.jury.slice().sort().map(j => 
                  <span key={j}>
                     <WikiLink to={'User_talk:' + j} wiki={editathon.wiki} />
                  </span>)}
            </div>
            <table>
               <thead>
                  <tr>
                     <th className='expander'></th>
                     <th className='user'>{this.renderSorter('name', this.tr('user'))}</th>
                     <th className='count'>{this.renderSorter('count', this.tr('acticlesCount'))}</th>
                     {this.showMarks() && <th className='total'>{this.renderSorter('total', this.tr('totalScore'))}</th>}
                  </tr>
               </thead>
               <tbody>
                  <tr className='spacer' />
               </tbody>
               {data.map(user => 
                  <ExpandableRow key={user.name} user={user} wiki={editathon.wiki} 
                                 formatMark={this.formatMark} formatNumber={this.formatNumber}
                                 showMarks={this.showMarks()}>
                     {this.renderArticles(editathon, user)}
                  </ExpandableRow>
               )}
            </table>
         </div>
      );
   },
   renderArticles({ wiki, jury, marks: marksConfig, flags }, user) {
      const consensualVote = !!(flags & EditathonFlags.consensualVote);
      return (
         <table className='articles'>
            <thead>
               <tr>
                  <th className='article'>{this.tr('acticle')}</th>
                  <th className='dateAdded'>{this.tr('addedOn')}</th>
                  {this.showMarks() && <th className='mark'>{this.tr('score')}</th>}
               </tr>
            </thead>
            <tbody>
               {user.articles.slice().sort(sortBy('dateAdded').desc).map(a => [
                  <tr className='summary'>
                     <td className='article'><WikiLink to={a.name} wiki={wiki} /></td>
                     <td className='dateAdded'>{this.tr('dateAdded', moment(a.dateAdded).utc())}</td>
                     {this.showMarks() && <td className='mark'>{this.formatMark(getTotalMark(jury, a.marks, marksConfig, consensualVote))}</td>}
                  </tr>,
                  this.showMarks() && <tr className='details'>
                     <td colSpan={3}>
                        <ul>
                           {jury
                              .map(jury => findMarkOf(a.marks, jury))
                              .filter(x => x)
                              .map((m, i) => this.renderMark(m, i, marksConfig))}
                        </ul>
                     </td>
                  </tr>
               ])}
            </tbody>
         </table>
      );
   },
   showMarks() {
      return !(this.props.editathon.flags & EditathonFlags.hiddenMarks);
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
   renderMark(mark, index, marksConfig) {
      const { sum, parts } = calcMark(mark.marks, marksConfig);

      const details = [];
      for (const p in parts) {
         const v = parts[p];
         details.push(<dt>{v && this.formatNumber(v, { forcePlus: true }) + ' ' || ''}</dt>);
         details.push(<dd>{p}</dd>);
      }

      return (
         <li className='mark' key={index}>
            <span className='jury'>{mark.user}</span>{': '}<span className='sum'>{this.formatNumber(sum)}</span>
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
      const { user, wiki, formatNumber, formatMark, children } = this.props;
      const { expanded } = this.state;
      return (
         <tbody>
            <tr onClick={this.expand}>
               <td className={classNames({ expander: true, expanded })}>
                  <button onClick={this.expand} />
               </td>
               <td className='user'><WikiLink to={`User_talk:${user.name}`} wiki={wiki} /></td>
               <td className='count'>{formatNumber(user.count)}</td>
               {this.props.showMarks && <td className='total'>{formatMark(user.total)}</td>}
            </tr>
            {expanded && <tr className='expanded'>
               <td colSpan={this.props.showMarks ? 4 : 3}>
                  {children}
               </td>
            </tr>}
         </tbody>
      );
   },
});

export default withTranslation(ArticlesList, 'ArticlesList');
