import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import DateTimePicker from '../DateTimePicker';
import WikiLookup from '../WikiLookup';
import { EditathonFlags } from '../../jury';
import { withTranslation } from '../../translate';
import { Validation } from './validation';
import { createBinder, createSetter, setDefault } from '../utils';
import url from '../../url';

function getDefaultData() {
   const date = moment.utc().add('d', 1);

   return {
      start: moment(date).startOf('d'),
      finish: moment(date).endOf('d'),
   };
}

class GeneralPage extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         code: '',
      };
      this.set = createSetter();
      this.bind = createBinder();
   }

   componentWillMount() {
      setDefault(this.props, getDefaultData);
      if (!this.state.code && this.props.value.code) {
         this.setState({ code: this.props.value.code });
      }
   }

   setCode(code) {
      this.setState({ code });
      this.set('code', code.trim().replace(/[ _]/g, '-').toLowerCase())
   }

   changeFlag(flag, isSet) {
      const { value } = this.props;
      const flags = isSet
         ? value.flags | flag
         : value.flags & ~flag;
      this.set('flags', flags);
   }

   render() {
      const { value, translation: { tr } } = this.props;
      return <div className='page GeneralPage'>
         <label id='name'>
            <span>{tr('title')}</span>
            <Validation isEmpty={() => !value.name} validate={() => value.name.length < 3 && tr('tooShort')}>
               {this.bind('name', <input type='text' />)}
            </Validation>
         </label>
         <label id='code'>
            <span>{tr('code')}</span>
            <Validation isEmpty={() => !value.code} validate={() => value.code.length < 3 && tr('tooShort')}>
               <input type='text' value={this.state.code} onChange={e => this.setCode(e.target.value)} />
            </Validation>
            <span id='url'>{window.location.origin + url('/editathons/') + encodeURIComponent(value.code || '')}</span>
         </label>
         <div className='field' id='project'>
            <label htmlFor='wiki'>{tr('project')}</label>
            <Validation isEmpty={() => !value.wiki}>
               {this.bind('wiki', <WikiLookup inputProps={{ id: 'wiki' }} />)}
            </Validation>
         </div>
         <label id='description' className='optional'>
            <span>
               {tr('description')}
               <span className='optional'>{tr('optional')}</span>
            </span>
            {this.bind('description', <textarea />)}
         </label>
         <div id='dates' className='field'>
            <div className='field'>
               <label htmlFor='startDate'>{tr('startDate')}</label>
               <Validation isEmpty={() => !value.start}>
                  {this.bind('start', <DateTimePicker id='startDate' vertical />)}
               </Validation>
            </div>
            <div className='field'>
               <label htmlFor='finishDate'>{tr('finishDate')}</label>
               <Validation isEmpty={() => !value.finish}
                           validate={() => value.start && value.start >= value.finish && tr('negativeDates')}>
                  {this.bind('finish', <DateTimePicker id='finishDate' vertical />)}
               </Validation>
            </div>
         </div>
         <div id='flags' className='field'>
            <label>
               <input
                     type='checkbox'
                     checked={value.flags & EditathonFlags.consensualVote}
                     onChange={e => this.changeFlag(EditathonFlags.consensualVote, e.target.checked)} />
               {tr('consensualVote')}
            </label>
            <label>
               <input
                     type='checkbox'
                     checked={value.flags & EditathonFlags.hiddenMarks}
                     onChange={e => this.changeFlag(EditathonFlags.hiddenMarks, e.target.checked)} />
               {tr('hiddenMarks')}
            </label>
         </div>
      </div>;
   }
}

export default withTranslation(GeneralPage, 'EditathonConfig.GeneralPage');
