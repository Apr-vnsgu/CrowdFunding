using CrowdFundingGqlAndMongoIntegration.Models;
using CrowdFundingGqlAndMongoIntegration.Queries;
using CrowdFundingGqlAndMongoIntegration.Repository;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.Mutations
{
    public class Mutation
    {
        private readonly UserRepository _userRepository;
        public Mutation(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<UserType> createUser(CreateUserDto user)
        {
            UserModel userModel = await _userRepository.createUser(user);
            UserType userType = new UserType()
            {
                _id = userModel._id,
                bookmarks = userModel.bookmarks,
                likedProjects = userModel.likedProjects,
                password = userModel.password,
                username = userModel.username,
                user_id = userModel.user_id,
                user_name = userModel.user_name
            };
            return userType;
        }
    }
}
