import React from 'react';
import classNames from 'classnames';

function WikiButton({ type, children, className, submit, loading, ...props }) {
   let element = <button type={submit ? 'submit' : 'button'} />;

   if (!props.disabled && React.isValidElement(children)) {
      element = children;
      children = element.props.children;
   }

   return React.cloneElement(element, Object.assign({ children }, props, {
      className: classNames([ 'WikiButton', type, className, loading && 'loading' ]),
      disabled: loading || props.disabled || false,
   }), children);
}

WikiButton.propTypes = {
   children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
   ]),
   type: React.PropTypes.string,
   submit: React.PropTypes.bool,
};

export default WikiButton;
