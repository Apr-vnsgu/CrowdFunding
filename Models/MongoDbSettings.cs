﻿namespace CrowdFundingGqlAndMongoIntegration.Models
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
        public string UserCollectionName { get; set; }
        public string ProjectCollectionName { get; set; }
        public string MessageCollectionName { get; set; }
    }
}
