import React from 'react';
import classNames from 'classnames';
import resolvePathname from 'resolve-pathname';
import { getRoutes, getTabRoutes } from '../../routerUtils';
import Link from '../Link';
import General from './General';
import { unUrl } from './../../url';

const Tabs = {
   'general': { title: 'General', component: General },
   'editathons': { title: 'Editathons' },
};

const Personal = ({ children, location }) => <div className='Personal mainContentPane'>
   <h1>Personal Cabinet</h1>
   <div className='content'>
      <nav className='tabs'>
         {Object.keys(Tabs).map(path => ({ 
               path,
               active: location.pathname.endsWith(path),
            })).map(({ path, active }) => <div key={path} className={classNames({ tab: true, active })}>
            <Link replace to={active ? null : resolvePathname(`./${path}`, unUrl(location.pathname))}>
               {Tabs[path].title}
            </Link>
         </div>)}
      </nav>
      <div className='content'>
         {children}
      </div>
   </div>
</div>;

export default Personal;
export const routes = getRoutes('personal', Personal, getTabRoutes(Tabs));
