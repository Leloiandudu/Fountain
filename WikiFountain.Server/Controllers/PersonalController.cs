﻿using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using NHibernate;
using NHibernate.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Controllers
{
    public class PersonalController : ApiControllerBase
    {
        private readonly Identity _identity;
        private readonly ISession _session;

        public PersonalController(Identity identity, ISession session)
        {
            _identity = identity;
            _session = session;

            if (_identity.GetUserInfo() == null)
                throw Unauthorized();
        }

        [ActionName("current-editathons")]
        public IEnumerable<object> GetCurrentEditathons()
        {
            var user = _identity.GetUserInfo();

            var list = (
                from ed in _session.Query<Editathon>()
                where ed.Articles.Any(a => a.User == user.Username)
                select ed
            ).FetchMany(_ => _.Articles)
             .ThenFetch(a => a.Marks)
             .Fetch(_ => _.Jury)
             .OrderByDescending(_ => _.Finish)
             .ToArray();

            return list.Select(ed => new {
                ed.Name, ed.Code,
                ed.Description, ed.Wiki,
                ed.Start, ed.Finish,
                HiddenMarks = ed.Flags.HasFlag(EditathonFlags.HiddenMarks),
                Rows = GetRows(ed, user) ?? Enumerable.Empty<Editathon.ResultRow>(),
            });
        }

        private static IEnumerable<Editathon.ResultRow> GetRows(Editathon ed, UserInfo user)
        {
            if (ed.Flags.HasFlag(EditathonFlags.HiddenMarks))
                return null;

            if (!ed.Articles.Where(a => a.User == user.Username).Any(a => a.Marks.Any()))
                return null;

            var rows = ed.GetResults();
            var rank = rows.Single(x => x.Name == user.Username).Rank;
            return rows.SkipWhile(u => u.Rank < rank - 1).TakeWhile(u => u.Rank <= rank + 1).ToArray();
        }

        [ActionName("jury-editathons")]
        public IEnumerable<object> GetJuryEditathons()
        {
            var user = _identity.GetUserInfo();

            return
                from ed in _session.Query<Editathon>()
                where ed.Jury.Contains(user.Username)
                orderby ed.Finish descending
                select new
                {
                    ed.Name,
                    ed.Code,
                    ed.Description,
                    ed.Wiki,
                    ed.Start,
                    ed.Finish,
                    missing = ed.Articles.Count(a => a.Marks.All(m => m.User != user.Username)),
                };
        }
    }
}
