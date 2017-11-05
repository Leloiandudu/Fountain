import React from 'react';
import classNames from 'classnames';
import Link from '../Link';
import Remote from '../Remote';
import WikiButton from '../WikiButton';
import Api from '../../Api';
import { withTranslation } from '../../translate';

const Editathons = ({ translation: { translate, tr } }) => <Remote getData={Api.getMyCurrentEditathons} render={data =>
   <div className='Editathons'>
      <h2>{tr('title')}</h2>
      <div className='list'>
         {data.map(ed => ({
            ...ed,
            finished: ed.finish.isBefore(),
            hasRows: ed.rows.length !== 0,
         })).map(ed =>
            <div className='row' key={ed.code}>
               <div className='name' title={ed.name}>
                  <Link className='WikiLink' to={`/editathons/${ed.code}`}>{ed.name}</Link>
               </div>
               <div className='finish' title={translate('formatDate', ed.finish, 'LL LT')}>
                  {ed.finished ? tr('hasEnded', ed.finish) : tr('willEndIn', ed.finish)}
               </div>
               <Link to={`/editathons/${ed.code}`} className='details'>
                  {ed.hasRows && <div className='row header'>
                     <span className='rank' />
                     <span className='name' />
                     <span className='total' />
                  </div>}
                  {ed.rows.map((r, i) =>
                  <div className={classNames('row', r.name === Global.user.name && 'me')} 
                       key={`${ed.code}*${i}`}>
                     <span className='rank'>{translate('formatNumber', r.rank)}</span>
                     <span className='name'>{r.name}</span>
                     <span className='total'>{translate('formatNumber', r.total, { places: 2 })}</span>
                  </div>)}
                  {!ed.hasRows && <span className='no-marks'>
                     {ed.hiddenMarks ? tr('hiddenMarks') : tr('noMarks')}
                  </span>}
               </Link>
               {!ed.finished && <WikiButton>
                  <Link to={`/editathons/${ed.code}/add`}>
                     {translate('ArticlesList.addArticle')}
                  </Link>
               </WikiButton>}
            </div>
         )}
      </div>
   </div>
} />;

export default withTranslation(Editathons, 'Personal.Editathons');
