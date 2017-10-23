import React from 'react';
import classNames from 'classnames';
import GeneralPage from './GeneralPage';
import RulesPage from './RulesPage';
import TemplatePage from './TemplatePage';
import JuryPage from './JuryPage';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';

function Headers(props) {
   return <div className='Headers'>
      {props.items.map((item, i) => 
         <button key={i} className={classNames({
            item: true,
            selected: i === props.selected
         })}>{item}</button>
      )}
   </div>;
}

const Pages = {
   general: GeneralPage,
   rules: RulesPage,
   template: TemplatePage,
   jury: JuryPage,
};

class EditathonConfig extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         selected: 'general',

         data: {
            general: {},
            rules: {},
            template: {},
            jury: {},
         }
      };
   }

   set(prop, value) {
      const { data } = this.state;
      data[prop] = value;
      this.setState({ data });
   }

   moveNext() {
      const index = this.getSelectedIndex();
      const nextKey = Object.keys(Pages)[index + 1];
      if (nextKey) {
         this.setState({ selected: nextKey });
      }
   }

   moveBack() {
      this.moveTo(Object.keys(Pages)[this.getSelectedIndex() - 1])
   }

   moveNext() {
      this.moveTo(Object.keys(Pages)[this.getSelectedIndex() + 1])
   }

   moveTo(key) {
      if (key) {
         this.setState({ selected: key });
      }
   }

   getSelectedIndex() {
      return Object.keys(Pages).indexOf(this.state.selected);
   }

   render() {
      const { translation: { tr } } = this.props;
      const { data, selected } = this.state;

      return <div className='EditathonConfig mainContentPane'>
         <h1>{tr('newEditathon')}</h1>
         <Headers items={Object.keys(Pages).map(k => tr(k))} selected={this.getSelectedIndex()} />
         {React.createElement(Pages[selected], {
            data: data[selected],
            onChange: v => this.set(selected, v),
         })}
         <div className='buttons'>
            <WikiButton onClick={() => this.moveBack()}>{tr('back')}</WikiButton>
            <WikiButton type='progressive' onClick={() => this.moveNext()}>{tr('next')}</WikiButton>
         </div>
         <pre>
            {JSON.stringify(data, null, 3)}
         </pre>
      </div>;
   }
}

export default withTranslation(EditathonConfig, 'EditathonConfig');
