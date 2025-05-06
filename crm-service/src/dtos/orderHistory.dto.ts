export class OrderHistoryDTO {
    orderId!: string;
    orderDate!: string;
    totalAmount!: number;
    status!: 'Completed' | 'Pending' | 'Cancelled';
  }  