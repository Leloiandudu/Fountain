import React from 'react';
import classNames from 'classnames';
import Autocomplete from 'react-autocomplete';
import throttle from './../throttle';

export default class LookupWithThrottle extends React.Component {
   constructor(props) {
      super(props);
      this.state = { items: [] };
   }

   componentWillMount() {
      this.callLookup = throttle(async value => {
         this.lookupValue = value;
         const items = await this.props.lookup(value);
         
         // make sure older request's response
         // didn't return after newer request's response
         if (this.lookupValue === value) {
            this.setState({ items })
         }
      }, 500);
   }

   componentDidMount() {
      if (this._autocomplete && this.props.autoFocus) {
         this._autocomplete.refs.input.select();
      }
   }

   componentWillUnmount() {
      this.callLookup && this.callLookup.cancel();
   }

   async onChange(value) {
      const { onChange } = this.props;
      onChange && onChange(value);
   }

   render() {
      const { inputProps, className, value } = this.props;

      return <Autocomplete
         ref={x => this._autocomplete = x}
         inputProps={inputProps}
         wrapperProps={{ className: classNames([ 'LookupWithThrottle', className ]) }}
         wrapperStyle={{}}
         value={value}
         items={this.state.items}
         getItemValue={x => x}
         renderItem={this.renderItem}
         renderMenu={this.renderMenu}
         onSelect={(value, item) => {
            this.onChange(value);
            this.setState({ items: [] })
         }}
         onChange={(event, value) => {
            this.onChange(value);
            this.callLookup(value);
         }} />;
   }

   renderItem(item, selected) {
      return <div key={item} className={classNames({ item: true, selected })}>{item}</div>;
   }

   renderMenu(items, value, style) {
      if (!items.length)
         return <div />;

      return <div className='popup-container'>
         <div className='popup' style={{ minWidth: style.minWidth }}>
            {items}
         </div>
      </div>;
   }
}

export function createLookup(baseClassName, lookup) {
   return function Lookup({ className, ...props }) {
      return <LookupWithThrottle
         className={classNames([ baseClassName, className ])}
         lookup={v => lookup(v, props)}
         {...props} />
   }
}
