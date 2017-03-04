using Newtonsoft.Json.Linq;
using NHibernate.Mapping.ByCode.Conformist;

namespace WikiFountain.Server.Models
{
    [Persistent, Auditable]
    public class Mark
    {
        public long Id { get; set; }
        public Article Article { get; set; }
        public string User { get; set; }
        public JObject Marks { get; set; }
        public string Comment { get; set; }
    }

    public class MarkMapping : ClassMapping<Mark>
    {
        public MarkMapping()
        {
            ManyToOne(_ => _.Article, m => m.UniqueKey("MarkForArticle"));
            Property(_ => _.User, p => p.UniqueKey("MarkForArticle"));
        }
    }
}
