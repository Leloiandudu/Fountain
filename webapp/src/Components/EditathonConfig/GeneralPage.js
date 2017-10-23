import React from 'react';
import classNames from 'classnames';
import DatePicker from '../DatePicker';
import WikiLookup from '../WikiLookup';
import { EditathonFlags } from '../../jury';
import { withTranslation } from '../../translate';
import { Validation } from './validation';
import { createBinder, createSetter } from '../utils';
import url from '../../url';

class GeneralPage extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         code: '',
      };
      this.set = createSetter('data');
      this.bind = createBinder('data');
   }

   componentWillMount() {
      if (!this.state.code && this.props.data.code) {
         this.setState({ code: this.props.data.code });
      }
   }

   setCode(code) {
      this.setState({ code });
      this.set('code', code.trim().replace(/ /g, '_').toLowerCase())
   }

   changeFlag(flag, value) {
      const { data } = this.props;
      const flags = value
         ? data.flags | flag
         : data.flags & ~flag;
      this.set('flags', flags);
   }

   render() {
      const { data, translation: { tr } } = this.props;
      return <div className='page GeneralPage'>
         <label id='name'>
            <span>{tr('title')}</span>
            <Validation isEmpty={() => !data.title} validate={() => data.title.length < 3 && tr('tooShort')}>
               {this.bind('title', <input type='text' />)}
            </Validation>
         </label>
         <label id='code'>
            <span>{tr('code')}</span>
            <Validation isEmpty={() => !data.code} validate={() => data.code.length < 3 && tr('tooShort')}>
               <input type='text' value={this.state.code} onChange={e => this.setCode(e.target.value)} />
            </Validation>
            <span id='url'>{window.location.origin + url('/editathons/') + encodeURIComponent(data.code || '')}</span>
         </label>
         <div className='field' id='project'>
            <label htmlFor='wiki'>{tr('project')}</label>
            <Validation isEmpty={() => !data.wiki}>
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
               <Validation isEmpty={() => !data.startDate}>
                  {this.bind('startDate', <DatePicker id='startDate' />)}
               </Validation>
            </div>
            <div className='field'>
               <label htmlFor='finishDate'>{tr('finishDate')}</label>
               <Validation isEmpty={() => !data.finishDate} 
                           validate={() => data.startDate && data.startDate > data.finishDate && tr('negativeDates')}>
                  {this.bind('finishDate', <DatePicker id='finishDate' />)}
               </Validation>
            </div>
         </div>
         <div id='flags' className='field'>
            <label>
               <input
                     type='checkbox'
                     checked={data.flags & EditathonFlags.consensualVote}
                     onChange={e => this.changeFlag(EditathonFlags.consensualVote, e.target.checked)} />
               {tr('consensualVote')}
            </label>
            <label>
               <input
                     type='checkbox'
                     checked={data.flags & EditathonFlags.hiddenMarks}
                     onChange={e => this.changeFlag(EditathonFlags.hiddenMarks, e.target.checked)} />
               {tr('hiddenMarks')}
            </label>
         </div>
      </div>;
   }
}

export default withTranslation(GeneralPage, 'EditathonConfig.GeneralPage');
