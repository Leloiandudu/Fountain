import moment from 'moment';
import 'moment/locale/ru';
import { plural, numberFormatter, dateFormatter, gender } from '../translate';

moment.updateLocale('ru', {
    monthsShort : [
        'янв', 'фев', 'мар', 'апр', 'май', 'июн', 
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
    ]
});

const formatNumber = numberFormatter('\u00a0', ',');
const { formatDateIn, formatDate } = dateFormatter('ru');

export default {
   _name: 'русский',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Войти',
      signOut: 'Выйти',
   },

   Footer: {
      'preLink': 'В случае проблем с инструментом обратитесь к ',
      'link': 'Ле Лою',
      'postLink': '',
   },

   EditathonList: {
      title: 'Марафоны',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Марафон начнётся ${formatDateIn(date)}`,
      editathonIsOver: 'Марафон завершён',
      editathonWillEndIn: date => `Марафон закончится ${formatDateIn(date)}`,
      addArticle: 'Добавить',
      juryTool: 'Оценить',
      jury: 'Жюри:',
      user: 'Участник',
      acticlesCount: 'Статей',
      totalScore: 'Баллов',
      acticle: 'Статья',
      addedOn: 'Добавлено',
      score: 'Баллов',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `В этом марафоне могут соревноваться только участники, зарегистрировавшиеся не ранее ${formatDate(date, 'L')}`,
         namespace: isIn => `${isIn ? 'Находится' : 'Не находится'} в основном пространстве статей`,
         author: 'Автор статьи: ',
         articleCreated: date => `Статья создана ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'символ', 'символа', 'символов')}`,
         bytes: n => `${formatNumber(n)} байт`,
         words: n => `${formatNumber(n)} ${plural(n, 'слово', 'слова', 'слов')}`,
      },

      unauthorized: 'Вы не авторзиованы.',
      networkError: err => `Произошла сетевая ошибка, попробуйте снова:\n${err}`,
      notFound: 'Статья не найдена',
      back: 'Назад',
      cancel: 'Отмена',
      next: 'Далее',
      add: 'Добавить',
      articleTitle: 'Название статьи:',
      youAlreadyAdded: 'Вы уже добавили эту статью в марафон',
      someoneAlreadyAdded: 'Другой участник уже добавил эту статью в марафон',
   },

   SignInWarning: {
      title: 'Для продолжения необходимо авторизоваться.',
      ok: 'Войти',
      cancel: 'Отмена',
   },

   UnsavedWarning: {
      message: 'Ваши изменения не будут сохранены.',
      ok: 'Продолжить',
      cancel: 'Отмена',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'символ', 'символа', 'символов')}`,
         bytes: n => `${formatNumber(n)} байт`,
         words: n => `${formatNumber(n)} ${plural(n, 'слово', 'слова', 'слов')}`,
         author: 'Автор',
         createdOn: 'Создана',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: g => gender(g, 'Добавила', 'Добавил'),
      },

      Preview: {
         notFound: 'Статья не найдена',
         loadingError: 'Ошибка загрузки:',
      },

      Evaluation: {
         comment: 'комментарий',
         total: n => `Сумма: ${formatNumber(n)}`,
         save: 'Сохранить',
         skip: 'Пропустить',

         Comment: {
            save: 'Сохранить',
            cancel: 'Отмена',
         },
      },
   },
};
