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

        private static string Join(IEnumerable<string> titles)
        {
            return string.Join("|", titles);
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