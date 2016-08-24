import React from 'react';
import Loader from './../Loader';
import WikiLink from './../WikiLink';
import Header from './Header';
import classNames from 'classnames';

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
      const { info, editathon, article } = this.props;
      if (!article || !editathon || info === undefined) {
         return <Loader />;
      }

      if (!info || info.error) {
         return null;
      }

      return (<div>
         {this.renderStat([ 
            <span key='author' >
               Автор статьи:&nbsp;
               <WikiLink to={`U:${info.user}`} />
            </span>,
            <span key='submitter'>
               , Сабмиттер:&nbsp;
               <WikiLink to={`U:${article.user}`} />
            </span>,
         ], info.user === article.user)}
         {this.renderStat('Статья создана ' + info.timestamp.format('L LT'), info.timestamp.isAfter(editathon.start))}
         {this.renderStat(`${(info.bytes / 1024).toFixed()} Кб, ${info.chars} символов`, info.bytes >= 3 * 1024 || info.chars >= 1000)}
      </div>).props.children;
   },
   renderStat(title, isOk) {
      return <span className={classNames({
         nasty: !isOk,
      })}>{title}</span>
   },
});

