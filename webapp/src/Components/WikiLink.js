import React from 'react';
import classNames from 'classnames';

function withoutNS(to) {
   return to.replace(/(.*:)?(.*)/, '$2');
}

export default ({ to, children, className, red, ...props }) =>
   <a {...props} className={classNames({ 'WikiLink' : true, [className]: className, red: red })} href={`https://ru.wikipedia.org/wiki/${to}`}>
      {children || withoutNS(to)}
   </a>;
