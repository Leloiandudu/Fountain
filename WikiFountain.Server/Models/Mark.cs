using Newtonsoft.Json.Linq;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class Mark
    {
        public long Id { get; set; }
        public Article Article { get; set; }
        public string User { get; set; }
        public JObject Marks { get; set; }
        public string Comment { get; set; }
    }
}
