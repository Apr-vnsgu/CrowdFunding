using CrowdFundingGqlAndMongoIntegration.Dtos;
using CrowdFundingGqlAndMongoIntegration.Models;
using HotChocolate;
using HotChocolate.Subscriptions;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.Repository
{
    public class MessageRepository
    {
        private IMongoCollection<MessageModel> _messageCollection;
        public MessageRepository(IOptions<MongoDbSettings> mongodbSettings)
        {
            MongoClient client = new MongoClient(mongodbSettings.Value.ConnectionString);
            IMongoDatabase database = client.GetDatabase(mongodbSettings.Value.DatabaseName);
            _messageCollection = database.GetCollection<MessageModel>(mongodbSettings.Value.MessageCollectionName);
        }
        public async Task<List<MessageModel>> getAllMessages()
        {
            return await _messageCollection.Find(new BsonDocument()).ToListAsync();
        }
        public async Task<MessageModel> writeMessage(CreateMessageDto message)
        {
            MessageModel messageActual = new MessageModel()
            {
                message_id = Guid.NewGuid().ToString(),
                senderId = message.senderId,
                receiverId = message.receiverId,
                content = message.content,
                timestamp = DateTime.Now.ToString(),
                isRead = false
            };
            try
            {
                await _messageCollection.InsertOneAsync(messageActual);
                return messageActual;
            }
            catch (Exception)
            {
                throw new GraphQLException(new Error("Message Failed To Send", "MSG_SEND_FAIL"));
            }
        }

        public async Task<List<MessageModel>> getMessagesOfSenderReceiver(string sentBy, string receivedTo)
        {
            FilterDefinition<MessageModel> filter = Builders<MessageModel>.Filter.And(
                    Builders<MessageModel>.Filter.Eq(x => x.senderId, sentBy),
                    Builders<MessageModel>.Filter.Eq(x => x.receiverId, receivedTo)
                );
            List<MessageModel> readMessages = await _messageCollection.Find(filter).ToListAsync();
            return readMessages;
        }

        public async Task<bool> readReceivedMessages(string sentBy, string receivedTo)
        {
            FilterDefinition<MessageModel> filter = Builders<MessageModel>.Filter.And(
                    Builders<MessageModel>.Filter.Eq(x => x.senderId, sentBy),
                    Builders<MessageModel>.Filter.Eq(x => x.receiverId, receivedTo)
                );
            UpdateDefinition<MessageModel> update = Builders<MessageModel>.Update.Set(x => x.isRead, true);
            try
            {
                await _messageCollection.UpdateManyAsync(filter, update);
                return true;
            }
            catch (Exception)
            {
                throw new GraphQLException(new Error("Message Read Failed", "MSG_READ_FAIL"));
            }
        }

        public async Task<List<MessageModel>> getReceiverMessages(string receiverId)
        {
            FilterDefinition<MessageModel> filter = Builders<MessageModel>.Filter.Or(
                    Builders<MessageModel>.Filter.Eq(x => x.receiverId, receiverId),
                    Builders<MessageModel>.Filter.Eq(x => x.senderId, receiverId)
                );
            List<MessageModel> messages = await _messageCollection.Find(filter).ToListAsync();

            return messages;
        }
        public async Task<string> deleteMessages()
        {
            FilterDefinition<MessageModel> filter = Builders<MessageModel>.Filter.Eq(x => x.isRead, true);
            try
            {
                await _messageCollection.DeleteManyAsync(filter);
                return "deleted";
            }
            catch (Exception)
            {
                throw new GraphQLException(new Error("Messages Were Not Deleted", "MSG_DEL_FAIL"));
            }
        }
        //public async Task<List<MessageModel>> readReceivedMessages(string sentBy, string receivedTo)
        //{
        //    FilterDefinition<MessageModel> filter = Builders<MessageModel>.Filter.And(
        //            Builders<MessageModel>.Filter.Eq(x => x.senderId, sentBy),
        //            Builders<MessageModel>.Filter.Eq(x => x.receiverId, receivedTo)
        //        );
        //    UpdateDefinition<MessageModel> update = Builders<MessageModel>.Update.Set(x => x.isRead, true);
        //    try
        //    {
        //        await _messageCollection.UpdateManyAsync(filter, update);
        //        List<MessageModel> messages = await _messageCollection.Find(new BsonDocument()).ToListAsync();
        //        return messages;
        //    }
        //    catch (Exception)
        //    {
        //        throw new GraphQLException(new Error("Message Read Failed", "MSG_READ_FAIL"));
        //    }
        //}
    }
}
