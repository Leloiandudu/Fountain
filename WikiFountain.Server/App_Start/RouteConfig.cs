using System.Web.Mvc;
using System.Web.Routing;
using Microsoft.Practices.Unity;

namespace WikiFountain.Server
{
    public class MvcConfig
    {
        private static void RegisterRoutes(RouteCollection routes)
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

        public static void Register()
        {
            RegisterRoutes(RouteTable.Routes);
            DependencyResolver.SetResolver(new UnityResolver(Bootstrapper.Init(() => new PerResolveLifetimeManager())));
        }
    }
}
