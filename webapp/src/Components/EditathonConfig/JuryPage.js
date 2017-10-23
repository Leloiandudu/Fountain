import React from 'react';
import classNames from 'classnames';
import UserLookup from '../UserLookup';
import WikiButton from '../WikiButton';
import { getMwApi } from '../../MwApi';
import { withTranslation } from '../../translate';

class JuryPage extends React.Component {
   constructor(props) {
      super(props);
      this._argId = 0;
      this.state = {
         jury: [ Global.user.name ],
         sendInvites: false,
      };
   }

   add() {
      const { jury } = this.state;
      jury.push('');
      this.setState({ jury });
   }

   replace(index, value) {
      const { jury } = this.state;
      if (value === undefined) {
         jury.splice(index, 1);
      } else {
         jury.splice(index, 1, value);
      }
      this.setState({ jury });
   }

   renderItem(jury, index) {
      return <div className='item' key={index}>
         <UserLookup
               wiki='ru'
               value={jury}
               onChange={text => this.replace(index, text)} />
         <WikiButton className='delete' onClick={e => {
            this.replace(index);
            e.target.blur();
         }} />
      </div>;
   }

   render() {
      const { translation: { tr } } = this.props;
      return <div className='page JuryPage'>
         {this.state.jury.map((j, i) => this.renderItem(j, i))}
         <WikiButton className='add' onClick={() => this.add()}>
            {tr('add')}
         </WikiButton>
         <label>
            <input
                  type='checkbox'
                  checked={this.state.sendInvites}
                  onChange={e => this.setState({ sendInvites: e.target.checked })} />
            <span>{tr('sendInvites')}</span>
         </label>
      </div>;
   }
}

export default withTranslation(JuryPage, 'EditathonConfig.JuryPage');
