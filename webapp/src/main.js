import 'babel-polyfill';
import './URLSearchParams';
import 'whatwg-fetch';

import moment from 'moment';
import React from 'react';
import { render } from 'react-dom';
import Router from './Router'
import { TranslationContext } from './translate'

moment.updateLocale('ru', {
    monthsShort : [
        'янв', 'фев', 'мар', 'апр', 'май', 'июн', 
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
    ]
});

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
