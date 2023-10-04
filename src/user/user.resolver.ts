/* eslint-disable prettier/prettier */
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserType } from './user.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/role.guard';
import { UserService } from './user.service';
import { CreateUserInput } from './createUserInput';
import { User } from './user.entity';
import { BookMark } from './bookMarkProject-DTO';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers(_, __, ___, info): Promise<User[]> {
    console.log(info.fieldNodes[0].loc.source.body);
    return this.userService.getUsers();
  }

  @Mutation(() => UserType)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.registerUser(createUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async bookMarkAProject(
    @Args('bookMark') bookMark: BookMark,
  ): Promise<boolean> {
    return await this.userService.bookMarkAProject(bookMark);
  }

  @Query(() => UserType)
  async getUser(@Args('username') username: string): Promise<User> {
    return this.userService.getUserByUsername(username);
  }
}
