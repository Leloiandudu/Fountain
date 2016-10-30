import { mwApi } from './MwApi';
import { getPlainText, getWordCount } from './parsing';

class Request {
   constructor() {
      this.items = new Map();
      this.callbacks = [];
   }

   add(type, params, cb) {
      let item = this.items.get(type);
      if (item === undefined) {
         if (type !== 'firstRev' && type !== 'lastRev')
            throw new Error(`Unknown type '${type}'`);

         item = {
            action: 'query',
            redirects: true,
            rvdir: type === 'firstRev' ? 'newer' : 'older',
         };
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
         const params = {
            titles: title,
         };
         for (const key in item) {
            let value = item[key];
            if (Array.isArray(value))
               value = value.join('|');
            params[key] = value;
         }
         return wiki.exec(params);
      });

      const results = new Map((await Promise.all(promises)).map((result, i) => [ items[i][0], result ]));

      for (const [ type, result ] of results) {
         if (result.query.pages[0].missing)
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
      'lastRev', {
         prop: [ 'revisions' ],
         rvprop: [ 'content' ],
         rvparse: true,
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{ content }]
            }]
         }
      }) => content,
   ],
   chars: [
      'lastRev', {
         prop: [ 'revisions' ],
         rvprop: [ 'content' ],
         rvparse: true,
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{ content }]
            }]
         }
      }) => getPlainText(content).length,
   ],
   words: [
      'lastRev', {
         prop: [ 'revisions' ],
         rvprop: [ 'content' ],
         rvparse: true,
         rvlimit: 1,
      }, ({
         query: {
            pages: [{
               revisions: [{ content }]
            }]
         }
      }) => getWordCount(content),
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

         // uselang: 'ru',
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
};

// what: title, ns, html, chars, bytes, creator, created, card
export default async function getArticleData(title, what) {
   const req = new Request();
   const result = {};

   for (const item of new Set(what)) {
      if (!(item in Types))
         throw new Error(`Unknown type '${item}'`);

      const [ type, params, cb ] = Types[item];
      req.add(type, params, data => result[item] = cb(data));
   }

   if (!await req.runFor(mwApi, title))
      return null;

   return result;
}
