import React from 'react';
import classNames from 'classnames';
import DatePicker from '../DatePicker';
import WikiLookup from '../WikiLookup';
import { withTranslation } from '../../translate';
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

   setCode(code) {
      this.setState({ code });
      this.set('code', code.trim().replace(/ /g, '_'))
   }

   render() {
      const { data, translation: { tr } } = this.props;
      return <div className='page GeneralPage'>
         <label id='name'>
            <span>{tr('title')}</span>
            {this.bind('title', <input type='text' />)}
         </label>
         <label id='code'>
            <span>{tr('code')}</span>
            <input type='text' value={this.state.code} onChange={e => this.setCode(e.target.value)} />
            <span id='url'>{window.location.origin + url('/editathons/') + (data.code || '')}</span>
         </label>
         <div className='field' id='project'>
            <label htmlFor='wiki'>{tr('project')}</label>
            {this.bind('wiki', <WikiLookup inputProps={{ id: 'wiki' }} />)}
         </div>
         <label id='description' className='optional'>
            <span>{tr('description')} <span className='optional'>{tr('optional')}</span></span>
            {this.bind('description', <textarea />)}
         </label>
         <div id='dates' className='field'>
            <div className='field'>
               <label htmlFor='startDate'>{tr('startDate')}</label>
               {this.bind('startDate', <DatePicker id='startDate' />)}
            </div>
            <div className='field'>
               <label htmlFor='finishDate'>{tr('finishDate')}</label>
               {this.bind('finishDate', <DatePicker id='finishDate' />)}
            </div>
         </div>
      </div>;
   }
}

export default withTranslation(GeneralPage, 'EditathonConfig.GeneralPage');
