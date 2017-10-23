import React from 'react';
import classNames from 'classnames';
import Tooltip from '../Tooltip';
import { withTranslation } from '../../translate';

export class ValidationForm extends React.Component {
   static get childContextTypes() {
      return {
         'ValidationContext': React.PropTypes.object,
      }
   }

   static get propTypes() { 
      return {
         className: React.PropTypes.string,
      }
   }

   constructor(props) {
      super(props);
      this._validations = new Set();
   }

   validate() {
      let valid = true;
      for (const v of this._validations) {
         const result = v.validate(true);
         valid = valid && result; 
      }
      return valid;
   }

   add(validation) {
      this._validations.add(validation);
   }

   remove(validation) {
      this._validations.delete(validation);
   }

   getChildContext() {
      return {
         'ValidationContext': {
            add: this.add.bind(this),
            remove: this.remove.bind(this),
         },
      };
   }

   render() {
      return <div className={classNames('ValidationForm', this.props.className)}>
         {this.props.children}
      </div>;
   }
}

class Validation extends React.Component {
   static get contextTypes() {
      return {
         'ValidationContext': React.PropTypes.object,
      }
   }

   static get propTypes() { 
      return {
         isEmpty: React.PropTypes.func,
         validate: React.PropTypes.func,
      }
   }

   constructor(props) {
      super(props);
      this.state = {
         message: null,
      };
      this._isEmpty = false;
   }

   componentDidMount() {
      this.context.ValidationContext.add(this);
   }

   componentWillUnmount() {
      this.context.ValidationContext.remove(this);
   }

   validate(checkEmpty) {
      let message = null;
      const props = this.props;

      const isEmpty = !props.isEmpty || props.isEmpty();
      if ((checkEmpty || this._isEmpty) && isEmpty) {
         message = this.props.translation.tr('required');
         this._isEmpty = true;
      } else {
         this._isEmpty = false;
      }

      if (!isEmpty) {
         message = props.validate && props.validate();
      }

      this.setState({ message });
      return !message;
   }

   render() {
      const { message } = this.state;
      return <div className={classNames('Validation', message && 'invalid')}
                  onBlur={() => { this.validate(false) }}>
         {this.props.children}
         {message && <Tooltip>{message}</Tooltip>}
      </div>
   }
}

Validation = withTranslation(Validation, 'Validation');
export { Validation };
