using System.Web.Http;
using Microsoft.Practices.Unity;
using NHibernate;

namespace WikiFountain.Server.Core
{
    public class ApiControllerWithDb : ApiControllerBase
    {
        [Dependency]
        protected ISession Session { get; set; }
    }
}
