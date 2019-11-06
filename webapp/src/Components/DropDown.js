import React from 'react';
import classNames from 'classnames';
import Autocomplete from 'react-autocomplete';
import WikiButton from './WikiButton';

export default class DropDown extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         open: false,
      };
      this._ignoreBlur = true;
      this._highlightPending = true;
   }

   componentWillReceiveProps(props) {
      const { value } = props;

      if (value !== this.props.value) {
         this._highlightPending = true;
      }
   }

   onButtonFocus() {
      if (!this.state.open) {
         this._highlightPending = true;
         this.setState({ open: true });
      } else {
         this.focusInput();
      }
   }

   onBlur() {
      if (this._ignoreBlur) return;
      setTimeout(() => this.setState({ value: '', open: false }), 1);
   }

   renderButton() {
      const { renderButton, value, renderItem = x => x, getValue, items } = this.props;

      let item, text;
      if (!getValue) {
         text = value;
      } else {
         for (const it of items) {
            if (getValue(it) === value) {
               item = it;
               text = renderItem(it);
               break;
            }
         }
      }

      const button = renderButton
         ? renderButton(value, text, item)
         : <WikiButton>{text}</WikiButton>;

      return React.cloneElement(button, {
         tabIndex: this.state.open ? -1 : 0,
         onFocus: () => this.onButtonFocus(),
         onMouseDown: () => this._ignoreBlur = true,
      });
   }

   renderItem(item, selected) {
      const { renderItem, getValue } = this.props;
      return <div
            key={getValue ? getValue(item) : item}
            className={classNames({ item: true, selected })}>
         {renderItem ? renderItem(item) : item}
      </div>
   }

   renderMenu(items, value, style) {
      return <div className='menu' tabIndex='-1'>
         {items}
      </div>
   }

   focusInput() {
      this._autocomplete && this._autocomplete.refs.input.focus();
   }

   onChange(event, value) {
      const { matchItem, filter } = this.props;

      if (!matchItem) return;
      this.setState({ value });

      if (this._autocomplete) {
         if (filter) {
            this.highlightIndex(this._autocomplete.getFilteredItems(this._autocomplete.props).length ? 0 : null);
         } else {
            this.highlightFirst(item => matchItem(item, value));
         }
      }
   }

   highlightValue(value) {
      const { getValue } = this.props;
      if (getValue) {
         this.highlightFirst(item => getValue(item) === value);
      }
   }

   highlightFirst(pred) {
      if (!this._autocomplete) return;
      const items = this._autocomplete.getFilteredItems(this._autocomplete.props);

      for (let i = 0; i < items.length; i++) {
         if (pred(items[i])) {
            this.highlightIndex(i);
            return;
         }
      }

      this.highlightIndex(null);
   }

   highlightIndex(index) {
      this._autocomplete.setState({ highlightedIndex: index });
   }

   onAutocompleteRef(ac) {
      this._autocomplete = ac;
      this.focusInput();
      if (this._highlightPending) {
         this.highlightValue(this.props.value);
         this._highlightPending = false;
      }
   }

   onKeyDown(e) {
      if (e.key === 'Escape') {
         e.target.blur();
      }
   }

   renderPopup() {
      const { open, value } = this.state;
      if (!open) return;

      const {
         onChange = () => {},
         items,
         getValue = x => x,
         filter = false,
         matchItem,
      } = this.props;

      return <div className='popup-container'>
         <div className='popup'>
            <Autocomplete
               autoHighlight={false}
               ref={ac => this.onAutocompleteRef(ac)}
               wrapperStyle={{}}
               wrapperProps={{
                  className: 'Autocomplete',
                  onMouseDown: () => this._ignoreBlur = true,
                  onMouseUp: () => this._ignoreBlur = false,
               }}
               inputProps={{
                  className: classNames('input', { hidden: !matchItem }),
                  onFocus: e => {
                     this._ignoreBlur = false;
                     e.target.select();
                  },
                  onBlur: () => this.onBlur(),
                  onKeyDown: e => this.onKeyDown(e),
               }}
               open={true}
               value={value}
               items={items}
               getItemValue={x => x}
               shouldItemRender={filter && matchItem ? matchItem : undefined}
               renderItem={(item, selected) => this.renderItem(item, selected)}
               renderMenu={(...args) => this.renderMenu(...args)}
               onSelect={(value, item) => {
                  onChange(getValue(value));
                  this.setState({ value: '', open: false })
               }}
               onChange={(e, v) => this.onChange(e, v)} />
         </div>
      </div>;
   }

   render() {
      return <div className={classNames('DropDown', this.props.collapse && 'collapse', this.props.className)}>
         {this.renderButton()}
         {this.renderPopup()}
      </div>;
   }
}
