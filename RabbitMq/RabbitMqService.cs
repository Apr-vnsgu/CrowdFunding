using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.RabbitMq
{
    public class RabbitMqService : IDisposable
    {
        private IConnection _connection;
        private IModel _channel;
        private EventingBasicConsumer _consumer;

        public RabbitMqService()
        {
            var factory = new ConnectionFactory() { HostName = "rabbitmq" };
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
        }

        public void PublishMessage(string queue, byte[] body, IBasicProperties properties)
        {
            _channel.QueueDeclare(queue: queue, durable: false, exclusive: false, autoDelete: false, arguments: null);
            _channel.BasicPublish(exchange: string.Empty, routingKey: queue, basicProperties: properties, body: body);
        }

        public async Task<string> ReceiveResponse(string queue, string correlationId)
        {
            Debug.WriteLine("Receiving response from nest....");
            _channel.QueueDeclare(queue: queue, durable: false, exclusive: false, autoDelete: false, arguments: null);
            var tcs = new TaskCompletionSource<string>();
            if (_consumer == null)
            {
                _consumer = new EventingBasicConsumer(_channel);
                _consumer.Received += (model, ea) =>
                {
                    var response = Encoding.UTF8.GetString(ea.Body.ToArray());
                    Debug.WriteLine(response);
                    tcs.TrySetResult(response);
                };
                Debug.WriteLine("Consuming Queue....");
                _channel.BasicConsume(queue: queue, autoAck: true, consumer: _consumer);
                Debug.WriteLine("Consumed Queue...");
            }
            return await tcs.Task;
        }

        public IBasicProperties CreateBasicProperties()
        {
            if (_channel != null && _channel.IsOpen)
            {
                return _channel.CreateBasicProperties();
            }

            // Attempt to recreate the channel
            else if (_connection != null && _connection.IsOpen)
            {
                _channel = _connection.CreateModel();
                return _channel.CreateBasicProperties();
            }
            else
            {
                Debug.WriteLine("Connecting to rmq....");
                var factory = new ConnectionFactory() { HostName = "rabbitmq" };
                _connection = factory.CreateConnection();
                Debug.WriteLine("Connected to rmq....");
                Debug.WriteLine("Creating channel to rmq....");
                _channel = _connection.CreateModel();
                Debug.WriteLine("Created channel to rmq....");
                return _channel.CreateBasicProperties();
            }

            // Log or handle the situation when the channel or connection is closed
            //throw new InvalidOperationException("Channel or connection is closed");
        }


        public void Dispose()
        {
            //_consumer?.Dispose();

            if (_channel != null && _channel.IsOpen)
            {
                _channel.Close();
            }

            if (_connection != null && _connection.IsOpen)
            {
                _connection.Close();
            }
        }
    }
}
