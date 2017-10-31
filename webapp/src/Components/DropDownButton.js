import React from 'react';
import DropDown from './DropDown';
import WikiButton from './WikiButton';

export default function DropDownButton({ className, collapse, items, renderItem, onClick, children }) {
   return <DropDown
      className={className}
      collapse={collapse}
      items={items}
      renderItem={renderItem}
      value={children}
      onChange={x => onClick(x)} />
}
