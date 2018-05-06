import React from 'react';
import classNames from 'classnames';
import GeneralPage from './GeneralPage';
import RulesPage from './RulesPage';
import MarksPage from './MarksPage';
import TemplatePage from './TemplatePage';
import JuryPage from './JuryPage';
import { ValidationForm } from './validation';
import Loader from '../Loader';
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
   marks: MarksPage,
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
         loading: false,
         editathon: {},
      };
      this._maxPageIndex = 0;
   }

   getCode() {
      return this.props.params.id;
   }

   isNew() {
      return this.getCode() === 'new';
   }

   async componentWillMount() {
      if (!this.isNew() && Global.user) {
         this.setState({ loading: true });
         const editathon = await Api.getEditathonConfig(this.getCode());
         this.setState({ loading: false, editathon });
      }
   }

   navigateBrowserBack() {
      this.context.router.goBack();
   }

   moveBack() {
      if (this.getSelectedIndex() === 0) {
         this.navigateBrowserBack();
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
         this._maxPageIndex = Math.max(this._maxPageIndex, Object.keys(Pages).indexOf(key));
      }
   }

   getSelectedIndex() {
      return Object.keys(Pages).indexOf(this.state.selected);
   }

   shouldShowPage(key) {
      if (!this.isNew()) return true;
      return Object.keys(Pages).indexOf(key) <= this._maxPageIndex;
   }

   async submit() {
      if (!this._form.validate()) {
         return;
      }

      this.setState({ sending: true });
      const { editathon } = this.state;

      try {
         if (this.isNew()) {
            await Api.createEditathon(editathon);
            this.context.router.replace({
               pathname: url('/editathons/' + editathon.code),
            });
         } else {
            await Api.setEditathonConfig(this.getCode(), editathon);
            this.navigateBrowserBack();
         }
      } catch(e) {
         alert(e.message);
         this.setState({ sending: false });
      }
   }

   render() {
      const { translation: { tr } } = this.props;
      const { editathon, selected, sending, loading } = this.state;

      if (!Global.user) {
         this.context.router.replace({
            pathname: url('/editathons/'),
         });
         return null;
      }

      if (loading) {
         return <Loader />;
      }

      const isLast = this.getSelectedIndex() === Object.keys(Pages).length - 1;

      return <ValidationForm className='EditathonConfig mainContentPane' ref={r => this._form = r}>
         <h1>{tr('newEditathon')}</h1>
         <Headers
            items={Object.keys(Pages).filter(k => this.shouldShowPage(k)).map(k => tr(k))}
            selected={this.getSelectedIndex()}
            onClick={k => this.moveTo(Object.keys(Pages)[k])} />
         {React.createElement(Pages[selected], {
            value: editathon,
            onChange: v => this.setState({ editathon: v }),
         })}
         {this.isNew()
            ? <div className='buttons'>
               <WikiButton onClick={() => this.moveBack()}>{tr('back')}</WikiButton>
               {!isLast && <WikiButton type='progressive' onClick={() => this.moveNext()}>{tr('next')}</WikiButton>}
               {isLast && <WikiButton loading={sending} type='progressive' onClick={() => this.submit()}>{tr('create')}</WikiButton>}
            </div>
            : <div className='buttons'>
               <WikiButton loading={sending} type='progressive' onClick={() => this.submit()}>{tr('save')}</WikiButton>
               <WikiButton onClick={() => this.navigateBrowserBack()}>{tr('cancel')}</WikiButton>
            </div>
         }
      </ValidationForm>;
   }
}

export default withTranslation(EditathonConfig, 'EditathonConfig');
