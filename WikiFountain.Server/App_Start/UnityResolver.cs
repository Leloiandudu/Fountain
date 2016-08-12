using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Microsoft.Practices.Unity;

namespace WikiFountain.Server
{
    class UnityResolver : IDependencyResolver, System.Web.Http.Dependencies.IDependencyResolver
    {
        private readonly IUnityContainer _container;
        public UnityResolver(IUnityContainer container)
        {
            _container = container;
        }

        public object GetService(Type serviceType)
        {
            if (typeof(IController).IsAssignableFrom(serviceType))
                return _container.Resolve(serviceType);

            try
            {
                return _container.Resolve(serviceType);
            }
            catch (ResolutionFailedException)
            {
                return null;
            }
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return _container.ResolveAll(serviceType);
        }

        public System.Web.Http.Dependencies.IDependencyScope BeginScope()
        {
            return new UnityResolver(_container.CreateChildContainer());
        }

        public void Dispose()
        {
            _container.Dispose();
        }
    }
}