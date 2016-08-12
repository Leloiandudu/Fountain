using System;
using System.Collections.Generic;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class Editathon
    {
        public Editathon()
        {
            Articles = new HashSet<Article>();
        }

        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime Start { get; set; }
        public DateTime Finish { get; set; }

        public ISet<Article> Articles { get; set; }
    }
}
