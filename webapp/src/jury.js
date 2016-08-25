export function getMark(marks, user = Global.user.name) {
   return marks.filter(m => m.user === user)[0];
}

export const Marks = {
   sources: {
      title: 'АИ',
      shortDescription: 'самостоятельная работа по АИ',
      description: 'самостоятельная работа по авторитетным источникам (при условии проставления сносок и качественного оформления ссылок на источники)',
      value: 1,
   },
   formatting: {
      title: 'оформ.',
      shortDescription: 'сложное оформление',
      description: 'сложное оформление (балл не присваивается в случае представления на конкурс однотипных, «шаблонных» статей — начиная с третьей статьи)',
      value: 1,
   },
   size: {
      title: 'большая',
      shortDescription: 'большой объём связного текста',
      description: 'большой объём связного текста',
      value: 1,
   },
   plusOne: {
      title: '+',
      shortDescription: 'высокое качество',
      description: 'отличное впечатление от статьи в целом, новаторство в оформлении, присвоение статуса добротной',
      value: 1,
   },
   minusOne: {
      title: '−',
      shortDescription: 'низкое качество работы',
      description: 'существенное количество стилистических, орфографических ошибок, плохого перевода и других недостатков, требующих значительной доработки или переработки',
      value: -1,
   },
};

export function calcMark(mark) {
   if (mark.isGood === false) {
      return { sum: 0, parts: { 'не соответствует требованиям': 0 } };
   }

   if (mark.isGood !== true) {
      return;
   }

   let sum = 1;
   const parts = { 'соответствует требованиям': 1 };
   for (const m in Marks) {
      if (mark[m] === true) {
         sum += Marks[m].value;
         parts[Marks[m].shortDescription] = Marks[m].value;
      }
   }
   return { sum, parts };
}
