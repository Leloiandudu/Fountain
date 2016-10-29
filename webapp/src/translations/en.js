import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('en');

export default {
   _name: 'English',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Log in',
      signOut: 'Log out',
   },

   Footer: {
      'preLink': 'Please contact ',
      'link': 'Le Loy',
      'postLink': ' if you have problems with this tool',
   },

   EditathonList: {
      title: 'Editations',
   },

   ArticlesList: {
      editathonWillStartIn: date => `The editathon will start ${formatDateIn(date)}`,
      editathonIsOver: 'The editathon has finished',
      editathonWillEndIn: date => `The editathon will end ${formatDateIn(date)}`,
      addArticle: 'Submit',
      juryTool: 'Judge',
      jury: 'Jury members:',
      user: 'User',
      acticlesCount: 'Articles',
      totalScore: 'Points',
      acticle: 'Article',
      addedOn: 'Added on',
      score: 'Points',
      dateAdded: date => formatDate(date, 'D MMM LT')
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Only users who registered before ${formatDate(date, 'L')} can participate in this editathon`,
         namespace: isIn => `${isIn ? 'Is in' : 'Is not in'} the main namespace`,
         author: 'Created by:',
         articleCreated: date => `The article was created at ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'symbol', 'symbols')}`,
         bytes: n => `${formatNumber(n)} bytes`,
      },

      unauthorized: 'You\'re not authorised',
      networkError: err => `Network error. Please try again:\n${err}`,
      notFound: 'Article not found',
      back: 'Back',
      cancel: 'Cancel',
      next: 'Next',
      add: 'Add',
      articleTitle: 'Article\'s title:',
      youAlreadyAdded: 'You have already added this article to the editathon',
      someoneAlreadyAdded: 'Another user has already added this article to the editathon',
   },

   SignInWarning: {
      title: 'Please log in to continue.',
      ok: 'Log in',
      cancel: 'Cancel',
   },

   UnsavedWarning: {
      message: 'Your changes will be discarded.',
      ok: 'Discard',
      cancel: 'Cancel',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'symbol', 'symbols')}`,
         bytes: n => `${formatNumber(n)} bytes`,
         author: 'Created by',
         createdOn: 'Created on',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Added by',
      },

      Preview: {
         notFound: 'Article not found',
         loadingError: 'Loading error:',
      },

      Evaluation: {
         comment: 'comment',
         total: n => `Total: ${n}`,
         save: 'Save',
         skip: 'Skip',
      },
   }
};
