using System.Web;
using Microsoft.Practices.Unity;
using Newtonsoft.Json;
using WikiFountain.Server.Core;

namespace WikiFountain.Server
{
    public class Bootstrapper
    {
        private static readonly IUnityContainer Container = new UnityContainer();

        public static IUnityContainer Init()
        {
            return Container
                .RegisterInstance(new OAuthConsumer(ReadToken()))
                .RegisterType<HttpContextBase>(new PerResolveLifetimeManager(), new InjectionFactory(c => new HttpContextWrapper(HttpContext.Current)))
                .RegisterInstance(MappingConfig.CreateSessionFactory())
                .RegisterType<NHibernate.ISession>(new PerResolveLifetimeManager(), new InjectionFactory(c =>
                {
                    var session = c.Resolve<NHibernate.ISessionFactory>().OpenSession();
                    session.BeginTransaction();
                    DbSessionModule.Register(session);
                    return session;
                }));
        }

        private static OAuthConsumer.Token ReadToken()
        {
            return JsonConvert.DeserializeObject<OAuthConsumer.Token>(System.IO.File.ReadAllText(
                System.IO.Path.Combine(HttpRuntime.AppDomainAppPath, "token")
            ));
        }
    }
}
