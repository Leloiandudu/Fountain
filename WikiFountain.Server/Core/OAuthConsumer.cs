using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using OAuth;

namespace WikiFountain.Server.Core
{
    public class OAuthConsumer
    {
        private static readonly Uri BaseUrl = new Uri("https://meta.wikimedia.org/w/index.php");

        public class Token
        {
            public string Key { get; set; }
            public string Secret { get; set; }
        }

        private readonly Token _consumer;

        public OAuthConsumer(Token consumer)
        {
            _consumer = consumer;
        }

        public Token ConsumerToken
        {
            get { return _consumer; }
        }

        public async Task<Token> GetRequestToken(string callback)
        {
            var msg = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(BaseUrl, "?title=Special:OAuth/initiate"),
            };
            var req = new OAuth.OAuthRequest
            {
                Type = OAuth.OAuthRequestType.RequestToken,
                CallbackUrl = callback,
            };
            Sign(msg, req);
            var response = await Query(msg);
            return GetToken(response);
        }

        public string GetRedirect(string tokenKey)
        {
            var args = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "title", "Special:OAuth/authorize" },
                { "oauth_token", tokenKey },
            });
            return new Uri(BaseUrl, "?" + args.ReadAsStringAsync().Result).ToString();
        }

        public async Task<Token> GetAccessToken(Token requestToken, string verifier)
        {
            var msg = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri(BaseUrl, "?title=Special:OAuth/token"),
            };
            var req = new OAuth.OAuthRequest
            {
                Type = OAuth.OAuthRequestType.AccessToken,
                Token = requestToken.Key,
                TokenSecret = requestToken.Secret,
                Verifier = verifier,
            };
            Sign(msg, req);
            var response = await Query(msg);
            return GetToken(response);
        }

        private void Sign(HttpRequestMessage msg, OAuthRequest req)
        {
            req.SignatureMethod = OAuthSignatureMethod.HmacSha1;
            req.ConsumerKey = _consumer.Key;
            req.ConsumerSecret = _consumer.Secret;
            req.RequestUrl = msg.RequestUri.GetLeftPart(UriPartial.Path);
            req.Method = msg.Method.Method;
            req.Version = "1.0";

            var args = msg.RequestUri.ParseQueryString();
            if (msg.Content != null)
            {
                var contentType = msg.Content.Headers.ContentType;
                if (contentType != null && string.Equals("application/x-www-form-urlencoded", contentType.MediaType, StringComparison.OrdinalIgnoreCase))
                {
                    var body = new FormDataCollection(msg.Content.ReadAsStringAsync().Result);
                    foreach (var item in body)
                        args.Add(item.Key, item.Value);
                }
            }

            msg.Headers.Add(HttpRequestHeader.Authorization.ToString(), req.GetAuthorizationHeader(args).TrimEnd(','));
        }

        public void Sign(HttpRequestMessage msg, Token token)
        {
            Sign(msg, new OAuthRequest
            {
                Token = token.Key,
                TokenSecret = token.Secret,
                Type = OAuth.OAuthRequestType.ProtectedResource,
            });
        }

        private static Token GetToken(string response)
        {
            var query = new FormDataCollection(response).ReadAsNameValueCollection();
            
            var key = query["oauth_token"];
            var secret = query["oauth_token_secret"];
            var callback = query["oauth_callback_confirmed"];

            if (key == null || secret == null)
                throw new OAuthException("OAuth failed with: " + WebUtility.HtmlDecode(response));

            if (callback != "true")
                throw new OAuthException("Callback unconfirmed with: " + WebUtility.HtmlDecode(response));

            return new Token { Key = key, Secret = secret };
        }

        private static async Task<string> Query(HttpRequestMessage msg)
        {
            using (var http = new HttpClient())
            {
                var resp = await http.SendAsync(msg);
                return await resp.Content.ReadAsStringAsync();
            }
        }
    }

    [Serializable]
    public class OAuthException : Exception
    {
        public OAuthException() { }
        public OAuthException(string message) : base(message) { }
        public OAuthException(string message, Exception inner) : base(message, inner) { }
        protected OAuthException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context)
            : base(info, context) { }
    }
}