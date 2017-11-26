using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace WikiFountain.Server
{
    public class ApiControllerBase : ApiController
    {
        public override async Task<HttpResponseMessage> ExecuteAsync(HttpControllerContext controllerContext, System.Threading.CancellationToken cancellationToken)
        {
            try
            {
                var task = base.ExecuteAsync(controllerContext, cancellationToken);
                if (Type.GetType("Mono.Runtime") != null)
                    return task.Result;
                else
                    return await task;
            }
            catch (UnauthorizedAccessException)
            {
                throw Unauthorized();
            }
        }
        
        protected static HttpResponseException NotFound()
        {
            return new HttpResponseException(HttpStatusCode.NotFound);
        }

        protected static HttpResponseException Unauthorized()
        {
            return new HttpResponseException(HttpStatusCode.Unauthorized);
        }

        protected static HttpResponseException Forbidden()
        {
            return new HttpResponseException(HttpStatusCode.Forbidden);
        }

        protected static HttpResponseException BadRequest()
        {
            return new HttpResponseException(HttpStatusCode.BadRequest);
        }
    }
}
