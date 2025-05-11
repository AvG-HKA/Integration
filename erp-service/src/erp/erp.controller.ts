import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderStatusDTO } from '../dtos/orderStatus.dto';
import { ERPService } from './erp.service';

interface OrderRequest {
  orderId:    string;
  productId:  string;
  customerId: string;
  quantity:   number;
}

@Controller()
export class ErpController {
  constructor(private readonly erpService: ERPService) {}

  @GrpcMethod('ERPService', 'ProcessOrder')
  async processOrder(request: OrderRequest): Promise<OrderStatusDTO> {
    return this.erpService.handleProcessOrder(request);
  }
}