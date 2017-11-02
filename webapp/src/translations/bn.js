import 'moment/locale/bn';
import { plural, numberFormatter, dateFormatter } from '../translate';

const { formatDateIn, formatDate } = dateFormatter('bn');

const formatNumberArabic = numberFormatter(',', '.');
const numberTable = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };

function formatNumber(...args) {
   const str = formatNumberArabic(...args);
   let res = '';
   for (let i = 0; i < str.length; i++) {
      const d = str[i];
      const ch = numberTable[d];
      res += ch || d;
   }
   return res;
}

export default {
   _name: 'বাংলা',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'প্রবেশ',
      signOut: 'প্রস্থান',
   },

   Footer: {
      'preLink': 'এই সরঞ্জাম সংক্রান্ত সমস্যা হলে, দয়া করে ',
      'link': 'Le Loy',
      'postLink': '-এর সঙ্গে যোগাযোগ করুন।',
   },

   EditathonList: {
      title: 'এডিটাথন',
   },

   ArticlesList: {
      editathonWillStartIn: date => `এডিটাথন শুরু হবে ${formatDateIn(date)} তারিখে`,
      editathonIsOver: 'এডিটাথন শেষ হয়েছে',
      editathonWillEndIn: date => `এডিটাথন শেষ হবে ${formatDateIn(date)} তারিখে`,
      addArticle: 'জমা দিন',
      juryTool: 'বিচার করুন',
      jury: 'বিচারকমণ্ডলী:',
      user: 'ব্যবহারকারী',
      acticlesCount: 'নিবন্ধ',
      totalScore: 'পয়েন্ট',
      acticle: 'নিবন্ধ',
      addedOn: 'যোগ করা হয়',
      score: 'পয়েন্ট',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `${formatDate(date, 'L')} এর পরে নিবন্ধিত ব্যবহারকারীরাই শুধুমাত্র এই এডিটাথনে অংশগ্রহণ করতে পারবেন`,
         namespace: isIn => `প্রধান ${isIn ? 'নামস্থানে রয়েছে' : 'নামস্থান নয়'}`,
         author: 'তৈরি করেছেন: ',
         articleCreated: date => `নিবন্ধটি ${formatDate(date, 'L LT')} তারিখে তৈরি করা হয়েছে`,
         chars: n => `${formatNumber(n)}টি চিহ্ন')}`,
         bytes: n => `${formatNumber(n)} বাইট`,
         words: n => `${formatNumber(n)}টি শব্দ`,
      },

      unauthorized: 'আপনি অনুমোদিত নন',
      networkError: err => `নেটওয়ার্ক ত্রুটি। দয়া করে আবার চেষ্টা করুন:\n${err}`,
      notFound: 'নিবন্ধ পাওয়া যায়নি',
      back: 'পিছনে',
      cancel: 'বাতিল করুন',
      next: 'পরবর্তী',
      add: 'যোগ করুন',
      articleTitle: 'নিবন্ধের শিরোনাম:',
      youAlreadyAdded: 'আপনি এই নিবন্ধটিকে ইতিমধ্যেই এডিটাথনে যোগ করেছেন',
      someoneAlreadyAdded: 'অন্য একজন ব্যবহারকারী ইতিমধ্যেই এই নিবন্ধকে এডিটাথনে যোগ করেছেন',
   },

   SignInWarning: {
      title: 'চালিয়ে যেতে দয়া করে প্রবেশ করুন।', // notice that they don't use the FULL STOP
      ok: 'প্রবেশ',
      cancel: 'বাতিল করুন',
   },

   UnsavedWarning: {
      message: 'আপনার পরিবর্তনগুলি বাতিল করা হবে।',
      ok: 'বাতিল করুন',
      cancel: 'বাতিল করুন',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)}টি চিহ্ন')}`,
         bytes: n => `${formatNumber(n)} বাইট`,
         words: n => `${formatNumber(n)}টি শব্দ`,
         author: 'তৈরি করেছেন',
         createdOn: 'তৈরি করা হয়',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'যোগ করেছেন',
      },

      Preview: {
         notFound: 'নিবন্ধ পাওয়া যায়নি',
         loadingError: 'লোডকরণে ত্রুটি:',
      },

      Evaluation: {
         comment: 'মন্তব্য',
         total: n => `মোট: ${formatNumber(n)}`,
         save: 'সংরক্ষণ করুন',
         skip: 'এড়িয়ে যান',

         Comment: {
            save: 'সংরক্ষণ করুন',
            cancel: 'পরিত্যাগ করুন',
         },
      },
   },
};
