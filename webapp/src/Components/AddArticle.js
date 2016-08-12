import React from 'react';
import url from './../url'
import WikiButton from './WikiButton';
import ArticleLookup from './ArticleLookup';
import Api, { UnauthorizedHttpError } from './../Api';
import throttle from './../throttle';

export default React.createClass({
   contextTypes: {
      router: React.PropTypes.object.isRequired
   },
   getInitialState() {
      return {
         title: '',
      };
   },
   componentWillMount() {
      // this.callUpdate = throttle(this.update, );
   },
   componentWillUnmount() {
      // this.callUpdate.cancel();
   },
   async add() {
      if (!this.state.title)
         return;

      try {
         await Api.addArticle(this.props.code, this.state.title);
         await this.returnToList();
      } catch(e) {
         if (e instanceof UnauthorizedHttpError) {
            alert('Вы не залогинены');
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
               onChange={title => this.setState({ title })} />
            <div id='buttons'>
               <WikiButton id='add' type='constructive' onClick={this.add}>Добавить</WikiButton>
               <WikiButton id='cancel' onClick={this.returnToList}>Отмена</WikiButton>
            </div>
         </div>
      );
   },
});
