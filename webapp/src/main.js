import 'babel-polyfill';
import './URLSearchParams';
import 'whatwg-fetch';

import moment from 'moment';
import 'moment/locale/ru';
import React from 'react';
import { render } from 'react-dom';
import Router from './Router'

moment.updateLocale('ru', {
    monthsShort : [
        'янв', 'фев', 'мар', 'апр', 'май', 'июн', 
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
    ]
});

render(Router, document.getElementById('body'));
