using CrowdFundingGqlAndMongoIntegration.Models;
using CrowdFundingGqlAndMongoIntegration.Mutations;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Mail;
using System.Diagnostics;
using System.Net;
using HotChocolate;
using Newtonsoft.Json.Serialization;

namespace CrowdFundingGqlAndMongoIntegration.Repository
{
    public class UserRepository
    {
        private readonly IMongoCollection<UserModel> _userCollection;
        private readonly MailSettings _settings;

        public UserRepository(IOptions<MongoDbSettings> mongodbSettings, IOptions<MailSettings> settings)
        {
            MongoClient client = new MongoClient(mongodbSettings.Value.ConnectionString);
            IMongoDatabase database = client.GetDatabase(mongodbSettings.Value.DatabaseName);
            _userCollection = database.GetCollection<UserModel>(mongodbSettings.Value.UserCollectionName);
            _settings = settings.Value;
        }

        public async Task<string> UpdatePassword(string username, string newPassword)
        {
            FilterDefinition<UserModel> filter = Builders<UserModel>.Filter.Eq("username", username);
            var user = await _userCollection.Find(filter).SingleOrDefaultAsync();
            if (user != null)
            {
                UpdateDefinition<UserModel> update = Builders<UserModel>.Update.Set<string>("password", newPassword);
                await _userCollection.FindOneAndUpdateAsync(filter, update);
                return "Password Updated Successfully!";
            }
            else
            {
                return "User Not Found!";

            }
        }

        public async Task<List<UserModel>> getUsers()
        {
            return await _userCollection.Find(new BsonDocument()).ToListAsync();
        }

        public async Task<UserModel> createUser(CreateUserDto user)
        {
            UserModel userModel = new UserModel()
            {
                user_id = Guid.NewGuid().ToString(),
                user_name = user.user_name,
                username = user.username,
                bookmarks = new List<string>(),
                likedProjects = new List<string>(),
                password = user.password,
            };

            try
            {
                await _userCollection.InsertOneAsync(userModel);
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(_settings.username, _settings.password),
                    EnableSsl = true
                };
                var mailMessage = new MailMessage()
                {
                    From = new MailAddress(_settings.username),
                    Subject = "Registered Successfully To CrowdFunding!",
                    IsBodyHtml = true,
                    Body = @$"
                             <html>
                  <head>
                    <style>
                      body {{
                        font-family: Arial, sans-serif;
                      }}
                      h1 {{
                        color: white;
                      }}
                      .container {{
                        width: 500px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #F0EB8D;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }}
                    .container2 {{
                        width: 500px;
                        margin: 0 auto;
                        opacity: 100%;
                        padding: 20px;
                        background-color: #8F43EE;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      }}
                    </style>
                  </head>
                  <body>
                    <div class=""container2"">
                      <h1>Welcome {user.user_name} To CrowdFunding!</h1>
                    </div>
                    <div class=""container"">
                      <p>
                        <b>
                            Thank you for joining our community. <br/> We are excited to have you on board!<br/>
                            Your Email is: {user.username}<br/>
                            Your Password is: {user.password}
                        </b>
                      </p>
                      <p>
                        If you have any questions, feel free to reach out to us @aryarana.mscit20@vnsgu.ac.in
                      </p>
                   </div>
                  </body>
                </html>
                        ",
                };
                mailMessage.To.Add(user.username);
                smtpClient.Send(mailMessage);
                return userModel;
            }
            catch (Exception)
            {
                throw new GraphQLException(new Error("User Already Exists", "DUP_KEY_ERR"));
            }

        }
    }
}
