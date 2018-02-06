function cmp(a, b) {
   if (a === undefined) a = null;
   if (b === undefined) b = null;

   if (a === b) return 0;
   if (a === null) return -1;
   if (b === null) return 1;

   a = a.valueOf();
   b = b.valueOf();
   if (a === b) return 0;

   return a < b ? -1 : 1;
}

function getResult(fn, objA, objB) {
   if (typeof fn === 'function') {
      if (fn.length === 1) {
         // do nothing
      } else if (fn.length === 2) {
         return fn(objA, objB);
      } else {
         throw new TypeError('passed func should accept 1 or 2 arguments');
      }
   } else {
      const part = fn;
      fn = x => x[part];
   }

   const a = fn(objA);
   const b = fn(objB);

   return cmp(a, b);
}

export default function sortBy(...parts) {
   if (parts.length === 1 && Array.isArray(parts[0])) {
      parts = parts[0];
   }

   function compare(objA, objB) {
      for (const part of parts) {
         const res = getResult(part, objA, objB);
         if (res) return res;
      }

      return 0;
   };

   compare.desc = (objA, objB) => compare(objB, objA);

   return compare;
}
