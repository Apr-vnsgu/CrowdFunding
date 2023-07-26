import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { ProjectType } from './project.type';
import { Project } from './project.entity';
import { CreateProjectInput } from './createProjectInput';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { PledgeAProject } from './pledgeProject.DTO';
import { Interval } from '@nestjs/schedule';
import { DeleteProject } from './deleteProjectInput';

@Resolver()
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [ProjectType])
  async getProjects(): Promise<Project[]> {
    return await this.projectService.getProjects();
  }

  @Mutation(() => ProjectType)
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
  ): Promise<Project> {
    return await this.projectService.createProject(createProjectInput);
  }

  @Query(() => [ProjectType])
  @UseGuards(JwtAuthGuard)
  async getAllProjectsOfAUser(
    @Args('username') username: string,
  ): Promise<Project[]> {
    return await this.projectService.getAllProjectsOfAUser(username);
  }

  @Mutation(() => ProjectType)
  @UseGuards(JwtAuthGuard)
  async pledgeAProject(
    @Args('pleadge') pledgeAProjectInput: PledgeAProject,
  ): Promise<Project> {
    return await this.projectService.pledgeAProject(pledgeAProjectInput);
  }

  @Mutation(() => Boolean)
  async DeleteProject(
    @Args('deleteProject') deleteProject: DeleteProject,
  ): Promise<boolean> {
    return await this.projectService.deleteProjectOfUser(deleteProject);
  }

  @Query(() => Boolean)
  async endTime(): Promise<any> {
    return this.projectService.endTime();
  }

  @Interval(86400000)
  handle() {
    this.endTime();
  }
}
