import React from 'react';
import classNames from 'classnames';
import GeneralPage from './GeneralPage';
import RulesPage from './RulesPage';
import TemplatePage from './TemplatePage';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';

function Headers(props) {
   return <div className='Headers'>
      {props.items.map((item, i) => 
         <button key={i} className={classNames({
            item: true,
            selected: item === props.selected
         })}>{item}</button>
      )}
   </div>;
}

class EditathonConfig extends React.Component {
   render() {
      const { translation: { tr } } = this.props;
      return <div className='EditathonConfig mainContentPane'>
         <h1>{tr('newEditathon')}</h1>
         <Headers items={[ 'General', 'Rules', 'Template', 'Jury', 'Marks' ]} selected='General' />
         <div className='buttons'>
            <WikiButton>{tr('back')}</WikiButton>
            <WikiButton type='progressive'>{tr('next')}</WikiButton>
         </div>
      </div>;
   }
}

export default withTranslation(EditathonConfig, 'EditathonConfig');
