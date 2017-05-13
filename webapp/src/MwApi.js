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
}

export function getMwApi(wiki) {
   return new MwApi(`https://${getWikiHost(wiki)}/w/api.php`)
}
