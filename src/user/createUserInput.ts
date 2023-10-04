/* eslint-disable prettier/prettier */

import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsNotEmpty()
  user_name: string;

  @Field()
  @IsEmail()
  username: string;

  @Field()
  @MinLength(7)
  password: string;
}
