using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using NHibernate.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;
using WikiFountain.Server.Models.Rules;

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
                e.Wiki,
            }).ToList());
        }

        public HttpResponseMessage Get(string code)
        {
            var e = Session.Query<Editathon>()
                .FetchMany(_ => _.Articles).ThenFetch(a => a.Marks)
                .Fetch(_ => _.Jury)
                .Fetch(_ => _.Rules)
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
                e.Wiki,
                e.ConsensualVote,
                e.Jury,
                e.Marks,
                Rules = e.Rules.Select(r => new
                {
                    r.Type,
                    r.Flags,
                    r.Params,
                }),
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

            var e = Session.Query<Editathon>()
                .Fetch(_ => _.Rules)
                .Fetch(_ => _.Articles)
                .SingleOrDefault(i => i.Code == code);

            if (e == null)
                return NotFound();

            var now = DateTime.UtcNow;
            if (now < e.Start || now.Date > e.Finish)
                return Forbidden();

            if (e.Articles.Any(a => a.Name == body.Title))
                return Forbidden();

            var wiki = new MediaWiki("https://" + e.Wiki +  ".wikipedia.org/w/api.php", _identity);

            var page = await wiki.GetPage(body.Title);
            if (page == null)
                return Forbidden();

            var rules = e.Rules
                .Where(r => !r.Flags.HasFlag(RuleFlags.Optional))
                .Select(r => r.Get())
                .ToArray();

            if (rules.Any())
            {
                var loader = new ArticleDataLoader(rules.SelectMany(r => r.GetReqs()));
                var data = await loader.LoadAsync(wiki, body.Title);

                var ctx = new RuleContext { User = user };
                foreach (var rule in rules)
                {
                    if (!rule.Check(data, ctx))
                        return Forbidden();
                }
            }

            if (e.Template != null)
                await UpdateTemplate(wiki, user, body.Title, page, (JObject)e.Template.DeepClone());

            e.Articles.Add(new Article
            {
                Name = body.Title,
                User = user.Username,
                DateAdded = now,
            });

            return Ok();
        }

        private static async Task UpdateTemplate(MediaWiki wiki, UserInfo user, string title, string page, JObject settings)
        {
            var template = new Template { Name = settings.Value<string>("name") };

            var args = settings.Value<JArray>("args");
            foreach (var arg in args.Values<JObject>())
            {
                foreach (var prop in arg.Properties())
                {
                    prop.Value = prop.Value.Value<string>().Replace("%user.name%", user.Username);
                }
                template.Args.Add(arg.ToObject<Template.Argument>());
            }

            var templateString = template + "\n";

            if (settings.Value<bool>("talkPage"))
            {
                title = "Talk:" + title;
                page = await wiki.GetPage(title) ?? "";
            }

            var existing = ParserUtils.FindTemplates(page, template.Name);
            if (existing.Count == 0)
            {
                page = page.Insert(0, templateString);
            }
            else
            {
                var regions = existing.Values.OrderByDescending(r => r.Offset).ToArray();
                foreach (var r in regions)
                {
                    var region = ParserUtils.ExpandToWholeLine(page, r);
                    page = page.Remove(region.Offset, region.Length);
                }
                page = page.Insert(regions.Last().Offset, templateString);
            }

            await wiki.EditPage(title, page, "Automatically adding template");
        }

        public class MarkPostData
        {
            public string Title { get; set; }
            public string Marks { get; set; }
            public string Comment { get; set; }
        }

        [HttpPost]
        public HttpResponseMessage SetMark(string code, [FromBody] MarkPostData body)
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            var e = Session.Query<Editathon>()
                .FetchMany(_ => _.Articles).ThenFetch(a => a.Marks)
                .Fetch(_ => _.Jury)
                .SingleOrDefault(i => i.Code == code);

            if (e == null)
                return NotFound();

            if (!e.Jury.Contains(user.Username))
                return Forbidden();

            var article = e.Articles.SingleOrDefault(a => a.Name == body.Title);
            if (article == null)
                return NotFound();

            var mark = article.Marks.SingleOrDefault(m => m.User == user.Username);

            if (mark == null)
            {
                mark = new Mark
                {
                    Article = article,
                    User = user.Username,
                };
                article.Marks.Add(mark);
            }

            mark.Marks = JObject.Parse(body.Marks);
            mark.Comment = body.Comment;

            return Ok();
        }
    }
}
