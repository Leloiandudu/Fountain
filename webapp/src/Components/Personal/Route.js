import React from 'react';
import { Route, IndexRedirect, Redirect } from 'react-router';
import Personal from './Personal';
import General from './General';

function routes(...routes) {
   return routes.map((x, i) => React.cloneElement(x, { key: i }));
}

export const route = 
   <Route path='personal/' component={Personal}>
      <IndexRedirect to='general' />

      <Route path='general' component={General} />
   </Route>;

export default routes(
   route,
   <Redirect from='personal' to='personal/' />
);
