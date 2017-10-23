import React from 'react';
import classNames from 'classnames';
import GeneralPage from './GeneralPage';
import RulesPage from './RulesPage';
import TemplatePage from './TemplatePage';
import JuryPage from './JuryPage';
import { ValidationForm } from './validation';
import WikiButton from '../WikiButton';
import Api from '../../Api';
import { withTranslation } from '../../translate';
import url from '../../url';

function Headers({ items, selected, onClick }) {
   return <div className='Headers'>
      {items.map((item, i) => 
         <button key={i} className={classNames({
            item: true,
            selected: i === selected
         })} onClick={() => onClick(i)}>{item}</button>
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
   static get contextTypes() {
      return {
         router: React.PropTypes.object.isRequired
      };
   }

   constructor(props) {
      super(props);
      this.state = {
         selected: 'general',
         sending: false,

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

   moveBack() {
      if (this.getSelectedIndex() === 0) {
         this.context.router.goBack();
      } else {
         this.moveTo(Object.keys(Pages)[this.getSelectedIndex() - 1])
      }
   }

   moveNext() {
      this.moveTo(Object.keys(Pages)[this.getSelectedIndex() + 1])
   }

   moveTo(key) {
      if (key && this._form.validate()) {
         this.setState({ selected: key });
      }
   }

   getSelectedIndex() {
      return Object.keys(Pages).indexOf(this.state.selected);
   }

   async submit() {
      if (!this._form.validate()) {
         return;
      }

      this.setState({ sending: true });
      const { data } = this.state;

      try {
         await Api.createEditathon(data);
         this.context.router.replace({
            pathname: url('/editathons/' + data.general.code),
         });
      } catch(e) {
         alert(e.message);
         this.setState({ sending: false });
      }
   }

   render() {
      const { translation: { tr } } = this.props;
      const { data, selected, sending } = this.state;

      if (!Global.user) {
         this.context.router.replace({
            pathname: url('/editathons/'),
         });
         return;
      }

      const isLast = this.getSelectedIndex() === Object.keys(Pages).length - 1;

      return <ValidationForm className='EditathonConfig mainContentPane' ref={r => this._form = r}>
         <h1>{tr('newEditathon')}</h1>
         <Headers
            items={Object.keys(Pages).map(k => tr(k))}
            selected={this.getSelectedIndex()}
            onClick={k => this.moveTo(Object.keys(Pages)[k])} />
         {React.createElement(Pages[selected], {
            data: data[selected],
            allData: data,
            onChange: v => this.set(selected, v),
         })}
         <div className='buttons'>
            <WikiButton onClick={() => this.moveBack()}>{tr('back')}</WikiButton>
            {!isLast && <WikiButton type='progressive' onClick={() => this.moveNext()}>{tr('next')}</WikiButton>}
            {isLast && <WikiButton loading={sending} type='progressive' onClick={() => this.submit()}>{tr('create')}</WikiButton>}
         </div>
      </ValidationForm>;
   }
}

export default withTranslation(EditathonConfig, 'EditathonConfig');
