import React from 'react';
import { Route, IndexRedirect, Redirect } from 'react-router';

export function getRoutes(root, component, children) {
   return [
      <Route key='root' path={`${root}/`} component={component}>
         {children}
      </Route>,

      <Redirect key='redirect' from={`${root}`} to={`${root}/`} />,
   ];
}

export function getTabRoutes(tabs) {
   const paths = Object.keys(tabs);
   
   return [
      <IndexRedirect key='' to={paths[0]} />,
      ...paths.map(path => <Route key={path} path={path} component={tabs[path].component} />),
   ];
}
