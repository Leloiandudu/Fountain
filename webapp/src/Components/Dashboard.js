import React from 'react';
import classNames from 'classnames';
import { withTranslation } from './../translate';

class Dashboard extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      const { editathon: e, translation: { tr, translate } } = this.props;

      const items = [{
         name: tr('users'),
         value: new Set(e.articles.map(a => a.user)).size,
      }, {
         name: tr('articles'),
         value: e.articles.length,
      }, {
         name: tr('marks'),
         value: e.articles.reduce((m, a) => [ ...m, ...a.marks], []).length,
      }, {
         name: tr('withoutMarks'),
         value: e.articles.filter(a => a.marks.length === 0).length,
         isGood: x => x === 0
      }];

      return <div className='Dashboard'>
         {items.map((x, i) => <div className='itemWrapper' key={i}>
            <div className={classNames({
               item: true,
               good: x.isGood && x.isGood(x.value),
               bad: x.isGood && !x.isGood(x.value),
            })}>
               <div className='name'>{x.name}</div>
               <div className='value'>{translate('formatNumber', x.value)}</div>
            </div>
         </div>)}
      </div>;
   }
}

export default withTranslation(Dashboard, 'Dashboard');
