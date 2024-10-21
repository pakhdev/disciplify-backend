import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT;
  if (process.env.ENABLE_CORS.toLowerCase() === 'true')
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(port, () => console.log(`Disciplify API. Port: ${port}`));
}

bootstrap();
