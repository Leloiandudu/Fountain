import React from 'react';
import classNames from 'classnames';
import Autocomplete from 'react-autocomplete';
import { getMwApi } from './../MwApi';
import throttle from './../throttle';

export default React.createClass({
   getInitialState() {
      return {
         items: [],
      };
   },
   componentWillMount() {
      this.callLookup = throttle(async value => {
         this.lookupValue = value;
         const items = await this.lookup(value);
         
         // make sure older request's response
         // didn't return after newer request's response
         if (this.lookupValue === value) {
            this.setState({ items })
         }
      }, 500);
   },
   componentWillUnmount() {
      this.callLookup && this.callLookup.cancel();
   },
   lookup(value) {
      return value && getMwApi(this.props.wiki).lookup(value) || [];
   },
   async onChange(value) {
      const { onChange } = this.props;
      onChange && onChange(value);
   },
   render() {
      return <Autocomplete
         inputProps={this.props.inputProps}
         wrapperProps={{ className: 'ArticleLookup' }}
         wrapperStyle={{}}
         value={this.props.value}
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
   },
   renderItem(item, selected) {
      return <div key={item} className={classNames({ item: true, selected })}>{item}</div>;
   },
   renderMenu(items, value, style) {
      if (!items.length)
         return <div />;

      return <div className='popup-container'>
         <div className='popup' style={{ minWidth: style.minWidth }}>
            {items}
         </div>
      </div>;
   },
});
