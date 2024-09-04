import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: false,
  });
  app.use("/static", express.static(join(__dirname, "..", "public/static/")));
  await app.listen(5555);
}
bootstrap();


