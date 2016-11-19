import React from 'react';
import classNames from 'classnames';
import WikiLink from '../WikiLink';
import ConflictButton from './ConflictButton';

export default function Header({ article, editathon, menuOpen, toggleMenu, children, onClose }) {
   return (
      <div className='Header'>
         <button className={classNames({
            'menu-button': true,
            'open': menuOpen,
         })} onClick={() => toggleMenu()} />
         <ConflictButton editathon={editathon} article={article} />
         <WikiLink className='title' title={article.name} to={article.name} wiki={editathon.wiki} target='_blank' />
         <div className='children'>
            {children}
         </div>
         <button className='close-button' onClick={onClose}></button>
      </div>
   );
}
