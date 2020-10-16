import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import stable from 'stable';
import sortBy from './../sortBy';
import { groupBy } from './../utils'
import { EditathonFlags, findMarkOf, getTotalMark } from './../jury';
import { withTranslation } from './../translate';
import Dashboard from './Dashboard';
import DropDownButton from './DropDownButton'
import Link from './Link';
import Loader from './Loader';
import MarkDetails from './MarkDetails';
import RequiresLogin from './RequiresLogin';
import WikiButton from './WikiButton';
import WikiLink from './WikiLink';

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

const ArticlesList = React.createClass({
   propTypes: {
      editathon: React.PropTypes.object,
   },
   getInitialState() {
      return {
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
   getData(articles, editathon) {
      let getTotal = (articles) => {
         const marks = articles.map(article => getTotalMark(editathon, article.marks)).filter(x => x !== null);
         if (!marks.length) return null;
         return marks.reduce((s, m) => s + m, 0);
      }

      if (editathon.flags & EditathonFlags.hiddenMarks)
         getTotal = () => null;

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
      const juryButton = def => isJury && <WikiButton type={def ? 'progressive' : ''} disabled={editathon.articles.length === 0}>
         <Link to={`/jury/${this.props.editathon.code}`}>{this.tr('juryTool')}</Link>
      </WikiButton>;

      if (now.isAfter(editathon.finish, 'day')) {
         const showAward = isJury && this.showMarks() &&
            editathon.articles.filter(a => getTotalMark(editathon, a.marks) === null).length === 0;

         return <div className='header'>
            <span>{this.tr('editathonIsOver')}</span>
            {juryButton(!showAward)}
            {showAward && <WikiButton className='award' type='progressive'>
               <Link to={`/editathons/${this.props.editathon.code}/award`}>
                  {this.tr('award')}
               </Link>
            </WikiButton>}
         </div>;
      } else {
         return <div className='header'>
            <span>{this.tr('editathonWillEndIn', editathon.finish)}</span>
            {juryButton(true)}
            <RequiresLogin redirectTo={`/editathons/${this.props.editathon.code}/add`}>
               <WikiButton type={isJury ? '' : 'progressive'} className={classNames('addArticle', isJury && 'combine')}>
                  <Link to={`/editathons/${this.props.editathon.code}/add`}>
                     {this.tr('addArticle')}
                  </Link>
               </WikiButton>
               {isJury && <DropDownButton className='manageArticles' collapse items={[
                  <Link to={`/editathons/${this.props.editathon.code}/manage`}>{this.tr('manageArticles')}</Link>
               ]} />}
            </RequiresLogin>
         </div>
      }
   },
   render() {
      const { editathon } = this.props;
      if (!editathon || !editathon.jury)
         return <Loader />;

      const { data } = this.state;

      return (
         <div className='ArticlesList'>
            {this.renderHeader(editathon)}
            <Dashboard editathon={editathon} />

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
   renderArticles(editathon, user) {
      const { wiki, jury, marks: marksConfig } = editathon;
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
                     {this.showMarks() && <td className='mark'>{this.formatMark(getTotalMark(editathon, a.marks))}</td>}
                  </tr>,
                  this.showMarks() && a.marks.length >= editathon.minMarks && <tr className='details'>
                     <td colSpan={3}>
                        <ul>
                           {jury
                              .map(jury => findMarkOf(a.marks, jury))
                              .filter(x => x)
                              .map((m, i) => <li key={i}>
                                 <MarkDetails mark={m} config={marksConfig} />
                              </li>)}
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
