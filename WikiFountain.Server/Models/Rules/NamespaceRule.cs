using System.Collections.Generic;
using System.Linq;

namespace WikiFountain.Server.Models.Rules
{
    class NamespaceRule : IRule
    {
        public int[] IsIn { get; set; }

        public bool Check(Newtonsoft.Json.Linq.JObject data, RuleContext ctx)
        {
            return IsIn.Contains(data.Value<int>("ns"));
        }

        public IEnumerable<RuleReq> GetReqs()
        {
            yield return RuleReq.Ns;
        }
    }
}
