import React from 'react';
import classNames from 'classnames';
import { createBinder, setDefault } from '../utils';
import UserLookup from '../UserLookup';
import WikiButton from '../WikiButton';
import { getMwApi } from '../../MwApi';
import { withTranslation } from '../../translate';

function getDefaultData() {
   return [ Global.user.name ];
}

class JuryPage extends React.Component {
   constructor(props) {
      super(props);
      this.bind = createBinder();
   }

   componentWillMount() {
      setDefault(this.props, 'jury', getDefaultData);
   }

   add() {
      const { value, onChange } = this.props;
      value.jury.push('');
      onChange(value);
   }

   replace(index, v) {
      const { value, onChange } = this.props;
      if (v === undefined) {
         value.jury.splice(index, 1);
      } else {
         value.jury.splice(index, 1, v);
      }
      onChange(value);
   }

   renderItem(jury, index) {
      return <div className='item' key={index}>
         <UserLookup
               wiki={this.props.value.wiki}
               value={jury}
               onChange={text => this.replace(index, text)} />
         <WikiButton className='delete' onClick={e => {
            this.replace(index);
            e.target.blur();
         }} />
      </div>;
   }

   render() {
      const { translation: { tr }, value: { jury = [] } } = this.props;

      return <div className='page JuryPage'>
         {jury.map((j, i) => this.renderItem(j, i))}
         <WikiButton className='add' onClick={() => this.add()}>
            {tr('add')}
         </WikiButton>
      </div>;
   }
}

export default withTranslation(JuryPage, 'EditathonConfig.JuryPage');
