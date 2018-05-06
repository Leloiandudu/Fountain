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
   _fallback: 'en',
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
      'postLink': '.',
   },

   EditathonList: {
      title: 'Марафоны',
      create: 'Создать',
      finished: 'Завершившиеся',
   },

   EditathonFilter: {
      search: 'поиск...',
      all: '(все)',
      project: 'проект...',
      language: 'язык...',
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
      manageArticles: 'Управление статьями',
      award: 'Наградить',
   },

   ManageArticles: {
      removeSelected: 'Удалить отмеченные',
   },

   Dashboard: {
      articles: 'Статей',
      users: 'Участников',
      marks: 'Оценок',
      withoutMarks: 'Не оценено',
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
         addedForCleanupRu: date => date ? [ 'На КУЛ с ', formatDate(date, 'L'), '' ] : [ 'Шаблон КУЛ ', 'не найден', '' ],
      },

      unauthorized: 'Вы не авторзиованы.',
      networkError: err => `Произошла сетевая ошибка, попробуйте снова:\n${err}`,
      notFound: 'Статья не найдена',
      back: 'Назад',
      cancel: 'Отмена',
      next: 'Далее',
      add: 'Добавить',
      user: 'Добавить от лица:',
      userNotFound: user => `Участник '${user}' не найден`,
      articleTitle: 'Название статьи:',
      youAlreadyAdded: 'Вы уже добавили эту статью в марафон',
      someoneAlreadyAdded: 'Другой участник уже добавил эту статью в марафон',
   },

   EditathonAward: {
      title: 'Награждение',
      rank: r => `#${r}`,
      noSignature: x => [ 'Подпись не найдена. Нажмите ', x, ', чтобы подписаться.' ],
      award: 'Наградить',
      cancel: 'Отмена',
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
         addedForCleanupRu: date => date ? [ 'На КУЛ с ', formatDate(date, 'L') ] : [ 'Шаблон КУЛ', 'не найден' ],
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

   EditathonConfig: {
      newEditathon: 'Создание марафона',
      back: 'Назад',
      next: 'Далее',
      create: 'Создать',
      save: 'Сохранить',
      cancel: 'Отмена',
      general: 'Общие',
      rules: 'Правила',
      marks: 'Оценки',
      template: 'Шаблон',
      jury: 'Жюри',
      GeneralPage: {
         title: 'Название',
         code: 'Код',
         project: 'Проект',
         description: 'Описание',
         optional: ' (необязательное поле)',
         startDate: 'Дата начала',
         finishDate: 'Дата конца',
         tooShort: 'минимум 3 символа',
         negativeDates: 'Дата конца не должна быть меньше даты начала',
         consensualVote: 'Требуется консенсус жюри',
         hiddenMarks: 'Скрыть оценки',
      },
      RulesPage: {
         add: 'Добавить правило',
         optional: 'необязательное',
         informational: 'показывать жюри',
         RulesDemo: {
            preview: 'Предпросмотр',
            user: 'Участник',
            article: 'Статья',
            show: 'Показать',
            forUser: 'при добавлении статьи участником:',
            forJury: 'для жюри:',
         },
         articleSize: {
            title: 'Размер статьи',
            atLeast: 'не менее',
            atMost: 'не более',
            chars: 'символов',
            bytes: 'байт',
            words: 'слов',
            or: '- или -',
            add: '+ или...',
         },
         submitterIsCreator: {
            title: 'Статья создана номинатором',
            description: 'Только автор статьи может добавить ее в марафон',
         },
         articleCreated: {
            title: 'Дата создания статьи',
            notBefore: 'не ранее',
            notAfter: 'не позднее',
         },
         submitterRegistered: {
            title: 'Дата регистрации номинатора',
            notBefore: 'не ранее',
         },
         namespace: {
            title: 'Пространство имён',
            description: 'Статя должна быть расположена в основном пространстве имён',
         },
      },
      MarksPage: {
         radio: 'группа переключателей',
         check: 'тумблер',
         int: 'диапазон',
         option: 'переключатель',
         title: 'название',
         description: 'описание',
         optional: 'необязательное',
         value: 'значение',
         min: 'мин',
         max: 'макс',
         add: 'добавить...',
         addOption: 'добавить переключатель',
         preview: 'Предпросмотр',
      },
      TemplatePage: {
         autoAdd: 'Автоматически добавлять шаблон',
         name: 'Имя шаблона',
         placement: 'Местоположение шаблона',
         inArticle: 'в статье',
         onTalkPage: 'на странице обсуджения',
         args: 'Аргументы',
         add: 'добавить',
         preview: 'Преварительный просмотр',
      },
      JuryPage: {
         add: 'добавить',
      },
   },

   MarksPreview: {
      incomplete: 'пожалуйста введите все обязательные оценки внизу чтобы протестировать оценку',
      resetPreview: 'Сбросить предпросмотр',
   },

   Validation: {
      required: 'обязательное поле',
   },

   Personal: {
      title: 'Личный кабинет',
      editathons: 'Участие',
      jury: 'Оценка',
      created: 'Созданные',
      approval: 'Подтверджение',

      Editathons: {
         title: 'Марафоны, в которых вы принимаете участие',
         hasEnded: date => `закончился ${formatDateIn(date)}`,
         willEndIn: date => `заканчивается ${formatDateIn(date)}`,
         noMarks: 'у вас пока нет оценок',
         hiddenMarks: 'оценки скрыты',
      },

      Jury: {
         title: 'Марафоны, в которых вы в жюри',
         hasEnded: date => `закончился ${formatDateIn(date)}`,
         willEndIn: date => `заканчивается ${formatDateIn(date)}`,
      },

      Created: {
         title: 'Марафоны, созданные вами',
         draft: 'черновик',
      },

      Approval: {
         title: 'Марафоны, требующие подтверждения',
      },
   },
};
