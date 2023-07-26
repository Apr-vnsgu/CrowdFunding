import { Module, forwardRef } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { Project } from './project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from 'src/user/user.module';
import { ProjectController } from './project.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => UserModule),
    MulterModule.register({ dest: './uploads' }),
  ],
  providers: [ProjectService, ProjectResolver],
  exports: [ProjectService, ProjectModule],
  controllers: [ProjectController],
})
export class ProjectModule {}
