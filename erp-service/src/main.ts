import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: { url: '0.0.0.0:50051', package: 'order', protoPath: path.join(process.cwd(), 'libs', 'proto', 'order.proto') }
  });
  await app.listen();
  console.log('ERP gRPC Service running on 50051');
}
bootstrap();