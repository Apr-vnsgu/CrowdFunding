﻿using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Collections.Generic;
using System;

namespace CrowdFundingGqlAndMongoIntegration.Queries
{
    public class ProjectType
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public Guid project_id { get; set; }
        public string username { get; set; }
        public string project_name { get; set; }
        public int target_amount { get; set; }
        public int pledge_amount { get; set; }
        public string description { get; set; }
        public string end_date { get; set; }
        public string image { get; set; }
        public IEnumerable<string> comments { get; set; }
        public string catagory { get; set; }
        public int likes { get; set; }
        public int pledges { get; set; }
    }
}
