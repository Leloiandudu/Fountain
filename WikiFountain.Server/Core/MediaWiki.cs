using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json.Linq;

namespace WikiFountain.Server.Core
{
    public class MediaWiki
    {
        private readonly string _url;
        private readonly Identity _identity;
        private string _csrfToken;

        public MediaWiki(string url, Identity identity)
        {
            _url = url;
            _identity = identity;
        }

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

        public async Task EditPage(string title, string text, string summary)
        {
            var token = await GetCsrfToken();

            var result = await Exec(new JObject
            {
                { "action", "edit" },
                { "title", title },
                { "text", text },
                { "summary", summary },
                { "token", token },
            });

            var code = result["edit"].Value<string>("result");
            if (code == null)
                throw new MediaWikiException("Invalid response: " + result);
            if (code != "Success")
                throw new MediaWikiException(code);
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
                    body.Add(new StringContent(prop.Value.Value<string>()), prop.Name);

                req.Headers.UserAgent.Add(new ProductInfoHeaderValue("Fountain", GetVersion().ToString(2)));
                req.Headers.UserAgent.Add(new ProductInfoHeaderValue("(https://github.com/leloiandudu/fountain; kf8.wikipedia@gmail.com)"));
                
                _identity.Sign(req);

                using (var resp = await http.SendAsync(req))
                {
                    return JObject.Parse(await resp.Content.ReadAsStringAsync());
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