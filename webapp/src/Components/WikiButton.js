import React from 'react';
import classNames from 'classnames';

function WikiButton(props) {
   let element = <button />;
   let children = props.children;

   if (React.isValidElement(children)) {
      element = children;
      children = element.props.children;
   }

   return React.cloneElement(element, Object.assign({}, props, {
      className: classNames([ 'WikiButton', props.type, props.className ]),
   }), children);
}

WikiButton.propTypes = {
   children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
   ]),
   type: React.PropTypes.string,
};

export default WikiButton;
