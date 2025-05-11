import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderDTO } from '../dtos/order.dto';
import { ProductDTO } from '../dtos/product.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: OrderDTO) {
    return this.ordersService.create(dto);
  }

  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.ordersService.getStatus(id);
  }

  @Get()
  findAll(): OrderDTO[] {
    return this.ordersService.findAll();
  }
}

@Controller('products')
export class ProductsController {
  constructor(private ordersService: OrdersService) {}

  @Get(':id')
  getProduct(@Param('id') id: string): ProductDTO {
    const product = this.ordersService.getProduct(id);
    if (!product) {
        throw new NotFoundException(`Produkt mit ID ${id} nicht gefunden`);
      }
      return product;
  }
}