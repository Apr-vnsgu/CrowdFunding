/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class Comment {
  @Field()
  project_name: string;

  @Field()
  comment: string;

  @Field()
  username: string;
}
