import React from 'react';
import classNames from 'classnames';
import WikiLink from '../WikiLink';

export default function Header({ title, wiki, menuOpen, toggleMenu, children, onClose }) {
   return (
      <div className='Header'>
         <button className={classNames({
            'menu-button': true,
            'open': menuOpen,
         })} onClick={() => toggleMenu()} />
         <WikiLink className='title' title={title} to={title} wiki={wiki} target='_blank' />
         <div className='children'>
            {children}
         </div>
         <button className='close-button' onClick={onClose}></button>
      </div>
   );
}
