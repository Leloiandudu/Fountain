using System;
using System.Collections.Generic;
using NHibernate.Mapping.ByCode.Conformist;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class Editathon
    {
        public Editathon()
        {
            Articles = new HashSet<Article>();
            Jury = new HashSet<string>();
        }

        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime Start { get; set; }
        public DateTime Finish { get; set; }

        public ISet<Article> Articles { get; set; }
        public ISet<string> Jury { get; set; }
    }

    public class EditathonMapping : ClassMapping<Editathon>
    {
        public EditathonMapping()
        {
            Set(_ => _.Jury, c => { }, er => er.Element(e => e.Column("Name")));
        }
    }
}
