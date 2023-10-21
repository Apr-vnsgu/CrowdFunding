using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace CrowdFundingGqlAndMongoIntegration.Models
{
    public class UserModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string user_id { get; set; }
        public string user_name { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public IEnumerable<string> bookmarks { get; set; }
        public IEnumerable<string> likedProjects { get; set; }

    }
}
