import React from 'react';
import classNames from 'classnames';

export default ({ isOpen, children, tryClose, ...props }) => 
   isOpen && (<div {...props} className='ModalDialog'>
      <div className={classNames([ 'content', props.className ])}>
         {children}
      </div>
      <div className='wrapper' onClick={tryClose} />
   </div>) || null;
