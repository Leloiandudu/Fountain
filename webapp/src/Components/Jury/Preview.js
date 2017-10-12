import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header';
import { withTranslation } from '../../translate';
import { getWikiHost, getArticleUrl } from './../../MwApi'
import Loader from '../Loader';

const Preview = React.createClass({
   shouldComponentUpdate({ title, info }) {
      return title !== this.props.title || info !== this.props.info;
   },
   componentDidUpdate() {
      const { info } = this.props;
      if (info && !info.error) {
         this.setContent();
      }
   },
   setContent() {
      const { info, title, wiki } = this.props;
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
         <base href='${getArticleUrl(wiki)}' target='_blank'>
         <link rel='stylesheet' href='/w/load.php?debug=false&lang=${this.props.translation.curLang}&modules=ext.cite.styles%7Cext.echo.badgeicons%7Cext.echo.styles.badge%7Cext.flaggedRevs.basic%7Cext.gadget.logo%7Cext.uls.interlanguage%7Cext.math.scripts,styles%7Cext.tmh.thumbnail.styles%7Cext.uls.nojs%7Cext.wikimediaBadges%7Cmediawiki.legacy.commonPrint,shared%7Cmediawiki.page.gallery.styles%7Cmediawiki.sectionAnchor%7Cmediawiki.skinning.interface%7Csite.styles%7Cskins.vector.styles%7Cwikibase.client.init&only=styles&skin=vector' />
         <style>
            h1 {
               line-height: 1.2em;
               padding-top: 0;
               margin-bottom: 0.25em;
            }

            h1 > a,
            h1 > a:visited,
            h1 > a:hover,
            h1 > a:focus,
            h1 > a:active {
               text-decoration: none;
               color: inherit;
            }
         </style>
      </head>
      <body class='mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject skin-vector' style='background: white'>
         <div id='bodyContent' class='mw-body-content' style='padding: 10px'>
            ${info.title !== title ? `<h1>
               <a href='${getArticleUrl(wiki, info.title)}'>${info.title}</a>
            </h1>` : ''}
            ${info.fileUrl && `
            <div>
               <a href='${info.fileUrl.url}'>
                  <img src='${info.fileUrl.thumburl}' />
               </a>
            </div>` || ''}
            ${info.html}
         </div>
         <script type='text/javascript'>
            var url = window.location.href;

            function getAnchor(element) {
               for (;;) {
                  if (!element) return null;
                  if (element.nodeName === 'A') return element;
                  element = element.parentElement;
               }
            }

            document.body.addEventListener('click', function(e) {
               var anchor = getAnchor(e.target);
               if (!anchor) return;
               var href = anchor.getAttribute('href');
               if (!href || href[0] != '#') return;
               anchor.setAttribute('href', url + href)
               anchor.setAttribute('target', '_self')
            }, true);
         </script>
      </body>
      </html>`;

      const div = ReactDOM.findDOMNode(this.refs.iframe);
      div.innerHTML = '<iframe></iframe>';

      const doc = div.getElementsByTagName('iframe')[0].contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
   },
   render() {
      return (
         <div className='Preview'>
            {this.renderContent()}
         </div>
      )
   },
   renderContent() {
      const { info, title, translation: { tr } } = this.props;
      if (info === undefined)
         return <div key='loader' className='content'>
            <Loader />
         </div>;

      if (info === false)
         return <div key='not-found' className='content not-found'>
            {tr('notFound')}
         </div>;

      if (info && info.error) {
         console.error(info.error);
         const error = info.error.stack
            ? info.error.message + '\n' + info.error.stack
            : JSON.stringify(info.error, null, 4);
         return <div key='error' className='content error'>
            {tr('loadingError') + ' '}
            <pre>{error}</pre>
         </div>;
      }

      return <div key='iframe' ref='iframe' className='content' />
   },
});

export default withTranslation(Preview, 'Jury.Preview');
