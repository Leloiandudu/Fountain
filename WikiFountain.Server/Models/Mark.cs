using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NHibernate.Mapping.ByCode.Conformist;

namespace WikiFountain.Server.Models
{
    [Persistent, Auditable]
    public class Mark
    {
        public long Id { get; set; }
        public Article Article { get; set; }
        public string User { get; set; }
        public JObject Marks { get; set; }
        public string Comment { get; set; }
    }

    public class MarkConfig : Dictionary<string, IMarkConfigPart>
    {
        public static MarkConfig ReadFrom(JObject marks)
        {
            return marks.ToObject<MarkConfig>(new JsonSerializer
            {
                Converters = { new MarkPartConverter() },
            });
        }

        public IDictionary<string, MarkPartValue> GetValues(JObject mark)
        {
            var result = new Dictionary<string, MarkPartValue>();
            GetValues(this, mark, result);
            return result;
        }

        private static void GetValues(IDictionary<string, IMarkConfigPart> config, JObject mark, IDictionary<string, MarkPartValue> to)
        {
            foreach (var item in config)
            {
                var value = mark.Value<JValue>(item.Key);
                if (value == null) continue;

                var res = item.Value.GetMark(value);
                if (res != null)
                {
                    var part = res.Value;
                    to.Add(item.Key, part.Value);
                    GetValues(part.Parts, mark, to);
                }
            }
        }
    }

    public class MarkMapping : ClassMapping<Mark>
    {
        public MarkMapping()
        {
            ManyToOne(_ => _.Article, m => m.UniqueKey("MarkForArticle"));
            Property(_ => _.User, p => p.UniqueKey("MarkForArticle"));
        }
    }

    public interface IMarkConfigPart
    {
        string Title { get; }
        string Description { get; }

        MarkPart? GetMark(JValue value);
    }

    public struct MarkPartValue
    {
        public string Title { get; set; }
        public decimal Value { get; set; }
    }

    public struct MarkPart
    {
        public MarkPart(string title, decimal value) : this()
        {
            Value = new MarkPartValue
            {
                Title = title,
                Value = value,
            };
            _parts = new MarkConfig();
        }

        public MarkPart(string title, decimal value, MarkConfig parts)
            : this(title, value)
        {
            _parts = parts;
        }

        public MarkPartValue Value { get; set; }

        private MarkConfig _parts;
        public MarkConfig Parts
        {
            get { return _parts ?? new MarkConfig(); }
            set
            {
                if (value == null) throw new ArgumentNullException("value");
                _parts = value;
            }
        }
    }
    
    class RadioMark : IMarkConfigPart
    {
        public RadioMark()
        {
            Parts = new List<Part>();
        }

        public string Title { get; set; }
        public string Description { get; set; }

        [JsonProperty("values")]
        public IList<Part> Parts { get; private set; }

        public MarkPart? GetMark(JValue value)
        {
            int index;

            if (value.Type == JTokenType.Integer)
                index = value.Value<int>(); 
            else if (value.Type == JTokenType.Boolean) // backwards compatibily
                index = value.Value<bool>() ? 1 : 0;
            else
                return null;

            if (index < 0 || index >= Parts.Count)
                return null;

            var part = Parts[index];
            return new MarkPart(part.Description ?? part.Title, part.Value, part.Children);
        }

        public class Part
        {
            public Part()
            {
                Children = new MarkConfig();
            }

            public string Title { get; set; }
            public string Description { get; set; }
            public decimal Value { get; set; }
            public MarkConfig Children { get; private set; }
        }
    }

    class CheckMark : IMarkConfigPart
    {
        public CheckMark()
        {
            Children = new MarkConfig();
        }

        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Value { get; set; }
        public MarkConfig Children { get; private set; }

        public MarkPart? GetMark(JValue value)
        {
            if (value.Type != JTokenType.Boolean)
                return null;

            if (!value.Value<bool>())
                return null;

            return new MarkPart(Title ?? Description, Value, Children);
        }
    }

    class IntMark : IMarkConfigPart
    {
        public string Title { get; set; }
        public string Description { get; set; }

        public MarkPart? GetMark(JValue value)
        {
            if (value.Type != JTokenType.Integer)
                return null;

            return new MarkPart(Title ?? Description, value.Value<int>());
        }
    }

    class MarkPartConverter : JsonConverter
    {
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var token = JToken.ReadFrom(reader);
            var type = GetType(token.Value<string>("type"));

            return serializer.Deserialize(token.CreateReader(), type ?? objectType);
        }

        private static Type GetType(string type)
        {
            return type == "radio" ? typeof(RadioMark)
                : type == "check" ? typeof(CheckMark)
                : type == "int" ? typeof(IntMark)
                : null;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(IMarkConfigPart);
        }
    }
}
