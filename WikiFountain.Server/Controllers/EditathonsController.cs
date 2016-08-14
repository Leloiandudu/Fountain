using System;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using NHibernate.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Controllers
{
    public class EditathonsController : ApiControllerWithDb
    {
        private readonly Identity _identity;

        public EditathonsController(Identity identity)
        {
            _identity = identity;
        }

        public HttpResponseMessage Get()
        {
            return Ok(Session.Query<Editathon>().OrderByDescending(e => e.Finish).Select(e => new
            {
                e.Code,
                e.Name,
                e.Description,
                e.Start,
                e.Finish,
            }).ToList());
        }

        public HttpResponseMessage Get(string code)
        {
            var e = Session.Query<Editathon>().Fetch(_ => _.Articles).SingleOrDefault(i => i.Code == code);
            if (e == null)
                return NotFound();
            return Ok(new
            {
                e.Code,
                e.Name,
                e.Description,
                e.Start,
                e.Finish,
                Articles = e.Articles.OrderByDescending(a => a.DateAdded),
            });
        }

        public class ArticlePostData
        {
            public string Title { get; set; }
        }

        [HttpPost]
        public HttpResponseMessage AddArticle(string code, [FromBody] ArticlePostData body)
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            var e = Session.Query<Editathon>().SingleOrDefault(i => i.Code == code);
            if (e == null)
                return NotFound();

            e.Articles.Add(new Article
            {
                Name = body.Title,
                User = user.Username,
                DateAdded = DateTime.UtcNow,
            });

            return Ok();
        }

        private static DateTime Utc(int year, int month, int day)
        {
            return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}
