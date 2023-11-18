import { Module, forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ProjectModule } from 'src/project/project.module';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { RabbitMQPublisherService } from 'src/rabbitmq/rabbitmq.publisher.service';

@Module({
  imports: [forwardRef(() => ProjectModule), TypeOrmModule.forFeature([User])],
  providers: [
    UserResolver,
    UserService,
    RabbitmqService,
    RabbitMQPublisherService,
  ],
  exports: [UserService],
})
export class UserModule {
  constructor(private readonly rabbitmq: RabbitmqService) {
    rabbitmq.handleRequests();
  }
}
