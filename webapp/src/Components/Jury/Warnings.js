import React from 'react';
import Loader from './../Loader';
import WikiLink from './../WikiLink';
import { withTranslation } from '../../translate';
import Header from './Header';
import classNames from 'classnames';

const RuleMessages = {
   submitterIsCreator: (rule, ok, stats, ctx, tr) => [ 
      tr('author'),
      <WikiLink to={`UT:${stats.creator}`} />,
   ],
   articleCreated: (rule, ok, stats, ctx, tr) => [
      tr('createdOn'),
      tr('createdDate', stats.created),
   ],
   articleSize: (rule, ok, stats, ctx, tr) => [
      tr('kbytes', stats.bytes / 1024),
      tr('chars', stats.chars),
   ],
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
      const { article, rules, info, translation: { tr } } = this.props;
      if (!article || !rules || info === undefined) {
         return <Loader />;
      }

      const author = this.renderStat('_author', [ 
         tr('submittedBy', info.userGender),
         <WikiLink key='a' to={'UT:' + article.user} className='value nowrap' target='_blank' />,
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
         {rules.map(rule => {
            const result = rule.check(info, ctx);
            return this.renderStat(rule.type, RuleMessages[rule.type](rule, result, info, ctx, tr), result);
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
