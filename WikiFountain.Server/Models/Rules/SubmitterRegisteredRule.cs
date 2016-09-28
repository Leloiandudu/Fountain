using System;
using System.Collections.Generic;

namespace WikiFountain.Server.Models.Rules
{
    class SubmitterRegisteredRule : IRule
    {
        public DateTime After { get; set; }

        public bool Check(Newtonsoft.Json.Linq.JObject data, RuleContext ctx)
        {
            return ctx.User.Registered.HasValue
                && ctx.User.Registered.Value > After;
        }

        public IEnumerable<RuleReq> GetReqs()
        {
            yield break;
        }
    }
}
