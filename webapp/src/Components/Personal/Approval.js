import React from 'react';
import classNames from 'classnames';
import Link from '../Link';
import MarksPreview from '../MarksPreview';
import Remote from '../Remote';
import WikiButton from '../WikiButton';
import WikiLink from '../WikiLink';
import Api from '../../Api';
import { withTranslation } from '../../translate';
import { getWikiHost } from '../../MwApi';
import { renderEditathonDates } from '../EditathonList';

const Approval = ({ translation: { translate, tr } }) => <Remote
   getData={Api.getUnapprovedEditathons}
   render={data =>
      <div className='Approval'>
         <h2>{tr('title')}</h2>
         <div className='list'>
            {data.map(ed =>
               <div className='row' key={ed.code}>
                  <header title={ed.name}>
                     <Link to={`/editathons/${ed.code}`}>
                        {ed.name}
                     </Link>
                  </header>
                  <div>{ed.description}</div>
                  <dl>
                     <div>
                        <dt>creator</dt>
                        <dd>
                           <WikiLink to={'User_talk:' + ed.creator} />
                        </dd>
                     </div>
                     <div>
                        <dt>code</dt>
                        <dd>{ed.code}</dd>
                     </div>
                     <div>
                        <dt>project</dt>
                        <dd>{getWikiHost(ed.wiki)}</dd>
                     </div>
                     <div>
                        <dt>dates</dt>
                        <dd>{renderEditathonDates(ed.start, ed.finish, translate)}</dd>
                     </div>
                     <div>
                        <dt>flags</dt>
                        <dd>{ed.flags}</dd>
                     </div>
                     <div>
                        <dt>jury</dt>
                        <dd>{ed.jury.map(j => <span className='jury' key={j}>
                           <WikiLink to={'User_talk:' + j} />
                        </span>)}</dd>
                     </div>
                     <div>
                        <dt>rules</dt>
                        <dd>{JSON.stringify(ed.rules)}</dd>
                     </div>
                     <div>
                        <dt>marks</dt>
                        <dd>
                           <MarksPreview config={ed.marks} />
                        </dd>
                     </div>
                     <div>
                        <dt>template</dt>
                        <dd>{JSON.stringify(ed.template)}</dd>
                     </div>
                  </dl>
                  <div className='buttons'>
                     <WikiButton type='constructive'>approve</WikiButton>
                     <WikiButton>
                        <Link to={`/editathons/${ed.code}/config`}>
                           edit
                        </Link>
                     </WikiButton>
                     <WikiButton type='destructive'>delete</WikiButton>
                  </div>
               </div>
            )}
         </div>
      </div>
   } />;

export default withTranslation(Approval, 'Personal.Approval');
