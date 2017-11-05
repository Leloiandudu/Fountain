import eq from 'shallow-equals';

export const EditathonFlags = Object.freeze({
   consensualVote: 1,
   hiddenMarks: 2,
});

export function findMarkOf(marks, user = Global.user.name) {
   return marks.filter(m => m.user === user)[0];
}

const Calc = {
   radio(mark, val) {
      // backwards compatibily
      if (val === false)
         val = 0;
      else if (val === true)
         val = 1;
      const cur = mark.values[val];
      return cur && { ...cur, val };
   },
   check(mark, val) {
      return val && { ...mark };
   },
   int(mark, val) {
      return val !== undefined ? { ...mark, val, value: val } : undefined;
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
         } else if (m.type === 'int') {
            res.parts[m.title || m.description] = m.cur.value;
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

function isSameMark(m1, m2, marksConfig) {
   m1 = calcMark(m1, marksConfig);
   m2 = calcMark(m2, marksConfig);
   if (!m1 || !m2) return m1 === m2;
   return eq(m1.parts, m2.parts);
}

function getConsensualMark(marks, marksConfig) {
   if (marks.length > 1) {
      if (!marks.reduce((a, b) => isSameMark(a, b, marksConfig) && a)) {
         return null;
      }
   }
   return calcMark(marks[0], marksConfig).sum;
}

export function calcTotalMark(jury, marks, marksConfig) {
   const all = jury.map(j => findMarkOf(marks, j)).filter(m => m).map(m => m.marks);
   if (all.length == 0)
      return null;

   return {
      average: all.map(m => calcMark(m, marksConfig).sum).reduce((a, b) => a + b, 0) / all.length,
      consensual: getConsensualMark(all, marksConfig),
   }
}

export function getTotalMark({ jury, marks: marksConfig, flags }, marks) {
   const consensualVote = !!(flags & EditathonFlags.consensualVote);
   const mark = calcTotalMark(jury, marks, marksConfig);
   return mark && (consensualVote ? mark.consensual : mark.average);
}

export function isConflict(editathon, article) {
   const { jury, marks, flags } = editathon;
   if (flags & EditathonFlags.hiddenMarks) return false;
   if (!(flags & EditathonFlags.consensualVote)) return false;
   const mark = calcTotalMark(jury, article.marks, marks);
   return mark && mark.consensual === null;
}
