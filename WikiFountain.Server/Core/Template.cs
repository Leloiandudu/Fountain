using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace WikiFountain.Server.Core
{
    public class Template
    {
        private static readonly Regex TokenRegex = new Regex(@"({{|\||}}|\[\[|\]\])"); // TODO: template args
        private static readonly Regex ArgRegex = new Regex(@"^([\s\w]+)=(.*)$", RegexOptions.Singleline);

        public Template()
        {
            Args = new List<Argument>();
        }

        public static Template Parse(string wiki)
        {
            return Parse(wiki, true);
        }

        public static Template ParseAt(string wiki, int index)
        {
            return Parse(wiki.Substring(index), false);
        }

        private static Template Parse(string wiki, bool strict)
        {
            wiki = wiki.Trim();

            if (!wiki.StartsWith("{{") || (strict && !wiki.EndsWith("}}")))
                throw new FormatException("Template should be surrounded by {{}}.");

            var parts = TokenRegex.Split(wiki);

            var template = new Template();

            var level = 0;
            var str = "";

            foreach (var part in parts.Where(x => x != "").Skip(1))
            {
                if (level < 0)
                {
                    if (strict)
                        throw new FormatException("Unexpected text after template end.");
                    else
                        break;
                }

                if ((part == "|" || part == "}}") && level == 0)
                {
                    if (template.Name == null)
                        template.Name = str;
                    else
                    {
                        var match = ArgRegex.Match(str);
                        var arg = match.Success
                            ? new Argument { Name = match.Groups[1].Value, Value = match.Groups[2].Value }
                            : new Argument { Value = str };

                        template.Args.Add(arg);
                    }

                    str = "";
                }
                else
                {
                    str += part;
                }

                if (part == "{{" || part == "[[")
                {
                    level++;
                }
                else if (part == "}}" || part == "]]")
                {
                    level--;
                }
                else
                {
                    // System.Diagnostics.Debug.WriteLine("{0}: {1}", level, part);
                }
            }

            if (level >= 0)
                throw new FormatException("Template end not found.");

            return template;
        }

        public string Name { get; set; }
        public IList<Argument> Args { get; private set; }

        public class Argument
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }

        public string this[string name]
        {
            get { return FindByName(name).Select(a => a.Value).FirstOrDefault(); }
            set
            {
                var arg = FindByName(name).FirstOrDefault();
                if (arg == null)
                {
                    if (value == null)
                        return;
                    arg = new Argument { Name = name };
                    Args.Add(arg);
                }

                if (value != null)
                    arg.Value = value;
                else
                    Args.Remove(arg);
            }
        }

        private IEnumerable<Argument> FindByName(string name)
        {
            return Args.Where(a => a.Name != null && string.Equals(a.Name.Trim(), name, StringComparison.InvariantCultureIgnoreCase));
        }

        public override string ToString()
        {
            var result = "{{" + Name;

            if (Args.Count > 0)
                result += "|" + string.Join("|", Args.Select(a => a.Name == null ? a.Value : string.Format("{0}={1}", a.Name, a.Value)));

            return result + "}}";
        }
    }
}
