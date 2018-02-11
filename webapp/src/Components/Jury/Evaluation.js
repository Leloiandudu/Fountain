import React from 'react';
import classNames from 'classnames';
import Header from './Header';
import MarkInput from '../MarkInput';
import ModalDialog from '../ModalDialog';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';
import { calcMark, isMarkValid } from '../../jury';

const Evaluation = React.createClass({
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
      this.setState({ marks: { ...marks }, comment });
   },
   openComment() {
      this.setState({
         isCommentOpen: true,
         editingComment: this.state.comment || '',
      });
   },
   saveComment() {
      this.onChanged({ isCommentOpen: false, comment: this.state.editingComment });
   },
   hasChanges() {
      const { marks: oldMark = {}, oldComment } = this.props.mark || {};
      const { marks: newMark, comment: newComment } = this.state;

      if ((newComment || '') !== (oldComment || '')) {
         return true;
      }

      for (const key in newMark) {
         if (oldMark[key] !== newMark[key]) {
            return true;
         }
      }
      return false;
   },
   canSave() {
      return this.hasChanges() && isMarkValid(this.state.marks, this.props.marks);
   },
   onSave() {
      this.props.onSaveMarks({
         marks: { ...this.state.marks },
         comment: this.state.comment,
      });
   },
   onMarksChange(marks) {
      this.onChanged({ marks });
   },
   onChanged(newState) {
      this.setState(newState, () => this.props.onChanged(this.hasChanges()));
   },
   render() {
      if (!this.props.article)
         return null;
      const { marks: config, translation: { tr } } = this.props;
      const { marks, comment, isCommentOpen, editingComment } = this.state;

      const total = (calcMark(marks, config) || { sum: null }).sum;

      return (
         <div className='Evaluation'>
            <MarkInput config={config} value={marks} onChange={this.onMarksChange} />
            <button onClick={this.openComment} className={classNames({
               'comment-button': true,
               selected: comment,
            })} title={comment}>{tr('comment')}</button>
            <div className='controls'>
               <div className='total'>
                  {tr('total', total === null ? '--' : total)}
               </div>
               <WikiButton disabled={!this.canSave()} type='constructive' onClick={this.onSave}>
                  {tr('save')}
               </WikiButton>
               <WikiButton onClick={this.props.onNext}>{tr('skip')}</WikiButton>
            </div>
            <ModalDialog isOpen={isCommentOpen} className='comment-dialog'>
               <textarea autoFocus={true} ref='commentTextarea' value={editingComment} onChange={event => this.setState({ editingComment: event.target.value })} />
               <div className='buttons'>
                  <WikiButton type='progressive' onClick={this.saveComment}>{tr('Comment.save')}</WikiButton>
                  <WikiButton onClick={() => this.setState({ isCommentOpen: false })}>{tr('Comment.cancel')}</WikiButton>
               </div>
            </ModalDialog>
         </div>
      )
   }
})

export default withTranslation(Evaluation, 'Jury.Evaluation');
