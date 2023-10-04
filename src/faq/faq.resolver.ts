import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FAQType } from './faq.type';
import { FAQInput } from './faq.input';
import { FaqService } from './faq.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { FAQ } from './faq.entity';

@Resolver()
export class FaqResolver {
  constructor(private faqService: FaqService) {}
  @Query(() => String)
  async getHi() {
    return 'hi';
  }

  @Mutation(() => FAQType)
  @UseGuards(JwtAuthGuard)
  async writeAQuestion(
    @Args('writeQuestion') questionInput: FAQInput,
  ): Promise<FAQ> {
    return this.faqService.writeAQuestion(questionInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async writeAnswer(
    @Args('writeAnswer') answerInput: FAQInput,
  ): Promise<boolean> {
    return this.faqService.writeAnswer(answerInput);
  }

  @Mutation(() => Boolean)
  async deleteQuestions(@Args('project_name') project_name: string) {
    return this.faqService.deleteQuestions(project_name);
  }

  @Query(() => [FAQType])
  async getFaqs(): Promise<FAQ[]> {
    return this.faqService.getFaqs();
  }
}
