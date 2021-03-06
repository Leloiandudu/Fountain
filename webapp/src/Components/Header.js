import React from 'react';
import Link from './Link';
import LangSwitcher from './LangSwitcher';
import url from '../url';
import { withTranslation } from '../translate';

const Header = ({ children, translation: { tr } }) => (
   <div className='Header'>
      <div className='mainContentPane'>
         <Link to='/'><img className='logo' src={url('/Content/logo.png')} /></Link>
         <LangSwitcher />
         {Global.user && <div className='login'>
            <span className='userName'><Link className='WikiLink' to='/personal'>{Global.user.name}</Link></span>
            <a className='action' href={url(`/logout?redirectTo=${window.location.pathname}`)}>{tr('signOut')}</a>
         </div> || <div className='login'>
            <a className='action' href={url(`/login?redirectTo=${window.location.pathname}`)}>{tr('signIn')}</a>
         </div>}
      </div>
   </div>
);

export default withTranslation(Header, 'Header');
