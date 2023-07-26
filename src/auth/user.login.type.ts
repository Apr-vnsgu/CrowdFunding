/* eslint-disable prettier/prettier */
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
@ObjectType('loginUserObject')
export class UserLoginInput {
  @Field()
  @IsEmail()
  username: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field({ nullable: true })
  accessToken?: string;
}
