import 'moment/locale/hu';
import { numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter(' ', ',');
const { formatDateIn, formatDate } = dateFormatter('hu');

export default {
   _name: 'magyar',
   _fallback: 'en',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',
   dateTimePicker: 'L LTS',

   Header: {
      signIn: 'Bejelentkezés',
      signOut: 'Kijelentkezés',
   },

   Footer: {
      'preLink': 'Ha probléma adódik az eszközzel, kérjük, értesítsd ',
      'link': 'Le Loyt',
      'postLink': '.',
   },

   EditathonList: {
      title: 'Szerkesztői maratonok',
   },

   ArticlesList: {
      editathonWillStartIn: date => `A szerkesztőmaraton kezdete ${formatDateIn(date)}`,
      editathonIsOver: 'A szerkesztőmaraton befejeződött',
      editathonWillEndIn: date => `A szerkesztőmaraton vége ${formatDateIn(date)}`,
      addArticle: 'Elküldés',
      juryTool: 'Zsűrizés',
      jury: 'Zsűritagok:',
      user: 'Szerkesztő',
      acticlesCount: 'Szócikkek',
      totalScore: 'Pontok',
      acticle: 'Szócikk',
      addedOn: 'Hozzáadva',
      score: 'Pontok',
      dateAdded: date => formatDate(date, 'MMM D, LT'),
   },

   Dashboard: {
      articles: 'Szócikkek',
      users: 'Felhasználók',
      marks: 'Értékelések',
      withoutMarks: 'Értékelés nélkül',
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Csak azok a szerkesztők vehetnek részt ezen a maratonon, akik ${formatDate(date, 'L')} után regisztráltak`,
         namespace: isIn => `${isIn ? 'A' : 'Nem a'} fő névtérben`,
         author: 'Létrehozó: ',
         articleCreated: date => `A szócikk létrehozásának dátuma ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} szimbólum`,
         bytes: n => `${formatNumber(n)} bájt`,
         words: n => `${formatNumber(n)} szó`,
      },

      unauthorized: 'Nincs engedélyed',
      networkError: err => `Hálózati hiba. Kérlek, próbáld újra:\n${err}`,
      notFound: 'Nincs ilyen szócikk',
      back: 'Vissza',
      cancel: 'Mégse',
      next: 'Következő',
      add: 'Hozzáadás',
      user: 'Add on behalf of:',
      userNotFound: user => `User '${user}' not found`,
      articleTitle: 'Szócikk címe:',
      youAlreadyAdded: 'Ezt a szócikket már hozzáadtad a szerkesztőmaratonhoz',
      someoneAlreadyAdded: 'Egy másik szerkesztő már hozzáadta ezt a szócikket a szerkesztőmaratonhoz',
   },

   SignInWarning: {
      title: 'Kérjük, jelentkezz be a folytatáshoz.',
      ok: 'Bejelentkezés',
      cancel: 'Mégse',
   },

   UnsavedWarning: {
      message: 'A változtatásaidat elvetjük.',
      ok: 'Elvetés',
      cancel: 'Mégse',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} szimbólum`,
         bytes: n => `${formatNumber(n)} bájt`,
         words: n => `${formatNumber(n)} szó`,
         author: 'Létrehozó',
         createdOn: 'Létrehozva',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Hozzáadta',
      },

      Preview: {
         notFound: 'Nincs ilyen szócikk',
         loadingError: 'Hiba a betöltéskor:',
      },

      Evaluation: {
         comment: 'megjegyzés',
         total: n => `Összesen: ${formatNumber(n)}`,
         save: 'Mentés',
         skip: 'Átugrás',

         Comment: {
            save: 'Mentés',
            cancel: 'Mégse',
         },
      },
   },
};
