using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Microsoft.Practices.Unity;
using Microsoft.Practices.Unity.WebApi;

[assembly: PreApplicationStartMethod(typeof(WikiFountain.Server.Global), "BeforeStart")]

namespace WikiFountain.Server
{
    public class Global : HttpApplication
    {
        public static void BeforeStart()
        {
            AppDomain.CurrentDomain.UnhandledException += (s, e) => Log(e.ExceptionObject.ToString());
            Microsoft.Web.Infrastructure.DynamicModuleHelper.DynamicModuleUtility.RegisterModule(typeof(DbSessionModule));
        }

        public static void Log(string text)
        {
            System.IO.File.AppendAllText(HttpRuntime.AppDomainAppPath + "/log", text + Environment.NewLine);
        }

        void Application_Start(object sender, EventArgs e)
        {
            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            DependencyResolver.SetResolver(new UnityResolver(Bootstrapper.Init(() => new PerResolveLifetimeManager())));
            GlobalConfiguration.Configuration.DependencyResolver = new UnityHierarchicalDependencyResolver(Bootstrapper.Init(() => new HierarchicalLifetimeManager()));
        }
    }
}
