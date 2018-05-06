using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WikiFountain.Server.Core
{
    public class UserRights
    {
        private readonly Identity _identity;

        public UserRights(Identity identity)
        {
            _identity = identity;
        }

        public bool IsGlobalAdmin()
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return false;

            return user.Username == "Ле Лой"
                || user.SysopWikis.Any(IsGlobalWiki);
        }

        public bool IsAdminIn(string wiki)
        {
            return IsGlobalAdmin() || GetAdminWikis().Contains(wiki);
        }

        public IEnumerable<string> GetAdminWikis()
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                return Enumerable.Empty<string>();

            return user.SysopWikis.Where(w => !IsGlobalWiki(w));
        }

        public async Task Actualize()
        {
            var user = _identity.GetUserInfo();
            if (user == null)
                throw new InvalidOperationException();

            var mw = MediaWikis.CreateMeta(_identity);
            user.SysopWikis = (await mw.GetSysopWikis(user.Username)).ToArray();
        }

        private static bool IsGlobalWiki(string w)
        {
            return w == "*" || w == "meta";
        }
    }
}