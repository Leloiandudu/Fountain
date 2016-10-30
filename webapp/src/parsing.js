function eraseTags(tag, tags) {
   if (!tag.childNodes.length)
      return tag.textContent.trim();

   return [...tag.childNodes]
      .filter(tag => tags.indexOf(tag.nodeName.toLowerCase()) === -1)
      .map(tag => eraseTags(tag, tags).trim())
      .filter(tag => tag)
      .join(" ");
};

export function getPlainText(text) {
   var tags = ["sup", "sub", "table", "div", "ul", "ol", "li", "dl", "dd", "dt", "#comment", "h1", "h2", "h3", "h4", "h5", "h6"];
   var parser = new DOMParser();
   var html = parser.parseFromString(text, "text/html");
   return eraseTags(html.body, tags);
}

export function getWordCount(text) {
   return (getPlainText(text).match(/[^\s]*[^\s\u2000-\u206f!"$%'()*,\-.:;?\\\[\]|~¡«°·»¿՚՛՜՝՞՟։־׀׆׳״،؟।၊။♪⟨⟩、。《》「」『』【】〜〽・﬩️﹁﹂！（），：？［］｛｝]+[^\s]*(\s|$)+/g) || []).length;
}
