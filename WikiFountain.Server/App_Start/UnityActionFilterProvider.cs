using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace WikiFountain.Server
{
    class UnityActionFilterProvider : IFilterProvider
    {
        public IEnumerable<FilterInfo> GetFilters(HttpConfiguration configuration, HttpActionDescriptor actionDescriptor)
        {
            return (
                actionDescriptor.ControllerDescriptor
                    .GetCustomAttributes<UnityActionFilterAttribute>()
                    .Select(attr => new FilterInfo(new UnityFilter(attr), FilterScope.Controller))
            ).Concat(
                actionDescriptor
                    .GetCustomAttributes<UnityActionFilterAttribute>()
                    .Select(attr => new FilterInfo(new UnityFilter(attr), FilterScope.Action))
            );
        }

        class UnityFilter : ActionFilterAttribute
        {
            private const string Key = "IUnityActionFilter";
            private readonly UnityActionFilterAttribute _attr;

            public UnityFilter(UnityActionFilterAttribute attr)
            {
                _attr = attr;
            }

            public override bool AllowMultiple
            {
                get { return _attr.GetType().GetCustomAttribute<AttributeUsageAttribute>(true).AllowMultiple; }
            }

            public override void OnActionExecuting(HttpActionContext actionContext)
            {
                var filter = (UnityActionFilter)actionContext.Request.GetDependencyScope().GetService(_attr.Type);
                actionContext.Request.Properties[Key] = filter;
                filter.OnActionExecuting(actionContext, _attr);
            }

            public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
            {
                object obj;
                if (!actionExecutedContext.Request.Properties.TryGetValue(Key, out obj))
                    return;

                var filter = obj as UnityActionFilter;
                if (filter != null)
                    filter.OnActionExecuted(actionExecutedContext, _attr);
            }
        }
    }

    abstract class UnityActionFilter
    {
        /// <summary>Occurs before the action method is invoked.</summary>
        /// <param name="actionContext">The action context.</param>
        public virtual void OnActionExecuting(HttpActionContext actionContext, UnityActionFilterAttribute attribute) { }

        /// <summary>Occurs after the action method is invoked.</summary>
        /// <param name="actionExecutedContext">The action executed context.</param>
        public virtual void OnActionExecuted(HttpActionExecutedContext actionExecutedContext, UnityActionFilterAttribute attribute) { }
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    class UnityActionFilterAttribute : Attribute
    {
        public UnityActionFilterAttribute(Type type)
        {
            if (!typeof(UnityActionFilter).IsAssignableFrom(type))
                throw new ArgumentException(string.Format("`{0}` must derive from UnityActionFilter", type));
            Type = type;
        }

        public Type Type { get; private set; }
    }
}
