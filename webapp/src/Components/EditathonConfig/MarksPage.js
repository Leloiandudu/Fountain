import React from 'react';
import DropDownButton from '../DropDownButton';
import IntegerInput from '../IntegerInput';
import MarksPreview from '../MarksPreview';
import WikiButton from '../WikiButton';
import { withTranslation } from '../../translate';
import { Validation } from './validation';
import { setDefault } from '../utils';

class MarksPage extends React.Component {
   constructor(props) {
      super(props);

      this._markPrototypes = {
         check: () => ({ title: '', value: 0, children: {} }),
         int: () => ({ title: '', min: 1, max: 5 }),
         radio: () => ({ title: '', values: [
            this._markPrototypes.option(),
            this._markPrototypes.option(),
         ] }),
         option: () => ({ title: '', children: {}, value: 0 }),
      };

      this._markRenderers = {
         check: this.renderCheck,
         radio: this.renderRadio,
         int: this.renderInt,
      };
      for (const key in this._markRenderers) {
         this._markRenderers[key] = this._markRenderers[key].bind(this);
      }

      this.onNewProps(props);
   }

   componentWillMount() {
      setDefault(this.props, 'marks', () => ({
         0: {
            type: 'radio',
            title: 'Accept the article?',
            values: [{
               value: 1,
               title: 'Yes',
               description: 'accepted',
               children: {},
            }, {
               value: 0,
               title: 'No',
               description: 'not accepted',
               children: {},
            }],
         }
      }));
   }

   componentWillReceiveProps(nextProps) {
      this.onNewProps(nextProps, this.props);
   }

   onNewProps(newProps, oldProps = {}) {
      if (newProps.value === oldProps.value) {
         return;
      }

      this._marks = JSON.parse(JSON.stringify({ x: newProps.value.marks })).x;
      this.calcId(newProps);
   }

   calcId(props = this.props) {
      function getChildIds(mark) {
         return mark.children ? getIds(mark.children) : [];
      }

      function getIds(marks) {
         return [
            ...Object.keys(marks),
            ...[].concat(...Object.values(marks).map(m =>
               m.type === 'radio' ? [].concat(...m.values.map(getChildIds))
               : getChildIds(m)
            ))
         ];
      }

      const { marks } = this.props.value;
      if (!marks) return;
      this._id = Math.max(...getIds(marks).concat(-1)) + 1;
   }

   tr(...args) {
      return this.props.translation.tr(...args);
   }

   renderGenericMark(id, mark, header, onDelete, value, showDesc, children) {
      return <div key={id} className='mark'>
         <div className='settings'>
            <header>
               <span>{header}</span>
               {onDelete && <WikiButton className='delete' onClick={onDelete} />}
            </header>
            <div className='row'>
               <label className='title'>
                  <span>{this.tr('title')}</span>
                  <Validation isEmpty={() => !mark.title}>
                     <input value={mark.title} onChange={e => {
                        mark.title = e.target.value;
                        this.onChange();
                     }} />
                  </Validation>
               </label>
               {value}
            </div>
            {showDesc && <div className='row'>
               <label className='description'>
                  <span>{this.tr('description')}</span>
                  <input value={mark.description || ''} onChange={e => {
                     mark.description = e.target.value;
                     this.onChange();
                  }} placeholder={this.tr('optional')} />
               </label>
            </div>}
         </div>
         {children}
      </div>;
   }

   renderIntegerValue(mark, title = 'value', prop = title) {
      return <label key={prop}>
         <span>{this.tr(title)}</span>
         <Validation isEmpty={() => !mark[prop] && mark[prop] !== 0}>
            <IntegerInput value={mark[prop]}
               onChange={v => {
                  mark[prop] = v;
                  this.onChange();
               }} />
         </Validation>
      </label>
   }

   renderRadio(id, mark, onDelete) {
      return this.renderGenericMark(
         id, mark, this.tr(mark.type), onDelete, null, false,
         [
            <div className='options' key='options'>
               {mark.values.map((option, index) => this.renderGenericMark(
                  index, option, this.tr('option'),
                  mark.values.length <= 2 ? null : () => {
                     mark.values.splice(index, 1);
                     this.onChange();
                  },
                  this.renderIntegerValue(option),
                  true,
                  [
                     this.renderMarks(option.children),
                     this.renderAdd(option.children),
                  ]
               ))}
            </div>,
            <WikiButton className='add' key='add' onClick={() => {
               mark.values.push(this._markPrototypes['option']());
               this.onChange();
            }}>{this.tr('addOption')}</WikiButton>,
         ]
      );
   }

   renderCheck(id, mark, onDelete) {
      return this.renderGenericMark(id, mark, this.tr(mark.type), onDelete,
         this.renderIntegerValue(mark), true,
         [
            this.renderMarks(mark.children),
            this.renderAdd(mark.children),
         ]
      );
   }

   renderInt(id, mark, onDelete) {
      return this.renderGenericMark(id, mark, this.tr(mark.type), onDelete, [
         this.renderIntegerValue(mark, 'min'),
         this.renderIntegerValue(mark, 'max'),
      ]);
   }

   renderAdd(marks) {
      return <DropDownButton
         key='add'
         className='add'
         items={Object.keys(this._markRenderers)}
         renderItem={t => this.tr(t)}
         onClick={t => this.add(t, marks)}
         children={this.tr('add')} />;
   }

   add(type, marks) {
      marks[this._id++] = { type, ...this._markPrototypes[type]() };
      this.onChange();
   }

   del(id, marks) {
      delete marks[id];
      this.onChange();
   }

   onChange() {
      const { value, onChange } = this.props;
      onChange({ ...value, marks: this._marks });
   }

   renderMarks(marks) {
      return Object.keys(marks).map(id => {
         const mark = marks[id];
         return this._markRenderers[mark.type](id, mark, () => this.del(id, marks))
      });
   }

   render() {
      const marks = this._marks;
      if (!marks) return null;

      return <div className='page MarksPage'>
         {this.renderMarks(marks)}
         {this.renderAdd(marks)}

         <div className='preview'>
            <header>{this.tr('preview')}</header>
            <MarksPreview config={marks} />
         </div>
      </div>;
   }
}

export default withTranslation(MarksPage, 'EditathonConfig.MarksPage');
