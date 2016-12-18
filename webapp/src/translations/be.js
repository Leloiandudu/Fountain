import 'moment/locale/be';
import { plural, numberFormatter, dateFormatter, gender } from '../translate';

const formatNumber = numberFormatter('\u00a0', ',');
const { formatDateIn, formatDate } = dateFormatter('be');

export default {
   _name: 'беларуская',
   _fallback: 'ru',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Увайсці',
      signOut: 'Выйсці',
   },

   Footer: {
      'preLink': 'У выпадку праблем з інструментам звярніцеся да ўдзельніка ',
      'link': 'Ле Лой',
      'postLink': '.',
   },

   EditathonList: {
      title: 'Марафоны',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Марафон пачнецца ${formatDateIn(date)}`,
      editathonIsOver: 'Марафон скончыўся',
      editathonWillEndIn: date => `Марафон скончыцца ${formatDateIn(date)}`,
      addArticle: 'Дадаць',
      juryTool: 'Ацаніць',
      jury: 'Журы:',
      user: 'Удзельнік',
      acticlesCount: 'Артыкулаў',
      totalScore: 'Балаў',
      acticle: 'Артыкул',
      addedOn: 'Дададзена',
      score: 'Балаў',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `У гэтым марафоне могуць удзельнічаць толькі ўдзельнікі, якія зарэгістраваліся пасля ${formatDate(date, 'L')}`,
         namespace: isIn => `${isIn ? 'Знаходзіцца' : 'Не знаходзіцца'} ў асноўнай прасторы артыкулаў`,
         author: 'Аўтар артыкула: ',
         articleCreated: date => `Артыкул створаны  ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'сімвал', 'сімвалы', 'сімвалаў')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'байт', 'байта', 'байтаў')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'слова', 'словы', 'слоў')}`,
      },

      unauthorized: 'Вы не аўтарызаваны.',
      networkError: err => `Памылка сеткі. Калі ласка, паспрабуйце яшчэ:\n${err}`,
      notFound: 'Артыкул не знойдзены',
      back: 'Назад',
      cancel: 'Адмена',
      next: 'Далей',
      add: 'Дадаць',
      articleTitle: 'Назва артыкула:',
      youAlreadyAdded: 'Вы ўжо дадалі гэты артыкул у марафон',
      someoneAlreadyAdded: 'Іншы ўдзельнік ужо дадаў гэты артыкул у марафон',
   },

   SignInWarning: {
      title: 'Для працягу трэба аўтарызавацца.',
      ok: 'Увайсці',
      cancel: 'Адмена',
   },

   UnsavedWarning: {
      message: 'Вашы змяненні не будуць захаваныя.',
      ok: 'Працягнуць',
      cancel: 'Адмена',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'сімвал', 'сімвалы', 'сімвалаў')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'байт', 'байта', 'байтаў')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'слова', 'словы', 'слоў')}`,
         author: 'Аўтар артыкула',
         createdOn: 'Створаны',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: g => gender(g, 'Дадала', 'Дадаў'),
      },

      Preview: {
         notFound: 'Артыкул не знойдзены',
         loadingError: 'Памылка загрузкі:',
      },

      Evaluation: {
         comment: 'каментарый',
         total: n => `Сума: ${formatNumber(n)}`,
         save: 'Захаваць',
         skip: 'Прапусціць',

         Comment: {
            save: 'Захаваць',
            cancel: 'Адмена',
         },
      },
   },
};
