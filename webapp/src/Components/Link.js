import React from 'react';
import { Link as RouterLink } from 'react-router';
import url from '../url';

export default class Link extends React.Component {
   constructor(props, { router }) {
      super(props);
      this._replacingRouter = {
         ...router,
         push: router.replace,
      }
   }

   static get contextTypes() {
      return {
         router: React.PropTypes.object.isRequired
      };
   }

   static get childContextTypes() {
      return {
         router: React.PropTypes.object,
      };
   }

   fixLink(to) {
      if (to === null) {
         return null;
      } else if (to.pathname) {
         return Object.assign({}, to, { pathname: url(to.pathname) });
      } else if (typeof to === 'string') {
         return url(to);
      } else {
         return to;
      }
   }

   getChildContext() {
      return {
         router: this.props.replace ? this._replacingRouter : this.context.router,
      };
   }

   render() {
      const { to, replace, ...props } = this.props;
      return <RouterLink {...props} to={this.fixLink(to)} />;
   }
}
