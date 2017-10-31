using System;
using System.Collections.Generic;
using NHibernate.Mapping.ByCode.Conformist;

namespace WikiFountain.Server.Models
{
    [Persistent, Auditable]
    public class Article
    {
        public Article()
        {
            Marks = new HashSet<Mark>();
        }

        public long Id { get; set; }
        public string Name { get; set; }
        public string User { get; set; }
        public DateTime DateAdded { get; set; }
        public ISet<Mark> Marks { get; set; }

        public Editathon Editathon { get; set; }
    }

    public class ArticleMapping : ClassMapping<Article>
    {
        public ArticleMapping()
        {
            ManyToOne<Editathon>("Editathon", m => m.UniqueKey("ArticleInEditathon"));
            Property(_ => _.Name, p => p.UniqueKey("ArticleInEditathon"));
        }
    }
}
