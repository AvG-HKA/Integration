import { Module } from '@nestjs/common';
import { OrdersController, ProductsController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ERP_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'order',
          protoPath: path.join(process.cwd(), 'libs', 'proto', 'order.proto'),
          url: 'erp-service:50051',
        },
      },
    ]),
  ],
  controllers: [OrdersController, ProductsController],
  providers: [OrdersService],
})
export class OrdersModule {}