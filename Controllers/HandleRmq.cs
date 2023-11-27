using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System.Threading;
using System.Text;
using Newtonsoft.Json;
using System.Diagnostics;
using System;
using CrowdFundingGqlAndMongoIntegration.Repository;

namespace CrowdFundingGqlAndMongoIntegration.Controllers
{
    class ReceivedData
    {
        public string username { get; set; }
        public string password { get; set; }
        public string correlationId { get; set; }
        public string response { get; set; }
    }
    public class HandleRmq
    {
        private readonly UserRepository _userRepository;
        public HandleRmq(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public void HandleRmqMessages(CancellationToken cancellationToken)
        {
            var factory = new ConnectionFactory() { HostName = "rabbitmq" };
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                var queuename = "NestQueue";
                channel.QueueDeclare(queue: queuename, durable: true, exclusive: false, autoDelete: false);
                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += async (model, ea) =>
                {
                    if (cancellationToken.IsCancellationRequested)
                    {
                        // Gracefully stop consuming when requested
                        return;
                    }
                    var message = Encoding.UTF8.GetString(ea.Body.ToArray());
                    var messageObj = JsonConvert.DeserializeObject<ReceivedData>(message);
                    channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                    var response = await _userRepository.UpdatePassword(messageObj.username, messageObj.password);
                    var properties = channel.CreateBasicProperties();
                    properties.CorrelationId = ea.BasicProperties.CorrelationId;
                    channel.QueueDeclare(queue: "ResponseQueue", durable: false, exclusive: false, autoDelete: false, arguments: null);
                    if (messageObj != null)
                    {
                        try
                        {

                            messageObj.correlationId = ea.BasicProperties.CorrelationId;
                            messageObj.response = response;
                            var message1 = JsonConvert.SerializeObject(messageObj);
                            Debug.WriteLine(messageObj.username);
                            var body = Encoding.UTF8.GetBytes(message1);
                            channel.BasicPublish(exchange: string.Empty, routingKey: "ResponseQueue", basicProperties: properties,
                                body: body);
                        }
                        catch (Exception)
                        {

                            throw;
                        }
                    }

                };
                channel.BasicConsume(queue: queuename, autoAck: false, consumer: consumer);

                // Wait for cancellation token to stop the consumer
                cancellationToken.WaitHandle.WaitOne();
            }
        }
    }
}
