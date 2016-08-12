using System;
using System.Collections.Generic;
using System.Web;
using NHibernate;

namespace WikiFountain.Server
{
    public class DbSessionModule : IHttpModule
    {
        private static readonly string Key = typeof(DbSessionModule).FullName;

        private HttpApplication _app;

        public void Init(HttpApplication context)
        {
            _app = context;
            _app.EndRequest += OnEndRequest;
        }

        public static void Register(ISession session)
        {
            if (RegisteredSessions == null)
                RegisteredSessions = new List<ISession>();
            RegisteredSessions.Add(session);
        }

        void OnEndRequest(object sender, EventArgs e)
        {
            if (RegisteredSessions == null)
                return;
            foreach (var session in RegisteredSessions)
            {
                var status = HttpContext.Current.Response.StatusCode;
                if (status >= 200 && status <= 399)
                    session.Transaction.Commit();
                session.Transaction.Dispose();
                session.Dispose();
            }
        }

        private static IList<ISession> RegisteredSessions
        {
            get { return ((IList<ISession>)HttpContext.Current.Items[Key]); }
            set { HttpContext.Current.Items[Key] = value; }
        }

        public void Dispose()
        {
            if (_app != null)
            {
                try
                {
                    _app.EndRequest -= OnEndRequest;
                }
                catch
                {
                }
                _app = null;
            }
        }
    }
}
