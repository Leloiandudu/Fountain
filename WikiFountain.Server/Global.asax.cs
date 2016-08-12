using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

[assembly: PreApplicationStartMethod(typeof(WikiFountain.Server.Global), "BeforeStart")]

namespace WikiFountain.Server
{
    public class Global : HttpApplication
    {
        public static void BeforeStart()
        {
            RegisterModule(typeof(DbSessionModule));
        }

        void Application_Start(object sender, EventArgs e)
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            var resolver = new UnityResolver(Bootstrapper.Init());
            DependencyResolver.SetResolver(resolver);
            GlobalConfiguration.Configuration.DependencyResolver = resolver;
        }
    }
}
