import 'babel-polyfill';
import './URLSearchParams';
import 'whatwg-fetch';

import React from 'react';
import { render } from 'react-dom';
import Router from './Router'
import { TranslationContext } from './translate'

// TODO: do on the server side when lighttpd is updated to version 1.4.40 on labs server
if (location.hostname === 'tools.wmflabs.org' && location.protocol === 'http:') {
   location.href = 'https' + location.href.slice(4);
}

let lang = localStorage.getItem('fountainLang');
if (!lang) {
   lang = navigator.language || navigator.userLanguage;
   if (lang) {
      const index = lang.indexOf('-');
      if (index !== -1)
         lang = lang.substr(0, index);
   }
}

render(
   <TranslationContext defaultLang={lang || 'en'} onSetLang={x => localStorage.setItem('fountainLang', x)}>
      {Router}
   </TranslationContext>,
   document.getElementById('body'));
