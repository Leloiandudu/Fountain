import 'moment/locale/de';
import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter('.', ',');
const { formatDateIn, formatDate } = dateFormatter('de');

export default {
   _name: 'Deutsch',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Einloggen',
      signOut: 'Ausloggen',
   },

   Footer: {
      'preLink': 'Bitte kontaktiere ',
      'link': 'Le Loy',
      'postLink': ' wenn Du Probleme mit diesem Tool hast',
   },

   EditathonList: {
      title: 'Edit-a-thons',
   },

   ArticlesList: {
      editathonWillStartIn: date => `Dieser Edit-a-thon beginnt ${formatDateIn(date)}`,
      editathonIsOver: 'Dieser Edit-a-thon wurde beendet',
      editathonWillEndIn: date => `Dieser Edit-a-thon endet ${formatDateIn(date)}`,
      addArticle: 'Abschicken',
      juryTool: 'Richter',
      jury: 'Jurymitglieder:',
      user: 'Benutzer',
      acticlesCount: 'Artikel',
      totalScore: 'Punkte',
      acticle: 'Artikel',
      addedOn: 'Hinzugefügt am',
      score: 'Punkte',
      dateAdded: date => formatDate(date, 'D MMM LT')
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Nur Benutzer, die sich nach dem ${formatDate(date, 'L')} registiert haben, können an diesem Edit-a-thon teilnehmen`,
         namespace: isIn => `${isIn ? 'Ist' : 'Ist nicht'} im Hauptnamensraum`,
         author: 'Erstellt von: ',
         articleCreated: date => `Der Artikel wurde angelegt am ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'Symbol', 'Symbole')}`,
         bytes: n => `${formatNumber(n)} Bytes`,
         words: n => `${formatNumber(n)} ${plural(n, 'Wort', 'Wörter')}`,
      },

      unauthorized: 'Du bist nicht berechtigt',
      networkError: err => `Netzwerkfehler. Bitte erneut versuchen:\n${err}`,
      notFound: 'Artikel nicht gefunden',
      back: 'Zurück',
      cancel: 'Abbrechen',
      next: 'Weiter',
      add: 'Hinzufügen',
      articleTitle: 'Artikelname:',
      youAlreadyAdded: 'Du hast schon diesen Artikel zum Edit-a-thon hinzugefügt',
      someoneAlreadyAdded: 'Ein anderer Benutzer hat diesen Artikel bereits zum Edit-a-thon hinzugefügt',
   },

   SignInWarning: {
      title: 'Bitte einloggen, um fortfahren zu können.',
      ok: 'Einloggen',
      cancel: 'Abbrechen',
   },

   UnsavedWarning: {
      message: 'Ihre Änderungen werden verworfen werden.',
      ok: 'Verwerfen',
      cancel: 'Abbrechen',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'Symbol', 'Symbole')}`,
         bytes: n => `${formatNumber(n)} Bytes`,
         words: n => `${formatNumber(n)} ${plural(n, 'Wort', 'Wörter')}`,
         author: 'Erstellt von',
         createdOn: 'Erstellt am',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Hinzugefügt von',
      },

      Preview: {
         notFound: 'Artikel nicht gefunden',
         loadingError: 'Ladefehler:',
      },

      Evaluation: {
         comment: 'Kommentar',
         total: n => `Insgesamt: ${n}`,
         save: 'Speichern',
         skip: 'Überspringen',

         Comment: {
            save: 'Speichern',
            cancel: 'Abbrechen',
         },
      },
   },
};
