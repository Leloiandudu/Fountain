import React from 'react';
import { withTranslation } from '../translate';
import { isMarkValid } from '../jury';
import MarkDetails from './MarkDetails';
import MarkInput from './MarkInput';
import WikiButton from './WikiButton';

class MarksPreview extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         marks: {},
      };
   }

   render() {
      const { config, translation: { tr } } = this.props;
      const { marks } = this.state;

      const isValid = isMarkValid(marks, config);
      const isEmpty = !Object.keys(config).length;

      return <div className='MarksPreview'>
         {isValid && !isEmpty
            ? <MarkDetails mark={{ marks }} config={config} />
            : tr('incomplete')
         }

         <MarkInput
            config={config}
            value={marks}
            onChange={marks => this.setState({ marks })} />

         {Object.keys(marks).length !== 0 && <WikiButton
            className='reset'
            onClick={() => this.setState({ marks: {} })}
            children={tr('resetPreview')} />}
      </div>;
   }
}

export default withTranslation(MarksPreview, 'MarksPreview');
