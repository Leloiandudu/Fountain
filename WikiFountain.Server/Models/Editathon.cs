using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using NHibernate.Mapping.ByCode.Conformist;

namespace WikiFountain.Server.Models
{
    [Persistent, Auditable]
    public class Editathon
    {
        public Editathon()
        {
            Articles = new HashSet<Article>();
            Jury = new HashSet<string>();
            Rules = new HashSet<Rule>();
        }

        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime Start { get; set; }
        public DateTime Finish { get; set; }
        public string Wiki { get; set; }
        public EditathonFlags Flags { get; set; }

        public ISet<Article> Articles { get; set; }
        public ISet<string> Jury { get; set; }
        public ISet<Rule> Rules { get; set; }
        public JObject Template { get; set; }
        public JObject Marks { get; set; }

        public IEnumerable<Mark> GetArticleMarks(Article a, UserInfo currentUser)
        {
            if (!Flags.HasFlag(EditathonFlags.HiddenMarks))
                return a.Marks;
            if (currentUser == null)
                return Enumerable.Empty<Mark>();

            return a.Marks.Select(m => m.User == currentUser.Username ? m : new Mark { User = m.User });
        }
    }

    [Flags]
    public enum EditathonFlags
    {
        ConsensualVote = 1,
        HiddenMarks = 2,
    }

    public class EditathonMapping : ClassMapping<Editathon>
    {
        public EditathonMapping()
        {
            Set(_ => _.Jury, c => { }, er => er.Element(e => e.Column("Name")));
        }
    }
}
