namespace CrowdFundingGqlAndMongoIntegration.Dtos
{
    public class CreateMessageDto
    {
        public string senderId { get; set; }
        public string receiverId { get; set; }
        public string content { get; set; }
    }
}
