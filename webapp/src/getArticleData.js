import moment from 'moment';
import { getPlainText, getWordCount, findTemplate } from './parsing';

class Request {
   constructor() {
      this.items = new Map();
      this.callbacks = [];
      this.lastCustomTypeId = 0;
   }

   add(type, params, cb) {
      let item = this.items.get(type);
      if (item === undefined) {
         if (type === 'firstRev' || type === 'lastRev') {
            item = {
               _title: 'titles',
               action: 'query',
               redirects: true,
               rvdir: type === 'firstRev' ? 'newer' : 'older',
            };
         } else if (type === 'html') {
            item = {
               _title: 'page',
               action: 'parse',
               redirects: true,
               prop: [ 'text' ],
               wrapoutputclass: '',
            }
         } else if (type === 'custom') {
            type = 'custom-' + ++this.lastCustomTypeId;
            item = {};
         } else {
            throw new Error(`Unknown type '${type}'`);
         }

         this.items.set(type, item);
      }

      // merging params

      for (const key in params) {
         const value = params[key];
         if (Array.isArray(value)) {
            let arr = item[key];
            if (arr === undefined)
               arr = [];
            else if (!Array.isArray(arr))
               throw new Error(`'${key}' is already defined as non-array '${arr}' for ${type}`);

            for (const it of value) {
               if (arr.indexOf(it) === -1)
                  arr.push(it);
            }
            item[key] = arr;
         } else {
            if (key in item && item[key] !== value)
               throw new Error(`'${key}' is already defined for ${type}, existing '${item[key]}' !== new '${value}'`);
            item[key] = value;
         }
      }

      this.callbacks.push(results => cb(results.get(type)));
      return this;
   }

   async runFor(wiki, title) {
      const items = [...this.items.entries()];

      const promises = items.map(([type, item]) => {
         const params = { };

         if (item._title) {
            params[item._title] = title;
         }

         for (const key in item) {
            if (key[0] == '_') continue;

            let value = item[key];
            if (Array.isArray(value))
               value = value.join('|');
            params[key] = value;
         }
         return wiki.exec(params);
      });

      const results = new Map((await Promise.all(promises)).map((result, i) => [ items[i][0], result ]));

      for (const [ type, result ] of results) {
         if (result.query && result.query.pages[0].missing)
            return false;
      }

      for (const cb of this.callbacks) {
         cb(results);
      }

      return true;
   }
}

const Types = {
   title: [
      'lastRev', { 
         prop: [ 'revisions' ],
         rvlimit: 1,
      }, ({
         query: {
            pages: [{ title }]
         }
      }) => title,
   ],
   ns: [
      'lastRev', { 
         prop: [ 'revisions' ],
         rvlimit: 1,
      }, ({
         query: {
            pages: [{ ns }]
         }
      }) => ns,
   ],
   html: [
      'html', {}, ({
         parse: { text }
      }) => text,
   ],
   chars: [
      'html', {}, ({
         parse: { text }
      }) => getPlainText(text).length,
   ],
   words: [
      'html', {}, ({
         parse: { text }
      }) => getWordCount(text),
   ],
   bytes: [
      'lastRev', {
         prop: [ 'revisions' ],
         rvprop: [ 'size' ],
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{ size }]
            }]
         }
      }) => size,
   ],
   card: [
      'lastRev', {
         prop: [ 'extracts', 'pageimages' ],

         exintro: true, // only content before first section
         exsentences: 5, // max sentences to return
         explaintext: true,

         piprop: 'thumbnail',
         pithumbsize: 300,
      }, ({
         query: {
            pages: [{
               extract,
               thumbnail,
            }]
         }
      }) => ({
         extract,
         thumbnail,
      }),
   ],
   creator: [
      'firstRev', {
         prop: [ 'revisions' ],

         rvprop: [ 'user' ],
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{
                  user,
               }],
            }],
         }
      }) => user,
   ],
   created: [
      'firstRev', {
         prop: [ 'revisions' ],

         rvprop: [ 'timestamp' ],
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{
                  timestamp,
               }],
            }],
         }
      }) => timestamp,
   ],
   addedForCleanupRu: ({ at }) => [
      'custom', {
         _title: 'titles',
         action: 'query',
         redirects: true,
         rvdir: 'older',
         rvstart: moment(at).toISOString(),
         prop: [ 'revisions' ],
         rvprop: [ 'ids', 'content' ],
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{
                  revid,
                  content,
               }]
            }]
         }
      }) => {
         const template = findTemplate(content, 'К улучшению');
         const arg = template && template.args[0];
         return {
            date: arg && arg.value && moment.utc(arg.value, 'YYYY-M-D', true),
            revId: revid,
         };
      }
   ],
   fileUrl: [
      'lastRev', {
         prop: [ 'imageinfo' ],

         iiprop: 'url',
         iiurlwidth: 800,
      }, ({
         query: {
            pages: [{
               title,
               imageinfo: [{
                  url,
                  thumburl,
               }],
            }],
         }
      }) => ({
         title,
         fileUrl: {
            url,
            thumburl,
         },
      }), 'merge',
   ],
};

// what: title, ns, html, chars, bytes, creator, created, card, { type: addedForCleanupRu, arg: { at: 'date' } }
export default async function getArticleData(mwApi, title, what) {
   const req = new Request();
   const result = {};

   for (const item of new Set(what)) {
      let type, arg;
      if (typeof item === 'string') {
         type = item;
         arg = null;
      } else {
         ({ type, arg } = item);
      }

      if (!(type in Types))
         throw new Error(`Unknown type '${type}'`);

      let config = Types[type];
      if (typeof config === 'function') {
         config = config(arg);
      }

      const [ reqType, params, cb, mode ] = config;
      req.add(reqType, params, data => {
         const res = cb(data);
         if (mode === 'merge') {
            Object.assign(result, res);
         } else {
            result[type] = res;
         }
      });
   }

   if (!await req.runFor(mwApi, title))
      return null;

   return result;
}
