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
         action: "parse",
         page: title,
         prop: "text",
      });

      return response.parse.text;
   }
}

export const mwApi = new MwApi('https://ru.wikipedia.org/w/api.php');
