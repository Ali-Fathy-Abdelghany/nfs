using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using NFS.Chat.Repositories;

namespace NFS.Chat.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddChatServices(this IServiceCollection services, IConfigurationSection mongoSection)
        {
            // Register chat repository (placeholder implementation)
            // Register MongoDB client and database
            services.AddSingleton<IMongoClient>(sp =>
                new MongoClient(mongoSection.GetValue<string>("ConnectionString")));
            services.AddSingleton(sp =>
                sp.GetRequiredService<IMongoClient>().GetDatabase(mongoSection.GetValue<string>("Database")));
            // Register chat repository
            services.AddSingleton<IChatRepository, ChatRepository>();
            services.AddSingleton<NFS.Application.Interfaces.Repositories.ITherapistReviewRepository, TherapistReviewRepository>();
            services.AddSignalR();
            // MongoDB configuration can be applied here using mongoSection if needed.
            return services;
        }
    }
}
