/* eslint-disable prettier/prettier */
import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';

@ObjectType('Users')
@InputType()
export class UserType {
  @Field(() => ID)
  user_id: string;

  @Field()
  user_name: string;
}
