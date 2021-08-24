﻿using System.Linq;
using System.Web.Mvc;
using NHibernate;
using NHibernate.Linq;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;

namespace WikiFountain.Server.Controllers
{
    [OutputCache(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class HomeController : MvcControllerBase
    {
        private readonly Identity _identity;
        private readonly ISession _session;

        public HomeController(Identity identity, ISession session)
        {
            _identity = identity;
            _session = session;
        }

        public ActionResult Index(string path)
        {
            var user = _identity.GetUserInfo();
            //var rights = _identity.GetUserRights();

            return View(new
            {
                UrlPrefix = HttpContext.GetSiteRoot(),
                User = user == null ? null : new
                {
                    Name = user.Username,
                    user.Registered,
                    //AdminWikis = rights.IsGlobalAdmin() ? (object)"*" : rights.GetAdminWikis(),
                },
            });
        }
    }
}
