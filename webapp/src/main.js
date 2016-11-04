import 'babel-polyfill';
import './URLSearchParams';
import 'whatwg-fetch';

import React from 'react';
import { render } from 'react-dom';
import Router from './Router'
import { TranslationContext } from './translate'
import { getNavitagorLang } from './utils'

// TODO: do on the server side when lighttpd is updated to version 1.4.40 on labs server
if (location.hostname === 'tools.wmflabs.org' && location.protocol === 'http:') {
   location.href = 'https' + location.href.slice(4);
}

const lang = localStorage.getItem('fountainLang') || getNavitagorLang();

render(
   <TranslationContext defaultLang={lang || 'en'} onSetLang={x => localStorage.setItem('fountainLang', x)}>
      {Router}
   </TranslationContext>,
   document.getElementById('body'));
