import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import url from './../url'
import getArticleInfo from './../getArticleInfo';
import Api, { UnauthorizedHttpError } from './../Api';
import WikiButton from './WikiButton';
import WikiLink from './WikiLink';
import ArticleLookup from './ArticleLookup';
import Loader from './Loader';

export default React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         title: '',
         updating: false,
         stage: 'pick',
         card: null,
         adding: false,
      };
   },
   async update() {
      let { card, stats, title } = this.state;

      try {
         if (!stats || title !== stats.title) {
            ({ card, stats } = await getArticleInfo(title));
            title = stats.title;
         }
      } catch(e) {
         console.log('error retrieving article info', e);
         card = stats = null;
      }

      this.setState({
         updating: false,
         title,
         card,
         stats,
      });
   },
   async add() {
      const stats = this.state.stats;
      if (!stats || !stats.title)
         return;

      this.setState({ adding: true });

      try {
         await Api.addArticle(this.props.code, stats.title);
         await this.returnToList();
      } catch(e) {
         this.setState({ adding: false })
         if (e instanceof UnauthorizedHttpError) {
            alert('Вы не авторзиованы.');
         } else {
            alert('Произошла сетевая ошибка, попробуйте снова:\n' + e.message);
         }
      }
   },
   async returnToList() {
      this.context.router.replace({
         pathname: url(`/editathons/${this.props.code}`),
      });
      this.props.onReloadEditathon && await this.props.onReloadEditathon();
   },
   render() {
      return (
         <form className='AddArticle' onSubmit={e => e.preventDefault()}>
            {this.renderStage()}
         </form>
      );
   },
   renderStage() {
      return {
         pick: this.renderPickStage,
         approve: this.renderApproveStage,
      }[this.state.stage]().props.children;
   },
   renderPickStage() {
      if (!Global.user) {
         this.returnToList();
         return <div />;
      }

      if (!Global.user.registered || moment(Global.user.registered).add(1, 'year').isBefore(this.props.editathon.start)) {
         return (
            <div>
               В этом марафоне могут соревноваться только участники, зарегистрировавшиеся за год до начала марафона и позднее.
               <div id='buttons'>
                  <WikiButton onClick={this.returnToList}>Назад</WikiButton>
               </div>
            </div>
         );
      }

      return (
         <div>
            <label htmlFor='title'>Название статьи:</label>
            <ArticleLookup
               inputProps={{ id: 'title' }}
               value={this.state.title}
               onChange={title => this.setState({ title })} />
            <div id='buttons'>
               <WikiButton onClick={this.returnToList}>Отмена</WikiButton>
               <WikiButton disabled={!this.state.title.trim()} type='progressive' submit={true} onClick={() => {
                  this.setState({ stage: 'approve', updating: true });
                  this.update();
               }}>Далее</WikiButton>
            </div>
         </div>
      );
   },
   renderApproveStage() {
      const stats = this.state.stats;
      const missing = !stats;
      const mainNs = stats && stats.ns === 0;
      const ok = !missing && mainNs;

      const title = <h2>
         <WikiLink to={stats && stats.title || this.state.title} red={missing} />
      </h2>;

      const addedBy = stats && this.props.editathon.articles.filter(a => a.name === stats.title)[0]

      return (
         <div>
            {this.state.updating ? <Loader /> : (<div>
               {missing ? 
               <div>
                  {title}
                  <div>Статья не найдена</div>
               </div> 
               :
               <div className='info'>
                  <div className='stats'>
                     {title}
                     {this.renderStat(`${ mainNs ? 'Находится' : 'Не находится'} в остновном пространстве статей`, mainNs, true)}
                     {this.renderStat([ 'Автор статьи: ', <WikiLink key='link' to={`U:${stats.user}`} /> ], stats.user === Global.user.name)}
                     {this.renderStat('Статья создана ' + stats.timestamp.format('L LT'), stats.timestamp.isAfter(this.props.editathon.start))}
                     {this.renderStat(`${(stats.bytes / 1024).toFixed()} Кб, ${stats.chars} символов`, stats.bytes >= 3 * 1024 || stats.chars >= 1000)}
                     {addedBy && this.renderStat(`${addedBy.user === Global.user.name ? 'Вы уже добавили' : 'Другой участник уже добавил' } эту статью в марафон`, false, true)}
                  </div>
                  {this.renderCard()}
               </div>}
            </div>).props.children}
            <div id='buttons'>
               <WikiButton onClick={() => this.setState({ stage: 'pick' })}>Назад</WikiButton>
               <WikiButton loading={this.state.adding} disabled={this.state.updating || !ok || addedBy} type='constructive' submit={true} onClick={this.add}>Добавить</WikiButton>
            </div>
         </div>
      );
   },
   renderStat(name, isOk, isCritical = false) {
      return <div className={classNames({ stat: true, error: !isOk && isCritical, warning: !isOk && !isCritical })}>{name}</div>
   },
   renderCard() {
      const card = this.state.card;
      if (!card)
         return null;
      return (
         <div className='card'>
            <div className='content'>
               <div className='thumbnail'>
                  {card.thumbnail && <img src={card.thumbnail.source} />}
               </div>
               <div className='extract'>{card.extract}</div>
            </div>
         </div>
      );
   },
});
