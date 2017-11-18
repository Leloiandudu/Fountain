import React from 'react';
import classNames from 'classnames';
import { getArticleUrl, getWikiHost } from '../MwApi'
import { withTranslation } from '../translate';

const BrowserSupportsSrcDoc = document && !!("srcdoc" in document.createElement("iframe"));

class IFrame extends React.Component {
   constructor(props) {
      super(props);
      this.onMessage = this.onMessage.bind(this);
      this._id = Math.random().toString();
   }

   componentDidMount() {
      window.addEventListener('message', this.onMessage, false);

      if (!BrowserSupportsSrcDoc && this._iframe) {
         const doc = this._iframe.contentWindow.document;
         doc.open();
         doc.write(this.getHtml());
         doc.close();
      }
   }

   componentWillUnmount() {
      window.removeEventListener('message', this.onMessage, false);
   }

   onMessage({ data: { id, height } }) {
      if (id === this._id && this._iframe) {
         this._iframe.style.height = height + 'px';
      }
   }

   getScript() {
      return `
<script type='text/javascript'>
   (function () {
      var lastScrollHeight = -1;
      var watcher;

      function watch() {
         watcher && cancelAnimationFrame(watcher);

         var height = document.documentElement.getBoundingClientRect ?
            document.documentElement.getBoundingClientRect().height :
            document.body.scrollHeight;

         if (lastScrollHeight !== height) {
            lastScrollHeight = height;
            parent.postMessage({ height: lastScrollHeight, id: '${this._id}' }, '*');
         }

         watcher = requestAnimationFrame(watch);
      };

      watch();
   })();
</script>
`;
   }

   getHtml() {
      const { html, autoSize = false } = this.props;
      if (typeof html !== 'function') {
         return html;
      }

      return html(autoSize ? this.getScript() : '');
   }

   render() {
      const {
         className,
         sandbox = 'allow-popups allow-scripts'
      } = this.props;

      return <iframe
         ref={x => this._iframe = x}
         className={classNames('IFrame', className)}
         sandbox={BrowserSupportsSrcDoc ? sandbox : undefined}
         srcDoc={BrowserSupportsSrcDoc ? (this.getHtml() || '') : undefined} />
   }
}

function WikiHtml({ html, wiki, title, className, translation, padding = true, autoSize = false }) {
   return <IFrame className={classNames('WikiHtml', className)} autoSize={autoSize} html={script => `
<!DOCTYPE html>
<html>
<head>
   <base href='${getArticleUrl(wiki, title)}' target='_blank'>
   <link rel='stylesheet' href='https://${getWikiHost(wiki)}/w/load.php?debug=false&lang=${translation.curLang}&modules=ext.cite.styles%7Cext.echo.badgeicons%7Cext.echo.styles.badge%7Cext.flaggedRevs.basic%7Cext.gadget.logo%7Cext.uls.interlanguage%7Cext.math.scripts,styles%7Cext.tmh.thumbnail.styles%7Cext.uls.nojs%7Cext.wikimediaBadges%7Cmediawiki.legacy.commonPrint,shared%7Cmediawiki.page.gallery.styles%7Cmediawiki.sectionAnchor%7Cmediawiki.skinning.interface%7Csite.styles%7Cskins.vector.styles%7Cwikibase.client.init&only=styles&skin=vector' />
   <style>
      ${autoSize ? `
      html {
         height: auto !important;
      }` : ''}

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
<body class='mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject skin-vector' style='background: white; height: auto'>
   <div id='bodyContent' class='mw-body-content' ${padding ? `style='padding: 10px' ` : ''}>
      ${html}
   </div>
   ${script}
   <script type='text/javascript'>
      (function() {
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

            // window.location.hash = href;
            window.location.replace(url + href);
            e.preventDefault();
         }, true);
      })();
   </script>
</body>
</html>
`} />;
}

WikiHtml = withTranslation(WikiHtml);
export { WikiHtml };
