import 'moment/locale/lo';
import { numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter('.', ',');
const { formatDateIn, formatDate } = dateFormatter('lo');

export default {
   _name: 'ພາສາລາວ',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'ເຂົ້າລະບົບ',
      signOut: 'ອອກຈາກລະບົບ',
   },

   Footer: {
      'preLink': 'ກະລຸນາຕິດຕໍ່ ',
      'link': 'Le Loy',
      'postLink': ' ຖ້າທ່ານພົບປັນຫາກັບອຸປະກອນນີ້.',
   },

   EditathonList: {
      title: 'Editathons',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Editathon ຈະເລີ່ມ ${formatDateIn(date)}`,
      editathonIsOver: 'ໄດ້ສຳເລັດລົງແລ້ວ',
      editathonWillEndIn: date => `Editathon ຈະສິ້ນສຸດ ${formatDateIn(date)}`,
      addArticle: 'ສົ່ງ',
      juryTool: 'ກຳມະການ',
      jury: 'ສະມາຊິກຄະນະຕັດສິນ:',
      user: 'ຜູ້ໃຊ້',
      acticlesCount: 'ບົດຄວາມ',
      totalScore: 'ຄະແນນ',
      acticle: 'ບົດຄວາມ',
      addedOn: 'ເພີ່ມເມື່ອ',
      score: 'ຄະແນນ',
      dateAdded: date => formatDate(date, 'D MMM LT')
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `ຜູ້ໃຊ້ທີ່ສະໝັກຫຼັງຈາກ ${formatDate(date, 'L')} ເທົ່ານັ້ນຈຶ່ງສາມາດເຂົ້າຮ່ວມ Editathon ຄັ້ງນີ້ໄດ້`,
         namespace: isIn => `${isIn ? 'ຢູ່ໃນຊ່ອງວ່າງຫຼັກສຳລັບຊື່' : ' ບໍ່ແມ່ນຊ່ອງວ່າງຫຼັກສຳລັບຊື່'}`,
         author: 'ສ້າງໂດຍ ',
         articleCreated: date => `ບົດຄວາມນີ້ສ້າງຂຶ້ນເມື່ອ ${formatDate(date, 'D MMM LT')}`,
         chars: n => `${formatNumber(n)} ສັນຍາລັກ`,
         bytes: n => `${formatNumber(n)} ໄບ`,
         words: n => `${formatNumber(n)} ຄຳ`,
      },

      unauthorized: 'ທ່ານບໍ່ໄດ້ຮັບການຢືນຢັນ',
      networkError: err => `ເຄືອຂ່າຍຂັດຂ້ອງ. ກະລຸນາລອງອີກຄັ້ງ:\n${err}`,
      notFound: 'ບໍ່ພົບບົດຄວາມ',
      back: 'ກັບຄືນ',
      cancel: 'ຍົກເລີກ',
      next: 'ຕໍ່ໄປ',
      add: 'ເພີ່ມ',
      articleTitle: 'ຫົວຂໍ້ຂອງບົດຄວາມ:',
      youAlreadyAdded: 'ທ່ານໄດ້ເພີ່ມບົດຄວາມນີ້ໄປຍັງ editathon ແລ້ວ',
      someoneAlreadyAdded: 'ສະມາຊິກຄົນອື່ນໄດ້ເພີ່ມບົດຄວາມນີ້ໄປຍັງ editathon ແລ້ວ',
   },

   SignInWarning: {
      title: 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອດຳເນີນການຕໍ່.',
      ok: 'ເຂົ້າລະບົບ',
      cancel: 'ຍົກເລີກ',
   },

   UnsavedWarning: {
      message: 'ການປ່ຽນແປງຂອງທ່ານຈະຖືກລຶບລ້າງ',
      ok: 'ລຶບລ້າງ',
      cancel: 'ຍົກເລີກ',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ສັນຍາລັກ`,
         bytes: n => `${formatNumber(n)} ໄບ`,
         words: n => `${formatNumber(n)} ຄຳ`,
         author: 'ສ້າງໂດຍ',
         createdOn: 'ສ້າງເມື່ອ',
         createdDate: date => formatDate(date, 'D MMM LT'),
         submittedBy: 'ເພີ່ມໂດຍ',
      },

      Preview: {
         notFound: 'ບໍ່ພົບບົດຄວາມ',
         loadingError: 'ການໂຫຼດຜິດພາດ:',
      },

      Evaluation: {
         comment: 'ຄວາມເຫັນ',
         total: n => `ລວມ: ${formatNumber(n)}`,
         save: 'ບັນທຶກ',
         skip: 'ຂ້າມ',

         Comment: {
            save: 'ບັນທຶກ',
            cancel: 'ຍົກເລີກ',
         },
      },
   },
};
