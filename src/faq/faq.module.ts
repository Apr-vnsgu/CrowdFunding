import { Module, forwardRef } from '@nestjs/common';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQ } from './faq.entity';
import { ProjectModule } from 'src/project/project.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FAQ]),
    forwardRef(() => ProjectModule),
    forwardRef(() => UserModule),
  ],
  providers: [FaqResolver, FaqService],
  exports: [FaqService],
})
export class FaqModule {}
