import 'moment/locale/sq';
import { plural, numberFormatter, dateFormatter, gender } from '../translate';

const formatNumber = numberFormatter('\u00a0', ',');
const { formatDateIn, formatDate } = dateFormatter('sq');

export default {
   _name: 'Shqip',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Hyni',
      signOut: 'Dil',
   },

   Footer: {
      'preLink': 'Ju lutem kontakto ',
      'link': 'Le Loy',
      'postLink': ' nëse ke probleme me këtë mjet.',
   },

   EditathonList: {
      title: 'Editathonët',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Editathoni do të fillojë ${formatDateIn(date)}`,
      editathonIsOver: 'Editathoni ka mbaruar',
      editathonWillEndIn: date => `Editathoni do të mbarojë ${formatDateIn(date)}`,
      addArticle: 'Dërgo',
      juryTool: 'Vlerëso',
      jury: 'Anëtarët e jurisë:',
      user: 'Përdoruesi',
      acticlesCount: 'Artikujt',
      totalScore: 'Pikët',
      acticle: 'Artikulli',
      addedOn: 'Добавлено',
      score: 'Pikët',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Vetëm përdoruesit që janë regjistruar pas ${formatDate(date, 'L')} mund të marrin pjesë në këtë editathon`,
         namespace: isIn => `${isIn ? 'Është një' : 'Nuk është'} hapësirën kryesore`,
         author: 'Krijuar nga: ',
         articleCreated: date => `Artikulli u krijua më ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'simbol', 'simbolet', 'simbole')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'bajt', 'bajte', 'bajte')}`,
         words: n => `${formatNumber(n)} 'fjalë'`,
      },

      unauthorized: 'Ti nuk je i autorizuar.',
      networkError: err => `Defekt në rrjet. Ju lutemi provoni përsëri:\n${err}`,
      notFound: 'Artikulli nuk u gjet',
      back: 'Prapa',
      cancel: 'Anulo',
      next: 'Para',
      add: 'Shto',
      articleTitle: 'Titulli i artikullit:',
      youAlreadyAdded: 'Ju tashmë e keni shtuar këtë artikull në editathon',
      someoneAlreadyAdded: 'Një përdorues tjetër tashmë e ka shtuar këtë artikull në editathon',
   },

   SignInWarning: {
      title: 'Ju lutemi hyni brënda për të vazhduar.',
      ok: 'Hyni',
      cancel: 'Anulo',
   },

   UnsavedWarning: {
      message: 'Ndryshimet tuaja do të hidhet.',
      ok: 'Heq dorë',
      cancel: 'Anulo',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'simbol', 'simbolet', 'simbole')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'bajt', 'bajte', 'bajte')}`,
         words: n => `${formatNumber(n)} 'fjalë'`,
         author: 'Krijuar nga',
         createdOn: 'Krijuar më',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Shtuar nga',
      },

      Preview: {
         notFound: 'Artikulli nuk u gjet',
         loadingError: 'Defekt gjatë ngarkimit:',
      },

      Evaluation: {
         comment: 'komento',
         total: n => `Gjithësej: ${formatNumber(n)}`,
         save: 'Ruaj',
         skip: 'Tejkalo',

         Comment: {
            save: 'Ruaj',
            cancel: 'Anulo',
         },
      },
   },
};
