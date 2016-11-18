function cmp(a, b) {
   if (a === undefined) a = null;
   if (b === undefined) b = null;

   if (a === b) return 0;
   if (a === null) return -1;
   if (b === null) return 1;

   return a < b ? -1 : 1;
}

export default function sortBy(...parts) {
   if (parts.lenght === 1 && Array.isArray(parts[0])) {
      parts = parts[0];
   }

   function compare(objA, objB) {
      for (const part of parts) {
         const fn = typeof part === 'function' ? part : x => x[part];

         const a = fn(objA);
         const b = fn(objB);

         const res = cmp(a, b);
         if (res) return res;
      }

      return 0;
   };

   compare.desc = (objA, objB) => compare(objB, objA);

   return compare;
}
