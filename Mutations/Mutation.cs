using Amazon.Util.Internal;
using CrowdFundingGqlAndMongoIntegration.Models;
using CrowdFundingGqlAndMongoIntegration.Queries;
using CrowdFundingGqlAndMongoIntegration.RabbitMq;
using CrowdFundingGqlAndMongoIntegration.Repository;
using HotChocolate;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.Mutations
{
    public class Mutation
    {
        private readonly UserRepository _userRepository;
        private readonly RabbitMqService _rabbitMqService;
        public Mutation(UserRepository userRepository, RabbitMqService rabbitMqService)
        {
            _userRepository = userRepository;
            _rabbitMqService = rabbitMqService ?? throw new ArgumentNullException(nameof(rabbitMqService));
        }
        public async Task<UserType> createUser(CreateUserDto user)
        {
            UserModel userModel = await _userRepository.createUser(user);
            UserType userType = new UserType()
            {
                _id = userModel._id,
                bookmarks = userModel.bookmarks,
                likedProjects = userModel.likedProjects,
                password = userModel.password,
                username = userModel.username,
                user_id = userModel.user_id,
                user_name = userModel.user_name
            };
            return userType;
        }

        public async Task<string> updatePassword(string username, string password)
        {
            return await this._userRepository.UpdatePassword(username, password);
        }

        public string login(string username, string password)
        {
            if (username != "arya@gmail.com" || password != "arya1234")
            {
                throw new GraphQLException(new Error("Wrong Credentials", "WRONG_CREDS"));
            }
            else
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("secretsecretsecret"));
                var claims = new List<Claim>
                {
                    new Claim("username", username)
                };
                var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var token = new JwtSecurityToken("http://localhost:23359/graphql", "http://localhost:23359/graphql", claims, expires: DateTime.Now.AddMinutes(90), signingCredentials: signingCredentials);
                return new JwtSecurityTokenHandler().WriteToken(token);
            }
        }

        public string rabbitmq(string username, string password)
        {
            try
            {
                var correlationId = Guid.NewGuid().ToString();
                var factory = new ConnectionFactory { HostName = "localhost" };
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();
                var properties = channel.CreateBasicProperties();
                properties.CorrelationId = correlationId;
                var myObj = new
                {
                    username,
                    password
                };
                var message = JsonConvert.SerializeObject(myObj);
                var body = Encoding.UTF8.GetBytes(message);
                channel.QueueDeclare(durable: false);
                channel.BasicPublish(exchange: string.Empty, routingKey: "hello", basicProperties: properties,
                    body: body);
                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += (model, ea) =>
                {
                    if (ea.BasicProperties.CorrelationId == correlationId)
                    {
                        var response = Encoding.UTF8.GetString(ea.Body.ToArray());
                        Debug.WriteLine(response);
                    }
                };
                return "Sent!";
            }
            catch (Exception)
            {

                throw;
            }
        }
        public async Task<string> SendingAndReceivingFromNestJs(string username, string password)
        {
            using (_rabbitMqService)
            {
                var correlationId = Guid.NewGuid().ToString();
                var requestQ = "hello";
                var responseQ = "NestResponse";
                var properties = _rabbitMqService.CreateBasicProperties();
                properties.CorrelationId = correlationId;
                properties.ReplyTo = responseQ;
                var requestData = new
                {
                    username,
                    password
                };
                var serializedData = JsonConvert.SerializeObject(requestData);
                var body = Encoding.UTF8.GetBytes(serializedData);
                Debug.WriteLine("Publishing....");
                try
                {
                    _rabbitMqService.PublishMessage(requestQ, body, properties);
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
                //_rabbitMqService.PublishMessage(requestQ, body, properties);
                Debug.WriteLine("Published....");


                Debug.WriteLine("Fetching Response...");
                return await _rabbitMqService.ReceiveResponse(responseQ, correlationId);
            }

        }


        //public string image(IFile file)
        //{
        //    Debug.WriteLine(file);
        //    return "true";
        //}
    }
}
