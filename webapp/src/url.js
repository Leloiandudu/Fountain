export default function url(href) {
   return Global.urlPrefix + href;
}

export function unUrl(href) {
   if (!href.startsWith(Global.urlPrefix)) {
      throw new Error(`'${href}' doesn't start with '${Global.urlPrefix}'`);
   }

   return href.substr(Global.urlPrefix.length);
}
