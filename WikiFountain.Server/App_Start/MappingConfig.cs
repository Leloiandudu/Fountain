using System;
using System.Linq;
using System.Reflection;
using NHibernate;
using NHibernate.Cfg;
using NHibernate.Cfg.MappingSchema;
using NHibernate.Dialect;
using NHibernate.Driver;
using NHibernate.Mapping.ByCode;
using NHibernate.Tool.hbm2ddl;
using NHibernate.Type;

namespace WikiFountain.Server
{
    public static class MappingConfig
    {
        public static ISessionFactory CreateSessionFactory()
        {
            var nhConf = new Configuration()
                .DataBaseIntegration(db =>
                {
                    db.ConnectionStringName = "db";
                    db.Dialect<MySQL55InnoDBDialect>();
                    db.Driver<MySqlDataDriver>();
                    db.BatchSize = 500;
                });

            nhConf.AddMapping(ImplicitMapping());

            //new SchemaExport(nhConf).Execute(Log, true, false);
            //new SchemaUpdate(nhConf).Execute(Log, true);

            return nhConf.BuildSessionFactory();
        }

        private static void Log(string message)
        {
            System.Diagnostics.Debug.Print(message);
        }

        private static HbmMapping ImplicitMapping()
        {
            var mapper = new ConventionModelMapper();

            mapper.IsEntity((t, d) => IsEntity(t));
            mapper.IsRootEntity((t, declared) => IsEntity(t) && !IsEntity(t.BaseType));

            mapper.IsPersistentProperty((mi, d) =>
            {
                if (mi.MemberType != MemberTypes.Property)
                    return false;
                var pi = (PropertyInfo)mi;
                return pi.CanRead && pi.CanWrite;
            });

            mapper.BeforeMapProperty += (model, member, prop) =>
            {
                if (member.LocalMember.GetPropertyOrFieldType() == typeof(DateTime))
                    prop.Type<UtcDateTimeType>();
            };

            mapper.BeforeMapSet += (model, member, prop) =>
            {
                prop.Key(k => k.Column(member.GetContainerEntity(model).Name + "Id"));
                prop.Cascade(Cascade.All);
            };

            mapper.BeforeMapClass += (model, type, cls) =>
            {
                cls.Id(id =>
                {
                    id.Column("Id");
                    id.Generator(Generators.HighLow, g => g.Params(new { max_lo = 100 }));
                });
                cls.Table(type.Name);
                cls.Lazy(false);
            };

            // add conformist mappings
            mapper.AddMappings(Assembly.GetAssembly(typeof(PersistentAttribute)).GetExportedTypes());

            // apply above conventions
            return mapper.CompileMappingFor(typeof(PersistentAttribute).Assembly.GetExportedTypes().Where(IsEntity));
        }

        private static bool IsEntity(Type t)
        {
            return !t.IsAbstract && t.GetCustomAttribute<PersistentAttribute>(true) != null;
        }
    }

    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class PersistentAttribute : Attribute
    {
    }
}
