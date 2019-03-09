import moment from 'moment';
import 'moment/locale/zh-cn';
import { plural, numberFormatter, dateFormatter } from '../translate';

moment.updateLocale('zh-cn', {
   meridiem: (hour, minute, isLowercase) =>
      hour < 12 ?
         (isLowercase ? 'am' : 'AM') :
         (isLowercase ? 'pm' : 'PM'),
   longDateFormat : {
      LT : 'h:mmA',
      L: 'YYYY[年]M[月]D[日]',
   },
});

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('zh-cn');

export default {
   _name: '中文',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: '登录',
      signOut: '登出',
   },

   Footer: {
      'preLink': '若关于本工具有任何疑问请联系 ',
      'link': 'Le Loy',
      'postLink': '。',
   },

   EditathonList: {
      title: '编辑马拉松',
   },

   ArticlesList: {
      editathonWillStartIn: date => `这场编辑马拉松将${formatDateIn(date)}举办`,
      editathonIsOver: '这场编辑马拉松已经结束',
      editathonWillEndIn: date => `这场编辑马拉松将${formatDateIn(date)}结束`,
      addArticle: '提交',
      juryTool: '评审',
      jury: '评审成员:',
      user: '用户',
      acticlesCount: '条目',
      totalScore: '分数',
      acticle: '条目',
      addedOn: '添加时间',
      score: '分数',
      dateAdded: date => formatDate(date, 'MMMDo LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Nur Benutzer, die sich nach dem ${formatDate(date, 'L')} registiert haben, können an diesem Edit-a-thon teilnehmen`,
         namespace: isIn => `${isIn ? '' : '不'}位于主名字空间`,
         author: '创建者: ',
         articleCreated: date => `本条目创建${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)}字`,
         bytes: n => `${formatNumber(n)}字节`,
      },

      unauthorized: '您未被授权',
      networkError: err => `网络错位，请重试:\n${err}`,
      notFound: '条目未找到',
      back: '返回',
      cancel: '取消',
      next: '下一步',
      add: '添加',
      articleTitle: '条目名称:',
      youAlreadyAdded: '您已将该条目添加至这场编辑马拉松',
      someoneAlreadyAdded: '另一个用户已提交该条目至这场编辑马拉松',
   },

   SignInWarning: {
      title: '请登陆后继续.',
      ok: '登陆',
      cancel: '取消',
   },

   UnsavedWarning: {
      message: '您的更改未被保存.',
      ok: '好',
      cancel: '取消',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)}字`,
         bytes: n => `${formatNumber(n)}字节`,
         author: '创建者',
         createdOn: '创建时间',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: '添加者',
      },

      Preview: {
         notFound: '条目未找到',
         loadingError: '加载错误:',
      },

      Evaluation: {
         comment: '评论',
         total: n => `总计: ${formatNumber(n)}`,
         save: '保存',
         skip: '跳过',

         Comment: {
            save: '保存',
            cancel: '取消',
         },
      },
   },
};
