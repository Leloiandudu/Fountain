import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import WikiLink from './WikiLink';
import sortBy from './../sortBy'
import { RuleFlags } from './../rules';
import { withTranslation } from './../translate';

const log = a => { console.log(a); return a; }

const RuleMessages = {
   submitterRegistered: ({ tr, rule, ok }) => !ok && tr('submitterRegistered', rule.params.after) || null,
   namespace: ({ tr, rule, ok }) => tr('namespace', ok),
   submitterIsCreator: ({ tr, rule, ok, stats, wiki }) => [ tr('author'), <WikiLink key='link' to={`User:${stats.creator}`} wiki={wiki} /> ],
   articleCreated: ({ tr, rule, ok, stats }) => tr('articleCreated', moment(stats.created).utc()),
   articleSize: ({ tr, translate, rule, ok, stats }) => [
      rule.params.bytes && tr('bytes', stats.bytes), 
      rule.params.chars && tr('chars', stats.chars),
      rule.params.words && tr('words', stats.words),
   ].filter(x => x).join(translate('delimiter')),
   addedForCleanupRu: ({ tr, rule, ok, stats, wiki }) => {
      const [ prefix, link, suffix ] = tr('addedForCleanupRu', stats.addedForCleanupRu.date);
      return [ 
         prefix,
         <WikiLink key='link' wiki={wiki}
                   to={stats.addedForCleanupRu.date ? `?oldid=${stats.addedForCleanupRu.revId}&diff=cur` : `${stats.title}?action=history`}>
            {link}
         </WikiLink>,
         suffix
      ];
   },
};

function renderStat(key, name, isOk, isCritical) {
   return !name ? undefined : <div key={key} className={classNames({
      stat: true,
      error: !isOk && isCritical,
      warning: !isOk && !isCritical,
   })}>{name}</div>
}

function Warnings({ rules, ctx, stats, wiki, translation }) {
   return <div className='Warnings'>
      {rules.map(rule => [ rule, rule.check(stats, ctx) ]).sort(sortBy(
         // sorting by result (error, warning, ok), then by type
         ([ rule, result ]) => result, 
         ([ rule, result ]) => result || (rule.flags & RuleFlags.optional),
         ([ rule, result ]) => rule.type
      )).map(([ rule, result ], i) => renderStat(
         i, 
         RuleMessages[rule.type]({ 
            rule, stats, wiki,
            ok: result,
            tr: translation.tr,
            translate: translation.translate,
         }), 
         result, 
         !(rule.flags & RuleFlags.optional))
      )}
   </div>;
}

export default withTranslation(Warnings, 'AddArticle.Warnings');
