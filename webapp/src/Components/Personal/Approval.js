import React from 'react';
import classNames from 'classnames';
import Link from '../Link';
import Remote from '../Remote';
import WikiButton from '../WikiButton';
import Api from '../../Api';
import { withTranslation } from '../../translate';

const Unapproved = ({ translation: { translate, tr } }) => <Remote getData={Api.getUnapprovedEditathons} render={data =>
   <div className='Unapproved'>
      <h2>{tr('title')}</h2>
      <div className='list'>
         {data.map(ed =>
            <Link className={classNames('row', ed.isPublished && 'published')} key={ed.code} to={`/editathons/${ed.code}`}>
               <div className='name' title={ed.name}>{ed.name}</div>
            </Link>
         )}
      </div>
   </div>
} />;

export default withTranslation(Unapproved, 'Personal.Approval');
