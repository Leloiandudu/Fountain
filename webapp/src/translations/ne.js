import 'moment/locale/ne';
import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('ne');

export default {
   _name: 'नेपाली भाषा ',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'लगइन',
      signOut: 'लगआउट',
   },

   Footer: {
      'preLink': 'यदि यो उपकरण प्रयोग गर्दा कुनै समस्या भएमा कृपय ',
      'link': 'Le Loy',
      'postLink': ' लाई सम्पर्क गर्नु होला ।',
   },

   EditathonList: {
      title: 'सम्पादन-थन',
   },

   ArticlesList: {
      editathonWillStartIn: date => `यो सम्पादन-थन मिती ${formatDateIn(date)} देखि शुरू हुनेछ`,
      editathonIsOver: 'सम्पादन-थन समाप्त भई सक्यो',
      editathonWillEndIn: date => `यो सम्पादन-थन मिती ${formatDateIn(date)} मा समाप्त हुनेछ`,
      addArticle: 'पेश गर्नुहोस्',
      juryTool: 'मूल्यांकनकर्ता',
      jury: 'मूल्यांकन सदस्यहरू:',
      user: 'प्रयोगकर्ता',
      acticlesCount: 'लेखहरू',
      totalScore: 'अंकहरू',
      acticle: 'लेख',
      addedOn: 'थप भएको मिति',
      score: 'अंकहरू',
      dateAdded: date => formatDate(date, 'D MMM LT')
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `मिति ${formatDate(date, 'L')} पछि दर्ता भएका प्रयोगर्कताहरू मात्र यस सम्पादन-थनमा सहभागि हुन पाउनेछ ।`,
         namespace: isIn => `यो मुख्य नेमस्पेस भित्र ${isIn ? 'छ' : 'छैन'}`,
         author: 'तयार गर्ने व्यक्ति: ',
         articleCreated: date => `यो लेख मित ${formatDate(date, 'L LT')} तयार गरिएको`,
         chars: n => `${formatNumber(n)} ${plural(n, 'चिन्ह', 'चिन्हहरू')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'बाइट', 'बाईटहरू')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'शब्द', 'शब्दहरू')}`,
      },

      unauthorized: 'तपाई आधिकारी व्यक्ति होइन',
      networkError: err => `नेटवर्कमा समस्या. कृपया फेरी तयार गर्नुहोसः\n${err}`,
      notFound: 'लेख पत्ता लागेन',
      back: 'पछाडि',
      cancel: 'रद्द',
      next: 'अर्को',
      add: 'थप',
      articleTitle: 'लेखको शिर्षकः',
      youAlreadyAdded: 'तपाईले यस लेखलाई सम्पादन-थनमा पहिलानै पेश गरि सक्नु भएको छ ।',
      someoneAlreadyAdded: 'अर्को प्रयोगकर्ताले यो लेखलाई यस सम्पादन-थनमा पेश गरिसक्नु भएको छ ।',
   },

   SignInWarning: {
      title: 'निरन्तरता दिन कृपया लगइन गर्नुहोस ।',
      ok: 'लगइन',
      cancel: 'रद्द',
   },

   UnsavedWarning: {
      message: 'तपाईको परिवर्तनलाई रद्द गरिएको छ',
      ok: 'हो, म सहमत छु',
      cancel: 'रद्द गर्ने',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'चिन्ह', 'चिन्हहरू')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'बाइट', 'बाईटहरू')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'शब्द', 'शब्दहरू')}`,
         author: 'तयार गर्ने व्यक्ति',
         createdOn: 'मा तयार गरिएको',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'थप गर्ने व्यक्ति',
      },

      Preview: {
         notFound: 'लेख पत्ता लागेन',
         loadingError: 'लोड गर्नमा समस्याः',
      },

      Evaluation: {
         comment: 'टिप्पणी',
         total: n => `जम्माः ${formatNumber(n)}`,
         save: 'संग्रह गर्ने',
         skip: 'छोड़ें',

         Comment: {
            save: 'संग्रह गर्ने',
            cancel: 'रद्द',
         },
      },
   },
};
