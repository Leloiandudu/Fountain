import React from 'react';
import classNames from 'classnames';
import resolvePathname from 'resolve-pathname';
import { getRoutes } from '../../routerUtils';
import { withTranslation } from '../../translate';
import url, { unUrl } from '../../url';
import Link from '../Link';
import Editathons from './Editathons';

const Tabs = {
   'editathons': Editathons,
};

class Personal extends React.Component {
   static get contextTypes() {
      return {
         router: React.PropTypes.object.isRequired
      };
   }

   componentWillMount() {
      if (!Global.user) {
         this.context.router.replace({
            pathname: url('/'),
         });
      }
   }

   render() {
      const { children, location, translation: { tr } } = this.props;
      return <div className='Personal mainContentPane'>
         <h1>{tr('title')}</h1>
         <div className='content'>
            <nav className='tabs'>
               {Object.keys(Tabs).map(path => ({ 
                     path,
                     active: location.pathname.endsWith(path),
                  })).map(({ path, active }) => <div key={path} className={classNames({ tab: true, active })}>
                  <Link replace to={active ? null : resolvePathname(`./${path}`, unUrl(location.pathname))}>
                     {tr(path)}
                  </Link>
               </div>)}
            </nav>
            <div className='content'>
               {children}
            </div>
         </div>
      </div>;
   }
}

Personal = withTranslation(Personal, 'Personal');

export const routes = getRoutes('personal', Personal, Tabs);
