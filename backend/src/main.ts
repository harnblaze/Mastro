import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000']

  app.use(
    cors({
      origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, мобильные приложения или Postman)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Mastro API')
    .setDescription('API для системы управления записями')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Экспорт OpenAPI спецификации в JSON файл для генерации клиента
  if (process.env.NODE_ENV !== 'production') {
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`OpenAPI спецификация экспортирована в: ${outputPath}`);
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
