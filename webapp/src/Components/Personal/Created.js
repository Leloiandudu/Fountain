import React from 'react';
import classNames from 'classnames';
import Link from '../Link';
import Remote from '../Remote';
import Api from '../../Api';
import { withTranslation } from '../../translate';

const Created = ({ translation: { translate, tr } }) => <Remote getData={Api.getCreatedEditathons} render={data =>
   <div className='Created'>
      <h2>{tr('title')}</h2>
      <div className='list'>
      {data.map(ed =>
         <Link key={ed.code}
               className={classNames('row', !ed.isPublished && 'draft')}
               to={`/editathons/${ed.code}` + (ed.isPublished ? '' : '/config')}>
            <div className='name' title={ed.name}>{ed.name}</div>
            {!ed.isPublished && <div className='description'>{tr('draft')}</div>}
         </Link>
      )}
      </div>
   </div>
} />;

export default withTranslation(Created, 'Personal.Created');
