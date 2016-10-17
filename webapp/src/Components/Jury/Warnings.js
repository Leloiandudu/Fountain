import React from 'react';
import moment from 'moment';
import Loader from './../Loader';
import WikiLink from './../WikiLink';
import Header from './Header';
import classNames from 'classnames';

const RuleMessages = {
   submitterIsCreator: (rule, ok, stats, ctx) => [ 
      'Автор',
      <WikiLink to={`UT:${stats.creator}`} />,
   ],
   articleCreated: (rule, ok, stats) => [
      'Cоздана',
      moment(stats.created).format('L LT'),
   ],
   articleSize: (rule, ok, stats) => [
      `${(stats.bytes / 1024).toFixed()} Кб`,
      `${stats.chars} символов`,
   ],
};

export default React.createClass({
   render() {
      return (
         <div className='Warnings'>
            {this.renderWarnings()}
         </div>
      )
   },
   renderWarnings() {
      const { article, rules, info } = this.props;
      if (!article || !rules || info === undefined) {
         return <Loader />;
      }

      const author = this.renderStat('_author', [ 
         info.userGender == 'female' ? 'Добавила' : 'Добавил',
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
            return this.renderStat(rule.type, RuleMessages[rule.type](rule, result, info, ctx), result);
         })}
      </div>).props.children;
   },
   renderStat(key, rows, isOk) {
      return <div key={key} className={classNames({ item: true, nasty: !isOk })}>
         {rows.map((row, i) => <div className='row' key={i}>{row}</div>)}
      </div>
   },
});
