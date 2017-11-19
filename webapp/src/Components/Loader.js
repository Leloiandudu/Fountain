import React from 'react';
import classNames from 'classnames';

export default ({ className, loading = true, children, ...props }) => 
   <div className={classNames([ loading && 'Loader', className ])} children={loading ? null : children} {...props} />
