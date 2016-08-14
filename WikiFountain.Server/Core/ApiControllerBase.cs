using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace WikiFountain.Server.Core
{
    public class ApiControllerBase : ApiController
    {
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
    }
}
