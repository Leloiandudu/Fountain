using System.Collections.Generic;

namespace WikiFountain.Server.Models.Rules
{
    class SubmitterIsCreatorRule : IRule
    {
        public bool Check(Newtonsoft.Json.Linq.JObject data, RuleContext ctx)
        {
            return ctx.User.Username == data.Value<string>("creator");
        }

        public IEnumerable<RuleReq> GetReqs()
        {
            yield return RuleReq.Creator;
        }
    }
}
