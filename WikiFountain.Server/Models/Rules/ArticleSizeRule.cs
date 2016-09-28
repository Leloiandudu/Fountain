using System.Collections.Generic;

namespace WikiFountain.Server.Models.Rules
{
    class ArticleSizeRule : IRule
    {
        public SizeConstraint Bytes { get; set; }
        public SizeConstraint Chars { get; set; }

        public bool Check(Newtonsoft.Json.Linq.JObject data, RuleContext ctx)
        {
            return Chars != null && Chars.Evaluate(data.Value<int>("chars"))
                || Bytes != null && Bytes.Evaluate(data.Value<int>("bytes"));
        }

        public IEnumerable<RuleReq> GetReqs()
        {
            if (Bytes != null)
                yield return RuleReq.Bytes;
            if (Chars != null)
                yield return RuleReq.Chars;
        }

        public class SizeConstraint
        {
            public int AtLeast { get; set; }

            public bool Evaluate(int value)
            {
                return value >= AtLeast;
            }
        }
    }
}
