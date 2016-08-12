using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NHibernate.Mapping.ByCode;
using NHibernate.Mapping.ByCode.Conformist;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class UserIdentity
    {
        public Guid Id { get; set; }
        public string UserInfo { get; set; }
        public byte[] Token { get; set; }
    }

    public class UserIdentityMapping : ClassMapping<UserIdentity>
    {
        public UserIdentityMapping()
        {
            Id(_ => _.Id, id => id.Generator(Generators.Assigned));
            Property(_ => _.UserInfo, p => p.Length(65536));
        }
    }
}