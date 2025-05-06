import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';

export class OrderDTO {
  @IsOptional()
  orderId?: string;

  @IsString()
  customerId!: string;

  @IsString()
  productId!: string;

  @IsInt()
  quantity!: number;

  @IsOptional()
  orderDate?: Date;

  @IsOptional()
  @IsEnum(['Processing', 'Shipped', 'Delivered'])
  deliveryStatus?: 'Processing' | 'Shipped' | 'Delivered';

  @IsOptional()
  deliveryDate?: Date;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}