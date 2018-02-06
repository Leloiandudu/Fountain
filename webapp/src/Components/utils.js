import React from 'react';

export function bind(comp, get, set) {
   let value = get();
   let prop = 'value';
   let onChange;

   if (comp.type === 'input' && comp.props.type === 'checkbox') {
      onChange = e => set(e.target.checked);
      prop = 'checked';
      value = value || false;
   } else if (comp.type === 'input' && comp.props.type === 'radio') {
      onChange = e => set(comp.props.value);
      prop = 'checked';
      value = value === comp.props.value;
   } else if (comp.type === 'input' || comp.type === 'textarea') {
      onChange = e => set(e.target.value);
      value = value || '';
   } else {
      onChange = v => set(v);
   }

   return React.cloneElement(comp, { [prop]: value, onChange });
}

function setProp(me, prop, value, valueProp) {
   me.props.onChange({
      ...(me.props[valueProp] || {}),
      [prop]: value
   });
}

function isObjectEmpty(obj) {
   return obj.constructor === Object && Object.keys(obj).length === 0;
}

export function createSetter(valueProp = 'value') {
   return function set(prop, value) {
      return setProp(this, prop, value, valueProp);
   }
}

export function createBinder(valueProp = 'value') {
   const bindProp = bind;
   return function bind(prop, component, onChange) {
      return bindProp(component, () => {
         const value = this.props[valueProp];
         return value && value[prop];
      }, v => {
         onChange && onChange(v);
         setProp(this, prop, v, valueProp);
      });
   }
}

export function setDefault(props, prop, getDefault, valueProp = 'value') {
   if (getDefault === undefined) {
      getDefault = prop;
      prop = null;
   }

   const { onChange } = props;
   let { [valueProp]: value = {} } = props;

   if (prop !== null) {
      value = value[prop] || {};
   }

   if (onChange && isObjectEmpty(value)) {
      value = getDefault();
      if (prop !== null) {
         const data = props[valueProp];
         data[prop] = value;
         onChange(data);
      } else {
         onChange(value);
      }
   }
}

export function createSubSection(parent, prop, valueProp = 'value', childValueProp = 'value') {
   function onChange(v) {
      const value = { ...parent.props[valueProp] };
      value[prop] = v;
      parent.props.onChange(value);
   }

   return {
      get props() {
         return {
            [childValueProp]: parent.props[valueProp][prop],
            onChange,
         }
      },
      bind: createBinder(childValueProp),
      set: createSetter(childValueProp),
   };
}
