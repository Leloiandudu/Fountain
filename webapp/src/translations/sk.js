import 'moment/locale/sk';
import { numberFormatter, dateFormatter } from '../translate';

function plural(n, sing, paucal, plural) {
   if (n === 1) { return sing }
   if (0 < n && n < 5) { return paucal }
   return plural
}

const formatNumber = numberFormatter('\u00a0', ',');
const { formatDateIn, formatDate } = dateFormatter('sk');

export default {
   _name: 'slovenčina',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Prihlásiť sa',
      signOut: 'Odhlásiť sa',
   },

   Footer: {
      'preLink': 'Ak máte problémy s týmto nástrojom, kontaktujte prosím redaktora ',
      'link': 'Le Loj',
      'postLink': '.',
   },

   EditathonList: {
      title: 'Editačné maratóny',
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
      editathonWillStartIn: date => `Editačný maratón začne ${formatDateIn(date)}`,
      editathonIsOver: 'Editačný maratón skončil',
      editathonWillEndIn: date => `Editačný maratón skončí ${formatDateIn(date)}`,
      addArticle: 'Odoslať',
      juryTool: 'Porotca',
      jury: 'Členovia poroty:',
      user: 'Redaktor',
      acticlesCount: 'Články',
      totalScore: 'Body',
      acticle: 'Článok',
      addedOn: ' Pridané',
      score: 'Body',
      dateAdded: date => formatDate(date, 'D. MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Len redaktori zaregistrovaní po XXX ${formatDate(date, 'L')} sa môžu zúčastniť v tomto editačnom maratóne`,
         namespace: isIn => `${isIn ? 'Je' : 'Nie je'} v hlavnom mennom priestore`,
         author: 'Vytvorené redaktorom: ',
         articleCreated: date => `Článok bol vytvorený ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'symbol', 'symboly', 'symbolov')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'bajt', 'bajta', 'bajtov')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'slovo', 'slová', 'slov')}`,
      },

      unauthorized: 'Nie ste autorizovaný.',
      networkError: err => `Chyba siete. Prosím, skúste to znovu:\n${err}`,
      notFound: 'Článok nebol nájdený',
      back: 'Späť',
      cancel: 'Zrušiť',
      next: 'Pokračovať',
      add: 'Pridať',
      articleTitle: 'Názov článku:',
      youAlreadyAdded: 'Tento článok ste už pridali',
      someoneAlreadyAdded: 'Tento článok už pridal iný redaktor',
   },

   SignInWarning: {
      title: 'Pre pokračovanie sa prosím prihláste.',
      ok: 'Prihlásiť sa',
      cancel: 'Zrušiť',
   },

   UnsavedWarning: {
      message: 'Vaše zmeny budú zahodené.',
      ok: 'Zahodiť',
      cancel: 'Zrušiť',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'symbol', 'symboly', 'symbolov')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'bajt', 'bajty', 'bajtov')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'slovo', 'slová', 'slov')}`,
         author: 'Vytvorené',
         createdOn: 'Vytvorené',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: g => 'Pridané',
      },

      Preview: {
         notFound: 'Článok nebol nájdený',
         loadingError: 'Chyba načítavania:',
      },

      Evaluation: {
         comment: 'komentár',
         total: n => `Spolu: ${formatNumber(n)}`,
         save: 'Uložiť',
         skip: 'Preskočiť',

         Comment: {
            save: 'Uložiť',
            cancel: 'Preskočiť',
         },
      },
   },

};
