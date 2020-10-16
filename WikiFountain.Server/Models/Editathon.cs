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
        public int MinMarks { get; set; }

        public ISet<Article> Articles { get; set; }
        public ISet<string> Jury { get; set; }
        public ISet<Rule> Rules { get; set; }
        public TemplateConfig Template { get; set; }
        public JObject Marks { get; set; }

        public string Creator { get; set; }
        public bool IsPublished { get; set; }

        public IEnumerable<Mark> GetArticleMarks(Article a, UserInfo currentUser)
        {
            if (!Flags.HasFlag(EditathonFlags.HiddenMarks))
                return a.Marks;
            if (currentUser == null)
                return Enumerable.Empty<Mark>();

            return a.Marks.Select(m => m.User == currentUser.Username ? m : new Mark { User = m.User });
        }

        public MarkConfig ReadMarksConfig()
        {
            return MarkConfig.ReadFrom(Marks);
        }

        public decimal? CalculateMark(Article a)
        {
            var all = Jury.Select(j => a.Marks.Where(m => m.User == j).SingleOrDefault())
                .Where(m => m != null)
                .Select(m => m.Marks)
                .ToArray();

            if (all.Length == 0) return null;

            // don't show mark unless we met the minimum
            if (all.Length < MinMarks) return null;

            var config = ReadMarksConfig();

            decimal result;
            var parts = all.Select(m => config.GetValues(m)).ToArray();

            if (Flags.HasFlag(EditathonFlags.ConsensualVote))
            {
                var p = parts.Aggregate((p1, p2) => p1 != null && p1.SequenceEqual(p2) ? p1 : null);
                if (p == null) return null;
                result = p.Values.Sum(v => v.Value);
            }
            else
            {
                result = parts.Average(p => p.Values.Sum(v => v.Value));
            }

            return Math.Round(result, 2);
        }

        public IReadOnlyList<ResultRow> GetResults()
        {
            if (Flags.HasFlag(EditathonFlags.HiddenMarks))
                return new ResultRow[0];

            var rows = Articles.GroupBy(a => a.User).Select(u => new ResultRow
            {
                Name = u.Key,
                Total = u.Sum(a => CalculateMark(a)),
                Rank = 1,
            }).OrderByDescending(u => u.Total).ToArray();

            for (var i = 1; i < rows.Length; i++)
            {
                var cur = rows[i];
                var prev = rows[i - 1];
                rows[i].Rank = prev.Rank + (prev.Total == cur.Total ? 0 : 1);
            }

            return rows;
        }

        public struct ResultRow
        {
            public string Name { get; set; }
            public decimal? Total { get; set; }
            public int Rank { get; set; }
        }
    }

    [Flags]
    public enum EditathonFlags
    {
        None = 0,
        ConsensualVote = 1,
        HiddenMarks = 2,
    }

    public class TemplateConfig
    {
        public string Name { get; set; }
        public bool TalkPage { get; set; }
        public Core.Template.Argument[] Args { get; set; }
    }

    public class EditathonMapping : ClassMapping<Editathon>
    {
        public EditathonMapping()
        {
            Set(_ => _.Jury, c => { }, er => er.Element(e => e.Column("Name")));
            Property(_ => _.Name, p => p.UniqueKey("EditathonName"));
            Property(_ => _.Code, p => p.UniqueKey("EditathonCode"));
        }
    }
}
