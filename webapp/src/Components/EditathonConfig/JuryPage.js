import React from 'react';
import classNames from 'classnames';
import { createBinder, setDefault } from '../utils';
import UserLookup from '../UserLookup';
import WikiButton from '../WikiButton';
import { getMwApi } from '../../MwApi';
import { withTranslation } from '../../translate';

function getDefaultData() {
   return {
      jury: [ Global.user.name ],
      sendInvites: false,
   };
}

class JuryPage extends React.Component {
   constructor(props) {
      super(props);
      this._argId = 0;
      this.bind = createBinder('data');
   }

   componentWillMount() {
      setDefault(this.props, getDefaultData, 'data');
   }

   add() {
      const { data, onChange } = this.props;
      const { jury } = data;
      jury.push('');
      onChange({ jury });
   }

   replace(index, value) {
      const { data, onChange } = this.props;
      const { jury } = data;
      if (value === undefined) {
         jury.splice(index, 1);
      } else {
         jury.splice(index, 1, value);
      }
      onChange({ jury });
   }

   renderItem(jury, index) {
      return <div className='item' key={index}>
         <UserLookup
               wiki={this.props.allData.general.wiki}
               value={jury}
               onChange={text => this.replace(index, text)} />
         <WikiButton className='delete' onClick={e => {
            this.replace(index);
            e.target.blur();
         }} />
      </div>;
   }

   render() {
      const { translation: { tr }, data: { jury = [] } } = this.props;

      return <div className='page JuryPage'>
         {jury.map((j, i) => this.renderItem(j, i))}
         <WikiButton className='add' onClick={() => this.add()}>
            {tr('add')}
         </WikiButton>
         <label>
            {this.bind('sendInvites', <input type='checkbox' />)}
            <span>{tr('sendInvites')}</span>
         </label>
      </div>;
   }
}

export default withTranslation(JuryPage, 'EditathonConfig.JuryPage');
