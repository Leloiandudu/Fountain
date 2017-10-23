import { getMwApi } from './../MwApi';
import { createLookup } from './LookupWithThrottle';

export default createLookup('UserLookup', async function lookup(value, { wiki }) {
   value = (value || '').trim();
   if (!value) return [];

   return await getMwApi(wiki).lookupUser(value);
});
