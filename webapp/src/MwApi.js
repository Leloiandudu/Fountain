import pkg from './../package.json';

const wikisMap = [
   [ 'meta', 'meta.wikimedia.org' ],
   [ 'commons', 'commons.wikimedia.org' ],
   [ /^([a-z\-]+)$/, '$1.wikipedia.org' ],
   [ /^q:([a-z\-]+)$/, '$1.wikiquote.org' ],
   [ /^s:([a-z\-]+)$/, '$1.wikisource.org' ],
   [ /^b:([a-z\-]+)$/, '$1.wikibooks.org' ],
   [ /^n:([a-z\-]+)$/, '$1.wikinews.org' ],
   [ /^v:([a-z\-]+)$/, '$1.wikiversity.org' ],
   [ /^voy:([a-z\-]+)$/, '$1.wikivoyage.org' ],
   [ /^wikt:([a-z\-]+)$/, '$1.wiktionary.org' ],
];

export function getWikiHost(wiki) {
   for (const [ key, value ] of wikisMap) {
      if (key === wiki) {
         return value;
      } else if (key instanceof RegExp && key.test(wiki)) {
         return wiki.replace(key, value);
      }
   }
   throw new Error(`Unknown wiki '${wiki}'.`);
}

export function getArticleUrl(wiki, to = '') {
   wiki = getWikiHost(wiki);
   return `https://${wiki}/wiki/${to}`;
}

export default function MwApi(url) {
   async function exec(params) {
      params = Object.assign({}, {
         format: 'json',
         formatversion: 2,
         origin: '*',
      }, params);

      const data = new URLSearchParams();
      for (const k in params)
         data.append(k, params[k]);

      const headers = new Headers({
         // causes OPTIONS request, making it twice as slow
         // 'Api-User-Agent': `${pkg.name}/${pkg.version}`,
      })

      const response = await fetch(url + '?' + data, { method: 'GET', headers });
      return await response.json();
   }

   this.exec = exec;

   this.lookup = async function lookup(title, ns = 0) {
      const response = await exec({
         action: 'opensearch',
         search: title,
         namespace: ns,
         limit: 10,
         redirects: 'resolve',
      });
      return response[1];
   }

   this.lookupUser = async function lookupUser(text) {
      const {
         query: {
            allusers
         }
      } = await exec({
         action: 'query',
         list: 'allusers',
         auprefix: text.slice(0, 1).toUpperCase() + text.slice(1),
         auwitheditsonly: true,
      });

      return allusers.map(u => u.name);
   }

   this.getPageHtml = async function getPageHtml(title) {
      const response = await exec({
         action: 'parse',
         page: title,
         prop: 'text',
      });

      return response.parse.text;
   }

   this.getUserGender = async function getUserGender(name) {
      const {
         query: {
            users: [{
               gender = 'unknown'
            }]
         }
      } = await exec({
         action: 'query',
         list: 'users',
         ususers: name,
         usprop: 'gender',
      });

      return gender;
   }

   // returns undefined if user is not found
   // returns null if reg date is unknown
   this.getUserRegDate = async function getUserRegDate(name) {
      const {
         query: {
            users: [{
               registration
            }]
         }
      } = await exec({
         action: 'query',
         list: 'users',
         ususers: name,
         usprop: 'registration',
      });

      return registration;
   }

   this.getNamespaces = async function getNamespaces() {
      const result = await exec({
         action: 'query',
         meta: 'siteinfo',
         siprop: 'namespaces|namespacealiases',
         maxage: 30 * 24 * 60 * 60, // 30 days
      });

      const all = {};
      const ns = result.query.namespaces;
      for (const id in ns) {
         all[id] = new Set([ ns[id].name, ns[id].canonical ].filter(x => x !== undefined));
      }

      for (const { id, alias } of result.query.namespacealiases) {
         all[id].add(alias);
      }

      for (const id in all) {
         all[id] = [ ...all[id] ];
      }

      return all;
   }

   // returns numberic id of the namespace, or null if there is no 
   // prefix, or undefined if prefix is unknown
   this.getNamespace = async function getNamespace(title) {
      const allNs = await this.getNamespaces();

      if (title[0] === ':') {
         title = title.slice(1);
      }

      const index = title.indexOf(':');
      if (index === -1) {
         return null; 
      }

      const prefix = title.slice(0, index).toLowerCase();
      return Object.keys(allNs)
         .filter(n => allNs[n].some(x => x.toLowerCase() === prefix))
         .map(n => parseInt(n))[0];
   }
}

export async function getSiteMatrix() {
   const matrix = await getMwApi('meta').exec({
      action: 'sitematrix',
      smsiteprop: 'code|sitename',
      maxage: 30 * 24 * 60 * 60, // 30 days
   });
   delete matrix.sitematrix.count;
   delete matrix.sitematrix.specials;

   const map = {
      'wiki': null,
      'wikiquote': 'q',
      'wikisource': 's',
      'wikibooks': 'b',
      'wikinews': 'n',
      'wikiversity': 'v',
      'wikivoyage': 'voy',
      'wiktionary': 'wikt',
   };

   const results = [];
   for (const i in matrix.sitematrix) {
      const lang = matrix.sitematrix[i];

      if (lang.site === undefined) {
         console.log(lang);
         continue;
      }

      const result = {
         code: lang.code,
         name: lang.name,
         sites: lang.site
            .filter(s => s.private === undefined && s.closed === undefined && s.fishbowl === undefined && s.code in map)
            .map(s => ({
               code: map[s.code],
               name: s.sitename,
            })),
      };

      if (result.sites.length) {
         results.push(result);
      }
   }

   return results;
}

export function getMwApi(wiki) {
   return new MwApi(`https://${getWikiHost(wiki)}/w/api.php`)
}
