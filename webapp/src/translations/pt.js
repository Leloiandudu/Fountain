import 'moment/locale/pt';
import { plural, numberFormatter, dateFormatter } from '../translate';

const formatNumber = numberFormatter('.', ',');
const { formatDateIn, formatDate } = dateFormatter('pt');

export default {
   _name: 'português',
   formatNumber,
   formatDate,
   formatDateIn,
   delimiter: ', ',

   Header: {
      signIn: 'Entrar',
      signOut: 'Sair',
   },

   Footer: {
      'preLink': 'Por favor contate ',
      'link': 'Le Loy',
      'postLink': ' se você tiver problemas com esta ferramenta.',
   },

   EditathonList: {
      title: 'Edit-a-thons',
   },

   ArticlesList: {
      editathonWillStartIn: date => `O edit-a-thon começará ${formatDateIn(date)}`,
      editathonIsOver: 'O edit-a-thon terminou',
      editathonWillEndIn: date => `O edit-a-thon terminará ${formatDateIn(date)}`,
      addArticle: 'Enviar',
      juryTool: 'Julgar',
      jury: 'Membros do júri:',
      user: 'Usuário(a)',
      acticlesCount: 'Artigos',
      totalScore: 'Pontos',
      acticle: 'Artigo',
      addedOn: 'Adicionado em',
      score: 'Pontos',
      dateAdded: date => formatDate(date, 'D MMM LT'),
   },

   AddArticle: {
      Warnings: {
         submitterRegistered: date => `Apenas usuários que se registraram antes de ${formatDate(date, 'L')} podem participar neste edit-a-thon`,
         namespace: isIn => `${isIn ? 'Está' : 'Não está'} no domínio principal`,
         author: 'Criado por: ',
         articleCreated: date => `O artigo foi criado em ${formatDate(date, 'L LT')}`,
         chars: n => `${formatNumber(n)} ${plural(n, 'símbolo', 'símbolos')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'byte', 'bytes')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'palavra', 'palavras')}`,
      },

      unauthorized: 'Você não está autorizado',
      networkError: err => `Erro na rede. Por favor, tente novamente:\n${err}`,
      notFound: 'Artigo não encontrado',
      back: 'Voltar',
      cancel: 'Cancelar',
      next: 'Próximo',
      add: 'Adicionar',
      articleTitle: 'Título do artigo:',
      youAlreadyAdded: 'Você já adicionou este artigo ao edit-a-thon',
      someoneAlreadyAdded: 'Outo usuário(a) já adicionou este artigo ao edit-a-thon',
   },

   SignInWarning: {
      title: 'Por favor, entre para continuar.',
      ok: 'Entrar',
      cancel: 'Cancelar',
   },

   UnsavedWarning: {
      message: 'Suas mudanças serão descartadas.',
      ok: 'Descartar',
      cancel: 'Cancelar',
   },

   Jury: {
      Warnings: {
         chars: n => `${formatNumber(n)} ${plural(n, 'símbolo', 'símbolos')}`,
         bytes: n => `${formatNumber(n)} ${plural(n, 'byte', 'bytes')}`,
         words: n => `${formatNumber(n)} ${plural(n, 'palavra', 'palavras')}`,
         author: 'Criado por',
         createdOn: 'Criado em',
         createdDate: date => formatDate(date, 'L LT'),
         submittedBy: 'Adicionado por',
      },

      Preview: {
         notFound: 'Artigo não encontrado',
         loadingError: 'Erro de carregamento:',
      },

      Evaluation: {
         comment: 'Comentário',
         total: n => `Total: ${formatNumber(n)}`,
         save: 'Salvar',
         skip: 'Pular',

         Comment: {
            save: 'Salvar',
            cancel: 'Cancelar',
         },
      },
   },
};
