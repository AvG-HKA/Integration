import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // REST-Server
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
  console.log('E-Commerce-Service läuft auf http://localhost:3000');

  // RMQ-Listener (Order Status Updates)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'order.status',
      queueOptions: { durable: true },
    }
  });

  await app.startAllMicroservices();
  console.log('E-Commerce RabbitMQ-Listener läuft');
}
bootstrap();