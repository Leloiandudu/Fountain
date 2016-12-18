using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace WikiFountain.Server.Core
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
                return Unauthorized();
            }
        }

        protected HttpResponseMessage Ok()
        {
            return Request.CreateResponse();
        }

        protected HttpResponseMessage Ok<T>(T value)
        {
            return Request.CreateResponse(HttpStatusCode.OK, value);
        }

        protected HttpResponseMessage NotFound()
        {
            return Request.CreateResponse(HttpStatusCode.NotFound);
        }

        protected HttpResponseMessage Unauthorized()
        {
            return Request.CreateResponse(HttpStatusCode.Unauthorized);
        }

        protected HttpResponseMessage Forbidden()
        {
            return Request.CreateResponse(HttpStatusCode.Forbidden);
        }
    }
}
