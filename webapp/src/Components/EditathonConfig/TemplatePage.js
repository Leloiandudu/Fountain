import React from 'react';
import classNames from 'classnames';
import { Validation } from './validation';
import { createBinder, setDefault } from '../utils';
import PageLookup from '../PageLookup';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';

function getDefaultData() {
   return {
      enabled: false,
      name: '',
      talkPage: false,
      args: [],
   };
}

class TemplatePage extends React.Component {
   constructor(props) {
      super(props);
      this._argId = 0;
      this.bind = createBinder('data');
   }

   componentWillMount() {
      setDefault(this.props, getDefaultData, 'data');
   }

   addArg() {
      const { data, onChange } = this.props;
      data.args.push({ id: this._argId++ });
      onChange({ ...data });
   }

   deleteArg(arg) {
      const { data, onChange } = this.props;
      const index = data.args.indexOf(arg);
      if (index !== -1) {
         data.args.splice(index, 1);
      }
      onChange({ ...data });
   }

   render() {
      const { 
         translation: { tr },
         data: { enabled },
      } = this.props;

      return <div className='page TemplatePage'>
         <label id='add'>
            {this.bind('enabled', <input type='checkbox' /> )}
            <span>{tr('autoAdd')}</span>
         </label>
         {enabled && this.renderRest()}
      </div>;
   }

   renderArg(arg) {
      const onChange = (e, p) => {
         const { data, onChange } = this.props;
         arg[p] = e.target.value;
         onChange({ ...data });
      }

      return <div className='arg' key={arg.id}>
         <input id={`${arg.id}-name`} value={arg.name || ''} onChange={e => onChange(e, 'name')} />
         <span>=</span>
         <Validation isEmpty={() => !arg.value}>
            <input id={`${arg.id}-value`} value={arg.value || ''} onChange={e => onChange(e, 'value')} />
         </Validation>
         <WikiButton className='delete' onClick={() => this.deleteArg(arg)} />
      </div>;
   }

   renderRest() {
      const { 
         translation: { tr },
         data: { name, args },
         allData: { general: { wiki } }
      } = this.props;
      return (<div>
         <div className='field' id='template'>            
            <label htmlFor='name'>{tr('name')}</label>
            <Validation isEmpty={() => !name}>
               {this.bind('name', <PageLookup
                  inputProps={{ id: 'name' }}
                  ns={10}
                  wiki={wiki} />)}
            </Validation>
         </div>
         <div id='placement' className='field'>
            <header>{tr('placement')}</header>
            <label>
               {this.bind('talkPage', <input type='radio' name='talkPage' value={false} />)}
               <span>{tr('inArticle')}</span>
            </label>
            <label>
               {this.bind('talkPage', <input type='radio' name='talkPage' value={true} />)}
               <span>{tr('onTalkPage')}</span>
            </label>
         </div>
         <div id='args'>
            <header>{tr('args')}</header>
            <div className='args'>
               {args.map(arg => this.renderArg(arg))}
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
      for (const arg of args) {
         add('|');
         if (arg.name) {
            add(arg.name, `${arg.id}-name`);
            add('=');
         }
         add(arg.value, `${arg.id}-value`);
      }
      add('}}');

      return parts;
   }
}

export default withTranslation(TemplatePage, 'EditathonConfig.TemplatePage');
