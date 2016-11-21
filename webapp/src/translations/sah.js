import moment from 'moment';
import { plural, numberFormatter, dateFormatter, gender } from '../translate';

const formatNumber = numberFormatter('\u00a0', ',');

function relativeTime(number, withoutSuffix, key, isFuture) {
   switch (key) {
      case 's':
         return isFuture ? 'аҕыйах түгэнинэн' : 'аҕыйах түгэн';
      case 'm':
      case 'h':
      case 'M':
      case 'y':
         return relativeTime('', withoutSuffix, key + key, isFuture).slice(1);
      case 'd':
         return isFuture ? 'күнүнэн' : 'хонук';
      case 'mm':
         return number + (isFuture ? ' мүнүүтэнэн' : ' мүнүүтэ');
      case 'hh':
         return number + (isFuture ? ' чааһынан' : ' чаас');
      case 'dd':
         return number + (isFuture ? ' хонугунан' : ' хонук');
      case 'MM':
         return number + (isFuture ? ' ыйынан' : ' ый');
      case 'yy':
         return number + (isFuture ? ' сылынан' : ' сыл');
   }
}

moment.defineLocale('sah', {
   months : 'тохсунньу_олунньу_кулун тутар_муус устар_ыам ыйын_бэс ыйын_от ыйын_атырдьах ыйын_балаҕан ыйын_алтынньы_сэтинньи_ахсынньы'.split('_'),
   monthsShort : 'тхс_олн_клн_мсу_ыам_бэс_оты_атр_блҕ_алт_сэт_ахс'.split('_'),
   monthsParseExact : true,
   weekdays : 'Баскыһыанньа_Бэнидиэнньик_Оптуорунньук_Сэрэдэ_Чэппиэр_Бээтинсэ_Субуота'.split('_'),
   weekdaysShort : 'Бс_Бн_Оп_Ср_Чп_Бт_Сб'.split('_'),
   weekdaysMin : 'Бс_Бн_Оп_Ср_Чп_Бт_Сб'.split('_'),
   weekdaysParseExact : true,
   longDateFormat : {
      LT : 'H:mm',
      LTS : 'H:mm:ss',
      L : 'YYYY/M/D',
      LL : 'YYYY, MMMM D',
      LLL : 'YYYY, MMMM D [к.,] H:mm',
      LLLL : 'dddd, YYYY [с.] MMMM D [к.,] H:mm',
   },
   calendar : {
      sameDay: '[Бүгүн] LT [чааска]',
      nextDay: '[Сарсын] LT [чааска]',
      nextWeek: '[Аныгыскы] dddd LT [чааска]',
      lastDay: '[Бэҕэһээ] LT [чааска]',
      lastWeek: '[Ааспыт] dddd LT [чааска]',
      sameElse: 'L'
   },
   relativeTime: {
      future: '%s',
      past: '%s ынараа өттүгэр',
      s: relativeTime,
      m: relativeTime,
      mm: relativeTime,
      h: relativeTime,
      hh: relativeTime,
      d: relativeTime,
      dd: relativeTime,
      M: relativeTime,
      MM: relativeTime,
      y: relativeTime,
      yy: relativeTime,
   },
   ordinalParse: /\d{1,2}(-c|)/,
   ordinal: function (number, period) {
      switch (period) {
      case 'M':
      case 'd':
      case 'DDD':
      case 'w':
      case 'W':
         return number + '-с';
      default:
         return number;
      }
   },
   week : {
      dow : 1, // Monday is the first day of The week.
      doy : 7  // The week that contains Jan 1st is the first week of the year.
   }
});
const { formatDateIn, formatDate } = dateFormatter('sah');

export default {
   _name: 'саха',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Киир',
      signOut: 'Таҕыс',
   },

   Footer: {
      'preLink': 'Туох эрэ сатамматаҕына бу киһиэхэ суруй ',
      'link': 'Ле Лой',
      'postLink': '.',
   },

   EditathonList: {
      title: 'Марафоннар',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Марафон саҕаланар болдьоҕо ${formatDateIn(date)}`,
      editathonIsOver: 'Марафон түмүктэннэ',
      editathonWillEndIn: date => `Марафон бүтэр болдьоҕо ${formatDateIn(date)}`,
      addArticle: 'Эбэргэ',
      juryTool: 'Сыаналыырга',
      jury: 'Дьүүллүүр сүбэ:',
      user: 'Кыттааччы',
      acticlesCount: 'Ыстатыйа',
      totalScore: 'Баал',
      acticle: 'Ыстатыйа',
      addedOn: 'Эбиллибит',
      score: 'Баал',
      dateAdded: date => formatDate(date, 'MMM D[,] LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Бу марафоҥҥа ${formatDate(date, 'L')} эрэ кэннэ бэлиэтэммит кыттааччылар кытталлар`,
         namespace: isIn => `Сүрүн аат далыгар ${isIn ? 'баар ыстатыйа' : 'киирбэт эбит'}`,
         author: 'Ыстатыйа ааптара: ',
         articleCreated: date => `Ыстатыйа баччаҕа ${formatDate(date, 'L LT')} айыллыбыт`,
         chars: n => `${formatNumber(n)} ${plural(n, 'бэлиэ', 'бэлиэлээх')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'баайт', 'баайтаах')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'тыл', 'тыллаах')}`,
      },

      unauthorized: 'Киирбэтэххин.',
      networkError: err => `Ситим алҕаһа таҕыста, хатылаан көр:\n${err}`,
      notFound: 'Ыстатыйа көстүбэтэ',
      back: 'Төнүн',
      cancel: 'Таҕыс',
      next: 'Салгыы',
      add: 'Эп',
      articleTitle: 'Ыстатыйа аата:',
      youAlreadyAdded: 'Бу ыстатыйаны урут киллэрбит эбиккин',
      someoneAlreadyAdded: 'Бу ыстатыйаны атын кыттааччы киллэрбит эбит',
   },

   SignInWarning: {
      title: 'Салгыырга киириэхтээххин.',
      ok: 'Киир',
      cancel: 'Таҕыс',
   },

   UnsavedWarning: {
      message: 'Эн уларытыыларыҥ бигэргэниэхтэрэ суоҕа.',
      ok: 'Салгыы',
      cancel: 'Таҕыс',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'бэлиэ', 'бэлиэлээх')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'баайт', 'баайтаах')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'тыл', 'тыллаах')}`,
         author: 'Ааптар',
         createdOn: 'Айыллыбыт',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Эппит',
      },

      Preview: {
         notFound: 'Ыстатыйа көстүбэтэ',
         loadingError: 'Киллэрии алҕаһа:',
      },

      Evaluation: {
         comment: 'ырытыы',
         total: n => `Барыта: ${formatNumber(n)}`,
         save: 'Бигэргэт',
         skip: 'Көтүт',

         Comment: {
            save: 'Бигэргэт',
            cancel: 'Таҕыс',
         },
      },
   },
};
