import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Marks } from '../../jury';
import Header from './Header';
import ModalDialog from '../ModalDialog';
import WikiLink from '../WikiLink';

export default React.createClass({
   getInitialState() {
      return { 
         marks: {},
         comment: null,
         isCommentOpen: false,
      };
   },
   componentWillMount() {
      this.readMarks(this.props);
   },
   componentWillReceiveProps(props) {
      if (props.article !== this.props.article) {
         this.readMarks(props);
      }
   },
   readMarks({ mark: { marks = {}, comment = null } = {} }) {
      this.setState({ marks, comment });
   },
   onMark(mark) {
      this.state.marks[mark] = !this.state.marks[mark];
      this.state.marks.isGood = true;
      this.setState({ marks: this.state.marks });
      this.props.onChanged();
   },
   setIsGood(isGood) {
      this.state.marks.isGood = isGood;
      if (!isGood) {
         for (var m in Marks) {
            this.state.marks[m] = false;
         }
      }
      this.setState({ marks: this.state.marks });
      this.props.onChanged();
   },
   openComment() {
      this.setState({
         isCommentOpen: true,
         editingComment: this.state.comment || '',
      });
   },
   saveComment() {
      this.setState({ isCommentOpen: false, comment: this.state.editingComment });
      this.props.onChanged();
   },
   // getPmPageTitle() {
   //    return 'User talk:' + this.props.article.stats.submittedBy;
   // },
   // async loadPmInfo() {
   //    this.setState({ pmInfo: null });

   //    var sec = await findArticleSection(this.getPmPageTitle(), PmSectionTitle);
   //    var { text, html } = sec.section == 'new'
   //       ? { text: ', html: ' }
   //       : await getArticleSection(this.getPmPageTitle(), sec.section, sec.revId);

   //    this.setState({
   //       pmInfo: {
   //          timestamp: sec.timestamp,
   //          section: sec.section,
   //          html,
   //          text,
   //       }
   //    })
   // },
   // openPm() {
   //    this.setState({ isPmOpen: true, pm: ' });
   //    this.loadPmInfo();
   // },
   // async sendPm() {
   //    var pmInfo = this.state.pmInfo;
   //    this.setState({ isPmSaving: true });
   //    try {
   //       await createOrAppendArticleSection(this.getPmPageTitle(), PmSectionTitle, pmInfo.section, pmInfo.text + '\n\n' + this.state.pm + ' ~~~~', 'Комментарий жюри Марафона юниоров', pmInfo.timestamp);
   //       this.setState({ isPmSaving: false, isPmOpen: false })
   //    } catch(err) {
   //       this.setState({ isPmSaving: false });
   //       if (err === 'editconflict') {
   //          alert('Edit conflict is detected! Please try to send again.');
   //          await this.loadPmInfo();
   //       } else {
   //          alert(err);
   //       }
   //    };
   // },
   render() {
      if (!this.props.article)
         return null;
      return (
         <div className='panel'>
            <Header title='Evaluation' />
            <div id='evaluation' className='block'>
               <div id='evaluation-pm'>
                  <WikiLink target='_blank' to={'UT:' + this.props.article.user}>PM author</WikiLink>
               </div>
               <div id='evaluation-y-n'>
                  <button onClick={this.openComment} className={classNames({
                     pressed: this.state.comment,
                     button: true,
                  })}>Comment</button>
                  <input className='nasty' type='radio' name='yesno' id='evaluation-n' checked={this.state.marks.isGood === false} onChange={() => this.setIsGood(false)} />
                  <label className='button' htmlFor='evaluation-n'>Bad</label>
                  <input type='radio' name='yesno' id='evaluation-y' checked={this.state.marks.isGood === true} onChange={() => this.setIsGood(true)} />
                  <label className='button' htmlFor='evaluation-y'>Good</label>
               </div>
               <div id='evaluation-marks'>
                  {Object.getOwnPropertyNames(Marks).map(m => [
                        <input type='checkbox' checked={this.state.marks[m] || false} className={classNames({
                           nasty: m === 'minusOne',
                           button: true,
                        })} id={'mark-' + m} onChange={() => this.onMark(m)} />,
                        <label className='button' htmlFor={'mark-' + m} title={Marks[m].description}>
                           <span>{Marks[m].title}</span>
                        </label>
                     ]
                  )}
               </div>
               <div id='evaluation-buttons'></div>
               <div id='evaluation-next'>
                  <button disabled={this.state.marks.isGood === undefined} className='button' onClick={() => this.props.onSaveMarks({
                     marks: this.state.marks,
                     comment: this.state.comment,
                  })}>Save</button>
                  <button className='button' onClick={this.props.onNext}>Skip</button>
               </div>
            </div>
            <ModalDialog isOpen={this.state.isCommentOpen} tryClose={() => this.setState({ isCommentOpen: false })} className='comment-dialog'>
               <textarea autoFocus={true} ref='commentTextarea' value={this.state.editingComment} onChange={event => this.setState({ editingComment: event.target.value })} />
               <div id='comment-dialog-buttons'>
                  <button className='button' onClick={this.saveComment}>Save</button>
                  <button className='button' onClick={() => this.setState({ isCommentOpen: false })}>Cancel</button>
               </div>
            </ModalDialog>
            {/*<Dialog header='PM' isOpen={this.state.isPmOpen} onClose={() => this.setState({isPmOpen: false})} className='pm-dialog'>
               <div className='pm-preview' dangerouslySetInnerHTML={{ __html: this.state.pmInfo && this.state.pmInfo.html }} />
               <textarea ref='pmTextarea' value={this.state.pm} onChange={event => this.setState({pm: event.target.value})} />
               <span>Don’t add ~~~~</span>
               <div id='pm-dialog-buttons'>
                  <button className='button' onClick={this.sendPm} disabled={!this.state.pmInfo || this.state.isPmSaving}>Send</button>
                  <button className='button' onClick={() => this.setState({isPmOpen: false})}>Cancel</button>
               </div>
            </ModalDialog>*/}
         </div>
      )
   }
})

