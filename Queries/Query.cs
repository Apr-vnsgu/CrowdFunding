using CrowdFundingGqlAndMongoIntegration.Models;
using CrowdFundingGqlAndMongoIntegration.Repository;
using HotChocolate.AspNetCore.Authorization;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CrowdFundingGqlAndMongoIntegration.Queries
{
    public class Query
    {
        private readonly UserRepository _userRepository;
        private readonly ProjectRepository _projectRepository;
        public Query(UserRepository userRepository, ProjectRepository projectRepository)
        {
            _userRepository = userRepository;
            _projectRepository = projectRepository;
        }

        public async Task<List<UserType>> getUsers()
        {
            List<UserModel> users = await _userRepository.getUsers();
            List<UserType> userTypes = new List<UserType>();
            foreach (UserModel user in users)
            {
                userTypes.Add(new UserType()
                {
                    _id = user._id,
                    user_id = user.user_id,
                    bookmarks = user.bookmarks,
                    likedProjects = user.likedProjects,
                    password = user.password,
                    username = user.username,
                    user_name = user.user_name,
                });
            }
            return userTypes;
        }

        [Authorize]
        public async Task<List<ProjectType>> getProjects()
        {
            List<ProjectModel> projects = await _projectRepository.getProjects();
            List<ProjectType> projectTypes = new List<ProjectType>();
            foreach (ProjectModel project in projects)
            {
                projectTypes.Add(new ProjectType()
                {
                    _id = project._id,
                    project_id = project.project_id,
                    catagory = project.catagory,
                    comments = project.comments,
                    description = project.description,
                    end_date = project.end_date,
                    image = project.image,
                    likes = project.likes,
                    pledges = project.pledges,
                    pledge_amount = project.pledge_amount,
                    project_name = project.project_name,
                    target_amount = project.target_amount,
                    username = project.username
                });
            }
            return projectTypes;
        }
    }
}
