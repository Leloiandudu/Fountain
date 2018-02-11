import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

export default class IntegerInput extends React.Component {
   constructor(props) {
      super(props);
      this.componentWillReceiveProps(props);
   }

   componentWillReceiveProps({ value, max, min, onChange }) {
      if (this.isEmpty(value)) {
         this.state = { value: '' };
         return;
      }

      value = parseInt(value) || 0;
      let changed = false;
      if (value > max) {
         value = max;
         changed = true;
      }
      if (value < min) {
         value = min;
         changed = true;
      }
      this.state = { value };

      if (changed && onChange) {
         onChange(value);
      }
   }

   isEmpty(value) {
      return !value && value !== 0;
   }

   dec() {
      const { min, onChange } = this.props;
      const value = parseInt(this.state.value) || 0;
      if (onChange && !(value <= min)) {
         onChange(value - 1);
      }
   }

   inc() {
      const { max, onChange } = this.props;
      const value = parseInt(this.state.value) || 0;
      if (onChange && !(value >= max)) {
         onChange(value + 1);
      }
   }

   onChange(value) {
      this.setState({ value });

      value = parseInt(value);
      if (isNaN(value)) return;

      const { min, max, onChange } = this.props;

      if (onChange && !(value < min) && !(value > max)) {
         onChange(value);
      }
   }

   onBlur() {
      let { value } = this.state;
      const { min, max, onChange } = this.props;

      if (this.isEmpty(value)) {
         onChange && onChange(undefined);
         return;
      }

      value = parseInt(value);
      if (isNaN(value)) {
         value = this.props.value;
      }
      value = value || 0;

      if (value > max) {
         value = max;
      }
      if (value < min) {
         value = min;
      }
      this.setState({ value });
      if (onChange && value != this.props.value) {
         onChange(value);
      }
   }

   onKeyDown(e) {
      switch(e.keyCode) {
      case 38:
         this.inc();
         break;

      case 40:
         this.dec();
         break;

      default:
         return;
      }

      e.preventDefault();
   }

   render() {
      let { value } = this.state;
      const { className } = this.props;

      if (this.isEmpty(value)) {
         value = '';
      }

      return <div className={classNames([ 'IntegerInput', className ])}>
         <div className='minus' onClick={() => this.dec()}><span>&minus;</span></div>
         <input type='number' value={value}
                onChange={e => this.onChange(e.target.value)}
                onBlur={() => this.onBlur()}
                onKeyDown={e => this.onKeyDown(e)} />
         <div className='plus' onClick={() => this.inc()}><span>+</span></div>
      </div>;
   }
}
