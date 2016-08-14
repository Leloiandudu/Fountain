using System;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace WikiFountain.Server.Core
{
    /// <summary>
    /// workaround for mono
    /// </summary>
    public abstract class MvcControllerBase : Controller
    {
        protected override IActionInvoker CreateActionInvoker()
        {
            if (Type.GetType("Mono.Runtime") != null)
                return new AsyncActionInvoker();
            else
                return base.CreateActionInvoker();
        }

        class AsyncActionInvoker : ControllerActionInvoker
        {
            protected override ActionResult CreateActionResult(ControllerContext controllerContext, ActionDescriptor actionDescriptor, object actionReturnValue)
            {
                return base.CreateActionResult(controllerContext, actionDescriptor, GetReturnValue(actionReturnValue));
            }

            private static object GetReturnValue(object value)
            {
                var task = value as Task;
                if (task == null)
                    return value;

                task.Wait();

                var result = task.GetType().GetProperty("Result");
                if (result == null)
                    return null;
                else
                    return result.GetValue(task);
            }
        }
    }
}
