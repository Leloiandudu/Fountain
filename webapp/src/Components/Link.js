import React from 'react';
import { Link } from 'react-router';
import url from '../url';

function fixLink(to) {
   if (to.pathname) {
      return Object.assign({}, to, { pathname: url(to.pathname) });
   } else if (typeof to === 'string') {
      return url(to);
   }
}

export default (props) =>
   <Link {...props} to={fixLink(props.to)} />
