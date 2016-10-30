import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header';
import { withTranslation } from '../../translate';
import { getWikiHost } from './../../MwApi'
import Loader from '../Loader';

const Preview = React.createClass({
   shouldComponentUpdate({ title, info }) {
      return title !== this.props.title || info !== this.props.info;
   },
   componentDidUpdate() {
      const { info } = this.props;
      if (info && !info.error) {
         this.setContent(info.html);
      }
   },
   setContent(html) {
      html = `
      <html>
      <head>
         <base href='https://${getWikiHost(this.props.wiki)}/wiki/' target='_blank'>
         <link rel='stylesheet' href='/w/load.php?debug=false&lang=${this.props.translation.curLang}&modules=site.styles%7Cext.cite.styles%7Cext.echo.badgeicons%7Cext.echo.styles.badge%7Cext.flaggedRevs.basic%7Cext.gadget.BKL%2CDYK%2CWikilinker%2Ccollapserefs%2CdirectLinkToCommons%2CeditZeroSection%2Clogo%2Cmarkadmins%2Cmarkblocked%2Cpreview%2CrefToolbar%2CreferenceTooltips%7Cext.math.scripts%2Cstyles%7Cext.tmh.thumbnail.styles%7Cext.uls.nojs%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cmediawiki.legacy.commonPrint%2Cshared%7Cmediawiki.sectionAnchor%7Cmediawiki.skinning.interface%7Cskins.vector.styles%7Cwikibase.client.init&only=styles&skin=vector' />
      </head>
      <body class='mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject skin-vector' style='background: white'>
         <div id='bodyContent' class='mw-body-content' style='padding: 10px'>
            ${html}
         </div>
      </body>
      </html>`;

      var div = ReactDOM.findDOMNode(this.refs.iframe);
      div.innerHTML = '<iframe></iframe>';

      var doc = div.getElementsByTagName('iframe')[0].contentWindow.document;
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
      const { info, translation: { tr } } = this.props;
      if (info === undefined)
         return <div key='loader' className='content'>
            <Loader />
         </div>;

      if (info === false)
         return <div key='not-found' className='content not-found'>
            {tr('notFound')}
         </div>;

      if (info && info.error)
         return <div key='error' className='content'>
            {tr('networkError') + ' '}
            <pre>{JSON.stringify(info.error, null, 4)}</pre>
         </div>;

      return <div key='iframe' ref='iframe' className='content' />
   },
});

export default withTranslation(Preview, 'Jury.Preview');
