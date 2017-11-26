using System;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace WikiFountain.Server
{
    class UnityModelBinderProvider : ModelBinderProvider
    {
        public override IModelBinder GetBinder(HttpConfiguration configuration, Type modelType)
        {
            var attr = modelType.GetCustomAttribute<UnityModelBinderAttribute>();
            if (attr == null)
                return null;

            return new UnityModelBinder(attr.Type);
        }

        sealed class UnityModelBinder : IModelBinder
        {
            private readonly Type _type;

            public UnityModelBinder(Type type)
            {
                _type = type;
            }

            public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
            {
                var binder = (IModelBinder)actionContext.Request.GetDependencyScope().GetService(_type);
                return binder.BindModel(actionContext, bindingContext);
            }
        }
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Parameter, Inherited = true, AllowMultiple = false)]
    class UnityModelBinderAttribute : Attribute
    {
        public UnityModelBinderAttribute(Type type)
        {
            if (!typeof(IModelBinder).IsAssignableFrom(type))
                throw new ArgumentException(string.Format("`{0}` should implement IModelBinder", type));
            Type = type;
        }

        public Type Type { get; private set; }
    }
}
