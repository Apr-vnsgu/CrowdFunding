import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { ProjectModule } from './project/project.module';
import { Project } from './project/project.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `${process.env.DB_URL}`,
      synchronize: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoLoadEntities: true,
      entities: [User, Project],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      driver: ApolloDriver,
      context: ({ req }) => ({ headers: req.headers }),
    }),
    UserModule,
    AuthModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
