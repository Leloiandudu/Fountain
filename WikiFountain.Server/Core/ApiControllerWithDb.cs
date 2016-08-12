using System.Web.Http;
using Microsoft.Practices.Unity;
using NHibernate;

namespace WikiFountain.Server.Core
{
    public class ApiControllerWithDb : ApiController
    {
        [Dependency]
        protected ISession Session { get; set; }
    }
}
