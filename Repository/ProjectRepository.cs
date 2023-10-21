using CrowdFundingGqlAndMongoIntegration.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.Repository
{
    public class ProjectRepository
    {
        private readonly IMongoCollection<ProjectModel> _projectCollection;
        public ProjectRepository(IOptions<MongoDbSettings> mongodbSettings)
        {
            MongoClient client = new MongoClient(mongodbSettings.Value.ConnectionString);
            IMongoDatabase database = client.GetDatabase(mongodbSettings.Value.DatabaseName);
            _projectCollection = database.GetCollection<ProjectModel>(mongodbSettings.Value.ProjectCollectionName);
        }

        public async Task<List<ProjectModel>> getProjects()
        {
            return await _projectCollection.Find(new BsonDocument()).ToListAsync();
        }
    }
}
