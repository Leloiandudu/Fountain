import moment from 'moment';
import 'moment/locale/bg';
import { plural, numberFormatter, dateFormatter, gender } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('bg');

export default {
   _name: 'български',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Влизане',
      signOut: 'Излизане',
   },

   Footer: {
      'preLink': 'Ако имате проблеми с този инструмент моля, свържете се с ',
      'link': 'Ле Лой',
      'postLink': '',
   },

   EditathonList: {
      title: 'Състезания',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Състезанието ще започне ${formatDateIn(date)}`,
      editathonIsOver: 'Състезанието завърши',
      editathonWillEndIn: date => `Състезанието ще приключи ${formatDateIn(date)}`,
      addArticle: 'Добавяне',
      juryTool: 'Оценка',
      jury: 'Жури:',
      user: 'Участник',
      acticlesCount: 'Статия',
      totalScore: 'Точки',
      acticle: 'Статия',
      addedOn: 'Добавена',
      score: 'Точки',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Само потребители които са регистрирани след ${formatDate(date, 'L')} могат да участват в конкурса`,
         namespace: isIn => `Статията ${isIn ? 'е' : 'не е'} в основно пространство`,
         author: 'Автор: ',
         articleCreated: date => `Статия е създадена през ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'символ', 'символа')}`,
         bytes: n => `${formatNumber(n)} байта`,
         words: n => `${formatNumber(n)} ${plural(n, 'дума', 'думи')}`,
      },

      unauthorized: 'Вие не сте влезли.',
      networkError: err => `Комуникационна грешка. Моля опитайте отново:\n${err}`,
      notFound: 'Няма статия',
      back: 'Назад',
      cancel: 'Отказ',
      next: 'Напред',
      add: 'Добавете',
      articleTitle: 'Заглавието на статия:',
      youAlreadyAdded: 'Вие вече сте добавили тази статия',
      someoneAlreadyAdded: 'Друг потребител вече добавил тази статия',
   },

   SignInWarning: {
      title: 'Моля, влезте за да продължи.',
      ok: 'Влизане',
      cancel: 'Отказ',
   },

   UnsavedWarning: {
      message: 'Промените ще бъдат изхвърлени.',
      ok: 'Изтриване',
      cancel: 'Отказ',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'символ', 'символа')}`,
         bytes: n => `${formatNumber(n)} байта`,
         words: n => `${formatNumber(n)} ${plural(n, 'дума', 'думи')}`,
         author: 'Автор',
         createdOn: 'Создана',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Добавена',
      },

      Preview: {
         notFound: 'Няма статия',
         loadingError: 'Грешка при качване:',
      },

      Evaluation: {
         comment: 'коментар',
         total: n => `Общо: ${n}`,
         save: 'Съхраняване',
         skip: 'Скип',

         Comment: {
            save: 'Съхраняване',
            cancel: 'Отказ',
         },
      },
   },
};
