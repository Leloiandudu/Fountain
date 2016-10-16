import React from 'react';
import classNames from 'classnames';
import WikiLink from '../WikiLink';

export default function Header({ title, menuOpen, toggleMenu, children, onClose }) {
   return (
      <div className='Header'>
         <button className={classNames({
            'menu-button': true,
            'open': menuOpen,
         })} onClick={() => toggleMenu()} />
         <WikiLink className='title' title={title} to={title} target='_blank' />
         <div className='children'>
            {children}
         </div>
         <button className='close-button' onClick={onClose}></button>
      </div>
   );
}
