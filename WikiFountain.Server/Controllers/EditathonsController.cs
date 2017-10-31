using System;
using System.Collections.Generic;
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
        private readonly AuditContext _auditContext;

        public EditathonsController(Identity identity, AuditContext auditContext)
        {
            _identity = identity;
            _auditContext = auditContext;
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

            var user = _identity.GetUserInfo();

            return Ok(new
            {
                e.Code,
                e.Name,
                e.Description,
                e.Start,
                e.Finish,
                e.Wiki,
                e.Flags,
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
                    Marks = e.GetArticleMarks(a, user).Select(m => new
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
            public string User { get; set; }
        }

        [HttpPost]
        public async Task<HttpResponseMessage> AddArticle(string code, [FromBody] ArticlePostData body)
        {
            _auditContext.Operation = OperationType.AddArticle;

            if (body == null || string.IsNullOrWhiteSpace(body.Title))
                return Request.CreateResponse(System.Net.HttpStatusCode.BadRequest);

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

            var wiki = MediaWikis.Create(e.Wiki, _identity);

            if (user.Username != body.User)
            {
                if (!e.Jury.Contains(user.Username))
                {
                    return Forbidden();
                }
                else
                {
                    user = await wiki.GetUser(body.User);
                    if (user == null)
                        return Forbidden();
                }
            }

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

        [HttpPost]
        public async Task<HttpResponseMessage> RemoveArticles(string code, [FromBody] long[] ids)
        {
            _auditContext.Operation = OperationType.RemoveArticle;

            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            var e = Session.Query<Editathon>()
                .Fetch(_ => _.Articles)
                .SingleOrDefault(i => i.Code == code);

            if (e == null)
                return NotFound();

            if (!e.Jury.Contains(user.Username))
                return Forbidden();


            foreach (var id in ids)
            {
                var article = e.Articles.SingleOrDefault(a => a.Id == id);
                if (article == null) return NotFound();

                e.Articles.Remove(article);
            }

            return Ok();
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
            _auditContext.Operation = OperationType.SetMark;

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

        [HttpPost]
        public HttpResponseMessage Create(EditathonData e)
        {
            return Unauthorized();
            _auditContext.Operation = OperationType.CreateEditathon;

            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            var exist = Session.Query<Editathon>()
                .Any(i => i.Code == e.General.Code || i.Name == e.General.Title);

            if (exist)
                return Forbidden();

            var editathon = new Editathon
            {
                Name = e.General.Title,
                Code = e.General.Code,
                Description = e.General.Description,
                Wiki = e.General.Wiki,
                Start = e.General.StartDate,
                Finish = e.General.FinishDate.AddDays(1).AddSeconds(-1),
                Flags = e.General.Flags,

                Jury = new HashSet<string>(e.Jury.Jury),
                Rules = new HashSet<Rule>(e.Rules.Rules),
            };

            if (e.Template.Enabled)
            {
                editathon.Template = JObject.FromObject(new
                {
                    name = e.Template.Name,
                    talkPage = e.Template.TalkPage,
                    args = e.Template.Args,
                });
            }

            Session.Save(editathon);

            if (e.Jury.SendInvites)
            {
                // ...
            }

            return Ok();
        }

        public class EditathonData
        {
            public GeneralPage General { get; set; }
            public RulesPage Rules { get; set; }
            public TemplatePage Template { get; set; }
            public JuryPage Jury { get; set; }

            public class GeneralPage
            {
                public string Title { get; set; }
                public string Code { get; set; }
                public string Description { get; set; }
                public string Wiki { get; set; }
                public DateTime StartDate { get; set; }
                public DateTime FinishDate { get; set; }
                public EditathonFlags Flags { get; set; }
            }

            public class RulesPage
            {
                public Rule[] Rules { get; set; }
            }

            public class TemplatePage
            {
                public bool Enabled { get; set; }
                public string Name { get; set; }
                public bool TalkPage { get; set; }
                public Template.Argument[] Args { get; set; }
            }

            public class JuryPage
            {
                public string[] Jury { get; set; }
                public bool SendInvites { get; set; }
            }
        }
    }
}
