namespace WikiFountain.Server.Models
{
    public class UserInfo
    {
        public string Username { get; set; }
        public int EditCount { get; set; }
        public string Registered { get; set; }
        public bool Confirmed_email { get; set; }
        public bool Blocked { get; set; }
        public string[] Groups { get; set; }
        public string[] Rights { get; set; }
        public string[] Grants { get; set; }
    }
}
