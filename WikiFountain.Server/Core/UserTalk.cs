using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WikiFountain.Server.Core
{
    public class UserTalk
    {
        private const string Prefix = "User talk:";
        private static readonly Dictionary<string, string> AddOnTopCategories = new Dictionary<string, string>
        {
            { "ru", "Википедия:Участники с добавлением тем сверху" },
        };

        public static async Task<UserTalk[]> GetAsync(MediaWiki wiki, IEnumerable<string> userNames)
        {
            string category;
            if (!AddOnTopCategories.TryGetValue(wiki.Code, out category))
                return userNames.Select(u => new UserTalk(u, wiki, false)).ToArray();

            return (await wiki.GetCategories(userNames.Select(u => GetPageName(u)), category))
                .Select(x => new UserTalk(GetUserName(x.Key), wiki, x.Value.Length > 0))
                .ToArray();
        }

        private static string GetPageName(string userName)
        {
            return Prefix + userName;
        }

        private static string GetUserName(string pageName)
        {
            return pageName.StartsWith(Prefix)
                ? pageName.Substring(Prefix.Length)
                : pageName;
        }

        public string UserName { get; set; }
        private readonly MediaWiki _wiki;
        private readonly bool _addOnTop;

        public UserTalk(string userName, MediaWiki wiki, bool addOnTop)
        {
            UserName = userName;
            _wiki = wiki;
            _addOnTop = addOnTop;
        }

        public Task WriteAsync(string text, string summary)
        {
            if (_addOnTop)
                text = text.TrimEnd() + "\n\n";
            else
                text = "\n\n" + text.TrimStart();

            return _wiki.EditPage(GetPageName(UserName), text, summary, !_addOnTop);
        }
    }
}
