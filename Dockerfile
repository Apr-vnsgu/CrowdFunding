FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
RUN apt-get update && apt-get install -y netcat
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["CrowdFundingGqlAndMongoIntegration.csproj", "."]
RUN dotnet restore "./CrowdFundingGqlAndMongoIntegration.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./CrowdFundingGqlAndMongoIntegration.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./CrowdFundingGqlAndMongoIntegration.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY wait-for-it.sh .
COPY --from=publish /app/publish .
CMD ["bash", "./wait-for-it.sh", "rabbitmq:5672", "--", "dotnet", "CrowdFundingGqlAndMongoIntegration.dll"]
