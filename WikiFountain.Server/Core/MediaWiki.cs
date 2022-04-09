using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Core
{
    public class MediaWiki
    {
        private readonly string _url;
        private readonly Identity _identity;
        private string _csrfToken;

        public MediaWiki(string code, string url, Identity identity)
        {
            Code = code;
            _url = url;
            _identity = identity;
        }

        public string Code { get; private set; }

        public async Task<string> GetPage(string title)
        {
            var result = await Exec(new JObject
            {
                { "action", "query" },
                { "titles", title },
                { "prop", "revisions" },
                { "rvprop", "content" },
                { "rvlimit", 1 },
            });

            var revs = result["query"]["pages"][0]["revisions"];
            if (revs == null)
                return null;

            return revs[0].Value<string>("content");
        }

        public async Task<UserInfo> GetUser(string name)
        {
            var result = await Exec(new JObject
            {
                { "action", "query" },
                { "list", "users" },
                { "ususers", name },
                { "usprop", "registration" },
            });

            var regDate = result["query"]["users"][0]["registration"];
            if (regDate == null)
                return null;

            return new UserInfo
            {
                Username = name,
                Registered = regDate.Value<DateTime?>(),
            };
        }

        public async Task<string> Parse(string text, string title = null)
        {
            var args = new JObject
            {
                { "action", "parse" },
                { "text", text },
                { "contentmodel", "wikitext" },
                { "prop", "text" },
                { "pst", true },
            };

            if (title != null)
                args.Add("title", title);

            return (await Exec(args))["parse"].Value<string>("text");
        }

        private async Task<string> GetCsrfToken()
        {
            if (_csrfToken == null)
            {
                _csrfToken = (await Exec(new JObject
                {
                    { "action", "query" },
                    { "meta", "tokens" },
                }))["query"]["tokens"].Value<string>("csrftoken");
            }
            return _csrfToken;
        }

        public async Task EditPage(string title, string text, string summary, bool? append = null)
        {
            var token = await GetCsrfToken();

            var result = await Exec(new JObject
            {
                { "action", "edit" },
                { "title", title },
                { !append.HasValue ? "text" : append.Value ? "appendtext" : "prependtext", text },
                { "summary", summary },
                { "token", token },
                { "redirect", append.HasValue },
                { "watchlist", "nochange" },
            });

            if (result["edit"] == null)
                throw new MediaWikiException("Invalid response: " + result);

            var code = result["edit"].Value<string>("result");
            if (code == null)
                throw new MediaWikiException("Invalid response: " + result);
            if (code != "Success")
                throw new MediaWikiException(code);
        }

        public async Task<IDictionary<string, string[]>> GetCategories(IEnumerable<string> titles, params string[] categories)
        {
            titles = titles.ToArray();

            var args = new JObject
            {
                { "action", "query" },
                { "prop", "categories" },
                { "titles", Join(titles) },
                { "redirects", true },
            };

            if (categories.Length > 0)
                args.Add("clcategories", Join(categories.Select(c => "Category:" + c)));

            var result = await Exec(args);
            var map = GetOriginalTitleMapping(result, titles);

            return result["query"].Value<JArray>("pages").ToDictionary(
                p => map[p.Value<string>("title")],
                p => p.Value<JArray>("categories")
                    .EmptyIfNull()
                    .Select(c => c.Value<string>("title")).ToArray());
        }

        private static IDictionary<string, string> GetOriginalTitleMapping(JObject result, IEnumerable<string> titles)
        {
            var dic = titles.ToDictionary(x => x);

            foreach (var prop in new[] { "normalized", "redirects" })
                foreach (var item in result["query"].Value<JArray>(prop).EmptyIfNull())
                    dic.ReplaceKey(item.Value<string>("from"), item.Value<string>("to"));

            return dic;
        }

        public async Task<IReadOnlyList<string>> GetSysopWikis(string user)
        {
            var result = (await Exec(new JObject
            {
                { "action", "query" },
                { "meta", "globaluserinfo" },
                { "guiuser", user },
                { "guiprop", "merged|groups" },
            }))["query"]["globaluserinfo"];

            var list = result.Value<JArray>("merged")
                .Where(w => (w["groups"] ?? new JArray()).ToObject<string[]>().Contains("sysop"))
                .Select(w => GetCodeByWikiName(w.Value<string>("wiki")))
                .Where(c => c != null)
                .ToList();

            if (result["groups"].ToObject<string[]>().Contains("global-sysop"))
                list.Add("*");

            return list;
        }


        public async Task<string> GetTalkPageTitle(string title)
        {
            if (!title.Contains(":"))
                return "Talk:" + title;

            var namespaces = await GetNamespaces();
            var res = namespaces.Select(ns => {
                var val = ns.Value.SingleOrDefault(v => title.StartsWith(v + ":"));
                if (val == null) return null;
                return new { Title = title.Substring(val.Length + 1), Id = ns.Key };
            })
            .SingleOrDefault(v => v != null);

            if (res == null)
                return "Talk:" + title;

            if (res.Id % 2 == 1)
                throw new InvalidOperationException("Already a talk page");

            return namespaces[res.Id + 1][0] + ":" + res.Title;
        }

        private IDictionary<int, string[]> _namespaces;
        public async Task<IDictionary<int, string[]>> GetNamespaces()
        {
            if (_namespaces != null)
                return _namespaces;

            var props = new[] { "name", "canonical" };

            var query = (await Query(new Dictionary<string, string>
            {
                { "meta", "siteinfo" },
                { "siprop", "namespaces|namespacealiases" },
            })).Single();

            return _namespaces = (
                query["namespaces"].Values().SelectMany(x =>
                {
                    var id = x.Value<int>("id");
                    return props.Select(p => x.Value<string>(p)).Where(v => v != null).Select(v => Tuple.Create(id, v));
                })
            ).Concat(
                query["namespacealiases"].Select(x => Tuple.Create(x.Value<int>("id"), x.Value<string>("alias")))
            ).Distinct().GroupBy(x => x.Item1, x => x.Item2).ToDictionary(x => x.Key, x => x.ToArray());
        }

        private static string GetCodeByWikiName(string wiki)
        {
            const string wik = "wik";
            var index = wiki.LastIndexOf(wik);
            if (index == -1)
                throw new FormatException("Unknown wiki name format: " + wiki);

            var code = wiki.Substring(0, index).Replace('_', '-');
            var suffix = wiki.Substring(index + wik.Length);
            if (suffix == "i")
                return code;
            if (suffix == "iquote")
                return "q:" + code;
            if (suffix == "isource")
                return "s:" + code;
            if (suffix == "ibooks")
                return "b:" + code;
            if (suffix == "inews")
                return "n:" + code;
            if (suffix == "iversity")
                return "v:" + code;
            if (suffix == "ivoyage")
                return "voy:" + code;
            if (suffix == "tionary")
                return "wikt:" + code;
            if (suffix == "imedia")
                return null;

            throw new FormatException("Unknown wiki name format: " + wiki);
        }

        private static string Join(IEnumerable<string> titles)
        {
            return string.Join("|", titles);
        }

        private async Task<IReadOnlyList<JObject>> Query(IDictionary<string, string> queryArgs)
        {
            queryArgs = new Dictionary<string, string>(queryArgs)
            {
                { "action", "query" },
            };

            var cont = new JObject(new JProperty("continue", ""));
            var results = new List<JObject>();

            for (; ; )
            {
                var args = JObject.FromObject(queryArgs);
                foreach (var p in cont.Properties())
                    args.Add(p.Name, p.Value.Value<string>());

                var result = await Exec(args);
                results.Add(result.Value<JObject>("query"));

                cont = result.Value<JObject>("continue");
                if (cont == null)
                    break;
            }

            return results;
        }

        public async Task<JObject> Exec(JObject args)
        {
            var data = new JObject
            {
                { "format", "json" },
                { "formatversion", 2 },
            };

            data.Merge(args);

            var body = new MultipartFormDataContent();
            using (var http = new HttpClient())
            using (var req = new HttpRequestMessage(HttpMethod.Post, _url) { Content = body })
            {
                foreach (var prop in data.Properties())
                {
                    var value = prop.Value;
                    if (value.Type == JTokenType.Boolean && !value.Value<bool>())
                        continue;
                    body.Add(new StringContent(value.Value<string>()), prop.Name);
                }

                req.Headers.UserAgent.Add(new ProductInfoHeaderValue("Fountain", GetVersion().ToString(2)));
                req.Headers.UserAgent.Add(new ProductInfoHeaderValue("(https://github.com/leloiandudu/fountain; kf8.wikipedia@gmail.com)"));

                _identity.Sign(req);

                using (var resp = await http.SendAsync(req))
                {
                    var result = JObject.Parse(await resp.Content.ReadAsStringAsync());
                    if (result["error"] != null && result["error"].Value<string>("code") == "mwoauth-invalid-authorization")
                        throw new UnauthorizedAccessException(result["error"].Value<string>("info"));
                    return result;
                }
            }
        }

        private static Version GetVersion()
        {
            return typeof(Global).Assembly.GetName().Version;
        }
    }

    [Serializable]
    public class MediaWikiException : Exception
    {
        public MediaWikiException() { }
        public MediaWikiException(string message) : base(message) { }
        public MediaWikiException(string message, Exception inner) : base(message, inner) { }
        protected MediaWikiException(
            System.Runtime.Serialization.SerializationInfo info,
            System.Runtime.Serialization.StreamingContext context)
            : base(info, context) { }
    }
}