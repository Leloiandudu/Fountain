import moment from 'moment';
import url from './url'
import URLSearchParams from 'url-search-params';

const apiUrl = url('/api/');

async function query(method, url, params) {
   const init = {
      method,
      credentials: 'same-origin',
   };

   if (params) {
      if (method === 'GET') {
         url += '?' + getParams(params, true).toString();
      } else {
         init.body = getParams(params, false);
      }
   }

   const response = await fetch(apiUrl + url, init);
   if (response.status === 401)
      throw new UnauthorizedHttpError();
   if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`);
   if (response.status === 204 || response.headers.get('Content-Length') == 0)
      return;
   return postProcess(await response.json());
}

function getParams(params, isUrl) {
   const data = true ? new URLSearchParams() : new FormData();
   for (const k in params)
      data.append(k, params[k]);
   return data;
}

const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?Z$/;

function postProcess(result) {
   if (!result)
      return result;

   if (typeof result === 'string') {
      if (dateRegex.test(result))
         return moment(result);
   } else if (Array.isArray(result)) {
      return result.map(postProcess);
   } else if (result && typeof result === 'object') {
      for (const prop in result) {
         result[prop] = postProcess(result[prop]);
      }
   }

   return result;
}

function get(url, params) {
   return query('GET', url, params);
}

function post(url, params) {
   return query('POST', url, params);
}

export default {
   getEditathons() {
      return get('editathons');
   },
   getEditathon(code) {
      return get(`editathons/${code}`);
   },
   addArticle(code, title) {
      return post(`editathons/${code}/article`, {
         title
      });
   },
};

export function UnauthorizedHttpError() {
}
