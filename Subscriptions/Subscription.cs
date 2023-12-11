using CrowdFundingGqlAndMongoIntegration.Models;
using CrowdFundingGqlAndMongoIntegration.Repository;
using HotChocolate;
using HotChocolate.Subscriptions;
using HotChocolate.Types;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.Subscriptions
{
    public class Subscription
    {
        private readonly MessageRepository _messageRepository;
        public Subscription(MessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }
        [Subscribe]
        public async Task<List<MessageModel>> MessageAction([EventMessage] string receiverId)
        {
            if (receiverId != null)
            {
                List<MessageModel> messages = await _messageRepository.getReceiverMessages(receiverId);
                return messages;
            }
            return null;
            //await topicEventSender.SendAsync("GetAllMessages", messages);
        }
        //[Subscribe]
        //public List<MessageModel> GetAllMessages([EventMessage] List<MessageModel> messages) => messages;
    }
}
