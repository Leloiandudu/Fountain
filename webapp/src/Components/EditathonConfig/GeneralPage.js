import React from 'react';
import moment from 'moment';
import DateTimePicker from '../DateTimePicker';
import WikiLookup from '../WikiLookup';
import { EditathonFlags } from '../../jury';
import { withTranslation } from '../../translate';
import { Validation } from './validation';
import { createBinder, createSetter, setDefault } from '../utils';
import Api from '../../Api';
import throttle from '../../throttle';
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

      this.codeChecker = existanceChecker('code')
      this.nameChecker = existanceChecker('name', props.isNew ? null : props.value.code)
   }

   componentWillMount() {
      setDefault(this.props, getDefaultData);
      if (!this.state.code && this.props.value.code) {
         this.setState({ code: this.props.value.code });
      }
   }

   setCode(code) {
      this.setState({ code });
      code = code.trim().replace(/[ _]/g, '-').toLowerCase()
      this.set('code', code)
      this.codeChecker.onChange(code)
   }

   setName(name) {
      this.set('name', name)
      this.nameChecker.onChange(name)
   }

   changeFlag(flag, isSet) {
      const { value } = this.props;
      const flags = isSet
         ? value.flags | flag
         : value.flags & ~flag;
      this.set('flags', flags);
   }

   async validateCodeOrName(what) {
      const { value: { [what]: value }, translation: { tr }, isNew } = this.props;
      if (what === 'code' && !isNew) return

      if (value.length < 3) { return tr('tooShort') }

      if (what === 'code') {
         if (!/^[a-z0-9\- ]+$/i.test(value)) {
            return tr('codeSymbols')
         }
      }

      const exists = await (what === 'code' ? this.codeChecker : this.nameChecker).check(value)
      if (exists) { return tr('exists') }
   }

   render() {
      const { value, translation: { tr }, isNew } = this.props;
      return <div className='page GeneralPage'>
         <label id='name'>
            <span>{tr('title')}</span>
            <Validation isEmpty={() => !value.name} validate={() => this.validateCodeOrName('name')}>
               <input type='text' value={value.name} onChange={e => this.setName(e.target.value)} />
            </Validation>
         </label>
         <label id='code'>
            <span>{tr('code')}</span>
            <Validation isEmpty={() => !value.code} validate={() => this.validateCodeOrName('code')}>
               <input disabled={!isNew} type='text' value={this.state.code} onChange={e => this.setCode(e.target.value)} />
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

function existanceChecker(what, existingCode) {
   let value = ''
   let result = false

   function check(val) {
      val = val.trim()
      if (!val) { return false }
      if (val === value) { return result }
      value = val
      return result = Api.exists(what, val, existingCode)
   }

   return {
      check,
      onChange: throttle(check, 500),
   }
}

export default withTranslation(GeneralPage, 'EditathonConfig.GeneralPage');
