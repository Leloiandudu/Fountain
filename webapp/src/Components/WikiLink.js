import React from 'react';
import classNames from 'classnames';
import { getWikiHost, getArticleUrl } from './../MwApi'

function withoutNS(to) {
   return to.replace(/(.*:)?(.*)/, '$2');
}

export default function({ to, wiki = 'meta', children, className, red, ...props }) {
   return <a {...props} className={classNames({ 'WikiLink' : true, [className]: className, red: red })} href={getArticleUrl(wiki, to)}>
      {children || withoutNS(to)}
   </a>;
}
