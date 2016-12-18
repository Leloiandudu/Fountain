import { matchAll, escapeRegExp } from './utils';

function eraseTags(tag, tags) {
   if (!tag.childNodes.length)
      return tag.textContent.trim();

   return [...tag.childNodes]
      .filter(tag => tags.indexOf(tag.nodeName.toLowerCase()) === -1)
      .map(tag => eraseTags(tag, tags).trim())
      .filter(tag => tag)
      .join(" ");
};

export function getPlainText(text) {
   const tags = ["sup", "sub", "table", "div", "ul", "ol", "li", "dl", "dd", "dt", "#comment", "h1", "h2", "h3", "h4", "h5", "h6"];
   const parser = new DOMParser();
   const html = parser.parseFromString(text, "text/html");
   return eraseTags(html.body, tags);
}

export function getWordCount(text) {
   return (getPlainText(text).match(/[^\s]*[^\s\u2000-\u206f!"$%'()*,\-.:;?\\\[\]|~¡«°·»¿՚՛՜՝՞՟։־׀׆׳״،؟।၊။♪⟨⟩、。《》「」『』【】〜〽・﬩️﹁﹂！（），：？［］｛｝]+[^\s]*(\s|$)+/g) || []).length;
}

function parseTemplateAt(text, index, strict) {
   text = text.substr(index).trim();

   if (!text.startsWith('{{') || (strict && !text.EndsWith('}}'))) {
      throw new Error('Template should be surrounded by {{}}.');
   }

   let level = 0;
   let str = '';
   const template = {
      name: null,
      args: [],
   };

   const [ , ...parts ] = text.split(/({{|\||}}|\[\[|\]\])/).filter(x => x);
   for (const part of parts) {
      if (level < 0) {
         if (strict) {
            throw new Error('Unexpected text after template end.');
         } else {
            break;
         }
      }

      if ((part === '|' || part === '}}') && level === 0) {
         if (template.name === null) {
            template.name = str;
         } else {
            const arg = /^([\s\w]+)=(.*)$/.exec(str);
            if (arg) {
               template.args.push({
                  name: arg[1],
                  value: arg[2],
               });
            } else {
               template.args.push({
                  value: str,
               });
            }
         }

         str = '';
      } else {
         str += part;
      }

      if (part == '{{' || part == '[[') {
         level++;
      } else if (part == '}}' || part == ']]') {
         level--;
      }
   }

   if (level >= 0) {
      throw new Error('Template end not found.');
   }

   return template;
}

export function* getIgnoredRegions(text) {
   const tokens = new RegExp([ '<!--', '-->', '(<nowiki)[\\s>]', '</nowiki>' ].join('|'), 'g');

   let prevToken = null;
   let start = 0;

   for (const match of matchAll(tokens, text)) {
      const token = match[1] || match[0];
      if ((token === '<!--' || token === '<nowiki') && prevToken === null) {
         prevToken = token;
         start = match.index;
      } else if (token === '-->' && prevToken === '<!--'
              || token === '</nowiki>' && prevToken === '<nowiki') {
         yield { index: start, length: match.index + token.length - start };
         prevToken = null;
      }
   }

   if (prevToken !== null)
      yield { index: start, length: text.length - start };
}

export function ignoredRegionsContain(regions, index) {
   for (const region of regions) {
      if (region.index <= index && index < regions.index + region.length) {
         return true;
      }
   }
   return false;
}

function getArticleTitleRegex(title) {
   const index = title.lastIndexOf(':') + 1;
   return new RegExp(
      '[\\s_]*' + escapeRegExp(title.substring(0, index)) + 
      '[' + title[index].toUpperCase() + title[index].toLowerCase() + ']' + 
      title.substring(index + 1).split(/[ _]+/).map(x => escapeRegExp(x)).join('[\\s_]+') + 
      '[\\s_]*'
   );
}

export function findTemplate(text, template, skipIgnored = false) {
   const templateNames = typeof template === 'string' ? [ template ] : template;
   const regex = new RegExp('\\{\\{(?:' + templateNames.map(t => '(?:' + getArticleTitleRegex(t).source + ')').join('|') + ')[|}\\s]');
   const ignored = skipIgnored ? [] : [ ...getIgnoredRegions(text) ];
   for (let i = 0;;) {
      const match = regex.exec(text.substr(i));
      if (!match) break;

      if (ignoredRegionsContain(ignored, match.index)) {
         i = match.index + match[0].length;
      } else {
         return parseTemplateAt(text, match.index, false);
      }
   }

   return null;
}
