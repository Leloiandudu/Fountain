import React from 'react';
import classNames from 'classnames';
import IntegerInput from './IntegerInput';
import WikiButton from './WikiButton';
import { getActiveMarks } from '../jury';

export default class MarkInput extends React.Component {
   constructor(props) {
      super(props);

      this._markRenderers = {
         check: this.renderCheck,
         radio: this.renderRadio,
         int: this.renderInt,
      };

      for (const key in this._markRenderers) {
         this._markRenderers[key] = this._markRenderers[key].bind(this);
      }
   }

   setMark(id, value) {
      const marks = { ...this.props.value };
      if (value === undefined) {
         value = !marks[id];
      }
      marks[id] = value;
      this.onChange(marks);
   }

   clearMark(id) {
      const marks = { ...this.props.value };
      delete marks[id];
      this.onChange(marks);
   }

   onChange(marks) {
      this.props.onChange(marks);
   }

   renderCheck(id, mark) {
      return <div className='check'>
         <button className={classNames({
               selected: !!mark.cur,
            })} title={mark.description} onClick={() => this.setMark(id)}>
            {mark.title || '\xa0'}
         </button>
         {this.renderMarkControls(mark.children)}
      </div>;
   }

   renderRadio(id, mark) {
      return <div className='radio'>
         <span className='title'>{mark.title + ': '}</span>
         <div className='buttons'>
            {mark.values.map((v, i) => <button key={i} title={v.description} className={classNames({
               selected: mark.cur && mark.cur.val === i,
            })} onClick={() => this.setMark(id, i)}>
               {v.title || '\xa0'}
            </button>)}
         </div>
         {this.renderMarkControls(mark.children)}
      </div>;
   }

   renderInt(id, mark) {
      return <div className='int'>
         <span className='title'>{mark.title + ': '}</span>
         <IntegerInput value={mark.cur ? mark.cur.val : undefined}
                       min={mark.min} max={mark.max}
                       onChange={v => v === undefined ? this.clearMark(id) : this.setMark(id, v)} />
     </div>
   }

   renderMarkControl(id, mark) {
      return this._markRenderers[mark.type](id, mark);
   }

   renderMarkControls(config) {
      const marks = getActiveMarks(this.props.value, config);
      return <ul>
         {Object.keys(marks).map(id => <li key={id}>
            {this.renderMarkControl(id, marks[id])}
         </li>)}
      </ul>
   }

   render() {
      const { config } = this.props;
      return <div className='MarkInput'>
         {config && this.renderMarkControls(config)}
      </div>;
   }
}
