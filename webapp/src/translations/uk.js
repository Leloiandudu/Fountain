import 'moment/locale/uk';
import { plural, numberFormatter, dateFormatter, gender } from '../translate';

const formatNumber = numberFormatter('\u00a0', ',');
const { formatDateIn, formatDate } = dateFormatter('uk');

export default {
   _name: 'українська',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Увійти',
      signOut: 'Вийти',
   },

   Footer: {
      'preLink': 'Будь ласка, напишіть користувачеві ',
      'link': 'Le Loy',
      'postLink': ', якщо у Вас виникли якісь проблеми із цим інструментом.',
   },

   EditathonList: {
      title: 'Вікімарафони',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Вікімарафон почнеться ${formatDateIn(date)}`,
      editathonIsOver: 'Вікімарафон закінчився',
      editathonWillEndIn: date => `Вікімарафон закінчиться ${formatDateIn(date)}`,
      addArticle: 'Додати',
      juryTool: 'Оцінити',
      jury: 'Члени журі:',
      user: 'Користувач',
      acticlesCount: 'Статті',
      totalScore: 'Оцінки',
      acticle: 'Стаття',
      addedOn: 'Добавлено',
      score: 'Оцінки',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Лише користувачі, що зареєструвалися після ${formatDate(date, 'L')}, можуть брати участь у цьому вікімарафоні`,
         namespace: isIn => `${isIn ? 'В' : 'Не в'} в основному просторі`,
         author: 'Створено: ',
         articleCreated: date => `Статтю створено ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'символ', 'символи', 'символів')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'байт', 'байта', 'байтів')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'слово', 'слова', 'слів')}`,
      },

      unauthorized: 'Ви не авторизовані.',
      networkError: err => `Мережева помилка. Будь ласка, спробуйте ще раз:\n${err}`,
      notFound: 'Статтю не знайдено',
      back: 'Назад',
      cancel: 'Скасувати',
      next: 'Далі',
      add: 'Додати',
      articleTitle: 'Назва статті:',
      youAlreadyAdded: 'Ви вже додали цю статтю до вікімарафону',
      someoneAlreadyAdded: 'Інший користувач уже додав цю статтю до вікімарафону',
   },

   SignInWarning: {
      title: 'Будь ласка, ввійдіть, щоб продовжити.',
      ok: 'Увійти',
      cancel: 'Скасувати',
   },

   UnsavedWarning: {
      message: 'Ваші зміни буде відкинуто.',
      ok: 'Відкинути',
      cancel: 'Скасувати',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'символ', 'символи', 'символів')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'байт', 'байта', 'байтів')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'слово', 'слова', 'слів')}`,
         author: 'Створено',
         createdOn: 'Дата створення',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Додано',
      },

      Preview: {
         notFound: 'Статтю не знайдено',
         loadingError: 'Помилка завантаження:',
      },

      Evaluation: {
         comment: 'коментар',
         total: n => `Усього: ${n}`,
         save: 'Зберегти',
         skip: 'Пропустити',

         Comment: {
            save: 'Зберегти',
            cancel: 'Скасувати',
         },
      },
   },
};
