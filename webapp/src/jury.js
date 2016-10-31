import eq from 'shallow-equals'

export function findMarkOf(marks, user = Global.user.name) {
   return marks.filter(m => m.user === user)[0];
}

const Calc = {
   'radio': function(mark, val) {
      // backwards compatibily
      if (val === false)
         val = 0;
      else if (val === true)
         val = 1;
      const cur = mark.values[val];
      return cur && { ...cur, val };
   },
   'check': function(mark, val) {
      return val && { ...mark };
   },
};

export function getActiveMarks(mark = {}, marks = {}) {
   const res = {};
   for (const id in marks) {
      const m = marks[id]
      const cur = Calc[m.type](m, mark[id]);
      res[id] = {
         ...m,
         cur,
         children: cur && cur.children
            ? getActiveMarks(mark, cur.children)
            : undefined
      };
      if (cur) delete cur.children;
   }
   return res;
}

export function calcMark(mark, marks) {
   if (!mark) return;

   return function calcMark(marks) {
      const res = { parts: {}, sum: null };

      for (const m of Object.values(marks)) {
         if (!m.cur) continue;
         res.sum += m.cur.value;

         if (m.type === 'radio') {
            res.parts[m.cur.description || m.cur.title] = m.cur.value;
         } else if (m.type === 'check') {
            res.parts[m.title || m.description] = m.value;
         }

         if (m.children) {
            const { parts, sum } = calcMark(m.children);
            Object.assign(res.parts, parts);
            res.sum += sum;
         }
      }

      return res;
   }(getActiveMarks(mark, marks));
}

export function isSameMark(m1, m2) {
   return eq(m1, m2);
}
