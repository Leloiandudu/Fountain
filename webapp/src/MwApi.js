import pkg from './../package.json';

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

   this.loadArticleCard = async function loadArticleCard(title, timeout) {
      const res = await exec({
         action: 'query',
         titles: title,
         prop: 'extracts|pageimages',
         redirects: true,

         exintro: true, // only content before first section
         exsentences: 5, // max sentences to return
         explaintext: true,

         piprop: 'thumbnail',
         pithumbsize: 300,

         // Cache-Control: s-maxage=timeout
         maxage: timeout,
         smaxage: timeout,

         uselang: 'ru',
      });

      if (!res || !res.query || !res.query.pages || !res.query.pages[0])
         throw new Error(`Error requesting '${title}'`);

      const p = res.query.pages[0];

      if (p.missing)
         return null;

      return {
         extract: p.extract,
         thumbnail: p.thumbnail,
         title: p.title,
      };
   }

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
}
