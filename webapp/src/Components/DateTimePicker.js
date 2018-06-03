import React from 'react';
import { findDOMNode } from 'react-dom';
import DayPicker from 'react-day-picker';
import LocaleUtils from 'react-day-picker/moment';
import moment from 'moment';
import { withTranslation } from '../translate';

function dateEqual(date1, date2) {
   if (!date1) {
      return !date2;
   } else if (!date2) {
      return false;
   } else {
      return date1.valueOf() === date2.valueOf();
   }
}

function getUtcDate(date) {
   return moment.utc({
      y: date.getFullYear(),
      M: date.getMonth(),
      d: date.getDate(),
   });
}

class DateTimePicker extends React.Component {
   constructor(props) {
      super(props);
      this.state = this.getState(props.value, props);
   }

   componentWillReceiveProps(newProps) {
      let state = {};
      if (!dateEqual(newProps.value, this.props.value)
         || this.getCurLang() !== this.getCurLang(newProps)) {
         state = this.getState(newProps.value, newProps);
      }

      this.setState(state);
   }

   formatDate(date, props = this.props) {
      return props.translation.translate(
         'formatDate', moment(date).utc(), this.getFormat(props));
   }

   parseDate(text) {
      return moment.utc(text, this.getFormat(), this.getCurLang(), true);
   }

   getFormat(props = this.props) {
      return props.translation.translate('dateTimePicker');
   }

   getCurLang(props = this.props) {
      return props.translation.curLang;
   }

   onDayClick(date) {
      date = getUtcDate(date);

      const prev = this.props.value;
      if (prev) {
         const time = moment.utc(prev);
         date.add(time.diff(moment(time).startOf('d')));
      }

      date = date.toDate();

      this.setState(this.getState(date));
      this.props.onChange && this.props.onChange(date);
      setTimeout(() => this.setState({ isOpen: false }), 100);
   }

   getState(date, props) {
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
         ...this.getState(this.props.value),
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
      const locale = moment.localeData(this.getCurLang());
      const placeholder = this.getFormat()
         .split(' ')
         .map(x => x.toLowerCase().startsWith('l') ? locale.longDateFormat(x).toLowerCase() : x)
         .join(' ');

      const value = this.props.value && moment.utc(this.props.value);

      return <div className='DateTimePicker'>
         <input
            id={this.props.id}
            value={this.state.text}
            ref='input'
            placeholder={placeholder}
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
                  selectedDays={(date) => value && value.isSame(getUtcDate(date), 'day')}
                  disabledDays={(date) => moment().isAfter(date, 'day')}
                  onDayClick={(date, mods) => this.onDayClick(date, mods)}
                  onMonthChange={month => this.setState({ month })} />
            </div>}
         </div>
      </div>;
   }
}

export default withTranslation(DateTimePicker);
