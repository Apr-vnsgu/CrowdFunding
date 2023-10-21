using System.Collections.Generic;
using System;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace CrowdFundingGqlAndMongoIntegration.Queries
{
    public class UserType
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
