using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using HtmlAgilityPack;

namespace WikiFountain.Server.Core
{
    static class ParserUtils
    {
        private static readonly string[] BlacklistedTags = { "sup", "sub", "table", "div", "ul", "ol", "li", "dl", "dd", "dt", "#comment", "h1", "h2", "h3", "h4", "h5", "h6" };

        public static string GetPlainText(string html)
        {
            var dom = new HtmlDocument();
            dom.LoadHtml(html);
            return EraseTags(dom.DocumentNode).Trim();
        }

        private static string EraseTags(HtmlNode tag)
        {
            if (!Filter(tag))
                return string.Empty; 
            
            if (!tag.HasChildNodes)
                return HtmlEntity.DeEntitize(tag.InnerText).Trim();

            return string.Join(" ", tag.ChildNodes.Select(EraseTags).Where(x => x != string.Empty)).Trim();
        }

        private static bool Filter(HtmlNode tag)
        {
            return !BlacklistedTags.Contains(tag.Name.ToLower());
        }
    }
}
