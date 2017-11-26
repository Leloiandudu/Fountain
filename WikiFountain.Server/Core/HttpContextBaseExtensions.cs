using System;
using System.Linq;
using System.Web;

namespace WikiFountain.Server.Core
{
    public static class HttpContextBaseExtensions
    {
        public static HttpCookie GetCookie(this HttpContextBase ctx, string name)
        {
            if (ctx.Response.Cookies.Keys.Cast<string>().Contains(name))
                return ctx.Response.Cookies[name];
            else
                return ctx.Request.Cookies[name];
        }
        
        public static string GetCookieValue(this HttpContextBase ctx, string name)
        {
            var cookie = ctx.GetCookie(name);
            if (cookie == null)
                return null;
            return cookie.Value;
        }

        public static void SetCookie(this HttpContextBase ctx, HttpCookie cookie)
        {
            ctx.Response.Cookies.Set(cookie);
        }

        public static void ClearCookie(this HttpContextBase ctx, string name, string path)
        {
            ctx.Response.Cookies.Add(new HttpCookie(name) { Path = path, Expires = new DateTime(1970, 1, 1) });
        }

        public static string GetSiteRoot(this HttpContextBase ctx)
        {
            return HttpRuntime.AppDomainAppVirtualPath.TrimEnd('/');
        }
    }
}
