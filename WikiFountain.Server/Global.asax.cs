using System;
using System.Linq;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

[assembly: PreApplicationStartMethod(typeof(WikiFountain.Server.Global), "BeforeStart")]

namespace WikiFountain.Server
{
    public class Global : HttpApplication
    {
        public static void BeforeStart()
        {
            ServicePointManager.ServerCertificateValidationCallback = LetsEncryptWorkaround;
            AppDomain.CurrentDomain.UnhandledException += (s, e) => Log(e.ExceptionObject.ToString());
            Microsoft.Web.Infrastructure.DynamicModuleHelper.DynamicModuleUtility.RegisterModule(typeof(DbSessionModule));
        }

        private static readonly string[] Chain = new[]
        {
            "A053375BFE84E8B748782C7CEE15827A6AF5A405",
            "933C6DDEE95C9C41A40F9F50493D82BE03AD87BF",
            "DAC9024F54D8F6DF94935FB1732638CA6AD77C13",
        };

        static bool LetsEncryptWorkaround(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
        {
            if (sslPolicyErrors == SslPolicyErrors.None)
                return true;

            if (sslPolicyErrors != SslPolicyErrors.RemoteCertificateChainErrors)
                return false;

            return chain.ChainElements.Cast<X509ChainElement>().Skip(1).Select(c => c.Certificate.GetCertHashString()).SequenceEqual(Chain);
        }

        public static void Log(string text)
        {
            System.IO.File.AppendAllText(HttpRuntime.AppDomainAppPath + "/log", text + Environment.NewLine);
        }

        void Application_Start(object sender, EventArgs e)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            MvcConfig.Register();
        }
    }
}
