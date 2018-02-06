using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Http.ModelBinding;
using Newtonsoft.Json.Linq;
using NHibernate;
using NHibernate.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;
using WikiFountain.Server.Models.Rules;

namespace WikiFountain.Server.Controllers
{
    public class EditathonsController : ApiControllerBase
    {
        private readonly Identity _identity;
        private readonly ISession _session;

        public EditathonsController(Identity identity, ISession session)
        {
            _identity = identity;
            _session = session;
        }

        public IEnumerable<object> GetAll()
        {
            return _session.Query<Editathon>().OrderByDescending(e => e.Finish).Select(e => new
            {
                e.Code,
                e.Name,
                e.Description,
                e.Start,
                e.Finish,
                e.Wiki,
            });
        }

        public object Get(EditathonCode code)
        {
            var e = code.Get(q => q
                .FetchMany(_ => _.Articles).ThenFetch(a => a.Marks)
                .Fetch(_ => _.Jury)
                .Fetch(_ => _.Rules));

            var user = _identity.GetUserInfo();

            return new
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
            };
        }

        public class ArticlePostData
        {
            public string Title { get; set; }
            public string User { get; set; }
        }

        [HttpPost]
        [ActionName("article")]
        [AuditOperation(OperationType.AddArticle)]
        public async void AddArticle(EditathonCode code, [FromBody] ArticlePostData body)
        {
            if (body == null || string.IsNullOrWhiteSpace(body.Title))
                throw BadRequest();

            var user = _identity.GetUserInfo();

            var e = code.Get(q => q
                .Fetch(_ => _.Jury)
                .Fetch(_ => _.Rules)
                .Fetch(_ => _.Articles));

            var now = DateTime.UtcNow;
            if (now < e.Start || now.Date > e.Finish)
                throw Forbidden();

            if (e.Articles.Any(a => a.Name == body.Title))
                throw Forbidden();

            var wiki = MediaWikis.Create(e.Wiki, _identity);

            if (user.Username != body.User)
            {
                if (!e.Jury.Contains(user.Username))
                {
                    throw Forbidden();
                }
                else
                {
                    user = await wiki.GetUser(body.User);
                    if (user == null)
                        throw Forbidden();
                }
            }

            var page = await wiki.GetPage(body.Title);
            if (page == null)
                throw Forbidden();

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
                        throw Forbidden();
                }
            }

            if (e.Template != null)
                await UpdateTemplate(wiki, user, body.Title, page, e.Template);

            e.Articles.Add(new Article
            {
                Name = body.Title,
                User = user.Username,
                DateAdded = now,
            });
        }

        private static async Task UpdateTemplate(MediaWiki wiki, UserInfo user, string title, string page, TemplateConfig settings)
        {
            var template = new Template { Name = settings.Name };

            foreach (var arg in settings.Args)
            {

                template.Args.Add(new Template.Argument
                {
                    Name = arg.Name,
                    Value = arg.Value.Replace("%user.name%", user.Username),
                });
            }

            if (settings.TalkPage)
            {
                title = "Talk:" + title;
                page = await wiki.GetPage(title) ?? "";
            }

            var templateString = template + "\n";
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
        [JuryOnly]
        [AuditOperation(OperationType.RemoveArticle)]
        public void RemoveArticles(EditathonCode code, [FromBody] long[] ids)
        {
            var e = code.Get(q => q.Fetch(_ => _.Articles));

            foreach (var id in ids)
            {
                var article = e.Articles.SingleOrDefault(a => a.Id == id);
                if (article == null)
                    throw NotFound();

                e.Articles.Remove(article);
            }
        }

        public class MarkPostData
        {
            public string Title { get; set; }
            public string Marks { get; set; }
            public string Comment { get; set; }
        }

        [HttpPost]
        [ActionName("mark")]
        [JuryOnly]
        [AuditOperation(OperationType.SetMark)]
        public void SetMark(EditathonCode code, [FromBody] MarkPostData body)
        {
            var e = code.Get(q => q.FetchMany(_ => _.Articles).ThenFetch(a => a.Marks));
            var user = _identity.GetUserInfo();

            var article = e.Articles.SingleOrDefault(a => a.Name == body.Title);
            if (article == null)
                throw NotFound();

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
        }

        [HttpPost]
        [AuditOperation(OperationType.CreateEditathon)]
        public void Create(EditathonData e)
        {
            var user = _identity.GetUserInfo().Username;
            if (_session.Query<Editathon>().Any(_ => _.Creator == user && !_.IsPublished))
                throw Forbidden();

            if (_session.Query<Editathon>().Any(_ => _.Code == e.Code || _.Name == e.Name))
                throw Forbidden();

            var editathon = new Editathon
            {
                Name = e.Name,
                Code = e.Code,
                Description = e.Description,
                Wiki = e.Wiki,
                Start = e.StartDate,
                Finish = e.FinishDate.AddDays(1).AddSeconds(-1),
                Flags = e.Flags,

                Creator = user,
                IsPublished = false,

                Template = e.Template,
                Jury = new HashSet<string>(e.Jury),
                Rules = new HashSet<Rule>(e.Rules),
            };

            _session.Save(editathon);
        }

        public object GetDraft(EditathonCode code)
        {
            var e = code.Get(q => q.Fetch(_ => _.Rules));
            var user = _identity.GetUserInfo();

            return new
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
            };
        }

        public class EditathonData
        {
            public string Name { get; set; }
            public string Code { get; set; }
            public string Description { get; set; }
            public string Wiki { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime FinishDate { get; set; }
            public EditathonFlags Flags { get; set; }

            public Rule[] Rules { get; set; }
            public TemplateConfig Template { get; set; }
            public string[] Jury { get; set; }
        }

        [HttpGet]
        [JuryOnly]
        public IEnumerable<Editathon.ResultRow> Results(EditathonCode code, int limit)
        {
            return code
                .Get(q => q.FetchMany(_ => _.Articles).ThenFetch(_ => _.Marks))
                .GetResults()
                .Where(r => r.Rank <= limit);
        }

        [HttpPost]
        [JuryOnly]
        public async void Award(EditathonCode code, [FromBody] IDictionary<string, string> awards)
        {
            if (awards == null || awards.Count == 0)
                throw BadRequest();

            var e = code.Get();
            var wiki = MediaWikis.Create(e.Wiki, _identity);

            foreach (var userTalk in await UserTalk.GetAsync(wiki, awards.Select(r => r.Key)))
                await userTalk.WriteAsync(awards[userTalk.UserName], "Automated awarding");
        }

        [ModelBinder]
        [UnityModelBinder(typeof(EditathonCodeBinder))]
        public class EditathonCode
        {
            private readonly ISession _session;
            private readonly string _code;

            public EditathonCode(ISession session, string code)
            {
                _session = session;
                _code = code;

                QueryModifiers = new List<Func<IQueryable<Editathon>, IQueryable<Editathon>>>();
                Validators = new List<Action<Editathon>>();
            }

            public List<Func<IQueryable<Editathon>, IQueryable<Editathon>>> QueryModifiers { get; private set; }
            public List<Action<Editathon>> Validators { get; private set; }

            public Editathon Get(Func<IQueryable<Editathon>, IQueryable<Editathon>> with = null)
            {
                var query = _session.Query<Editathon>().Where(e => e.IsPublished);
                if (with != null)
                    query = with(query);
                foreach (var mod in QueryModifiers)
                    query = mod(query);

                var editathon = query.SingleOrDefault(e => e.Code == _code);
                if (editathon == null)
                    throw new HttpResponseException(System.Net.HttpStatusCode.NotFound);

                foreach (var validator in Validators)
                    validator(editathon);

                return editathon;
            }

            class EditathonCodeBinder : TypedModelBinder<string, EditathonCode>
            {
                private readonly ISession _session;

                public EditathonCodeBinder(ISession session)
                {
                    _session = session;
                }

                protected override EditathonCode BindModel(string value, HttpActionContext actionContext, ModelBindingContext bindingContext)
                {
                    return new EditathonCode(_session, value);
                }
            }
        }

        class JuryOnlyAttribute : UnityActionFilterAttribute
        {
            public JuryOnlyAttribute() : base(typeof(JuryOnlyFilter))
            {
            }

            class JuryOnlyFilter : UnityActionFilter
            {
                private readonly Identity _identity;
                private bool _executed;

                public JuryOnlyFilter(Identity identity)
                {
                    _identity = identity;
                }

                public override void OnActionExecuting(HttpActionContext actionContext, UnityActionFilterAttribute attribute)
                {
                    var code = actionContext.ActionArguments.Values.OfType<EditathonCode>().SingleOrDefault();
                    if (code == null)
                        throw new Exception("Action should have EditathonCode in its arguments.");

                    var user = _identity.GetUserInfo();
                    if (user == null)
                        throw new HttpResponseException(System.Net.HttpStatusCode.Unauthorized);

                    code.QueryModifiers.Add(q => q.Fetch(_ => _.Jury));
                    code.Validators.Add(e =>
                    {
                        _executed = true;
                        if (!e.Jury.Contains(user.Username))
                            throw new HttpResponseException(System.Net.HttpStatusCode.Forbidden);
                    });
                }

                public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext, UnityActionFilterAttribute attribute)
                {
                    if (!_executed && IsSuccess(actionExecutedContext.Response.StatusCode))
                        throw new Exception("Action should call EditathonCode.Get()");
                }

                private static bool IsSuccess(System.Net.HttpStatusCode statusCode)
                {
                    return System.Net.HttpStatusCode.OK <= statusCode && (int)statusCode <= 399;
                }
            }
        }
    }
}
