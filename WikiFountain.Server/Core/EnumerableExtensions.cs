using System.Collections.Generic;
using System.Linq;

namespace WikiFountain.Server.Core
{
    static class EnumerableExtensions
    {
        public static IEnumerable<T> EmptyIfNull<T>(this IEnumerable<T> items)
        {
            return items ?? Enumerable.Empty<T>();
        }

        public static bool ReplaceKey(this IDictionary<string, string> dic, string oldKey, string newKey)
        {
            string value;
            if (!dic.TryGetValue(oldKey, out value))
                return false;

            dic.Remove(oldKey);
            dic[newKey] = value;
            return true;
        }
    }
}
