import { getMwApi } from './../MwApi';
import { createLookup } from './LookupWithThrottle';

export default createLookup('PageLookup', async function lookup(value, { wiki, ns }) {
   value = (value || '').trim();
   if (!value) return [];

   const mw = getMwApi(wiki);
   const restrictNs = ns !== undefined;
   const allNs = restrictNs ? await mw.getNamespaces() : null;

   if (restrictNs) {
      const id = await mw.getNamespace(value);
      if (id !== undefined && id !== null && id != ns) {
         return [];
      }
   }

   let results = await mw.lookup(value, ns);

   if (restrictNs && ns !== 0) {
      const prefixLength = allNs[ns][0].length + 1;
      results = results.map(r => r.slice(prefixLength));
   }

   return results;
});
