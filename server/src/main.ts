import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { REQUEST_BODY_LIMIT } from './common/app.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
  const clientUrl = configService.get<string>('CLIENT_URL', 'http://localhost:5173');
  const clientOrigins = Array.from(new Set([
    ...clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean),
    'http://127.0.0.1:5173',
    'http://localhost:5175',
  ]));
  const port = configService.get<number>('PORT', 5000);
  app.use(json({ limit: REQUEST_BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
  app.enableCors({ origin: clientOrigins, credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(port);
}

void bootstrap();
