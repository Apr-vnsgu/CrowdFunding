/* eslint-disable prettier/prettier */

import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  user_name: string;

  @Field()
  username: string;

  @Field()
  password: string;
}
