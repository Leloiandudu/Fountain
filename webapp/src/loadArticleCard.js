import React from 'react';
import MwApi from './MwApi';

const mwApi = new MwApi('https://ru.wikipedia.org/w/api.php');

const Cache = new Map();
const Timeout = 300;

function expired(ts) {
   return Date.now() - ts > Timeout * 1000;
};

function getExtract(title, text) {
   const res = [];

   text = removeParentheses(text);

   let lastIndex = 0;
   const titleLow = title.toLowerCase();
   const textLow = text.toLowerCase();
   for (;;) {
      let index = textLow.indexOf(titleLow, lastIndex);
      if (index === -1) break; 

      res.push(text.substring(lastIndex, index));
      res.push(<b key={index}>{text.substr(index, titleLow.length)}</b>);
      lastIndex = index + titleLow.length;
   }
   res.push(text.substring(lastIndex));

   return res;
}

function removeParentheses(string) {
   let newString = '', level = 0;

   for (let i = 0; i < string.length; i++) {
      let ch = string.charAt(i);

      if (ch === ')' && level === 0) {
         return string;
      }

      if (ch === '(') {
         level++;
      } else if (ch === ')') {
         level--;
      } else if (level === 0) {
         // omitting leading spaces
         if (!(ch === ' ' && string.charAt(i + 1) === '(')) {
            newString += ch;
         }
      }
   }

   return level === 0 ? newString : string;
}

export default async function loadArticleCard(title) {
   if (Cache.has(title)) {
      const record = Cache.get(title);
      if (!expired(record.timestamp))
         return record.data;
   }

   let data = await mwApi.loadArticleCard(title, Timeout);
   console.log(data);
   data = {
      extract: getExtract(data.title, data.extract),
      title: data.title,
      thumbnail: data.thumbnail,
   };

   for (var [k, v] of Cache) {
      if (expired(v.timestamp)) {
         Cache.delete(k);
      }
   }

   Cache.set(title, {
      timestamp: Date.now(),
      data,
   });

   return data;
};
