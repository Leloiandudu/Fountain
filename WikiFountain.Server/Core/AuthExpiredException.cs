using System;

namespace WikiFountain.Server.Core
{
    [Serializable]
    public class AuthExpiredException : Exception
    {
        public AuthExpiredException() { }
        public AuthExpiredException(string message) : base(message) { }
        public AuthExpiredException(string message, Exception inner) : base(message, inner) { }
        protected AuthExpiredException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context)
            : base(info, context) { }
    }
}
