using System;

namespace WikiFountain.Server.Core
{
    using System.Text.RegularExpressions;
    using Wiki = Tuple<Predicate<string>, Func<string, string>>;

    public static class MediaWikis
    {
        private static readonly Wiki[] Wikis = 
        {
            Const("meta", "meta.wikimedia.org"),
            Regex(@"^([a-z\-]+)$", "$1.wikipedia.org"),
            Regex(@"^q:([a-z\-]+)$", "$1.wikiquote.org"),
        };

        private static Wiki Const(string code, string url)
        {
            return new Wiki(x => x == code, x => url);
        }
        private static Wiki Regex(string regex, string replace)
        {
            var r = new Regex(regex);
            return new Wiki(r.IsMatch, x => r.Replace(x, replace));
        }

        public static MediaWiki Create(string code, Identity identity)
        {
            foreach (var wiki in Wikis)
            {
                if (wiki.Item1(code))
                    return new MediaWiki("https://" + wiki.Item2(code) + "/w/api.php", identity);
            }
            throw new Exception(string.Format("Unknown wiki '{0}'.", code));
        }
    }
}
