using CrowdFundingGqlAndMongoIntegration.Controllers;
using CrowdFundingGqlAndMongoIntegration.Models;
using CrowdFundingGqlAndMongoIntegration.Mutations;
using CrowdFundingGqlAndMongoIntegration.Queries;
using CrowdFundingGqlAndMongoIntegration.RabbitMq;
using CrowdFundingGqlAndMongoIntegration.Repository;
using CrowdFundingGqlAndMongoIntegration.Subscriptions;
using HotChocolate.Types;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.Configure<MongoDbSettings>(Configuration.GetSection("MongoDb"));
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:3000")
                               .AllowAnyOrigin()
                               .AllowAnyHeader()
                               .AllowAnyMethod();
                    });
            });
            services.Configure<MailSettings>(Configuration.GetSection("Credentials"));

            services.AddHttpContextAccessor();
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateAudience = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ValidAudience = "http://localhost:5000/graphql",
                    ValidIssuer = "http://localhost:5000/graphql",
                    RequireSignedTokens = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("secretsecretsecret"))
                };
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
            });
            services.AddScoped<Mutation>();
            services.AddScoped<RabbitMqService>();
            services.AddSingleton<UserRepository>();
            services.AddSingleton<ProjectRepository>();
            services.AddSingleton<MessageRepository>();
            services.AddScoped<HandleRmq>();
            services.AddGraphQLServer()
                .AddQueryType<Query>()
            .AddMutationType<Mutation>()
            .AddSubscriptionType<Subscription>()
            .AddInMemorySubscriptions();
            services.AddControllers();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.Use((context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    var allowedOrigins = new[] { "http://localhost:3000" };
                    var origin = context.Request.Headers["Origin"].ToString();

                    if (allowedOrigins.Contains(origin))
                    {
                        context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
                        // Note: Add any other necessary CORS headers here if needed
                    }

                    // Handle WebSocket request
                    // You might want to perform additional logic here if needed

                    return Task.CompletedTask; // Important: Return immediately for WebSocket requests
                }

                return next();
            });


            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowReactApp");
            app.UseRouting();
            app.UseWebSockets();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGraphQL();
            });
        }
    }
}
