using System;
using System.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NHibernate.SqlTypes;
using NHibernate.UserTypes;

namespace WikiFountain.Server
{
    public class JObjectType : IUserType
    {
        public new bool Equals(object x, object y)
        {
            return new JTokenEqualityComparer().Equals((JToken)x, (JToken)y);
        }

        public int GetHashCode(object x)
        {
            return x.GetHashCode();
        }

        public object NullSafeGet(IDataReader rs, string[] names, object owner)
        {
            var o = rs[names[0]];
            if (o == DBNull.Value)
                return null;
            return Parse(o);
        }

        public void NullSafeSet(IDbCommand cmd, object value, int index)
        {
            var dataParameter = ((IDataParameter)cmd.Parameters[index]);
            if (value == null)
                dataParameter.Value = DBNull.Value;
            else
                dataParameter.Value = ToString(value);
        }

        public object DeepCopy(object value)
        {
            return Parse(ToString(value));
        }

        public object Replace(object original, object target, object owner)
        {
            return Parse(Disassemble(target));
        }

        public object Assemble(object cached, object owner)
        {
            return Parse(cached);
        }

        public object Disassemble(object value)
        {
            return ToString(value);
        }

        private static JObject Parse(object value)
        {
            return JObject.Parse((string)value);
        }

        private static string ToString(object value)
        {
            return ((JToken)value).ToString(Formatting.None);
        }

        public SqlType[] SqlTypes
        {
            get { return new SqlType[] { SqlTypeFactory.GetString(int.MaxValue) }; }
        }

        public Type ReturnedType { get { return typeof(JObject); } }
        public bool IsMutable { get { return true; } }
    }
}
