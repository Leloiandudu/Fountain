using System;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using NHibernate.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Controllers
{
    public class PersonalController : ApiControllerWithDb
    {
        private readonly Identity _identity;

        public PersonalController(Identity identity)
        {
            _identity = identity;
        }

        [ActionName("current-editathons")]
        public HttpResponseMessage GetCurrentEditathons()
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            var list = (
                from ed in Session.Query<Editathon>()
                where ed.Articles.Any(a => a.User == user.Username)
                select ed
            ).FetchMany(_ => _.Articles)
             .ThenFetch(a => a.Marks)
             .Fetch(_ => _.Jury)
             .OrderByDescending(_ => _.Finish)
             .ToArray();

            return Ok(list.Select(ed => new {
                ed.Name, ed.Code,
                ed.Description, ed.Wiki,
                ed.Start, ed.Finish,
                Rows = GetRows(ed, user) ?? new object[0],
            }));
        }

        private static object GetRows(Editathon ed, UserInfo user)
        {
            if (ed.Flags.HasFlag(EditathonFlags.HiddenMarks))
                return null;

            if (!ed.Articles.Where(a => a.User == user.Username).Any(a => a.Marks.Any()))
                return null;

            var rows = ed.Articles.GroupBy(a => a.User).Select(u => new {
                Name = u.Key,
                Total = u.Sum(a => ed.CalculateMark(a)),
                Rank = 1,
            }).OrderByDescending(u => u.Total).ToArray();

            for(var i = 1; i < rows.Length; i++)
            {
                var cur = rows[i];
                var prev = rows[i - 1];
                rows[i] = new
                {
                    cur.Name,
                    cur.Total,
                    Rank = prev.Rank + (prev.Total == cur.Total ? 0 : 1)
                };
            }

            var rank = rows.Single(x => x.Name == user.Username).Rank;
            return rows.SkipWhile(u => u.Rank < rank - 1).TakeWhile(u => u.Rank <= rank + 1).ToArray();
        }
    }
}
