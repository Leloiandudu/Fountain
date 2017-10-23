import React from 'react';
import classNames from 'classnames';
import DatePicker from '../DatePicker';
import WikiLookup from '../WikiLookup';
import { withTranslation } from '../../translate';
import url from '../../url';

class GeneralPage extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         code: '',
      };
   }

   setCode(code) {
      this.setState({ code });
   }

   render() {
      const { translation: { tr } } = this.props;
      return <div className='page GeneralPage'>
         <label id='name'>
            <span>{tr('title')}</span>
            <input type='text' />
         </label>
         <label id='code'>
            <span>{tr('code')}</span>
            <input type='text' value={this.state.code} onChange={e => this.setCode(e.target.value)} />
            <span id='url'>{window.location.origin + url('/editathons/') + this.state.code}</span>
         </label>
         <div className='field' id='project'>
            <label htmlFor='wiki'>{tr('project')}</label>
            <WikiLookup inputProps={{ id: 'wiki' }} />
         </div>
         <label id='description' className='optional'>
            <span>{tr('description')} <span className='optional'>{tr('optional')}</span></span>
            <textarea />
         </label>
         <div id='dates' className='field'>
            <div className='field'>
               <label htmlFor='startDate'>{tr('startDate')}</label>
               <DatePicker id='startDate' />
            </div>
            <div className='field'>
               <label htmlFor='finishDate'>{tr('finishDate')}</label>
               <DatePicker id='finishDate' />
            </div>
         </div>
      </div>;
   }
}

export default withTranslation(GeneralPage, 'EditathonConfig.GeneralPage');
