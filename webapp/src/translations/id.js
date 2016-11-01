import 'moment/locale/id';
import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(',', '.');
const { formatDateIn, formatDate } = dateFormatter('id');

export default {
   _name: 'Bahasa Indonesia',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Masuk log',
      signOut: 'Keluar log',
   },

   Footer: {
      'preLink': 'Jika mendapati masalah dengan alat ini, hubungi ',
      'link': 'Le Loy',
      'postLink': '',
   },

   EditathonList: {
      title: 'Maraton wiki',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Maraton wiki akan dimulai ${formatDateIn(date)}`,
      editathonIsOver: 'Maraton wiki telah berakhir',
      editathonWillEndIn: date => `Maraton wiki akan berakhir ${formatDateIn(date)}`,
      addArticle: 'Kirim',
      juryTool: 'Beri nilai',
      jury: 'Anggota juri:',
      user: 'Nama pengguna',
      acticlesCount: 'Jumlah artikel',
      totalScore: 'Poin',
      acticle: 'Artikel',
      addedOn: 'Ditambahkan pada',
      score: 'Poin',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Hanya pengguna yang telah terdaftar setelah XXX ${formatDate(date, 'L')} dapat mengikuti maraton wiki ini`,
         namespace: isIn => `${isIn ? 'Berada' : 'Tidak berada'} dalam ruang nama utama`,
         author: 'Dibuat oleh: ',
         articleCreated: date => `Artikel ini dibuat pada ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} simbol}`,
         bytes: n => `${formatNumber(n)} bita`,
         words: n => `${formatNumber(n)} kata`,
      },

      unauthorized: 'Anda tidak berwenang',
      networkError: err => `Galat jaringan. Silakan coba lagi:\n${err}`,
      notFound: 'Artikel tidak ditemukan',
      back: 'Kembali',
      cancel: 'Batal',
      next: 'Next',
      add: 'Berikut',
      articleTitle: 'Judul artikel:',
      youAlreadyAdded: 'Anda telah menambahkan artikel tersebut ke maraton wiki ini',
      someoneAlreadyAdded: 'Pengguna lain telah menambahkan artikel tersebut ke maraton wiki ini',
   },

   SignInWarning: {
      title: 'Silakan masuk log.',
      ok: 'Masuk log',
      cancel: 'Batal',
   },

   UnsavedWarning: {
      message: 'Perubahan Anda akan dibatalkan.',
      ok: 'Hapus',
      cancel: 'Batal',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} simbol}`,
         bytes: n => `${formatNumber(n)} bita`,
         words: n => `${formatNumber(n)} kata`,
         author: 'Dibuat oleh',
         createdOn: 'Dibuat pada',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Ditambahkan oleh',
      },

      Preview: {
         notFound: 'Artikel tidak ditemukan',
         loadingError: 'Galat dalam memuat:',
      },

      Evaluation: {
         comment: 'komentar',
         total: n => `Jumlah: ${n}`,
         save: 'Simpan',
         skip: 'Lewati',

         Comment: {
            save: 'Simpan',
            cancel: 'Batal',
         },
      },
   },
};
