using CrowdFundingGqlAndMongoIntegration.Controllers;
using CrowdFundingGqlAndMongoIntegration.Mutations;
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
            var host = CreateHostBuilder(args).Build();
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var handleRmq = services.GetRequiredService<HandleRmq>();
                services.GetRequiredService<Mutation>();
                var consumerTask = Task.Run(() => handleRmq.HandleRmqMessages(cancellationTokenSource.Token));
                await host.RunAsync();
                cancellationTokenSource.Cancel();
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
