/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteProject {
  @Field()
  username: string;

  @Field()
  project_name: string;
}
