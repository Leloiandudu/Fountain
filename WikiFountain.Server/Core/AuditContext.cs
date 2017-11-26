using System.Net;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace WikiFountain.Server.Core
{
    public class AuditContext
    {
        public Models.OperationType? Operation { get; set; }
    }

    class AuditOperationAttribute : UnityActionFilterAttribute
    {
        public AuditOperationAttribute(Models.OperationType operation) : base(typeof(Filter))
        {
            Operation = operation;
        }

        public Models.OperationType Operation { get; private set; }

        class Filter : UnityActionFilter
        {
            private readonly AuditContext _auditContext;
            private readonly Identity _identity;

            public Filter(AuditContext auditContext, Identity identity)
            {
                _auditContext = auditContext;
                _identity = identity;
            }

            public override void OnActionExecuting(HttpActionContext actionContext, UnityActionFilterAttribute attribute)
            {
                if (_identity.GetUserInfo() == null)
                    throw new HttpResponseException(HttpStatusCode.Unauthorized);

                _auditContext.Operation = ((AuditOperationAttribute)attribute).Operation;
            }
        }
    }
}
