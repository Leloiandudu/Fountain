import React from 'react';
import { withTranslation } from '../../translate';
import Loader from '../Loader';
import { WikiHtml } from '../wikiPreview';
import { getArticleUrl } from './../../MwApi';

const Preview = React.createClass({
   shouldComponentUpdate({ title, info }) {
      return title !== this.props.title || info !== this.props.info;
   },
   render() {
      return (
         <div className='Preview'>
            {this.renderContent()}
         </div>
      )
   },
   renderContent() {
      const { info, title, wiki, translation: { tr } } = this.props;
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

      return <WikiHtml className='content' wiki={wiki} title={info.title} html={`
<div class="mw-indicators">
   ${Object.keys(info.indicators).map(k => `<div class="mw-indicator">${info.indicators[k]}</div>`)}
</div>
${info.title !== title ? `<h1 id="firstHeading" class="firstHeading">
   <a href='${getArticleUrl(wiki, info.title)}'>${info.title}</a>
</h1>` : ''}
${info.fileUrl && `
<div>
   <a href='${info.fileUrl.url}'>
      <img src='${info.fileUrl.thumburl}' />
   </a>
</div>` || ''}
${info.html}
`} />
   },
});

export default withTranslation(Preview, 'Jury.Preview');
