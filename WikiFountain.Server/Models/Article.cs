using System;

namespace WikiFountain.Server.Models
{
    [Persistent]
    public class Article
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string User { get; set; }
        public DateTime DateAdded { get; set; }
    }
}
