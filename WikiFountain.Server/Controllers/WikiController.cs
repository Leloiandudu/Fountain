using System.Threading.Tasks;
using System.Web.Http;
using WikiFountain.Server.Core;

namespace WikiFountain.Server.Controllers
{
    public class WikiController : ApiControllerBase
    {
        private readonly Identity _identity;

        public WikiController(Identity identity)
        {
            _identity = identity;
            if (_identity.GetUserInfo() == null)
                throw Unauthorized();
        }

        public class ParseData
        {
            public string Wiki { get; set; }
            public string Text { get; set; }
            public string Title { get; set; }
        }

        [HttpPost]
        public Task<string> Parse([FromBody] ParseData data)
        {
            return MediaWikis.Create(data.Wiki, _identity).Parse(data.Text, data.Title);
        }
    }
}
