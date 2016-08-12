import React from 'react';
import classNames from 'classnames';

function withoutNS(href) {
   return href.replace(/(.*:)?(.*)/, '$2');
}

export default (props) =>
   <a {...props} className={classNames([ 'WikiLink', props.className ])} href={`https://ru.wikipedia.org/wiki/${props.href}`}>
      {props.children || withoutNS(props.href)}
   </a>;
