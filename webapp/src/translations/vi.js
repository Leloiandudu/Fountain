import 'moment/locale/vi';
import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('vi');

export default {
   _name: 'Tiếng Việt',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Đăng nhập',
      signOut: 'Đăng xuất',
   },

   Footer: {
      'preLink': 'Liên hệ ',
      'link': 'Lê Lợi',
      'postLink': ' nếu công cụ này có vấn đề.',
   },

   EditathonList: {
      title: 'Cuộc đua soạn thảo',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Cuộc đua soạn thảo này sẽ bắt đầu ${formatDateIn(date)}`,
      editathonIsOver: 'Cuộc đua soạn thảo đã kết thúc',
      editathonWillEndIn: date => `Cuộc đua soạn thảo này sẽ kết thúc ${formatDateIn(date)}`,
      addArticle: 'Gửi',
      juryTool: 'Giám khảo',
      jury: 'Các thành viên đánh giá:',
      user: 'Thành viên',
      acticlesCount: 'Các bài viết',
      totalScore: 'Điểm',
      acticle: 'Bài viết',
      addedOn: 'Thêm vào lúc',
      score: 'Điểm',
      dateAdded: date => formatDate(date, 'LT D MMM'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Các thành viên đăng ký sau ${formatDate(date, 'L')} mới có thể tham gia vào cuộc đua soạn thảo này`,
         namespace: isIn => `${isIn ? 'Trong' : 'Không thuộc'} không gian chính`,
         author: 'Tạo bởi: ',
         articleCreated: date => `Bài viết được tạo vào ${formatDate(date, 'LT L')}`,
         chars: n => `${formatNumber(n)} biểu tượng`,
         bytes: n => `${formatNumber(n)} bytes`,
         words: n => `${formatNumber(n)} lời`,
      },

      unauthorized: 'Bạn không có quyền làm việc này',
      networkError: err => `Mạng bị lỗi. Làm ơn thử lại sau:\n${err}`,
      notFound: 'Không tìm thấy bài viết',
      back: 'Trở về',
      cancel: 'Bỏ qua',
      next: 'Tiếp theo',
      add: 'Thêm',
      articleTitle: 'Tên bài viết:',
      youAlreadyAdded: 'Bạn đã thêm bài viết này vào cuộc đua trước đó rồi',
      someoneAlreadyAdded: 'Một thành viên khác đã thêm bài viết này vào cuộc đua trước bạn rồi',
   },

   SignInWarning: {
      title: 'Làm ơn đăng nhập để tiếp tục.',
      ok: 'Đăng nhập',
      cancel: 'Bỏ qua',
   },

   UnsavedWarning: {
      message: 'Những thay đổi của bạn sẽ bị bỏ đi.',
      ok: 'Bỏ đi',
      cancel: 'Hủy bỏ',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} biểu tượng`,
         bytes: n => `${formatNumber(n)} bytes`,
         words: n => `${formatNumber(n)} lời`,
         author: 'Tạo bởi',
         createdOn: 'Tạo vào lúc',
         createdDate: date => formatDate(date, 'LT L'),
         submittedBy: 'Thêm bởi',
      },

      Preview: {
         notFound: 'Không tìm thấy bài viết',
         loadingError: 'Lỗi nạp bài viết:',
      },

      Evaluation: {
         comment: 'Bình luận',
         total: n => `Tổng điểm: ${formatNumber(n)}`,
         save: 'Lưu',
         skip: 'Bỏ qua',

         Comment: {
            save: 'Lưu',
            cancel: 'Bỏ qua',
         },
      },
   },
};
