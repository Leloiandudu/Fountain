import React from 'react';
import moment from 'moment';
import Loader from './../Loader';
import WikiLink from './../WikiLink';
import Header from './Header';
import classNames from 'classnames';

const RuleMessages = {
   submitterIsCreator: (rule, ok, stats, ctx) => [ 
      <span key='author' >
         Автор статьи:&nbsp;
         <WikiLink to={`U:${stats.creator}`} />
      </span>,
      <span key='submitter'>
         , Сабмиттер:&nbsp;
         <WikiLink to={`U:${ctx.user.name}`} />
      </span>,
   ],
   articleCreated: (rule, ok, stats) => 'Статья создана ' + moment(stats.created).format('L LT'),
   articleSize: (rule, ok, stats) => `${(stats.bytes / 1024).toFixed()} Кб, ${stats.chars} символов`,
};

export default React.createClass({
   render() {
      return (
         <div className="panel">
            <Header title="Warnings" />
            <div id="warnings" className="block">
               {this.renderWarnings()}
            </div>
         </div>
      )
   },
   renderWarnings() {
      const { article, rules, info } = this.props;
      if (!article || !rules || info === undefined) {
         return <Loader />;
      }

      if (!info || info.error) {
         return null;
      }

      const ctx = {
         user: {
            name: article.user,
         },
      };

      return (<div>
         {rules.map(rule => {
            const result = rule.check(info, ctx);
            return this.renderStat(RuleMessages[rule.type](rule, result, info, ctx), result);
         })}
      </div>).props.children;
   },
   renderStat(title, isOk) {
      return <span className={classNames({
         nasty: !isOk,
      })}>{title}</span>
   },
});

