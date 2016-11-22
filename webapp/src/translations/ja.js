import moment from 'moment';
import 'moment/locale/ja';
import { numberFormatter, dateFormatter } from '../translate';

moment.updateLocale('ja', {
   longDateFormat: {
      'LT': 'Ah：mm',
      'L': 'YYYY年M月D日',
   }
});

const formatNumber = numberFormatter('.', ',');
const { formatDateIn, formatDate } = dateFormatter('ja');

export default {
   _name: '日本語',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: '、',

   Header: {
      signIn: 'ログイン',
      signOut: 'ログアウト',
   },

   Footer: {
      'preLink': '何かこのツールについての問題がございましたら、',
      'link': 'Le Loyのユーザーページ',
      'postLink': ' までご連絡ください。',
   },

   EditathonList: {
      title: 'エディッタソン',
   },

   ArticlesList: {
      editathonWillStartIn: date => `このエディタソンは ${formatDateIn(date)} に始まります`,
      editathonIsOver: 'このエディタソンは終了しました',
      editathonWillEndIn: date => `このエディタソンは ${formatDateIn(date)} に終わります`,
      addArticle: '送信',
      juryTool: '審査員',
      jury: '審査員:',
      user: '利用者',
      acticlesCount: '記事数',
      totalScore: '得点',
      acticle: '記事',
      addedOn: '追加日時',
      score: '得点',
      dateAdded: date => formatDate(date, 'M月D日 Ah：mm'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `${formatDate(date, 'L')} よりも後に登録したユーザーだけがこのエディタソンに参加できます`,
         namespace: isIn => `標準名前空間にありま${isIn ? 'す' : ' せん'}`,
         author: '作成者： ',
         articleCreated: date => `${formatDate(date, 'L LT')} に作成されました`,
         chars: n => `${formatNumber(n)} 文字`,
         bytes: n => `${formatNumber(n)} バイト`,
         words: n => `${formatNumber(n)} 語`,
      },

      unauthorized: '認証されていません',
      networkError: err => `ネットワークエラー　もう一度お試しください:\n${err}`,
      notFound: '記事が見つかりません',
      back: '戻る',
      cancel: '取り消し',
      next: '次へ',
      add: '追加',
      articleTitle: '記事名：',
      youAlreadyAdded: 'あなたはすでにこの記事を当エディタソンに追加しました',
      someoneAlreadyAdded: 'この記事はすでに他の利用者により当エディタソンに追加されました',
   },

   SignInWarning: {
      title: 'ログインしてください。',
      ok: 'ログイン',
      cancel: '取り消し',
   },

   UnsavedWarning: {
      message: '変更は破棄されます。',
      ok: '破棄',
      cancel: '取り消し',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} 文字`,
         bytes: n => `${formatNumber(n)} バイト`,
         words: n => `${formatNumber(n)} 語`,
         author: '作成者：',
         createdOn: '作成日時：',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: '追加者：',
      },

      Preview: {
         notFound: '記事が見つかりません',
         loadingError: '読み込みエラー：',
      },

      Evaluation: {
         comment: 'コメント',
         total: n => `合計得点： ${formatNumber(n)}`,
         save: '保存',
         skip: 'スキップ',

         Comment: {
            save: '保存',
            cancel: '取り消し',
         },
      },
   },
};
