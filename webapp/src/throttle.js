export default function throttle(fn, period) {
   let timeout = null;

   const cancel = () => {
      if (timeout) {
         clearTimeout(timeout);
         timeout = null;
      }
   }

   const throttle = (...args) => {
      cancel();
      timeout = setTimeout(() => fn(...args), period);
   }

   throttle.cancel = cancel;

   return throttle;
}
