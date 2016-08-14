using System.Web.Mvc;
using System.Web.Routing;

namespace WikiFountain.Server
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("api/{*pathInfo}");

            routes.MapRoute(
                name: "login",
                url: "login",
                defaults: new { controller = "Login", action = "Login" }
            );

            routes.MapRoute(
                name: "logout",
                url: "logout",
                defaults: new { controller = "Login", action = "Logout" }
            );

            routes.MapRoute(
                name: "callback",
                url: "callback",
                defaults: new { controller = "Login", action = "Callback" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{*path}",
                defaults: new { controller = "Home", action = "Index", path = UrlParameter.Optional }
            );
        }
    }
}
