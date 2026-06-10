import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');

  // Security middleware
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('APP_URL', 'http://localhost:3000'),
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HMS e-Register API')
    .setDescription('AI Hotel Register & Police Intelligence Command Centre')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & MFA')
    .addTag('hotels', 'Hotel Management')
    .addTag('guests', 'Digital Register')
    .addTag('ocr', 'OCR Digitization')
    .addTag('watchlist', 'Blacklist & Watchlist')
    .addTag('incidents', 'Alerts & Incidents')
    .addTag('analytics', 'Reports & Analytics')
    .addTag('ai', 'AI Search & Fraud Detection')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`HMS API running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
