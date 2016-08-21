using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
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
            var e = Session.Query<Editathon>()
                .FetchMany(_ => _.Articles).ThenFetch(a => a.Marks)
                .SingleOrDefault(i => i.Code == code);

            if (e == null)
                return NotFound();
            return Ok(new
            {
                e.Code,
                e.Name,
                e.Description,
                e.Start,
                e.Finish,
                Articles = e.Articles.OrderByDescending(a => a.DateAdded).Select(a => new 
                {
                    a.Id,
                    a.DateAdded,
                    a.Name,
                    a.User,
                    Marks = a.Marks.Select(m => new
                    {
                        m.User,
                        m.Marks,
                        m.Comment,
                    }),
                }),
            });
        }

        public class ArticlePostData
        {
            public string Title { get; set; }
        }

        [HttpPost]
        public async Task<HttpResponseMessage> AddArticle(string code, [FromBody] ArticlePostData body)
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            var e = Session.Query<Editathon>().SingleOrDefault(i => i.Code == code);
            if (e == null)
                return NotFound();

            if (user.Registered == null || user.Registered.Value.AddYears(1) < e.Start)
                return Forbidden();

            var now = DateTime.UtcNow;
            if (now < e.Start || now.Date > e.Finish)
                return Forbidden();

            if (e.Articles.Any(a => a.Name == body.Title))
                return Forbidden();

            var wiki = new MediaWiki("https://ru.wikipedia.org/w/api.php", _identity);

            var page = await wiki.GetPage(body.Title);
            if (page == null)
                return Forbidden();
            if (!HasTemplate(page))
            {
                page = "{{Марафон юниоров}}\n" + page;
                await wiki.EditPage(body.Title, page, "Автоматическая простановка шаблона");
            }

            e.Articles.Add(new Article
            {
                Name = body.Title,
                User = user.Username,
                DateAdded = now,
            });

            return Ok();
        }

        private static bool HasTemplate(string text)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(text, @"\{\{(?:[\s_]*[Мм]арафон[ _]+юниоров[\s_]*)[|}\s]");
        }

        private static DateTime Utc(int year, int month, int day)
        {
            return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}
