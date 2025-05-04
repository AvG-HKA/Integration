export class OrderStatusDTO {
    orderId!: string;
    status!: 'Processed' | 'Shipped' | 'Cancelled';
    deliveryDate!: string;
  }
  