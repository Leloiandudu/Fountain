using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using NHibernate;
using NHibernate.Linq;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Core
{
    public class Identity
    {
        private const string EncryptionKeyCookieName = "identity";
        private const string UserIdCookieName = "user";

        private readonly HttpContextBase _context;
        private readonly OAuthConsumer _oauth;
        private readonly ISession _session;

        private OAuthConsumer.Token _token;
        private UserIdentity _user;

        public Identity(HttpContextBase context, OAuthConsumer oauth, ISession session)
        {
            _context = context;
            _oauth = oauth;
            _session = session;
        }

        public UserInfo GetUserInfo()
        {
            _user = _user ?? ReadUser();
            if (_user == null) return null;
            return _user.UserInfo;
        }

        public UserRights GetUserRights()
        {
            return new UserRights(this);
        }

        public void Sign(HttpRequestMessage msg)
        {
            _token = _token ?? ReadToken();
            if (_token == null)
                throw new AuthExpiredException();
            _oauth.Sign(msg, _token);
        }

        public void Update(OAuthConsumer.Token token, UserInfo userInfo)
        {
            using (var aes = new AesManaged())
            {
                var userId = Guid.NewGuid();
                SetEncryptionKey(aes.Key.Concat(aes.IV).ToArray());
                SetUserId(userId);

                using (var enc = aes.CreateEncryptor())
                {
                    var encryptedToken = Crypt(enc, Encoding.ASCII.GetBytes(token.Key + '@' + token.Secret));
                    SetUser(new UserIdentity
                    {
                        Id = userId,
                        Token = encryptedToken,
                        UserInfo = userInfo,
                    });
                }
            }
        }

        private OAuthConsumer.Token ReadToken()
        {
            var userId = UserId;
            var key = EncryptionKey;
            if (userId == null || key == null)
                return null;

            var identity = GetUser(userId.Value);
            if (identity == null)
                return null;

            using (var aes = new AesManaged())
            {
                var keyLen = aes.Key.Length;
                if (key.Length != keyLen + aes.IV.Length)
                    return null;

                aes.Key = key.Take(keyLen).ToArray();
                aes.IV = key.Skip(keyLen).ToArray();

                using (var dec = aes.CreateDecryptor())
                {
                    try
                    {
                        var data = Encoding.ASCII.GetString(Crypt(dec, identity.Token));
                        var parts = data.Split(new[] { '@' }, 2);
                        return new OAuthConsumer.Token
                        {
                            Key = parts[0],
                            Secret = parts[1],
                        };
                    }
                    catch
                    {
                        return null;
                    }
                }
            }
        }

        private UserIdentity ReadUser()
        {
            var userId = UserId;
            if (userId == null)
                return null;

            return GetUser(userId.Value);
        }

        public void Clear()
        {
            if (UserId.HasValue)
                ClearUser(UserId.Value);

            var path = _context.GetSiteRoot();
            foreach (var name in new[] { UserIdCookieName, EncryptionKeyCookieName })
            {
                // fix for the old behaviour when cookies were set for Path=/
                if (path != "") _context.ClearCookie(name, "/");
                _context.ClearCookie(name, path);
            }
        }

        private Guid? UserId
        {
            get
            {
                var cookie = _context.GetCookieValue(UserIdCookieName);
                if (cookie == null)
                    return null;
                Guid guid;
                if (!Guid.TryParse(cookie, out guid))
                    return null;
                return guid;
            }
        }

        private void SetUserId(Guid id)
        {
            SetSecureCookie(UserIdCookieName, id.ToString("N"));
        }

        private byte[] EncryptionKey
        {
            get
            {
                var cookie = _context.GetCookieValue(EncryptionKeyCookieName);
                if (cookie == null)
                    return null;
                return Convert.FromBase64String(cookie);
            }
        }

        private void SetEncryptionKey(byte[] value)
        {
            SetSecureCookie(EncryptionKeyCookieName, Convert.ToBase64String(value));
        }

        private void SetSecureCookie(string name, string value)
        {
            _context.SetCookie(new HttpCookie(name, value)
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.MaxValue,
                Path = _context.GetSiteRoot(),
            });
        }

        private static byte[] Crypt(ICryptoTransform transform, byte[] data)
        {
            var ms = new MemoryStream();
            using (var stream = new CryptoStream(ms, transform, CryptoStreamMode.Write))
                stream.Write(data, 0, data.Length);
            return ms.ToArray();
        }

        private UserIdentity GetUser(Guid userId)
        {
            return _session.Query<UserIdentity>().SingleOrDefault(u => u.Id == userId);
        }

        private void SetUser(UserIdentity user)
        {
            _session.SaveOrUpdate(user);
        }

        private void ClearUser(Guid userId)
        {
            var user = GetUser(userId);
            if (user != null)
                _session.Delete(user);
        }
    }
}
