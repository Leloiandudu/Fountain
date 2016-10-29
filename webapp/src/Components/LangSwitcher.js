import React from 'react';
import { findDOMNode } from 'react-dom';
import Autocomplete from 'react-autocomplete';
import classNames from 'classnames';
import scrollIntoView from 'dom-scroll-into-view';
import { withTranslation } from '../translate';

const keyHandlers = {
   Enter() {
      if (this.state.highlighted)
         this.select(this.state.highlighted);
   },

   ArrowUp() { 
      const langs = this.props.translation.allLangs();
      const index = langs.indexOf(this.state.highlighted);
      if (index > 0)
         this.setState({ highlighted: langs[index - 1] })
   },

   ArrowDown() { 
      const langs = this.props.translation.allLangs();
      const index = langs.indexOf(this.state.highlighted);
      if (index < langs.length - 1)
         this.setState({ highlighted: langs[index + 1] })
   },

   Escape() {
      this.setState({ isOpen: false });
   },
};

class LangSwitcher extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         isOpen: false,
         value: '',
         highlighted: '',
      };
   }

   componentDidUpdate() {
      if (this.shouldScroll) {
         this.shouldScroll = false;
         scrollIntoView(
            findDOMNode(this.refs.highlighted),
            findDOMNode(this.refs.list), 
            { onlyScrollIfNeeded: true, offsetBottom: 20 });
      }
   }

   shouldRender(item) {
      const value = this.state.value.toLowerCase();
      return item.code.toLowerCase().indexOf(value) === 0 ||
             item.name.toLowerCase().indexOf(value) === 0;
   }

   open() {
      this.setState({
         isOpen: true,
         value: '',
         highlighted: this.props.translation.curLang,
      });
      this.shouldScroll = true;
   }

   select(value) {
      this.props.translation.setLang(value);
      this.setState({ isOpen: false });
   }

   onKeyDown(event) {
      const handler = keyHandlers[event.key];
      if (handler) {
         event.preventDefault();
         handler.call(this, event);
      }
   }

   onBlur() {
      setTimeout(() => this.setState({ isOpen: false }), 100);
   }

   renderItem(x) {
      return <a className={classNames({
                   current: x.code === this.props.translation.curLang,
                   highlighted: x.code === this.state.highlighted,
                })}
                onClick={() => this.select(x.code)}
                key={x.code}
                ref={x.code === this.state.highlighted ? 'highlighted' : undefined}>
         {`${x.code}: ${x.name}`}
      </a>;
   }

   getItems() {
      const { translation: { allLangs, translateFrom: trF } } = this.props;
      return allLangs()
         .map(x => ({ code: x, name: trF(x, '_name') }))
         .filter(x => this.shouldRender(x));
   }

   onChange(value) {
      this.state.value = value;
      const items = this.getItems();
      let highlighted = this.state.highlighted;
      if (!items.filter(x => x.code === this.state.highlighted)[0])
         highlighted = items[0] && items[0].code;
      this.setState({ value, highlighted });
   }

   render() {
      return <div className='LangSwitcher'>
         <button onClick={() => this.open()}>{'\u00a0'}</button>
         {this.state.isOpen && <div className='popup'>
            <input autoFocus={true}
                   onKeyDown={e => this.onKeyDown(e)}
                   onBlur={() => this.onBlur()}
                   value={this.state.value}
                   onChange={e => this.onChange(e.target.value)} />
            <div className='list' ref='list'>
               {this.getItems().map(x => this.renderItem(x))}
            </div>
         </div>}
      </div>;
   }
}

export default withTranslation(LangSwitcher);
