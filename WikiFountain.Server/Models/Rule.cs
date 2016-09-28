using Newtonsoft.Json.Linq;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class Rule
    {
        public long Id { get; set; }
        public string Type { get; set; }
        public RuleSeverity Severity { get; set; }
        public JObject Params { get; set; }
    }

    public enum RuleSeverity
    {
        Requirement,
        Warning,
        Info,
    }
}
