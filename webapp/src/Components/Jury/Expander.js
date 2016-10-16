import React from 'react';
import classNames from 'classnames';

export default function Expander({ expanded, className, children, ...props }) {
   return <div className={classNames([ 'Expander', className, expanded && 'expanded' ])} {...props}>
      {children}
   </div>;
}
