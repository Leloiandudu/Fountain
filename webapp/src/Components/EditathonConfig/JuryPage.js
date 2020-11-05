import React from 'react';
import { withTranslation } from '../../translate';
import IntegerInput from '../IntegerInput';
import UserLookup from '../UserLookup';
import { createBinder, setDefault } from '../utils';
import WikiButton from '../WikiButton';
import { Validation } from './validation';

function getDefaultData() {
   return [Global.user.name];
}

class JuryPage extends React.Component {
   constructor(props) {
      super(props);
      this.bind = createBinder();
   }

   componentDidMount() {
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
         <Validation isEmpty={() => !jury}>
            <UserLookup
               wiki={this.props.value.wiki}
               value={jury}
               onChange={text => this.replace(index, text)} />
         </Validation>
         <WikiButton className='delete' onClick={e => {
            this.replace(index);
            e.target.blur();
         }} />
      </div>;
   }

   render() {
      const { translation: { tr }, value } = this.props;
      const { jury = [], minMarks = 0 } = value

      return <div className='page JuryPage'>
         {jury.map((j, i) => this.renderItem(j, i))}
         <Validation isEmpty={() => jury.length === 0}>
            <WikiButton className='add' onClick={() => this.add()}>
               {tr('add')}
            </WikiButton>
         </Validation>

         <label>
            <span>{tr('minMarks')}</span>
            <IntegerInput value={minMarks} min={1} max={Math.max(1, jury.length)}
               onChange={v => {
                  this.props.onChange({ ...value, minMarks: v });
               }} />
         </label>
      </div>;
   }
}

export default withTranslation(JuryPage, 'EditathonConfig.JuryPage');
