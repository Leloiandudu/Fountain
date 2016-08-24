export function getMark(marks) {
   return marks.filter(m => m.user === Global.user.name)[0];
}
