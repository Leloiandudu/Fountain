// URLSearchParams should be in global scope, otherwise fetch polyfill think it's not supported
// and url-search-params doesn't polyfill the global scope by default

import URLSearchParams from 'url-search-params';
window.URLSearchParams = URLSearchParams;
