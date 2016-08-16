import React from 'react';
import url from './../url'
import WikiButton from './WikiButton';
import ArticleLookup from './ArticleLookup';
import loadArticleCard from './../loadArticleCard';
import Api, { UnauthorizedHttpError } from './../Api';
import throttle from './../throttle';

/*
> 3k || > 1k ch
started by user
started after editathon start
ns=0
!redirect
*/

export default React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         title: '',
         updating: false,
         card: null,
      };
   },
   componentWillMount() {
      this.callUpdate = throttle(this.update, 1000);
   },
   componentWillUnmount() {
      this.callUpdate.cancel();
   },
   async update() {
      this.setState({
         updating: false,
         card: this.state.title && await loadArticleCard(this.state.title),
      });
   },
   onTitleChanged(title) {
      this.setState({ 
         title,
         updating: true,
      });
      this.callUpdate();
   },
   async add() {
      if (!this.state.title)
         return;

      try {
         await Api.addArticle(this.props.code, this.state.title);
         await this.returnToList();
      } catch(e) {
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
         <div className='AddArticle'>
            <label htmlFor='title'>Название статьи:</label>
            <ArticleLookup
               inputProps={{ id: 'title' }}
               value={this.state.title}
               onChange={this.onTitleChanged} />
            <div id='buttons'>
               <WikiButton disabled={this.state.updating} id='add' type='constructive' onClick={this.add}>Добавить</WikiButton>
               <WikiButton id='cancel' onClick={this.returnToList}>Отмена</WikiButton>
            </div>
            {this.renderCard()}
         </div>
      );
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
