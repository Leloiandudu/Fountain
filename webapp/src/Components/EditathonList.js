import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import Link from './Link';
import RequiresLogin from './RequiresLogin';
import DropDown from './DropDown';
import EditathonCalendar from './EditathonCalendar';
import WikiButton from './WikiButton';
import { createBinder, setDefault } from './utils';
import { getNavitagorLang } from './../utils';
import Api from './../Api';
import { getSiteMatrix } from './../MwApi';
import { withTranslation } from '../translate';

const ProjectTypes = {
   'Wikipedia': '',
   'Wikiquote': 'q',
   'Wikisource': 's',
   'Wikibooks': 'b',
   'Wikinews': 'n',
   'Wikiversity': 'v',
   'Wikivoyage': 'voy',
   'Wiktionary': 'wikt',
};

class EditathonFilter extends React.PureComponent {
   constructor(props) {
      super(props);
      this.state = {
         matrix: [],
      };
      this.bind = createBinder();
   }

   async componentWillMount() {
      setDefault(this.props, () => ({
         type: null,
         lang: this.getDefaultLang(),
      }));
      this.setState({ matrix: await getSiteMatrix() });
   }

   renderButton(placeholder, value, text) {
      if (value === null) {
         return <WikiButton>
            <button>
               <span className='placeholder'>
                  {placeholder}
               </span>
            </button>
         </WikiButton>
      } else {
         return <WikiButton>{text}</WikiButton>
      }
   }

   matchItem(item, value) {
      value = value.toLowerCase();
      return item.code.toLowerCase().startsWith(value) ||
             item.name.toLowerCase().startsWith(value);
   }

   getDefaultLang() {
      return localStorage.getItem('fountainFilterLang') || getNavitagorLang();
   }

   onLangChanged(lg) {
      localStorage.setItem('fountainFilterLang', lg);
   }

   render() {
      const { translation: { tr } } = this.props;
      return <div className='EditathonFilter'>
         {this.bind('text', <input type='text' placeholder={tr('search')} />)}
         {this.bind('type', <DropDown 
            items={[{
               name: tr('all'),
               value: null,
            }, ...Object.keys(ProjectTypes).map(x => ({
               name: x,
               value: ProjectTypes[x],
            })) ]}
            getValue={x => x.value} renderItem={x => x.name} renderButton={this.renderButton.bind(this, tr('project'))} />)}
         {this.bind('lang', <DropDown
            showInput={true} filter={true}
            matchItem={(item, value) => this.matchItem(item, value)}
            placeholder={tr('language')} items={this.state.matrix}
            renderItem={x => `${x.code}: ${x.name}`} getValue={x => x.code} />, lg => this.onLangChanged(lg))}
      </div>;
   }
}

EditathonFilter = withTranslation(EditathonFilter, 'EditathonFilter');

const EditathonList = React.createClass({
   getInitialState() {
      return {};
   },
   async componentWillMount() {
      this.setState({
         list: await Api.getEditathons(),
      });
   },
   onCreate(e) {
      if (!Global.user) {
         e.preventDefault();
      }
   },
   filter(e) {
      const [, type, lang ] = /^(?:(.+):)?(.+)$/.exec(e.wiki);
      const { filter = {} } = this.state;
      return (filter.type ? filter.type === type : true)
          && (filter.lang ? filter.lang === lang : true)
          && (filter.text ? e.name.startsWith(filter.text) : true);
   },
   render() {
      const { translation: { tr } } = this.props;
      const { filter = {}, list } = this.state
      const editathons = list && list.filter(e => this.filter(e)) || [];

      return (
         <div className='EditathonList mainContentPane'>
            <h1>{tr('title')}</h1>
            <EditathonFilter value={filter} onChange={filter => this.setState({ filter })} />
            <EditathonCalendar editathons={editathons} />
            {false && <RequiresLogin className='create' redirectTo='/editathons/new/config'>
               <WikiButton type='progressive'>
                  <Link to='/editathons/new/config' onClick={this.onCreate}>
                     {tr('create')}
                  </Link>
               </WikiButton>
            </RequiresLogin>}
            <ul>
               {editathons.map(this.renderItem)}
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
