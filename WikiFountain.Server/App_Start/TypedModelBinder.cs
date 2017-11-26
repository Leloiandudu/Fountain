using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace WikiFountain.Server
{
    abstract class TypedModelBinder<TValue, TModel> : IModelBinder
    where TValue : class
    {
        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            if (bindingContext.ModelType != typeof(TModel))
                return false;

            var val = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
            if (val == null)
                return false;

            var key = val.RawValue as TValue;
            if (key == null)
            {
                bindingContext.ModelState.AddModelError(bindingContext.ModelName, "Wrong value type");
                return false;
            }

            bindingContext.Model = BindModel(key, actionContext, bindingContext);
            return bindingContext.Model != null;
        }

        protected abstract TModel BindModel(TValue value, HttpActionContext actionContext, ModelBindingContext bindingContext);
    }
}
