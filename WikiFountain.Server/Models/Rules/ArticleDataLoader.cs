using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json.Linq;
using WikiFountain.Server.Core;

namespace WikiFountain.Server.Models.Rules
{
    class ArticleDataLoader
    {
        private readonly IDictionary<LoaderType, JObject> _requests = new Dictionary<LoaderType, JObject>();
        private readonly IList<Action<IDictionary<LoaderType, JObject>, JObject>> _callbacks = new List<Action<IDictionary<LoaderType, JObject>, JObject>>();

        public ArticleDataLoader(IEnumerable<RuleReq> reqs)
        {
            foreach (var req in reqs.Distinct())
            {
                var loader = Loaders[req];

                JObject request;
                if (!_requests.TryGetValue(loader.Type, out request))
                {
                    if (loader.Type == LoaderType.FirstRev || loader.Type == LoaderType.LastRev)
                    {
                        request = JObject.FromObject(new
                        {
                            _title = "titles",
                            action = "query",
                            redirects = true,
                            rvdir = loader.Type == LoaderType.FirstRev ? "newer" : "older",
                        });
                    }
                    else if (loader.Type == LoaderType.Html)
                    {
                        request = JObject.FromObject(new
                        {
                            _title = "page",
                            action = "parse",
                            prop = new[] { "text" },
                            wrapoutputclass = "",
                        });
                    }
                    _requests.Add(loader.Type, request);
                }

                var pars = loader.Params as JObject;
                if (pars == null)
                {
                    if (loader.Params != null)
                        pars = JObject.FromObject(loader.Params);
                    else
                        pars = new JObject();
                }

                foreach (var prop in pars.Properties())
                {
                    if (prop.Name.StartsWith("_"))
                        continue;

                    JToken value;
                    if (prop.Value is JArray)
                    {
                        JArray arr;
                        if (request[prop.Name] == null)
                            arr = new JArray();
                        else
                            arr = request.Value<JArray>(prop.Name);

                        arr.Merge(prop.Value, new JsonMergeSettings { MergeArrayHandling = MergeArrayHandling.Union });
                        value = arr;
                    }
                    else
                    {
                        var existing = request[prop.Name];
                        if (existing != null && !existing.Equals(prop.Value))
                            throw new Exception(string.Format("'{0}' is already defined for {1}, existing '{2}' !== new '{3}'", prop.Name, loader.Type, existing, prop.Value));
                        value = prop.Value;
                    }

                    request[prop.Name] = value;
                }

                var key = req.ToString();
                key = char.ToLower(key[0]) + key.Substring(1);
                _callbacks.Add((results, result) => result[key] = JToken.FromObject(loader.Callback(results[loader.Type])));
            }

            foreach (var request in _requests.Values)
            {
                foreach (var prop in request.Properties())
                {
                    var arr = prop.Value as JArray;
                    if (arr != null)
                        prop.Value = string.Join("|", arr.Values<string>());
                }
            }
        }

        public async Task<JObject> LoadAsync(MediaWiki wiki, string title)
        {
            var results = (await Task.WhenAll(_requests.Values.Select(args => {
                var obj = new JObject();
                if (args["_title"] != null)
                    obj[args.Value<string>("_title")] = title;
                obj.Merge(args);
                return obj;
            }).Select(wiki.Exec)))
                .Zip(_requests, (res, req) => new { Key = req.Key, Value = res })
                .ToDictionary(x => x.Key, x => x.Value);

            var result = new JObject();
            foreach (var cb in _callbacks)
                cb(results, result);

            return result;
        }

        private static readonly IDictionary<RuleReq, Loader> Loaders = new Dictionary<RuleReq, Loader>
        {
            {
                RuleReq.Ns, 
                new Loader
                {
                    Type = LoaderType.LastRev,
                    Params = new
                    {
                        prop = new[] { "revisions" },
                        rvlimit = 1,
                    },
                    Callback = data => data["query"]["pages"][0].Value<int>("ns"),
                }
            },
            {
                RuleReq.Bytes, 
                new Loader
                {
                    Type = LoaderType.LastRev,
                    Params = new
                    {
                        prop = new[] { "revisions" },
                        rvprop = new[] { "size" },
                        rvlimit = 1,
                    },
                    Callback = data => data["query"]["pages"][0]["revisions"][0].Value<int>("size"),
                }
            },
            {
                RuleReq.Chars, 
                new Loader
                {
                    Type = LoaderType.Html,
                    Callback = data => ParserUtils.GetPlainText(GetContent(data)).Length,
                }
            },
            {
                RuleReq.Words, 
                new Loader
                {
                    Type = LoaderType.Html,
                    Callback = data => ParserUtils.GetWordCount(GetContent(data)),
                }
            },
            {
                RuleReq.Created, 
                new Loader
                {
                    Type = LoaderType.FirstRev,
                    Params = new
                    {
                        prop = new[] { "revisions" },
                        rvprop = new[] { "timestamp" },
                        rvlimit = 1,
                    },
                    Callback = data => data["query"]["pages"][0]["revisions"][0].Value<DateTime>("timestamp"),
                }
            },
            {
                RuleReq.Creator, 
                new Loader
                {
                    Type = LoaderType.FirstRev,
                    Params = new
                    {
                        prop = new[] { "revisions" },
                        rvprop = new[] { "user" },
                        rvlimit = 1,
                    },
                    Callback = data => data["query"]["pages"][0]["revisions"][0].Value<string>("user"),
                }
            },
        };

        private static string GetContent(JObject queryResult)
        {
            return queryResult["parse"].Value<string>("text");
        }

        class Loader
        {
            public LoaderType Type { get; set; }
            public object Params { get; set; }
            public Func<JObject, object> Callback { get; set; }
        }

        enum LoaderType
        {
            FirstRev,
            LastRev,
            Html,
        }
    }
}
