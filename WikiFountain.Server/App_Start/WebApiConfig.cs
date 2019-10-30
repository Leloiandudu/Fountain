using System;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Filters;
using System.Web.Http.ModelBinding;
using System.Web.Http.Routing;
using Microsoft.Practices.Unity;
using Microsoft.Practices.Unity.WebApi;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace WikiFountain.Server
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "editathons-new",
                routeTemplate: "api/editathons/new",
                defaults: new { controller = "Editathons", action = "create" }
            );

            config.Routes.MapHttpRoute(
                name: "editathons-all",
                routeTemplate: "api/editathons",
                defaults: new { controller = "Editathons", action = "GetAll" }
            );

            config.Routes.MapHttpRoute(
                name: "editathons-check-exists",
                routeTemplate: "api/editathons/exists",
                defaults: new { controller = "Editathons", action = "CheckExists" }
            );

            config.Routes.MapHttpRoute(
                name: "editathons",
                routeTemplate: "api/editathons/{code}/{action}",
                defaults: new { controller = "Editathons", action = "Get" },
                constraints: new { httpMethod = new HttpMethodConstraint(HttpMethod.Get, HttpMethod.Post) }
            );

            config.Routes.MapHttpRoute(
                name: "editathons-delete",
                routeTemplate: "api/editathons/{code}",
                defaults: new { controller = "Editathons" },
                constraints: new { httpMethod = new HttpMethodConstraint(HttpMethod.Delete) }
            );

            config.Routes.MapHttpRoute(
                name: "api-default",
                routeTemplate: "api/{controller}/{action}"
            );

            config.Formatters.JsonFormatter.MediaTypeMappings.Add(
                new RequestHeaderMapping("Accept", "text/html", StringComparison.OrdinalIgnoreCase, true, "application/json"));

            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            config.Formatters.JsonFormatter.UseDataContractJsonSerializer = false;
            JsonConvert.DefaultSettings = () => new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
            };

            GlobalConfiguration.Configuration.DependencyResolver = new UnityHierarchicalDependencyResolver(Bootstrapper.Init(() => new HierarchicalLifetimeManager()));
            GlobalConfiguration.Configuration.Services.Insert(typeof(ModelBinderProvider), 0, new UnityModelBinderProvider());
            GlobalConfiguration.Configuration.Services.Add(typeof(IFilterProvider), new UnityActionFilterProvider());
        }
    }
}
