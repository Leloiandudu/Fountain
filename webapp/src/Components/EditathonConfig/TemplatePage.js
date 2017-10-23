import React from 'react';
import classNames from 'classnames';
import PageLookup from '../PageLookup';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';

class TemplatePage extends React.Component {
   constructor(props) {
      super(props);
      this._argId = 0;
      this.state = {
         enabled: false,
         name: '',
         talkPage: false,
         args: [],
      };
   }

   addArg() {
      const { args } = this.state;
      args.push({ id: this._argId++ });
      this.setState({ args });
   }

   deleteArg(arg) {
      const { args } = this.state;
      const index = args.indexOf(arg);
      if (index !== -1) {
         args.splice(index, 1);
      }
      this.setState({ args });
   }

   render() {
      const { translation: { tr } } = this.props;
      const { enabled } = this.state;

      return <div className='page TemplatePage'>
         <label id='add'>
            <input type='checkbox' checked={enabled} onChange={e => this.setState({ enabled: e.target.checked })} />
            <span>{tr('autoAdd')}</span>
         </label>
         {enabled && this.renderRest()}
      </div>;
   }

   renderArg(arg) {
      const onChange = (e, p) => {
         arg[p] = e.target.value;
         this.setState({ args: this.state.args });
      }

      return <div className='arg' key={arg.id}>
         <input id={`${arg.id}-name`} value={arg.name || ''} onChange={e => onChange(e, 'name')} />
         <span>=</span>
         <input id={`${arg.id}-value`} value={arg.value || ''} onChange={e => onChange(e, 'value')} />
         <WikiButton className='delete' onClick={() => this.deleteArg(arg)} />
      </div>;
   }

   renderRest() {
      const { translation: { tr } } = this.props;
      const { name, talkPage, args } = this.state;
      return (<div>
         <div className='field' id='template'>            
            <label htmlFor='name'>{tr('name')}</label>
            <PageLookup
               inputProps={{ id: 'name' }}
               ns={10}
               wiki={'ru'}
               value={name}
               onChange={name => this.setState({ name })} />
         </div>
         <div id='placement' className='field'>
            <header>{tr('placement')}</header>
            <label>
               <input type='radio' name='talkPage' checked={!talkPage} onChange={e => this.setState({ talkPage: false })} />
               <span>{tr('inArticle')}</span>
            </label>
            <label>
               <input type='radio' name='talkPage' checked={talkPage} onChange={e => this.setState({ talkPage: true })} />
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
