using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;
using JWT;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Controllers
{
    [OutputCacheAttribute(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class LoginController : MvcControllerBase
    {
        private readonly OAuthConsumer _oauth;
        private readonly Identity _identity;

        public LoginController(OAuthConsumer oauth, Identity identity)
        {
            _oauth = oauth;
            _identity = identity;
        }

        public async Task<ActionResult> Login(string redirectTo = null)
        {
            _identity.Clear();

            var token = await _oauth.GetRequestToken("oob");
            RequestToken = token;
            RedirectTo = redirectTo;

            return Redirect(_oauth.GetRedirect(token.Key));
        }

        public ActionResult Logout(string redirectTo = null)
        {
            _identity.Clear();
            return Redirect(redirectTo ?? "~/");
        }

        public async Task<ActionResult> Callback([Bind(Prefix = "oauth_verifier")] string verifier, [Bind(Prefix = "oauth_token")] string oauthToken)
        {
            var token = RequestToken;
            if (token == null)
                return Redirect("~/login");

            if (token.Key != oauthToken)
                return View("error");

            var accessToken = await _oauth.GetAccessToken(token, verifier);
            _identity.Update(accessToken, await QueryInfo(msg => _oauth.Sign(msg, accessToken)));

            return Redirect(RedirectTo ?? "~/");
        }

        private async Task<UserInfo> QueryInfo(Action<HttpRequestMessage> sign)
        {
            var msg = new HttpRequestMessage(HttpMethod.Get, "https://ru.wikipedia.org/w/index.php?title=Special:OAuth/identify");
            using (var http = new HttpClient())
            {
                sign(msg);
                var response = await http.SendAsync(msg);
                var result = await response.Content.ReadAsStringAsync();
                if (result.Contains("\"message\""))
                    throw new AuthExpiredException(JObject.Parse(result).Value<string>("message"));
                var str = JsonWebToken.Decode(result, _oauth.ConsumerToken.Secret);
                return JsonConvert.DeserializeObject<UserInfo>(str, new JsonSerializerSettings { DateFormatString = "yyyyMMddHHmmss", DateTimeZoneHandling = DateTimeZoneHandling.Utc });
            }
        }

        private OAuthConsumer.Token RequestToken
        {
            get 
            {
                return Session["token"] as OAuthConsumer.Token; 
            }
            set { Session["token"] = value; }
        }

        private string RedirectTo
        {
            get { return Session["redirectTo"] as string; }
            set { Session["redirectTo"] = value; }
        }
    }
}
