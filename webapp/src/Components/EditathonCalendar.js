import React from 'react';
import moment from 'moment';
import Tooltip from './Tooltip';
import { withTranslation } from './../translate';

function overlap(e1, e2) {
   return e1.start.isSameOrBefore(e2.start) && e2.start.isSameOrBefore(e1.finish)
       || e2.start.isSameOrBefore(e1.start) && e1.start.isSameOrBefore(e2.finish);
}

function getLayers(editathons) {
   const layers = [];
   let first = true;

   for (const editathon of editathons) {
      let layer = layers.filter(lr => lr.every(e => !overlap(e, editathon)))[0];
      if (!layer) {
         layer = [];
         layers.push(layer);
      }

      layer.push(editathon);
   }

   return layers;
}

function totalMonths(m) {
   return m.year() * 12 + m.month();
}

class EditathonCalendar extends React.PureComponent {
   onWheel(e) {
      e.preventDefault();
      let k = 1;
      if (e.deltaMode === 1) {
         k = parseFloat(getComputedStyle(this._element).lineHeight);
      }
      this._element.scrollLeft += e.deltaY * k;
   }

   formatDate(...args) {
      return this.props.translation.translate('formatDate', ...args);
   }

   renderSection(d, isFirst) {
      const format = isFirst || d.month() === 0 ? 'MMM YYYY' : 'MMM';
      return <div className='section' key={d.toDate().getTime()}>
         <span className='label'>{this.formatDate(d, format)}</span>
      </div>;
   }

   renderAxis(min, max) {
      const sections = [];
      for (const d = min.clone(); d.isSameOrBefore(max); d.add(1, 'month')) {
         sections.push(this.renderSection(d, d.isSame(min)));
      }

      return <div id='axis'>
         {sections}
      </div>;
   }

   dateToOffset(date, min) {
      const months = totalMonths(date) - totalMonths(min);
      return months * 100 + (date.date() - 1) * 100.0 / (date.daysInMonth() - 1);
   }

   renderStrip(e, min, isFirstLayer, key) {
      const left = this.dateToOffset(e.start, min);
      const right = this.dateToOffset(e.finish, min);
      return <div className='strip' key={key} style={{ left, width: right - left }}>
         <div className='tooltip'>
            <Tooltip onTop={isFirstLayer}>{`${e.name}
${this.formatDate(e.start, 'L')} – ${this.formatDate(e.finish, 'L')}`}</Tooltip>
         </div>
         <div className='inner' />
      </div>;
   }

   renderLayers(editathons, min) {
      const layers = getLayers(editathons);
      return layers.map((layer, i) => <div className='layer' key={i}>
         {layer.map((editathon, j) => this.renderStrip(editathon, min, i === 0, j))}
      </div>);
   }

   render() {
      const editathons = this.props.editathons.map(e => ({
         ...e,
         start: moment(e.start).startOf('day'),
         finish: moment(e.finish).startOf('day'),
      })).filter(e => !e.start.isSame(e.finish));

      let min = moment.min(editathons.map(e => e.start)).startOf('month');
      const max = moment.max(editathons.map(e => e.finish)).startOf('month').add(1, 'month');
      if (max.diff(min, 'months') < 7) {
         min = moment(max).add(-7, 'months');
      }

      return <div className='EditathonCalendar'
                  onWheel={e => this.onWheel(e)}
                  ref={x => this._element = x}>
         <div className='content'>
            {this.renderAxis(min, max)}
            {this.renderLayers(editathons, min)}
         </div>
      </div>;
   }
}

export default withTranslation(EditathonCalendar);
