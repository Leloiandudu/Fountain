using System;
using Newtonsoft.Json.Linq;

namespace WikiFountain.Server.Models
{
    [Persistent, Auditable]
    public class Rule
    {
        public long Id { get; set; }
        public string Type { get; set; }
        public RuleFlags Flags { get; set; }
        public JObject Params { get; set; }
    }

    [Flags]
    public enum RuleFlags
    {
        Optional = 1,
        Informational = 2,
    }
}
