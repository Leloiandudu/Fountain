using System;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;

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
            return GetSiteRoot();
        }

        public static string GetSiteRoot(this HttpControllerContext ctx)
        {
            return GetSiteRoot();
        }

        private static string GetSiteRoot()
        {
            return System.Web.Hosting.HostingEnvironment.ApplicationVirtualPath.TrimEnd('/');
        }

        public static string ResolveUrl(this HttpControllerContext ctx, string url)
        {
            if (!url.StartsWith("~"))
                throw new ArgumentException();
            url = url.Substring(1);

            var uri = new UriBuilder(GetRequestUri(ctx.Request).GetLeftPart(UriPartial.Authority));
            uri.Path = GetSiteRoot() + url;

            return uri.Uri.AbsoluteUri;
        }

        private static Uri GetRequestUri(HttpRequestMessage req)
        {
            if (!req.Headers.TryGetValues("X-Forwarded-Host", out var host))
                return req.RequestUri;

            if (!req.Headers.TryGetValues("X-Forwarded-Proto", out var protos))
                req.Headers.TryGetValues("X-Forwarded-Scheme", out protos);

            var proto = protos?.FirstOrDefault() ?? "http";

            return new Uri(new Uri($"{proto}://{host.First()}"), req.RequestUri.PathAndQuery);
        }
    }
}
