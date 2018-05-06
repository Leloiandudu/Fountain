using System;

namespace WikiFountain.Server.Models
{
    public class UserInfo
    {
        public UserInfo()
        {
            SysopWikis = new string[0];
        }

        public string Username { get; set; }
        public int EditCount { get; set; }
        public DateTime? Registered { get; set; }
        public bool Confirmed_email { get; set; }
        public bool Blocked { get; set; }
        public string[] Groups { get; set; }
        public string[] Rights { get; set; }
        public string[] Grants { get; set; }

        public string[] SysopWikis { get; set; }
    }
}
