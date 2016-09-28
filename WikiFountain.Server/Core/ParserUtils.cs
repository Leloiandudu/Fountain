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

        public static Regex GetArticleTitleRegex(string title)
        {
            var index = title.LastIndexOf(':') + 1;
            return new Regex(@"[\s_]*" + Regex.Escape(title.Substring(0, index)) + "[" + char.ToUpper(title[index]) + char.ToLower(title[index]) + "]" + string.Join(@"[\s_]+", Regex.Split(title.Substring(index + 1), "[ _]+").Select(Regex.Escape)) + @"[\s_]*");
        }

        public static IDictionary<Template, TextRegion> FindTemplates(string text, string templateName, bool skipIgnored = true)
        {
            return FindTemplates(text, new[] { templateName }, skipIgnored);
        }

        public static IDictionary<Template, TextRegion> FindTemplates(string text, IEnumerable<string> templateNames, bool skipIgnored)
        {
            var items = new Dictionary<Template, TextRegion>();
            var regex = new Regex(@"\{\{(?:" + string.Join("|", templateNames.Select(t => "(?:" + GetArticleTitleRegex(t) + ")")) + @")[|}\s]");
            var ignored = skipIgnored ? new TextRegion[0] : GetIgnoredRegions(text).ToArray();
            for (var i = 0; ; )
            {
                var match = regex.Match(text, i);
                if (!match.Success)
                    break;

                if (ignored.Contains(match.Index))
                {
                    i = match.Index + match.Length;
                }
                else
                {
                    var template = Template.ParseAt(text, match.Index);
                    var region = new TextRegion(match.Index, template.ToString().Length);
                    items.Add(template, region);
                    i = region.Offset + region.Length;
                }
            }
            return items;
        }

        /// <summary>
        /// Returns commented and nowiki regions.
        /// </summary>
        public static IEnumerable<TextRegion> GetIgnoredRegions(string wiki)
        {
            var tokens = new Regex(string.Join("|", new[] { "<!--", "-->", @"(<nowiki)[\s>]", "</nowiki>" }));

            string prevToken = null;
            var start = 0;

            foreach (Match match in tokens.Matches(wiki))
            {
                var token = match.Groups[1].Success ? match.Groups[1].Value : match.Value;
                if ((token == "<!--" || token == "<nowiki") && prevToken == null)
                {
                    prevToken = token;
                    start = match.Index;
                }
                else if (token == "-->" && prevToken == "<!--"
                    || token == "</nowiki>" && prevToken == "<nowiki")
                {
                    yield return new TextRegion(start, match.Index + token.Length - start);
                    prevToken = null;
                }
            }

            if (prevToken != null)
                yield return new TextRegion(start, wiki.Length - start);
        }

        public static TextRegion ExpandToWholeLine(string text, TextRegion region)
        {
            var index = 0;
            if (region.Offset > 0)
            {
                index = text.LastIndexOf('\n', region.Offset - 1) + 1;
                if (!string.IsNullOrWhiteSpace(text.Substring(index, region.Offset - index)))
                    return region;
            }

            var end = region.Offset + region.Length;
            var index2 = text.IndexOf('\n', end) + 1;
            if (index2 == 0)
                index2 = text.Length;

            if (!string.IsNullOrWhiteSpace(text.Substring(end, index2 - end)))
                return region;

            return new TextRegion(index, index2 - index);
        }

        public static bool Contains(this IEnumerable<TextRegion> regions, int offset)
        {
            return regions.Any(r => r.Contains(offset));
        }
    }

    [DebuggerDisplay("off: {Offset}, len: {Length}")]
    struct TextRegion
    {
        public TextRegion(int offset, int length)
            : this()
        {
            Offset = offset;
            Length = length;
        }

        public int Offset { get; private set; }
        public int Length { get; private set; }

        public bool Contains(int offset)
        {
            return Offset <= offset && offset < Offset + Length;
        }

        public string Get(string str)
        {
            return str.Substring(Offset, Length);
        }
    }
}
