import React from 'react';
import Loader from './../Loader';
import WikiLink from './../WikiLink';
import { withTranslation } from '../../translate';
import Header from './Header';
import classNames from 'classnames';

const RuleMessages = {
   submitterIsCreator: (rule, ok, stats, ctx, tr, wiki) => [ 
      tr('author'),
      <WikiLink to={`User_talk:${stats.creator}`} wiki={wiki} target='_blank' />,
   ],
   articleCreated: (rule, ok, stats, ctx, tr) => [
      tr('createdOn'),
      tr('createdDate', stats.created),
   ],
   articleSize: (rule, ok, stats, ctx, tr) => [
      rule.params.bytes && tr('bytes', stats.bytes),
      rule.params.chars && tr('chars', stats.chars),
      rule.params.words && tr('words', stats.words),
   ].filter(x => x),
};

const Warnings = React.createClass({
   render() {
      return (
         <div className='Warnings'>
            {this.renderWarnings()}
         </div>
      )
   },
   renderWarnings() {
      const { article, rules, info, translation: { tr }, wiki } = this.props;
      if (!article || !rules || info === undefined) {
         return <Loader />;
      }

      const author = this.renderStat('_author', [ 
         tr('submittedBy', info.userGender),
         <WikiLink key='a' to={'User_talk:' + article.user} wiki={wiki} className='value nowrap' target='_blank' />,
      ], true);

      if (!info || info.error) {
         return author;
      }

      const ctx = {
         user: {
            name: article.user,
         },
      };

      return (<div>
         {author}
         {rules.map((rule, i) => {
            const result = rule.check(info, ctx);
            return this.renderStat(i, RuleMessages[rule.type](rule, result, info, ctx, tr, wiki), result);
         })}
      </div>).props.children;
   },
   renderStat(key, rows, isOk) {
      return <div key={key} className={classNames({ item: true, nasty: !isOk })}>
         {rows.map((row, i) => <div className='row' key={i}>{row}</div>)}
      </div>
   },
});

export default withTranslation(Warnings, 'Jury.Warnings');
