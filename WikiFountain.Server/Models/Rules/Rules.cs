using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace WikiFountain.Server.Models.Rules
{
    static class Rules
    {
        public static IDictionary<string, Type> All = new Dictionary<string, Type>
        {
            { "articleCreated", typeof(ArticleCreatedRule) },
            { "articleSize", typeof(ArticleSizeRule) },
            { "namespace", typeof(NamespaceRule) },
            { "submitterRegistered", typeof(SubmitterRegisteredRule) },
            { "submitterIsCreator", typeof(SubmitterIsCreatorRule) },
        };

        public static IRule Get(this Rule rule)
        {
            var pars = rule.Params ?? new JObject();
            return (IRule)pars.ToObject(All[rule.Type]);
        }
    }
}
