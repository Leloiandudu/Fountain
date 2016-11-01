import 'moment/locale/ml';
import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('ml');

export default {
   _name: 'ഇംഗ്ലീഷ്',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'പ്രവേശിക്കുക',
      signOut: 'പുറത്തുകടക്കുക',
   },

   Footer: {
      'preLink': 'ഈ ഉപകരണത്തില്‍ നിങ്ങള്‍ക്ക് എന്തെങ്കിലും പ്രശ്നങ്ങളുണ്ടെങ്കില്‍ ദയവായി ',
      'link': 'ലീ ലോയ്',
      'postLink': ' നെ ബന്ധപ്പെടുക',
   },

   EditathonList: {
      title: 'തിരുത്തല്‍യജ്ഞങ്ങള്‍',
   },

   ArticlesList: {
      editathonWillStartIn: date => `തിരുത്തല്‍യജ്ഞം ${formatDateIn(date)} നു തുടങ്ങും`,
      editathonIsOver: 'തിരുത്തല്‍യജ്ഞം പൂര്‍ത്തിയായി',
      editathonWillEndIn: date => `തിരുത്തല്‍യജ്ഞം ${formatDateIn(date)} നു അവസാനിക്കും`,
      addArticle: 'സമര്‍പ്പിക്കുക',
      juryTool: 'പരിശോധിക്കുക',
      jury: 'ജൂറി അംഗങ്ങൾ:',
      user: 'ഉപയോക്താവ്',
      acticlesCount: 'ലേഖനങ്ങള്‍',
      totalScore: 'പോയന്റുകള്‍',
      acticle: 'ലേഖനം',
      addedOn: 'ചേർത്ത തീയതി',
      score: 'പോയന്റുകള്‍',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `${formatDate(date, 'L')} ശേഷം രജിസ്റ്റര്‍ ചെയ്ത ഉപയോക്താക്കള്‍ക്ക് മാത്രമേ ഈ തിരുത്തല്‍യത്നത്തില്‍ പങ്കെടുക്കാനാകൂ`,
         namespace: isIn => `പ്രധാന നാമമേഖല${isIn ? 'യിൽ ആണോ' : ' തന്നെയല്ലേ'}`,
         author: 'സൃഷ്ടിച്ചത്: ',
         articleCreated: date => `ലേഖനം ${formatDate(date, 'L LT')} ന് സൃഷ്ടിക്കപ്പെട്ടിരിക്കുന്നു`,
         chars: n => `${formatNumber(n)} ${plural(n, 'ചിഹ്നം', 'ചിഹ്നങ്ങള്‍')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'ബൈറ്റ്', 'ബൈറ്റുകള്‍')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'വാക്ക്', 'വാക്കുകൾ')}`,
      },

      unauthorized: 'നിങ്ങൾക്ക് അനുമതിയില്ല',
      networkError: err => `നെറ്റ്വർക്ക് പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക:\n${err}`,
      notFound: 'ലേഖനം കണ്ടെത്താനായില്ല',
      back: 'പിന്നോട്ട്',
      cancel: 'റദ്ദാക്കുക',
      next: 'അടുത്തത്',
      add: 'ചേർക്കുക',
      articleTitle: 'ലേഖനത്തിന്റെ തലക്കെട്ട്:',
      youAlreadyAdded: 'നിങ്ങൾ ഇതിനകംതന്നെ തിരുത്തല്‍യജ്ഞത്തിലേയ്ക്ക് ഈ ലേഖനം ചേർത്തിട്ടുണ്ട്',
      someoneAlreadyAdded: 'മറ്റൊരു ഉപയോക്താവ് ഇതിനകംതന്നെ തിരുത്തല്‍യജ്ഞത്തിലേക്ക് ഈ ലേഖനം ചേർത്തു',
   },

   SignInWarning: {
      title: 'തുടരുന്നതിന് ലോഗിൻ ചെയ്യുക.',
      ok: 'പ്രവേശിക്കുക',
      cancel: 'റദ്ദാക്കുക',
   },

   UnsavedWarning: {
      message: 'നിങ്ങള്‍ വരുത്തിയ മാറ്റങ്ങൾ ഒഴിവാക്കപ്പെടും.',
      ok: 'ഉപേക്ഷിക്കുക',
      cancel: 'റദ്ദാക്കുക',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'ചിഹ്നം', 'ചിഹ്നങ്ങള്‍')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'ബൈറ്റ്', 'ബൈറ്റുകള്‍')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'വാക്ക്', 'വാക്കുകൾ')}`,
         author: 'സൃഷ്ടിച്ചത്',
         createdOn: 'സൃഷ്ടിച്ചത്',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'ചേർത്തത്',
      },

      Preview: {
         notFound: 'ലേഖനം കണ്ടെത്താനായില്ല',
         loadingError: 'ലോഡിങ്ങ് പിശക്:',
      },

      Evaluation: {
         comment: 'അഭിപ്രായം',
         total: n => `ആകെ: ${n}`,
         save: 'സംരക്ഷിക്കുക',
         skip: 'ഒഴിവാക്കുക',

         Comment: {
            save: 'സംരക്ഷിക്കുക',
            cancel: 'റദ്ദാക്കുക',
         },
      },
   },
};
