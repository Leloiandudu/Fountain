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
                await UpdateTemplate(wiki, user, body.Title, page, (JObject)e.Template.DeepClone());

            e.Articles.Add(new Article
            {
                Name = body.Title,
                User = user.Username,
                DateAdded = now,
            });
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
            throw Unauthorized();

            var user = _identity.GetUserInfo();
            var exist = _session.Query<Editathon>()
                .Any(i => i.Code == e.General.Code || i.Name == e.General.Title);

            if (exist)
                throw Forbidden();

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

            _session.Save(editathon);

            if (e.Jury.SendInvites)
            {
                // ...
            }
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

        [HttpGet]
        [JuryOnly]
        public IEnumerable<Editathon.ResultRow> Results(EditathonCode code, int limit)
        {
            return code.Get().GetResults().Where(r => r.Rank <= limit);
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
                var query = _session.Query<Editathon>();
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
