import React from 'react';
import classNames from 'classnames';
import Autocomplete from 'react-autocomplete';
import { getSiteMatrix } from './../MwApi';
import sortBy from './../sortBy';

const MaxItems = 10;

export default class WikiLookup extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         text: props.value || '',
         items: [],
         filteredItems: []
      };
      this.init();
   }

   async init() {
      const matrix = await getSiteMatrix();
      const items = matrix
         .map(lang => lang.sites.map(s => ({
            code: s.code,
            name: s.name,
            lang: {
               code: lang.code,
               name: lang.name,
            },
         })))
         .reduce((a1, a2) => a1.concat(a2), [{
            code: null, name: '',
            lang: { code: 'commons', name: 'commons' },
         }]);

      this.setState(state => ({
         items,
         filteredItems: this.filter(state.text, items),
      }));
   }

   componentWillReceiveProps(newProps) {
      const text = newProps.value || '';
      if (newProps.value != this.props.value) {
         this.setState(state =>({
            text,
            filteredItems: this.filter(text, state.items),
         }));
      }
   }

   renderItem(item, selected, styles) {
      return <tr className={classNames({ item: true, selected })} key={this.getItemCode(item)}>
         <td>{this.getItemCode(item)}</td>
         <td>{item.name}</td>
         <td>{item.lang.name}</td>
      </tr>;
   }

   getItemCode(item) {
      return item.code === null ? item.lang.code : `${item.code}:${item.lang.code}`;
   }

   renderMenu(items, value, style) {
      if (!items.length) {
         return <div />
      }

      const more = this.state.filteredItems.length > MaxItems;

      return <div className='popup-container'>
         <div className='popup' style={{ minWidth: style.minWidth }}>
            <table>
               <thead>
                  <tr>
                     <th>код</th>
                     <th>название</th>
                     <th>язык</th>
                  </tr>
               </thead>
               <tbody>{items}</tbody>
               {more && <tbody>
                  <tr className='item'>
                     <td colSpan={3}>...</td>
                  </tr>
               </tbody>}
            </table>
         </div>
      </div>;
   }

   matchItem(item, text) {
      if (text.length < 1) return false;
      return this.getItemCode(item).indexOf(text) !== -1
          || item.name.toLowerCase().indexOf(text) === 0
          || item.lang.name.toLowerCase().indexOf(text) === 0;
   }

   sortItems(a, b, text) {
      return sortBy(
         x => x.code === text ? 0 : 1,
         x => x.lang.code === text ? 0 : 1,
         x => x.lang.code,
         x => x.code
      )(a, b);
   }

   filter(text, items) {
      text = text.toLowerCase();
      return items
         .filter(i => this.matchItem(i, text))
         .sort((a, b) => this.sortItems(a, b, text));
   }

   onChange(text, item) {
      this.setState(state => ({
         text,
         filteredItems: this.filter(text, state.items)
      }));

      if (item === undefined) {
         item = this.state.items.filter(i => this.getItemCode(i) === text)[0];
      }

      this.props.onChange && this.props.onChange(item && this.getItemCode(item) || null);
   }

   render() {
      return <Autocomplete
         wrapperProps={{ className: 'WikiLookup' }}
         inputProps={this.props.inputProps}
         value={this.state.text}
         items={[...this.state.filteredItems].slice(0, MaxItems)}
         getItemValue={this.getItemCode}
         renderItem={this.renderItem.bind(this)}
         renderMenu={this.renderMenu.bind(this)}
         onSelect={(text, item) => this.onChange(text, item)}
         onChange={(event, text) => this.onChange(text)} />;
   }
}
