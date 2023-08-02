/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FAQInput {
  @Field({ nullable: true })
  id: string;

  @Field()
  project_name: string;

  @Field({ nullable: true })
  question: string;

  @Field({ nullable: true })
  answer: string;

  @Field({ nullable: true })
  from: string;
}
