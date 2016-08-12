import React from 'react';
import { Router, Route, IndexRoute, IndexRedirect, Redirect, browserHistory } from 'react-router';
import url from './url'
import App from './Components/App';
import AddArticle from './Components/AddArticle';
import ArticlesList from './Components/ArticlesList';
import EditathonList from './Components/EditathonList';
import EditathonPage from './Components/EditathonPage';

export default (
   <Router history={browserHistory}>
      <Route path={url('/')} component={App}>
         <IndexRedirect to='editathons/' />
         <Route path='editathons/'>
            <IndexRoute component={EditathonList} />
            <Route path=':id' component={EditathonPage}>
               <IndexRoute component={ArticlesList} />
               <Route path='add' component={AddArticle} />
            </Route>
         </Route>
         <Redirect from='editathons' to='editathons/' />
      </Route>
   </Router>
);
