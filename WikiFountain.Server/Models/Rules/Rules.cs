using System;
using System.Collections.Generic;
using Newtonsoft.Json;

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
        };

        public static IRule Get(this Rule rule)
        {
            return (IRule)rule.Params.ToObject(All[rule.Type]);
        }
    }
}
