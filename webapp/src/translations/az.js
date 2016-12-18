import 'moment/locale/az';
import { numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter('.', ',');
const { formatDateIn, formatDate } = dateFormatter('az');

export default {
   _name: 'Azərbaycan',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Daxil ol',
      signOut: 'Çıx',
   },

   Footer: {
      'preLink': 'Alətlə bağlı probleminiz varsa, ',
      'link': 'Le Loy',
      'postLink': ' ilə əlaqə saxlayın.',
   },

   EditathonList: {
      title: 'Müsabiqələr',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Müsabiqə ${formatDateIn(date)} başlayacaq`,
      editathonIsOver: 'Dieser Edit-a-thon wurde beendet',
      editathonWillEndIn: date => `Müsabiqə ${formatDateIn(date)} başa çatacaq`,
      addArticle: 'Təqdim et',
      juryTool: 'Təftiş et',
      jury: 'Jüri üzvləri:',
      user: 'İstifadəçi',
      acticlesCount: 'Məqalələr',
      totalScore: 'Xal',
      acticle: 'Məqalə',
      addedOn: 'Əlavə edilib',
      score: 'Xal',
      dateAdded: date => formatDate(date, 'D MMM LT')
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `${formatDate(date, 'L')} tarixindən sonra qeydiyyatdan keçən istifadəçilər müsabiqədə iştirak edə bilərlər`,
         namespace: isIn => `Əsas ad fazasında${isIn ? 'dır' : ' deyil'}`,
         author: 'Müəllif: ',
         articleCreated: date => `Məqalə ${formatDate(date, 'L LT')} tarixində yaradılıb`,
         chars: n => `${formatNumber(n)} simvol')}`,
         bytes: n => `${formatNumber(n)} bayt`,
         words: n => `${formatNumber(n)} söz')}`,
      },

      unauthorized: 'İcazəniz yoxdur',
      networkError: err => `Şəbəkə xətası. Yenə yoxlayın:\n${err}`,
      notFound: 'Məqalə tapılmadı',
      back: 'Geriyə',
      cancel: 'Ləğv et',
      next: 'Növbəti',
      add: 'Əlavə et',
      articleTitle: 'Məqalə başlığı:',
      youAlreadyAdded: 'Siz məqaləni artıq müsabiqəyə əlavə etmisiz',
      someoneAlreadyAdded: 'Başqa bir istifadəçi artıq məqaləni müsabiqəyə əlavə edib',
   },

   SignInWarning: {
      title: 'Davam etmək üçün daxil olun.',
      ok: 'Daxil ol',
      cancel: 'Ləğv et',
   },

   UnsavedWarning: {
      message: 'Dəyişiklikləriniz ləğv olundu.',
      ok: 'İmtina et',
      cancel: 'Ləğv et',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} simvol')}`,
         bytes: n => `${formatNumber(n)} bayt`,
         words: n => `${formatNumber(n)} söz')}`,
         author: 'Müəllif',
         createdOn: 'Yaradılma tarixi',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Əlavə edən',
      },

      Preview: {
         notFound: 'Məqalə tapılmadı',
         loadingError: 'Yüklənmə xətası:',
      },

      Evaluation: {
         comment: 'şərh',
         total: n => `Cəmi: ${formatNumber(n)}`,
         save: 'Saxla',
         skip: 'Keç',

         Comment: {
            save: 'Saxla',
            cancel: 'Ləğv et',
         },
      },
   },
};
