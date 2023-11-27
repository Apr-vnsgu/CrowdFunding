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
import { RabbitMQPublisherService } from 'src/rabbitmq/rabbitmq.publisher.service';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private userService: UserService,
    private readonly rabbitMqPublisher: RabbitMQPublisherService,
    private readonly rabbitmqreceiver: RabbitmqService,
  ) {}

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

  @Mutation(() => String, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<string> {
    const message = {
      username,
      password,
    };
    const responseFromDotNet = await this.rabbitMqPublisher.sendRequestToDotNet(
      message,
    );
    if (responseFromDotNet.response === 'Password Updated Successfully!') {
      await this.userService.emailUpdatePassword(username, password);
      return 'Password updated successfully';
    } else {
      return 'Password update failed';
    }
  }
}
