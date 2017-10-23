import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import Link from './Link';
import RequiresLogin from './RequiresLogin';
import WikiButton from './WikiButton';
import Api from './../Api';
import { withTranslation } from '../translate';

const EditathonList = React.createClass({
   getInitialState() {
      return {};
   },
   async componentWillMount() {
      this.setState({ list: await Api.getEditathons() });
   },
   onCreate(e) {
      if (!Global.user) {
         e.preventDefault();
      }
   },
   render() {
      const { translation: { tr } } = this.props;
      return (
         <div className='EditathonList mainContentPane'>
            <h1>{tr('title')}</h1>
            <RequiresLogin className='create' redirectTo='/editathons/new/config'>
               <WikiButton type='progressive'>
                  <Link to='/editathons/new/config' onClick={this.onCreate}>
                     {tr('create')}
                  </Link>
               </WikiButton>
            </RequiresLogin>
            <ul>
               {this.state.list && this.state.list.map(this.renderItem)}
            </ul>
         </div>
      );
   },
   renderItem(item) {
      const today = moment().utc();
      const isPast = item.finish.isBefore(today);
      const isCurrent = item.start.isBefore(today) && item.finish.isAfter(today);
      const url = '/editathons/' + encodeURIComponent(item.code);

      return (
         <li key={item.code} className={classNames({ past: isPast })}
             title={isCurrent ? '' : item.description}>
            <div className='summary'>
               <span className='name'>
                  <Link to={{ pathname: url, state: { editathon: item } }}>{item.name}</Link>
               </span>
               <span className='dates'>{this.renderDates(item)}</span>
            </div>
            {isCurrent && <span className='description'>{item.description}</span>}
         </li>
      );
   },
   renderDates({ start, finish }) {
      const { translation: { translate } } = this.props;

      start = moment(start).utc();
      finish = moment(finish).utc();
      
      let format = 'MMM';
      let startFormat = format;

      if (start.date() !== 1 || moment(finish).endOf('month').day() !== finish.day())
         startFormat = format = 'D ' + format;
      else if (start.isSame(finish, 'month'))
         startFormat = '';

      format = format + ' YYYY';
      if (start.year() !== finish.year())
         startFormat = format;

      if (!startFormat)
         return translate('formatDate', finish, format);

      return `${translate('formatDate', start, startFormat)} — ${translate('formatDate', finish, format)}`;
   },
});

export default withTranslation(EditathonList, 'EditathonList');
