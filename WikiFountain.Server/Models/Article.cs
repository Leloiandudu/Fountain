using System;
using System.Collections.Generic;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class Article
    {
        public Article()
        {
            Marks = new HashSet<Mark>();
        }

        public long Id { get; set; }
        public string Name { get; set; }
        public string User { get; set; }
        public DateTime DateAdded { get; set; }
        public ISet<Mark> Marks { get; set; }
    }
}
