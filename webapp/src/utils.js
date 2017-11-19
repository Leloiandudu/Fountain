export function getNavitagorLang() {
   let lang = navigator.language || navigator.userLanguage;
   if (lang) {
      const index = lang.indexOf('-');
      if (index !== -1)
         lang = lang.substr(0, index);
   }
   return lang;
}

export function* matchAll(regex, input) {
   if (!regex.global) {
      yield regex.exec(input);
      return;
   }

   for(;;) {
      const res = regex.exec(input);
      if (res === null) break;
      yield res;
   }
}

export function escapeRegExp(regex) {
   return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function checkTokenMatch(token, text) {
   const regexes = token.split(/\s+/).filter(t => t).map(t => new RegExp('([\\s,\\-]|^)' + escapeRegExp(t), 'i'));
   return regexes.every(r => r.test(text));
}

export function groupBy(items, fnKey, fnValue = x => x) {
   const groups = new Map();
   for (const item of items) {
      const key = fnKey(item);
      let group = groups.get(key);
      if (group === undefined) {
         group = [];
         groups.set(key, group);
      }
      group.push(fnValue(item));
   }
   return groups;
}
