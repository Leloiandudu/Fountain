import React from 'react';
import { withTranslation } from '../translate';
import { calcMark } from '../jury';

function MarkDetails({ mark, config, translation }) {
   const { sum, parts } = calcMark(mark.marks, config);
   const formatNumber = (...args) => translation.translate('formatNumber', ...args);

   const details = [];
   for (const id in parts) {
      const p = parts[id];
      details.push(<dt key={`dt-${id}`}>{p.value && formatNumber(p.value, { forcePlus: true }) + ' ' || ''}</dt>);
      details.push(<dd key={`dd-${id}`}>{p.title}</dd>);
   }

   const user = mark.user
      ? [ <span key='jury' className='jury'>{mark.user}</span>, ': ' ]
      : null;

   return <div className='MarkDetails'>
      {user}<span className='sum'>{formatNumber(sum)}</span>
      <dl className='details'>
         {details}
      </dl>
      {mark.comment && <div className='comment'>
         {mark.comment}
      </div>}
   </div>
}

export default withTranslation(MarkDetails);
