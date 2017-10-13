import React from 'react';
import classNames from 'classnames';

export default function Tooltip({ children, className }) {
    return <div className={classNames('Tooltip', className)}>
       <div className='content'>{children}</div>
    </div>;
}
