using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WikiFountain.Server.Core;

namespace WikiFountain.Server.Controllers
{
    [OutputCacheAttribute(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class HomeController : MvcControllerBase
    {
        private readonly Identity _identity;

        public HomeController(Identity identity)
        {
            _identity = identity;
        }

        public ActionResult Index(string path)
        {
            var user = _identity.GetUserInfo();
            return View(new
            {
                UrlPrefix = HttpContext.GetSiteRoot(),
                User = user == null ? null : new
                {
                    Name = user.Username,
                    user.Registered,
                },
            });
        }
    }
}
