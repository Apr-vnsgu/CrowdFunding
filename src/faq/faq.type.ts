/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('FAQ')
export class FAQType {
  @Field()
  id: string;

  @Field()
  project_name: string;

  @Field()
  question: string;

  @Field({nullable: true})
  answer: string;

  @Field()
  to: string;

  @Field()
  from: string;
}
