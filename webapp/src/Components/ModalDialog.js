import React from 'react';

export default ({ isOpen, children, tryClose }) => 
   isOpen && <div className='ModalDialog'>
      <div className='content'>
         {children}
      </div>
      <div className='wrapper' />
   </div>;
