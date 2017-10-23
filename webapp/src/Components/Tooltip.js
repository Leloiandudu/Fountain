import React from 'react';
import classNames from 'classnames';

export default function Tooltip({ children, className, onTop = false }) {
    return <div className={classNames('Tooltip', className)}>
       <div className={classNames('content', onTop ? 'top' : 'bottom')}>
         {children}
      </div>
    </div>;
}
