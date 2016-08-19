import React from 'react';
import classNames from 'classnames';

export default ({ className, ...props }) => <div className={classNames([ 'Loader', className ])} {...props} />
