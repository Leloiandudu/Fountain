import React from 'react';
import { findDOMNode } from 'react-dom';
import DayPicker from 'react-day-picker';
import LocaleUtils from 'react-day-picker/moment';
import moment from 'moment';
import { withTranslation } from '../translate';

class DatePicker extends React.Component {
   constructor(props) {
      super(props);
      this.state = this.getState(props.value, props);
   }

   componentWillReceiveProps(newProps) {
      let state = {};
      if (newProps.value !== this.props.value) {
         state = this.getState(newProps.value, newProps);
      }

      if (this.getCurLang() !== this.getCurLang(newProps) && newProps.value) {
         state.text = this.formatDate(newProps.value, newProps);
      }

      this.setState(state);
   }

   formatDate(date, props = this.props) {
      return props.translation.translate('formatDate', date, 'L');
   }

   parseDate(text) {
      return moment.utc(text, 'L', this.getCurLang(), true);
   }

   getCurLang(props = this.props) {
      return props.translation.curLang;
   }

   onDayClick(date) {
      date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

      this.setState(this.getState(date));
      this.props.onChange && this.props.onChange(date);
      setTimeout(() => this.setState({ isOpen: false }), 100);
   }

   getState(date = this.props.value, props) {
      return {
         text: date && this.formatDate(date, props) || '',
         month: date || new Date(),
      };
   }

   onInputChange(text) {
      const date = this.parseDate(text);
      const value = date.isValid() ? date.toDate() : null;
      this.setState({
         text,
         month: date.isValid() ? date.toDate() : this.state.month,
      });

      if (this.props.onChange) {
         if (value || text == '' && this.props.allowEmpty) {
            this.props.onChange(value);
         }
      }
   }

   onInputFocus() {
      if (this.timeout) {
         clearTimeout(this.timeout);
         this.timeout = null;
      }
      this.setState((state) => state.isOpen ? {} : { isOpen: true });
   }

   onInputBlur() {
      this.timeout = setTimeout(() => this.setState(() => ({
         ...this.getState(),
         isOpen: false,
      })), 150);
   }

   onPopupClick() {
      const input = findDOMNode(this.refs.input);
      if (input) {
         input.focus();
      }
   }

   render() {
      return <div className='DatePicker'>
         <input
            id={this.props.id}
            value={this.state.text}
            ref='input'
            placeholder={moment.localeData(this.getCurLang()).longDateFormat('L').toLowerCase()}
            onClick={() => this.setState({ isOpen: true })}
            onChange={e => this.onInputChange(e.target.value)}
            onFocus={() => this.onInputFocus()}
            onBlur={() => this.onInputBlur()} />
         <div className='popup-container' onClick={() => this.onPopupClick()}>
            {this.state.isOpen && <div className='popup'>
               <DayPicker
                  tabIndex={null}
                  locale={this.getCurLang()}
                  localeUtils={LocaleUtils}
                  modifiers={{
                     weekend(date) {
                        const wd = date.getDay();
                        return wd === 0 || wd === 6;
                     },
                  }}
                  month={this.state.month}
                  selectedDays={(date) => moment(this.props.value || '').isSame(date, 'day')}
                  disabledDays={(date) => moment().isAfter(date, 'day')}
                  onDayClick={(date, mods) => this.onDayClick(date, mods)}
                  onMonthChange={month => this.setState({ month })} />
            </div>}
         </div>
      </div>;
   }
}

export default withTranslation(DatePicker);
