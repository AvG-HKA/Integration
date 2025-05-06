import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  console.log('CRM-Service läuft und konsumiert order.created');
}
bootstrap();