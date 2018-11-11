import moment from 'moment';
import React from 'react';
import Api from '../../Api';
import { EditathonFlags } from '../../jury';
import { getWikiHost } from '../../MwApi';
import { RuleFlags } from '../../rules';
import { withTranslation } from '../../translate';
import { renderEditathonDates } from '../EditathonList';
import Link from '../Link';
import Loader from '../Loader';
import MarksPreview from '../MarksPreview';
import TemplatePreview from '../TemplatePreview';
import WikiButton from '../WikiButton';
import WikiLink from '../WikiLink';

class Rules {
   static articleSize(rule, tr) {
      return Object.keys(rule.params).map(k =>
         Object.keys(rule.params[k]).map(op => `${tr(op)} ${rule.params[k][op]} ${tr(k)}`).join(', ')
      ).join(' OR ');
   }

   static submitterIsCreator(rule) {
      return null;
   }

   static articleCreated(rule, tr, translate) {
      return Object.keys(rule.params).map(k =>
         `${tr(k === 'after' ? 'notBefore' : 'notAfter')} ${translate('formatDate', moment(rule.params[k]).utc(), 'L LT')}`
      ).join(', ');
   }

   static submitterRegistered(rule, tr, translate) {
      return this.articleCreated(rule, tr, translate);
   }

   static namespace(rule) {
      return 'MAIN';
   }

   static addedForCleanupRu(rule) {
      return null;
   }

   static render(rule, translate) {
      // TODO: better i18n support
      const tr = (x, ...args) => translate(`EditathonConfig.RulesPage.${rule.type}.${x}`, ...args);
      return <div className='Rule' key={rule.id}>
         <div className='type'>{tr('title')}:</div>
         <div className='descr'>{Rules[rule.type](rule, tr, translate)}</div>
         <div className='flags'>
            {(rule.flags & RuleFlags.optional) !== 0 && <div className='flag optional'>optional</div> || <div className='flag required'>required</div>}
            {(rule.flags & RuleFlags.informational) !== 0 && <div className='flag jury'>jury</div>}
         </div>
      </div>;
   }
}

class Approval extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         sending: false,
         data: null,
      };
   }

   componentDidMount() {
      this.update();
   }

   async update() {
      this.setState({ data: null });
      this.setState({
         data: await Api.getUnapprovedEditathons(),
      });
   }

   render() {
      const { translation: { translate, tr } } = this.props;
      const { data, sending } = this.state;

      if (!data) {
         return <Loader />;
      }

      return <div className='Approval'>
         <h2>{tr('title')}</h2>
         <div className='list'>
            {data.map(ed =>
               <div className='row' key={ed.code}>
                  <header title={ed.name}>{ed.name}</header>
                  <div>{ed.description}</div>
                  <dl>
                     <div>
                        <dt>{tr('creator')}</dt>
                        <dd>
                           <WikiLink to={'User_talk:' + ed.creator} />
                        </dd>
                     </div>
                     <div>
                        <dt>{tr('code')}</dt>
                        <dd>{ed.code}</dd>
                     </div>
                     <div>
                        <dt>{tr('project')}</dt>
                        <dd>{getWikiHost(ed.wiki)}</dd>
                     </div>
                     <div>
                        <dt>{tr('dates')}</dt>
                        <dd>{renderEditathonDates(ed.start, ed.finish, translate)}</dd>
                     </div>
                     <div>
                        <dt>{tr('flags')}</dt>
                        <dd className='flags'>
                           {ed.flags === 0 && tr('noFlags')}
                           {(ed.flags & EditathonFlags.consensualVote) !== 0 && <div className='flag consensualVote'>{translate('EditathonConfig.GeneralPage.consensualVote')}</div>}
                           {(ed.flags & EditathonFlags.hiddenMarks) !== 0 && <div className='flag hiddenMarks'>{translate('EditathonConfig.GeneralPage.hiddenMarks')}</div>}
                        </dd>
                     </div>
                     <div>
                        <dt>{tr('jury')}</dt>
                        <dd>{ed.jury.map(j => <span className='jury' key={j}>
                           <WikiLink to={'User_talk:' + j} />
                        </span>)}</dd>
                     </div>
                     <div>
                        <dt>{tr('rules')}</dt>
                        <dd>{ed.rules.map(rule => Rules.render(rule, translate))}</dd>
                     </div>
                     <div>
                        <dt>{tr('marks')}</dt>
                        <dd>
                           <MarksPreview config={ed.marks} />
                        </dd>
                     </div>
                     <div>
                        <dt>{tr('template')}</dt>
                        <dd>{ed.template && <TemplatePreview name={ed.template.name} args={ed.template.args} /> || tr('noTemplate')}</dd>
                     </div>
                  </dl>
                  <div className='buttons'>
                     <WikiButton disabled={sending} loading={sending === 'approve'}
                                 type='constructive' onClick={() => this.onApprove(ed.code)}>
                        {tr('approve')}
                     </WikiButton>
                     <WikiButton disabled={sending}>
                        <Link to={`/editathons/${ed.code}/config`}>
                           {tr('edit')}
                        </Link>
                     </WikiButton>
                     <WikiButton disabled={sending} loading={sending === 'delete'}
                                 type='destructive' onClick={() => this.onDelete(ed.code)}>
                        {tr('delete')}
                     </WikiButton>
                  </div>
               </div>
            )}
         </div>
      </div>
   }

   async onApprove(code) {
      await this.exec('approve', () => Api.publishEditathon(code));
   }

   async onDelete(code) {
      await this.exec('delete', () => Api.removeEditathon(code));
   }

   async exec(sending, api) {
      this.setState({ sending });
      try {
         await api();
         this.update();
      } catch(e) {
         alert(e);
      }
      this.setState({ sending: false });
   }
}

export default withTranslation(Approval, 'Personal.Approval');
