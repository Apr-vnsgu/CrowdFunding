using CrowdFundingGqlAndMongoIntegration.Controllers;
using CrowdFundingGqlAndMongoIntegration.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var cancellationTokenSource = new CancellationTokenSource();

            // Build and run the host for your application
            var host = CreateHostBuilder(args).Build();

            // Use IServiceScopeFactory to create a scope for resolving services
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;

                // Resolve the HandleRmq class using the service provider
                var handleRmq = services.GetRequiredService<HandleRmq>();

                // Run the message consumer in a background task
                var consumerTask = Task.Run(() => handleRmq.HandleRmqMessages(cancellationTokenSource.Token));

                // Run the web host
                await host.RunAsync();

                // Stop the consumer when the host is stopped
                cancellationTokenSource.Cancel();

                // Wait for the consumer task to complete
                await consumerTask;
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
