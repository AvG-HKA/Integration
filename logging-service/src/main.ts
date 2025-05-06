import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  console.log('Logging-Service läuft und schreibt alle Events in interactions.log');
}
bootstrap();