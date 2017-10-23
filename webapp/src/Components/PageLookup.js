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
   async lookup(value) {
      value = (value || '').trim();
      if (!value) return [];

      const mw = getMwApi(this.props.wiki);
      const restrictNs = this.props.ns !== undefined;
      const allNs = restrictNs ? await mw.getNamespaces() : null;

      if (restrictNs) {
         const id = await mw.getNamespace(value);
         if (id !== undefined && id !== null && id != ns) {
            return [];
         }
      }

      let results = await mw.lookup(value, this.props.ns);

      if (restrictNs && this.props.ns !== 0) {
         const prefixLength = allNs[this.props.ns][0].length + 1;
         results = results.map(r => r.slice(prefixLength));
      }

      return results;
   },
   async onChange(value) {
      const { onChange } = this.props;
      onChange && onChange(value);
   },
   render() {
      return <Autocomplete
         inputProps={this.props.inputProps}
         wrapperProps={{ className: 'PageLookup' }}
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
