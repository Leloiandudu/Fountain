using System;
using System.Net.Http.Formatting;
using System.Web.Http;
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
                name: "editathons",
                routeTemplate: "api/editathons/{code}",
                defaults: new { controller = "Editathons", code = RouteParameter.Optional, action = "get" }
            );

            config.Routes.MapHttpRoute(
                name: "editathons-addarticle",
                routeTemplate: "api/editathons/{code}/article",
                defaults: new { controller = "Editathons", action = "AddArticle" }
            );

            config.Routes.MapHttpRoute(
                name: "editathons-setmark",
                routeTemplate: "api/editathons/{code}/mark",
                defaults: new { controller = "Editathons", action = "SetMark" }
            );

            config.Routes.MapHttpRoute(
                name: "editathons-default",
                routeTemplate: "api/editathons/{code}/{action}",
                defaults: new { controller = "Editathons" }
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
        }
    }
}
