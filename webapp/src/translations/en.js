import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('en');

export default {
   _name: 'English',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',
   dateTimePicker: 'L LTS',

   Header: {
      signIn: 'Log in',
      signOut: 'Log out',
   },

   Footer: {
      'preLink': 'Please contact ',
      'link': 'Le Loy',
      'postLink': ' if you have problems with this tool.',
   },

   EditathonList: {
      title: 'Editathons',
      create: 'Create new',
      finished: 'Finished',
   },

   EditathonFilter: {
      search: 'search...',
      all: '(All)',
      project: 'project...',
      language: 'language...',
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
      dateAdded: date => formatDate(date, 'D MMM LT'),
      manageArticles: 'Manage Articles',
      award: 'Award',
   },

   ManageArticles: {
      removeSelected: 'Remove Selected',
   },

   Dashboard: {
      articles: 'Articles',
      users: 'Users',
      marks: 'Marks',
      withoutMarks: 'Without marks',
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Only users who registered before ${formatDate(date, 'L')} can participate in this editathon`,
         namespace: isIn => `${isIn ? 'Is in' : 'Is not in'} the main namespace`,
         author: 'Created by: ',
         articleCreated: date => `The article was created at ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'symbol', 'symbols')}`,
         bytes: n => `${formatNumber(n)} bytes`,
         words: n => `${formatNumber(n)} words`,
         addedForCleanupRu: date => date ? [ 'On Cleanup since ', formatDate(date, 'L'), '' ] : [ 'Cleanup template ', 'not found', '' ],
      },

      unauthorized: 'You\'re not authorised',
      networkError: err => `Network error. Please try again:\n${err}`,
      notFound: 'Article not found',
      back: 'Back',
      cancel: 'Cancel',
      next: 'Next',
      add: 'Add',
      user: 'Add on behalf of:',
      userNotFound: user => `User '${user}' not found`,
      articleTitle: 'Article\'s title:',
      youAlreadyAdded: 'You have already added this article to the editathon',
      someoneAlreadyAdded: 'Another user has already added this article to the editathon',
   },

   EditathonAward: {
      title: 'Awarding',
      rank: r => `#${r}`,
      noSignature: x => [ 'No signature found. Click ', x, ' to add.' ],
      award: 'Award',
      cancel: 'Cancel',
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
         words: n => `${formatNumber(n)} words`,
         author: 'Created by',
         createdOn: 'Created on',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Added by',
         addedForCleanupRu: date => date ? [ 'On Cleanup since ', formatDate(date, 'L') ] : [ 'Clenup template', 'not found' ],
      },

      Preview: {
         notFound: 'Article not found',
         loadingError: 'Loading error:',
      },

      Evaluation: {
         comment: 'comment',
         total: n => `Total: ${formatNumber(n)}`,
         save: 'Save',
         skip: 'Skip',

         Comment: {
            save: 'Save',
            cancel: 'Cancel',
         },
      },
   },

   EditathonConfig: {
      newEditathon: 'New Editathon',
      back: 'Back',
      next: 'Next',
      create: 'Create',
      save: 'Save',
      cancel: 'Cancel',
      general: 'General',
      rules: 'Rules',
      marks: 'Marks',
      template: 'Template',
      jury: 'Jury',
      GeneralPage: {
         title: 'Title',
         code: 'Code',
         project: 'Project',
         description: 'Description',
         optional: ' (optional)',
         startDate: 'Start Date',
         finishDate: 'Finish Date',
         tooShort: 'should be at least 3 characters',
         negativeDates: 'Finish Date should not be less than Start Date',
         consensualVote: 'Consensual vote',
         hiddenMarks: 'Hidden marks',
         exists: 'This editathon already exists',
         codeSymbols: 'Only latin letters, digits and spaces are allowed',
      },
      RulesPage: {
         add: 'Add rule',
         optional: 'optional',
         informational: 'show in jury tool',
         RulesDemo: {
            preview: 'Preview',
            user: 'User',
            article: 'Article',
            show: 'Show',
            forUser: 'the user sees:',
            forJury: 'the jury see:',
         },
         articleSize: {
            title: 'Article size',
            atLeast: 'at least',
            atMost: 'at most',
            chars: 'symbols',
            bytes: 'bytes',
            words: 'words',
            or: '- or -',
            add: '+ or...',
         },
         submitterIsCreator: {
            title: 'Created by submitter',
            description: 'Only the creator can submit the article',
         },
         articleCreated: {
            title: 'Article creation date',
            notBefore: 'not before',
            notAfter: 'not after',
         },
         submitterRegistered: {
            title: 'Submitter registration date',
            notBefore: 'not before',
         },
         namespace: {
            title: 'Article namespace',
            description: 'Article must belong to the main namespace',
         },
      },
      MarksPage: {
         radio: 'radio group',
         check: 'toggle button',
         int: 'numeric input',
         option: 'radio button',
         title: 'title',
         description: 'description',
         optional: 'optional',
         value: 'value',
         min: 'min',
         max: 'max',
         add: 'add...',
         addOption: 'add radio button',
         preview: 'Preview',
      },
      TemplatePage: {
         autoAdd: 'Automatically add template',
         name: 'Template name',
         placement: 'Template placement',
         inArticle: 'in the article',
         onTalkPage: 'on the talk page',
         args: 'Arguments',
         add: 'add',
         preview: 'Preview',
      },
      JuryPage: {
         add: 'add',
      },
   },

   MarksPreview: {
      incomplete: 'please pick all compulsory mark controls below to test the mark',
      resetPreview: 'Reset preview',
   },

   Validation: {
      required: 'required',
   },

   Personal: {
      title: 'Personal Cabinet',
      editathons: 'Participation',
      jury: 'Evaluation',
      created: 'Created',
      approval: 'Approval',

      Editathons: {
         title: 'Editathons You Participate In',
         hasEnded: date => `has ended ${formatDateIn(date)}`,
         willEndIn: date => `will end in ${formatDateIn(date)}`,
         noMarks: 'you don\'t have marks yet',
         hiddenMarks: 'marks are hidden',
      },

      Jury: {
         title: 'Editathons Where You Are in Jury',
         hasEnded: date => `has ended ${formatDateIn(date)}`,
         willEndIn: date => `will end in ${formatDateIn(date)}`,
      },

      Created: {
         title: 'Editathons Created by You',
         draft: 'draft',
      },

      Approval: {
         title: 'Editathons Requiring Approval',
         noTemplate: 'none',
         noFlags: 'none',
         creator: 'Creator',
         code: 'Code',
         project: 'Project',
         dates: 'Dates',
         flags: 'Flags',
         jury: 'Jury',
         rules: 'Rules',
         marks: 'Marks',
         template: 'Template',
         approve: 'Approve',
         edit: 'Edit',
         delete: 'Delete',
      },
   },
};
