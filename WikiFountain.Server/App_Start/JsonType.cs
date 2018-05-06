using System;
using System.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NHibernate.SqlTypes;
using NHibernate.UserTypes;

namespace WikiFountain.Server
{
    public class JsonType<T> : IUserType
    {
        public new bool Equals(object x, object y)
        {
            if (x == null || y == null)
                return ReferenceEquals(x, y);
            return new JTokenEqualityComparer().Equals(JObject.FromObject(x), JObject.FromObject(y));
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
            if (value == null) return null;
            return Parse(ToString(value));
        }

        public object Replace(object original, object target, object owner)
        {
            return DeepCopy(original);
        }

        public object Assemble(object cached, object owner)
        {
            return Parse(cached);
        }

        public object Disassemble(object value)
        {
            return ToString(value);
        }

        private static object Parse(object obj)
        {
            var str = obj as string;

            if (string.IsNullOrWhiteSpace(str))
                return null;

            return JsonConvert.DeserializeObject<T>(str);
        }

        private static string ToString(object value)
        {
            if (value == null)
                return null;
            return JsonConvert.SerializeObject(value, Formatting.None);
        }

        public SqlType[] SqlTypes
        {
            get { return new SqlType[] { SqlTypeFactory.GetString(int.MaxValue) }; }
        }

        public Type ReturnedType { get { return typeof(T); } }
        public bool IsMutable { get { return true; } }
    }
}
