import React from 'react';
import moment from 'moment';
import Link from './Link';
import Loader from './Loader';
import RequiresLogin from './RequiresLogin';
import DropDown from './DropDown';
import EditathonCalendar from './EditathonCalendar';
import WikiButton from './WikiButton';
import { createBinder, setDefault, createSetter } from './utils';
import { getNavitagorLang, checkTokenMatch } from './../utils';
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
      this.setLang = createSetter().bind(this, 'lang');
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

   renderLangButton(placeholder) {
      const { lang } = this.props.value;
      const name = this.state.matrix.filter(m => m.code === lang).map(m => m.name)[0];
      return this.renderButton(placeholder, lang, this.renderLang(lang, name));
   }

   renderLang(code, name) {
      if (name === undefined) {
         return code;
      } else if (code === null) {
         return name;
      } else {
         return `${code}: ${name}`;
      }
   }

   matchItem(item, value) {
      if (value === null) {
         return item.code === null;
      }

      value = value.toLowerCase();
      return (item.code || '').startsWith(value) ||
             item.name.toLowerCase().startsWith(value);
   }

   getDefaultLang() {
      const lang = localStorage.getItem('fountainFilterLang');
      if (lang === 'null') {
         return null;
      }

      return lang || getNavitagorLang();
   }

   onLangChanged(lang) {
      this.setLang(lang);
      localStorage.setItem('fountainFilterLang', lang);
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
            }))]}
            getValue={x => x.value} renderItem={x => x.name}
            renderButton={this.renderButton.bind(this, tr('project'))} />)}
         <DropDown
            showInput={true} filter={true}
            matchItem={(item, value) => this.matchItem(item, value)}
            items={[{
               code: null,
               name: tr('all'),
            }, ...this.state.matrix]} getValue={x => x.code}
            renderButton={() => this.renderLangButton(tr('language'))}
            renderItem={x => this.renderLang(x.code, x.name)}
            onChange={lg => this.onLangChanged(lg)} />
      </div>;
   }
}

EditathonFilter = withTranslation(EditathonFilter, 'EditathonFilter');

const EditathonList = React.createClass({
   getInitialState() {
      return { loading: true };
   },
   async componentWillMount() {
      this.setState({
         list: await Api.getEditathons(),
         loading: false,
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
          && (filter.text ? checkTokenMatch(filter.text, e.name) : true);
   },
   render() {
      const { translation: { tr } } = this.props;
      const { filter = {}, list, loading } = this.state
      const editathons = list && list.filter(e => this.filter(e)) || [];

      if (loading) {
         return <Loader />
      }

      return (
         <div className='EditathonList mainContentPane'>
            <h1>{tr('title')}</h1>
            <EditathonFilter value={filter} onChange={filter => this.setState({ filter })} />
            {filter.lang && <EditathonCalendar editathons={editathons} />}
            {false && <RequiresLogin className='create' redirectTo='/editathons/new/config'>
               <WikiButton type='progressive'>
                  <Link to='/editathons/new/config' onClick={this.onCreate}>
                     {tr('create')}
                  </Link>
               </WikiButton>
            </RequiresLogin>}
            <ul>
               {editathons.filter(item => !isPast(item)).map(this.renderItem)}
            </ul>
            <h2>{tr('finished')}</h2>
            <ul className='past'>
               {editathons.filter(isPast).map(this.renderItem)}
            </ul>
         </div>
      );
   },
   renderItem(item) {
      const today = moment().utc();
      const isCurrent = moment(item.start).isBefore(today) && moment(item.finish).isAfter(today);
      const url = '/editathons/' + encodeURIComponent(item.code);

      return (
         <li key={item.code} title={item.description}>
         	<Link to={{ pathname: url, state: { editathon: item } }}>
               <div className='summary'>
                  <div className='name'>
                     {item.name}
                  </div>
                  <div className='dates'>{this.renderDates(item)}</div>
               </div>
               {isCurrent && <div className='description'>{item.description}</div>}
            </Link>
         </li>
      );
   },
   renderDates({ start, finish }) {
      const { translation: { translate } } = this.props;

      start = moment(start);
      finish = moment(finish);

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

function isPast(editathon) {
   return moment(editathon.finish).isBefore(moment().utc());
}

export default withTranslation(EditathonList, 'EditathonList');
