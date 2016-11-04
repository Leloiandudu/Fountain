export function getNavitagorLang() {
   let lang = navigator.language || navigator.userLanguage;
   if (lang) {
      const index = lang.indexOf('-');
      if (index !== -1)
         lang = lang.substr(0, index);
   }
   return lang;
}
