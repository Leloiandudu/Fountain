import React from 'react';
import DropDown from './DropDown';
import WikiButton from './WikiButton';

export default function DropDownButton({ className, items, renderItem, onClick, children }) {
   return <DropDown
      className={className}
      items={items}
      renderItem={renderItem}
      value={children}
      onChange={x => onClick(x)} />
}
