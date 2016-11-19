import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Header from './Header';
import ModalDialog from '../ModalDialog';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';
import { calcMark, getActiveMarks } from '../../jury';

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
      this.setState({ isCommentOpen: false, comment: this.state.editingComment });
      this.props.onChanged();
   },
   setMark(id, value) {
      if (value === undefined)
         value = !this.state.marks[id];
      this.state.marks[id] = value;
      this.setState({ marks: this.state.marks });
      this.props.onChanged();
   },
   renderCheck(id, mark) {
      return <button className={classNames({
            check: true,
            selected: this.state.marks[id],
         })} title={mark.description} onClick={() => this.setMark(id)}>
         {mark.title}
      </button>;
   },
   renderRadio(id, mark) {
      return <div className='radio'>
         <span className='title'>{mark.title + ': '}</span>
         <div className='buttons'>
            {mark.values.map((v, i) => <button key={i} title={v.description} className={classNames({
               selected: mark.cur && mark.cur.val === i,
            })} onClick={() => this.setMark(id, i)}>
               {v.title}
            </button>)}
         </div>
         {this.renderMarkControls(mark.children)}
      </div>;
   },
   renderMarkControl(id, mark) {
      const components = {
         check: this.renderCheck,
         radio: this.renderRadio,
      };

      return components[mark.type](id, mark);
   },
   renderMarkControls(marks) {
      if (!marks) return;
      marks = getActiveMarks(this.state.marks, marks);
      return <ul>
         {Object.keys(marks).map(id => <li key={id}>
            {this.renderMarkControl(id, marks[id])}
         </li>)}
      </ul>
   },
   hasChanges() {
      const { marks: oldMark = {}, oldComment } = this.props.mark || {};
      const { marks: newMark, comment: newComment } = this.state;

      if ((newComment || '') !== (oldComment || '')) {
         return true;
      }

      for (var key in newMark) {
         if (oldMark[key] !== newMark[key]) {
            return true;
         }
      }
      return false;
   },
   markIsValid() {
      // test if all radios have values
      function isValid(marks) {
         if (!marks) return true;

         for (const m of Object.values(marks)) {
            if (m.type === 'radio' && m.cur === undefined)
               return false;
            return isValid(m.children)
         }
      }

      return isValid(getActiveMarks(this.state.marks, this.props.marks));
   },
   canSave() {
      return this.hasChanges() && this.markIsValid();
   },
   onSave() {
      this.props.onSaveMarks({
         marks: { ...this.state.marks },
         comment: this.state.comment,
      });
   },
   getTotal() {
      const { sum = null } = calcMark(this.state.marks, this.props.marks);
      return sum === null ? '--' : sum;
   },
   render() {
      if (!this.props.article)
         return null;
      const { marks, translation: { tr } } = this.props;
      return (
         <div className='Evaluation'>
            <div className='marks'>
               {this.renderMarkControls(marks)}
            </div>
            <button onClick={this.openComment} className={classNames({
               'comment-button': true,
               selected: this.state.comment,
            })} title={this.state.comment}>{tr('comment')}</button>
            <div className='controls'>
               <div className='total'>
                  {tr('total', this.getTotal())}
               </div>
               <WikiButton disabled={!this.canSave()} type='constructive' onClick={this.onSave}>
                  {tr('save')}
               </WikiButton>
               <WikiButton onClick={this.props.onNext}>{tr('skip')}</WikiButton>
            </div>
            <ModalDialog isOpen={this.state.isCommentOpen} className='comment-dialog'>
               <textarea autoFocus={true} ref='commentTextarea' value={this.state.editingComment} onChange={event => this.setState({ editingComment: event.target.value })} />
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
