using System;
using System.Collections.Generic;

namespace WikiFountain.Server.Models.Rules
{
    class ArticleCreatedRule : IRule
    {
        public DateTime? Before { get; set; }
        public DateTime? After { get; set; }

        public bool Check(Newtonsoft.Json.Linq.JObject data, RuleContext ctx)
        {
            var created = data.Value<DateTime>("created");
            return Before.HasValue ? created < Before.Value : true
                && After.HasValue ? created > After.Value : true;
        }

        public IEnumerable<RuleReq> GetReqs()
        {
            yield return RuleReq.Created;
        }
    }
}
