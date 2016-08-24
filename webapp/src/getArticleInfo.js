import moment from 'moment';
import { mwApi } from './MwApi';
import { getPlainText } from './parsing';

export default async function getArticleInfo(title, includeCard = true) {
   const timeout = 300;
   const cardParams = !includeCard ? {} : {
      exintro: true, // only content before first section
      exsentences: 5, // max sentences to return
      explaintext: true,

      piprop: 'thumbnail',
      pithumbsize: 300,

      // Cache-Control: s-maxage=timeout
      maxage: timeout,
      smaxage: timeout,

      uselang: 'ru',
   };

   const [{
      query: {
         normalized,
         redirects,
         pages: [{
            ns,
            extract,
            thumbnail,
            revisions: [{
               content: html,
               size: size,
            }],
         }],
      },
   }, {
      query: {
         pages: [{
            revisions: [{
               user,
               timestamp,
            }],
         }],
      },
   }] = await Promise.all([mwApi.exec({
      action: 'query',
      titles: title,
      prop: 'revisions' + (includeCard ? '|extracts|pageimages' : ''),
      redirects: true,

      rvprop: 'content|size',
      rvparse: true,
      rvlimit: 1,

      ...cardParams,
   }), mwApi.exec({
      action: 'query',
      titles: title,
      prop: 'revisions',
      redirects: true,

      rvprop: 'user|timestamp',
      rvdir: 'newer',
      rvlimit: 1,
   })]);

   if (normalized && normalized[0])
      title = normalized[0].to;
   if (redirects && redirects[0])
      title = redirects[0].to;

   const stats = {
      title,
      html,
      chars: getPlainText(html).length,
      bytes: size,
      user,
      timestamp: moment(timestamp),
      ns,
   };

   if (!includeCard) {
      return stats;
   }

   return {
      card: {
         extract,
         thumbnail,
      },
      stats,
   };
}
