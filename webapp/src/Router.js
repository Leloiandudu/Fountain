import React from 'react';
import { Router, Route, IndexRoute, IndexRedirect, Redirect, browserHistory } from 'react-router';
import url from './url'
import App from './Components/App';
import AddArticle from './Components/AddArticle';
import ArticlesList from './Components/ArticlesList';
import EditathonList from './Components/EditathonList';
import EditathonPage from './Components/EditathonPage';
import EditathonConfig from './Components/EditathonConfig/EditathonConfig';
import ManageArticles from './Components/ManageArticles';
import EditathonAward from './Components/EditathonAward';
import { routes as personalRoutes } from './Components/Personal/Personal';
import Jury from './Components/Jury/Jury';

export default (
   <Router history={browserHistory}>
      <Route path={url('/jury')}>
         <Route path=':id' component={Jury} />
      </Route>

      <Route path={url('/')} component={App}>
         <IndexRedirect to='editathons/' />
         <Route path='editathons/'>
            <IndexRoute component={EditathonList} />
            <Route path=':id' component={EditathonPage}>
               <IndexRoute component={ArticlesList} />
               <Route path='add' component={AddArticle} />
               <Route path='manage' component={ManageArticles} />
               <Route path='award' component={EditathonAward} />
            </Route>
            <Route path=':id/config' component={EditathonConfig} />
         </Route>
         <Redirect from='editathons' to='editathons/' />

         {personalRoutes}
      </Route>
   </Router>
);
