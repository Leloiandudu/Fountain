import 'moment/locale/ka';
import { numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('ka');

export default {
   _name: 'ქართული',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'შესვლა',
      signOut: 'გასვლა',
   },

   Footer: {
      'preLink': 'ხელსაწყოსთან დაკავშირებული პრობლემის შემთხვევაში დაუკავშირდით ',
      'link': 'Le Loy',
      'postLink': '-ს.',
   },

   EditathonList: {
      title: 'მარათონი',
   },

   ArticlesList: {
      editathonWillStartIn: date => `მარათონი დაიწყება ${formatDateIn(date)}`,
      editathonIsOver: 'მარათონი დასრულდა',
      editathonWillEndIn: date => `მარათონი სრულდება ${formatDateIn(date)}`,
      addArticle: 'დამატება',
      juryTool: 'შეფასება',
      jury: 'ჟიურის წევრები:',
      user: 'მომხმარებელი',
      acticlesCount: 'სტატიები',
      totalScore: 'ქულა',
      acticle: 'სტატია',
      addedOn: 'დამატებულია',
      score: 'ქულები',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `ამ მარათონში მხოლოდ იმ მომხმარებლებს შეუძლიათ მონაწილეობის მიღება, რომლებიც ${formatDate(date, 'L')}-ის შემდეგ დარეგისტრირდნენ`,
         namespace: isIn => `${isIn ? '' : 'არ არის '} სტატიების მთავარ სახელთა სივრცეში${isIn ? 'ა' : ''}`,
         author: 'შემქმნელი: ',
         articleCreated: date => `სტატიის შექმნის თარიღია ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} სიმბოლო)}`,
         bytes: n => `${formatNumber(n)} ბაიტი`,
         words: n => `${formatNumber(n)} სიტყვა}`,
      },

      unauthorized: 'თქვენ არ ხართ ავტორიზებული.',
      networkError: err => `ქსელის შეცდომა. კიდევ სცადეთ:\n${err}`,
      notFound: 'სტატია ვერ მოიძებნა',
      back: 'უკან',
      cancel: 'გაუქმება',
      next: 'შემდეგი',
      add: 'დამატება',
      articleTitle: 'სტატიის სათაური:',
      youAlreadyAdded: 'ეს სტატია თქვენ უკვე დაამატეთ მარათონში',
      someoneAlreadyAdded: 'ეს სტატია სხვა მომხმარებელმა უკვე დაამატა მარათონში',
   },

   SignInWarning: {
      title: 'გასაგრძელებლად საჭიროა ავტორიზაცია.',
      ok: 'შესვლა',
      cancel: 'გაუქმება',
   },

   UnsavedWarning: {
      message: 'თქვენი ცვლილებები არ შეინახება.',
      ok: 'კარგი',
      cancel: 'გაუქმება',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} სიმბოლო)}`,
         bytes: n => `${formatNumber(n)} ბაიტი`,
         words: n => `${formatNumber(n)} სიტყვა}`,
         author: 'შემქმნელი',
         createdOn: 'შექმნის თარიღი',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'შემქმნელი',
      },

      Preview: {
         notFound: 'სტატია ვერ მოიძებნა',
         loadingError: 'ჩატვირთვის შეცდომა:',
      },

      Evaluation: {
         comment: 'კომენტარი',
         total: n => `სულ: ${formatNumber(n)}`,
         save: 'შენახვა',
         skip: 'გამოტოვება',

         Comment: {
            save: 'შენახვა',
            cancel: 'გაუქმება',
         },
      },
   },
};
