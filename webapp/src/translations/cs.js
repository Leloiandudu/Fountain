import 'moment/locale/cs';
import { numberFormatter, dateFormatter } from '../translate';

function plural(n, sing, paucal, plural) {
   if (n === 1) { return sing }
   if (0 < n && n < 5) { return paucal }
   return plural
}

const formatNumber = numberFormatter('\u00a0', ',');
const { formatDateIn, formatDate } = dateFormatter('cs');

export default {
   _name: 'čeština',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Přihlásit se',
      signOut: 'Odhlásit se',
   },

   Footer: {
      'preLink': 'Pokud máte problémy s tímto nástrojem, kontaktujte prosím wikipedistu ',
      'link': 'Lje Loj',
      'postLink': '.',
   },

   EditathonList: {
      title: 'Editatony',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Editaton začne ${formatDateIn(date)}`,
      editathonIsOver: 'Editaton skončil',
      editathonWillEndIn: date => `Editaton skončí ${formatDateIn(date)}`,
      addArticle: 'Přidat článek',
      juryTool: 'Porota',
      jury: 'Porotci:',
      user: 'Wikipedista',
      acticlesCount: 'Články',
      totalScore: 'Body',
      acticle: 'Článek',
      addedOn: ' Přidáno',
      score: 'Body',
      dateAdded: date => formatDate(date, 'D. MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Jen wikipedisté, kteří se zaregistrovali po ${formatDate(date, 'L')} se můžou zúčastnit tohoto editatonu`,
         namespace: isIn => `${isIn ? 'Je' : 'Není'} v hlavním jmenném prostoru`,
         author: 'Vytvořeno wikipedistou: ',
         articleCreated: date => `Článek byl vytvořen ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'znak', 'znaky', 'znaků')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'byte', 'byty', 'bytů')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'slovo', 'slova', 'slov')}`,
      },

      unauthorized: 'Nejste autorizováni.',
      networkError: err => `Chyba sítě. Prosím, zkuste to znovu:\n${err}`,
      notFound: 'Článek nebyl nalezen',
      back: 'Zpět',
      cancel: 'Zrušit',
      next: 'Pokračovat',
      add: 'Přidat',
      articleTitle: 'Název článku:',
      youAlreadyAdded: 'Tento článek jste již přidali',
      someoneAlreadyAdded: 'Tento článek již přidal jiný wikipedista',
   },

   SignInWarning: {
      title: 'Pro pokračování se prosím přihlaste.',
      ok: 'Přihlásit se',
      cancel: 'Zrušit',
   },

   UnsavedWarning: {
      message: 'Vaše změny budou zahozeny.',
      cancel: 'Zrušit',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'znak', 'znaky', 'znaků')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'byte', 'byty', 'bytů')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'slovo', 'slova', 'slov')}`,
         author: 'Vytvořeno wikipedistou',
         createdOn: 'Vytvořeno',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Přidáno',
      },

      Preview: {
         notFound: 'Článek nebyl nalezen',
         loadingError: 'Chyba načítání:',
      },

      Evaluation: {
         comment: 'komentář',
         total: n => `Celkem: ${formatNumber(n)}`,
         save: 'Uložit',
         skip: 'Přeskočit',

         Comment: {
            save: 'Uložit',
            cancel: 'Zrušit',
         },
      },
   },
};
