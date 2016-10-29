import React from 'react';
import WikiLink from './WikiLink';
import { withTranslation } from './../translate';

const Footer = ({ translation: { tr }}) => 
   <div className='Footer mainContentPane'>
      <span>{tr('preLink')}</span>
      <WikiLink to='UT:Ле Лой'>{tr('link')}</WikiLink>
      <span>{tr('postLink')}</span>
   </div>

export default withTranslation(Footer, 'Footer');
