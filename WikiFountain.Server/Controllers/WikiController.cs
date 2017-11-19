using System.Net.Http;
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
        }

        public class ParseData
        {
            public string Wiki { get; set; }
            public string Text { get; set; }
            public string Title { get; set; }
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Parse([FromBody] ParseData data)
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return Unauthorized();

            return Ok(await MediaWikis.Create(data.Wiki, _identity).Parse(data.Text, data.Title));
        }
    }
}
