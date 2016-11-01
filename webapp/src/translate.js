import React from 'react';
import moment from 'moment';

export function plural(n, one, few, many) {
   if (many === undefined)
      return Math.abs(n) === 1 ? one : few;

   n = Math.abs(n) % 100;
   if (n < 10 || n > 20) {
      const x = n % 10;
      if (x == 1)
         return one;
      if (0 < x && x < 5)
         return few;
   }
   return many;
}

export function gender(g, feminine, masculine, neuter = masculine) {
   if (g === 'female') {
      return feminine;
   } else if (g === 'male') {
      return masculine;
   } else {
      return neuter;
   }
}

export function numberFormatter(group, decimal) {
   if (!group && !decimal)
      return n => n.toString();

   function formatInt(n, places) {
      if (places < 0)
         n -= n % Math.pow(10, -places);

      if (n === 0)
         return '0';

      const parts = [ ];
      while (n > 0) {
         parts.unshift((n % 1000).toFixed());
         n = Math.trunc(n / 1000);
      }

      return parts.map((p, i) => i === 0 ? p : p.padStart(3, '0')).join(group);
   }

   return function formatNumber(n, { places = 0, forcePlus = false } = {}) {
      const p = Math.abs(n) + 5 * Math.pow(10, -places - 1);
      const i = Math.trunc(p);

      const sign = Math.sign(n) === -1 ? 
         '\u2212' : 
         (forcePlus ? '+' : '');

      const start = sign + formatInt(i, places);
      if (places <= 0)
         return start;

      const f = p - i;
      return start + decimal + f.toString().slice(2, places + 2);
   }
}

export function dateFormatter(lang) {
   return {
      formatDate(date, format) {
         return moment(date).locale(lang).format(format);
      },
      formatDateIn(date) {
         return moment(date).locale(lang).fromNow();
      }
   }
}

export function translator(dict) {
   return function translate(key, ...args) {
      const tr = key.split('.').reduce((d, k) => {
         const v = d[k];
         if (v === undefined) throw new Error(`Key '${key}' is not found at ${k}`);
         return v;
      }, dict);

      if (typeof tr === 'string') {
         return tr;
      } else {
         return tr.apply(null, args);
      }
   }
}

// const { translations: Langs } = require('./translations/*.js', { mode: 'hash' });
const Langs = {
   bg: require('./translations/bg').default,
   de: require('./translations/de').default,
   en: require('./translations/en').default,
   ru: require('./translations/ru').default,
   sq: require('./translations/sq').default,
   uk: require('./translations/uk').default,
   zh: require('./translations/zh').default,
};

export class TranslationContext extends React.Component {
   static get childContextTypes() {
      return {
         'TranslationContext': React.PropTypes.object,
      }
   }

   static get propTypes() { 
      return {
         defaultLang: React.PropTypes.string.isRequired,
         onSetLang: React.PropTypes.func,
      }
   }

   constructor(props) {
      super(props);
      this.state = {
         curLang: null,
      };
   }

   getChildContext() {
      let curLang = this.state.curLang || this.props.defaultLang;
      if (!Langs[curLang])
         curLang = 'en';
      return {
         'TranslationContext': {
            curLang,
            translate: translator(Langs[curLang]),
            translateFrom: (lang, ...args) => translator(Langs[lang])(...args),
            setLang: lang => {
               if (!(lang in Langs)) {
                  throw new Error('Unknown language ' + lang);
               }
               this.setState({ curLang: lang });
               if (this.props.onSetLang)
                  this.props.onSetLang(lang);
            },
            allLangs() {
               return Object.keys(Langs).sort();
            },
         }
      };
   }

   render() {
      return this.props.children;
   }
}

export function withTranslation(Component, prefix) {
   return class Translation extends React.Component {
      static get contextTypes() {
         return {
            'TranslationContext': React.PropTypes.object,
         }
      }

      render() {
         const translation = { ...this.context['TranslationContext'] };
         if (prefix)
            translation.tr = (key, ...args) => translation.translate(prefix + '.' + key,  ...args);
         return <Component {...this.props} translation={translation} />
      }
   }
}
