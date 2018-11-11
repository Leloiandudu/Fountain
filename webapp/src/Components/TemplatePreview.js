import React from 'react';

export default function TemplatePreview({ name, args, labelFor }) {
   return <div className='TemplatePreview'>
      {renderTemplate(name, args, labelFor)}
   </div>;
}

function renderTemplate(name, args, labelFor) {
   const parts = [];
   const add = (text, id, isName) => {
      const props = { key: parts.length - 1 };
      if (id !== undefined) {
         props.className = 'label';
         if (labelFor) {
            props.htmlFor = labelFor(id, isName);
            props.className += ' clickable';
         }
      }
      parts.push(React.createElement(id !== undefined ? 'label' : 'span', props, text));
   };

   add('{{');
   add(name, null);
   for (const id in args) {
      const arg = args[id];
      add('|');
      if (arg.name) {
         add(arg.name, id, true);
         add('=');
      }
      add(arg.value, id, false);
   }
   add('}}');

   return parts;
}
