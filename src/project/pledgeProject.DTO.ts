/* eslint-disable prettier/prettier */

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PledgeAProject {
  @Field(() => String)
  username: string;

  @Field(() => Number)
  pledge_amount: number;

  @Field(() => String)
  project_name: string;
}
