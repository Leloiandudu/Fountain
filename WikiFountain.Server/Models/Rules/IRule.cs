using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace WikiFountain.Server.Models.Rules
{
    interface IRule
    {
        bool Check(JObject data, RuleContext ctx);
        IEnumerable<RuleReq> GetReqs();
    }

    class RuleContext
    {
        public UserInfo User { get; set; }
    }

    enum RuleReq
    {
        Title,
        Ns,
        Bytes,
        Chars,
        Words,
        Created,
        Creator,
    }
}
