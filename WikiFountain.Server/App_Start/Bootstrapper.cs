using System;
using System.Web;
using Microsoft.Practices.Unity;
using Newtonsoft.Json;
using WikiFountain.Server.Core;

namespace WikiFountain.Server
{
    public class Bootstrapper
    {
        public static IUnityContainer Init(Func<LifetimeManager> perRequestLifetime)
        {
            return new UnityContainer()
                .RegisterType<AuditContext>(perRequestLifetime())
                .RegisterInstance(new OAuthConsumer(ReadToken()))
                .RegisterType<HttpContextBase>(perRequestLifetime(), new InjectionFactory(c => new HttpContextWrapper(HttpContext.Current)))
                .RegisterInstance(MappingConfig.CreateSessionFactory())
                .RegisterType<SessionHolder>(perRequestLifetime(), new InjectionFactory(c =>
                {
                    var session = c.Resolve<NHibernate.ISessionFactory>().OpenSession(new AuditInterceptor(c.Resolve<AuditContext>()));
                    session.BeginTransaction();
                    DbSessionModule.Register(session);
                    return new SessionHolder { Session = session };
                }))
                .RegisterType<NHibernate.ISession>(new TransientLifetimeManager(), new InjectionFactory(c => c.Resolve<SessionHolder>().Session));
        }

        // wrapping ISession to prevent Unity from disposing it
        class SessionHolder
        {
            public NHibernate.ISession Session { get; set; }
        }

        private static OAuthConsumer.Token ReadToken()
        {
            return JsonConvert.DeserializeObject<OAuthConsumer.Token>(System.IO.File.ReadAllText(
                System.IO.Path.Combine(HttpRuntime.AppDomainAppPath, "token")
            ));
        }
    }
}
