import React from 'react';
import classNames from 'classnames';
import Link from '../Link';
import Remote from '../Remote';
import WikiButton from '../WikiButton';
import Api from '../../Api';
import { withTranslation } from '../../translate';

const Jury = ({ translation: { translate, tr } }) => <Remote getData={Api.getJuryEditathons} render={data =>
   <div className='Jury'>
      <h2>{tr('title')}</h2>
      <div className='list'>
         {data.map(ed =>
            <Link className='row' key={ed.code} to={`/jury/${ed.code}`}>
               <div className='details'>
                  <div className='name' title={ed.name}>{ed.name}</div>
                  <div className='finish' title={translate('formatDate', ed.finish, 'LL LT')}>
                     {ed.finish.isBefore() ? tr('hasEnded', ed.finish) : tr('willEndIn', ed.finish)}
                  </div>
               </div>
               <div className={classNames('marks', !ed.missing && 'marks-zero')}>
                  <span>{ed.missing}</span>
               </div>
            </Link>
         )}
      </div>
   </div>
} />;

export default withTranslation(Jury, 'Personal.Jury');
