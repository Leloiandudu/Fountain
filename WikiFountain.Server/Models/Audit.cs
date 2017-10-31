using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace WikiFountain.Server.Models
{
    [Persistent]
    [DebuggerDisplay("{User} {Type} {Timestamp}")]
    public class AuditLog
    {
        public long Id { get; set; }
        public string User { get; set; }
        public OperationType Type { get; set; }
        public DateTime Timestamp { get; set; }
        public ISet<AuditRecord> Records { get; set; }
        public ISet<AuditCollection> Collections { get; set; }

        public AuditLog()
        {
            Timestamp = DateTime.UtcNow;
            Records = new HashSet<AuditRecord>();
            Collections = new HashSet<AuditCollection>();
        }
    }

    public enum OperationType
    {
        AddArticle,
        SetMark,
        CreateEditathon,
        RemoveArticle,
    }

    [Persistent]
    [DebuggerDisplay("{Entity} #{Key} {Property}: {OldValue} -> {NewValue}")]
    public class AuditRecord
    {
        public long Id { get; set; }
        public long Key { get; set; }
        public string Entity { get; set; }
        public string Property { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
    }

    [Persistent]
    [DebuggerDisplay("{ParentEntity} #{ParentKey} {Collection} -> {Entity} #{Key}: {Added}")]
    public class AuditCollection
    {
        public long Id { get; set; }
        public long Key { get; set; }
        public string Entity { get; set; }
        public long ParentKey { get; set; }
        public string ParentEntity { get; set; }
        public string Collection { get; set; }
        public bool Added { get; set; }
    }
}
