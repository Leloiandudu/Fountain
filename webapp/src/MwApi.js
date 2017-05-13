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

   this.lookup = async function lookup(title) {
      const response = await exec({
         action: 'opensearch',
         search: title,
         namespace: 0,
         limit: 10,
         redirects: 'resolve',
      });
      return response[1];
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

export function getMwApi(wiki) {
   return new MwApi(`https://${getWikiHost(wiki)}/w/api.php`)
}
