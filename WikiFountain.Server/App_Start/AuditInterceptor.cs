using System;
using System.Collections;
using System.Linq;
using System.Reflection;
using System.Web;
using NHibernate;
using NHibernate.Collection;
using NHibernate.Engine;
using NHibernate.Proxy;
using NHibernate.Type;
using WikiFountain.Server.Core;
using WikiFountain.Server.Models;

namespace WikiFountain.Server
{
    public class AuditInterceptor : EmptyInterceptor
    {
        private readonly AuditContext _auditContext;
        private readonly HttpContextBase _httpContext;
        private ISession _session;
        private ISessionImplementor _sessionImpl;
        private AuditLog _audit = new AuditLog();

        public AuditInterceptor(AuditContext auditContext, HttpContextBase httpContext)
        {
            _auditContext = auditContext;
            _httpContext = httpContext;
        }

        public override void SetSession(ISession session)
        {
            _session = session;
            _sessionImpl = session.GetSessionImplementation();
        }

        public override bool OnSave(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            Audit(entity, propertyNames, types, state);
            return false;
        }

        public override bool OnFlushDirty(object entity, object id, object[] currentState, object[] previousState, string[] propertyNames, IType[] types)
        {
            Audit(entity, propertyNames, types, currentState);
            return false;
        }

        public override void OnDelete(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            Audit(entity, propertyNames, types, null);
        }

        public override void OnCollectionRecreate(object collection, object key)
        {
            if (_auditContext.Operation == null)
                return;

            var col = collection as IPersistentCollection;
            if (col == null) return;
            Audit(col);
        }

        public override void OnCollectionRemove(object collection, object key)
        {
            if (_auditContext.Operation == null)
                return;

            var col = collection as IPersistentCollection;
            if (col == null) return;
            Audit(col);
        }

        public override void OnCollectionUpdate(object collection, object key)
        {
            if (_auditContext.Operation == null)
                return;

            var col = collection as IPersistentCollection;
            if (col == null) return;
            Audit(col);
        }

        public override void PostFlush(ICollection entities)
        {
            if (_auditContext.Operation == null) return;

            using (var session = _session.SessionFactory.OpenSession())
            using (var tx = session.BeginTransaction())
            {
                var user = new Identity(_httpContext, null, session).GetUserInfo();
                if (user != null)
                    _audit.User = user.Username;

                _audit.Timestamp = DateTime.UtcNow;
                _audit.Type = _auditContext.Operation.Value;
                session.Save(_audit);
                tx.Commit();
            }
        }

        private void Audit(IPersistentCollection col)
        {
            var ce = _sessionImpl.PersistenceContext.GetCollectionEntry(col);
            var entities = col.Entries(ce.CurrentPersister).Cast<object>().ToArray();

            for (var i = 0; i < entities.Length; i++)
            {
                var entity = entities[i];
                if (col.NeedsInserting(entity, i, ce.CurrentPersister.ElementType))
                    _audit.Collections.Add(AuditCollection(col, entity, true));
            }

            foreach (var entity in col.GetDeletes(ce.CurrentPersister, true))
                _audit.Collections.Add(AuditCollection(col, entity, false));
        }

        private AuditCollection AuditCollection(IPersistentCollection col, object entity, bool added)
        {
            var parentEntry = GetEntry(col.Owner);
            var entry = GetEntry(entity);
            return new AuditCollection
            {
                Key = (long)_session.GetIdentifier(entity),
                Entity = entry.EntityName,
                ParentKey = (long)_session.GetIdentifier(col.Owner),
                ParentEntity = parentEntry.EntityName,
                Collection = col.Role.Substring(parentEntry.EntityName.Length + 1),
                Added = added,
            };
        }

        private void Audit(object entity, string[] propertyNames, IType[] types, object[] newState)
        {
            if (_auditContext.Operation == null)
                return;

            if (entity.GetType().GetCustomAttribute<AuditableAttribute>(true) == null)
                return;

            var entry = GetEntry(entity);
            var oldState = entry.LoadedState;

            var indices = oldState == null
                ? Enumerable.Range(0, propertyNames.Length)
                : FindDirty(entity, newState, oldState);

            var key = (long)_session.GetIdentifier(entity);

            var records =
                from i in indices
                where ShouldLog(types[i])
                select new AuditRecord
                {
                    Key = key,
                    Entity = entry.EntityName,
                    Property = propertyNames[i],
                    OldValue = oldState == null ? null : Convert.ToString(oldState[i]),
                    NewValue = newState == null ? null : Convert.ToString(newState[i]),
                };

            foreach (var record in records)
                _audit.Records.Add(record);
        }

        private bool ShouldLog(IType type)
        {
            return !type.IsCollectionType && !type.IsEntityType;
        }

        private EntityEntry GetEntry(object entity)
        {
            var persistenceCtx = _sessionImpl.PersistenceContext;
            var proxy = entity as INHibernateProxy;

            var entry = persistenceCtx.GetEntry(entity);
            if (entry == null && proxy != null)
            {
                var obj = persistenceCtx.Unproxy(proxy);
                entry = persistenceCtx.GetEntry(obj);
            }

            return entry;
        }

        private int[] FindDirty(object entity, object[] state, object[] oldState)
        {
            var className = NHibernateProxyHelper.GuessClass(entity).FullName;
            var persister = _sessionImpl.Factory.GetEntityPersister(className);
            return persister.FindDirty(state, oldState, entity, _sessionImpl);
        }
    }

    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class AuditableAttribute : Attribute
    {
    }
}
