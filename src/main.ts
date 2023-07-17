import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { TransformInterceptor } from './transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { printSchema } from 'graphql';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  const { schema } = app.get(GraphQLSchemaHost);
  writeFileSync(join(process.cwd(), '/src/schema.gql'), printSchema(schema));
}
bootstrap();
