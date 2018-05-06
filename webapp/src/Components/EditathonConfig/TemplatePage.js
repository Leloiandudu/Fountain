import React from 'react';
import classNames from 'classnames';
import { Validation } from './validation';
import { createSetter, createSubSection } from '../utils';
import PageLookup from '../PageLookup';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';

class TemplatePage extends React.Component {
   constructor(props) {
      super(props);
      this.set = createSetter();
      this.template = createSubSection(this, 'template');
      this.state = { enabled: false };
   }

   componentWillMount() {
      this.setState({ enabled: !!this.props.value.template });
   }

   addArg() {
      const { value, onChange } = this.template.props;
      value.args.push({});
      onChange({ ...value });
   }

   deleteArg(arg) {
      const { value, onChange } = this.template.props;
      const index = value.args.indexOf(arg);
      if (index !== -1) {
         value.args.splice(index, 1);
      }
      onChange({ ...value });
   }

   onEnable(enabled) {
      if (enabled) {
         this.set('template', this._value || {
            name: '',
            talkPage: true,
            args: [],
         });
      } else {
         this._value = { ...this.props.value.template };
         this.set('template', null);
      }
      this.setState({ enabled });
   }

   render() {
      const { translation: { tr } } = this.props;
      const { enabled } = this.state;

      return <div className='page TemplatePage'>
         <label id='add'>
            <input
               type='checkbox'
               value={enabled}
               onChange={e => this.onEnable(e.target.checked)} />
            <span>{tr('autoAdd')}</span>
         </label>
         {enabled && this.renderRest()}
      </div>;
   }

   renderArg(arg, id) {
      const onChange = (e, p) => {
         const { value, onChange } = this.template.props;
         arg[p] = e.target.value;
         onChange({ ...value });
      }

      return <div className='arg' key={id}>
         <input id={`${id}-name`} value={arg.name || ''} onChange={e => onChange(e, 'name')} />
         <span>{'='}</span>
         <Validation isEmpty={() => !arg.value}>
            <input id={`${id}-value`} value={arg.value || ''} onChange={e => onChange(e, 'value')} />
         </Validation>
         <WikiButton className='delete' onClick={() => this.deleteArg(arg)} />
      </div>;
   }

   renderRest() {
      const {
         translation: { tr },
         value: { template: { name, args }, wiki },
      } = this.props;
      return (<div>
         <div className='field' id='template'>
            <label htmlFor='name'>{tr('name')}</label>
            <Validation isEmpty={() => !name}>
               {this.template.bind('name', <PageLookup
                  inputProps={{ id: 'name' }}
                  ns={10}
                  wiki={wiki} />)}
            </Validation>
         </div>
         <div id='placement' className='field'>
            <header>{tr('placement')}</header>
            <label>
               {this.template.bind('talkPage', <input type='radio' name='talkPage' value={false} />)}
               <span>{tr('inArticle')}</span>
            </label>
            <label>
               {this.template.bind('talkPage', <input type='radio' name='talkPage' value={true} />)}
               <span>{tr('onTalkPage')}</span>
            </label>
         </div>
         <div id='args'>
            <header>{tr('args')}</header>
            <div className='args'>
               {args.map((arg, id) => this.renderArg(arg, id))}
            </div>
            <WikiButton onClick={() => this.addArg()}>{tr('add')}</WikiButton>
         </div>
         <div id='preview'>
            <header>{tr('preview')}</header>
            <div className='preview'>
               {this.renderTemplate(name, args)}
            </div>
         </div>
      </div>).props.children;
   }

   renderTemplate(name, args) {
      const parts = [];
      const add = (text, label) => {
         const props = { key: parts.length - 1 };
         if (label) {
            props.htmlFor = label;
         }
         parts.push(React.createElement(label ? 'label' : 'span', props, text));
      };

      add('{{');
      add(name, 'name');
      for (const id in args) {
         const arg = args[id];
         add('|');
         if (arg.name) {
            add(arg.name, `${id}-name`);
            add('=');
         }
         add(arg.value, `${id}-value`);
      }
      add('}}');

      return parts;
   }
}

export default withTranslation(TemplatePage, 'EditathonConfig.TemplatePage');
