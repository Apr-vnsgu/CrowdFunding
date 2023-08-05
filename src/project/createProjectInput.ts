/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsEmail()
  username: string;

  @Field(() => String)
  project_name: string;

  @Field(() => Number)
  target_amount: number;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  end_date: string;

  @Field(() => String)
  image: string;

  @Field(() => String)
  catagory: string;
}
