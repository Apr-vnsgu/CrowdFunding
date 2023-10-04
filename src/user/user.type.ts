/* eslint-disable prettier/prettier */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Users')
export class UserType {
  @Field(() => ID)
  user_id: string;

  @Field()
  user_name: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field(() => [String], { nullable: true })
  bookmarks: string[];

  @Field(() => [String], { nullable: true })
  likedProjects: [];
}
