import { Module } from '@nestjs/common';
import { OrdersController, ProductsController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, ProductsController],
  providers: [OrdersService],
})
export class OrdersModule {}