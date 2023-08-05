/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Projects')
export class ProjectType {
  @Field(() => ID)
  project_id: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  project_name: string;

  @Field(() => Number)
  target_amount: number;

  @Field(() => Number, { nullable: true })
  pledge_amount: number;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String)
  end_date: string;

  @Field()
  image: string;

  @Field(() => [String], { nullable: true })
  comments: string[];

  @Field(() => String)
  catagory: string;

  @Field(() => Number, { nullable: true })
  likes: number;

  @Field(() => Number, { nullable: true })
  pledges: number;
}
