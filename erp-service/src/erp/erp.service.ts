import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { OrderStatusDTO } from '../dtos/orderStatus.dto';

@Injectable()
export class ERPService {
  private channel!: amqp.Channel;

  constructor() {
    // RabbitMQ-Verbindung
    amqp.connect('amqp://guest:guest@rabbitmq:5672').then(conn =>
      conn.createChannel().then(ch => {
        this.channel = ch;
        ch.assertQueue('order.status', { durable: true });
        ch.assertExchange('logs', 'fanout', { durable: true });
      }),
    );
  }

  async handleProcessOrder(request: {
    orderId: string;
    productId: string;
    customerId: string;
    quantity: number;
  }): Promise<OrderStatusDTO> {
    // Auf "Processed" setzen und drei Tage Lieferzeit

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const isoString = deliveryDate.toISOString();

    const reply: OrderStatusDTO = {
      orderId: request.orderId,
      status: 'Processed',
      deliveryDate: isoString,
    };

    // an E-Commerce-Service
    this.channel.sendToQueue(
      'order.status',
      Buffer.from(JSON.stringify(reply)),
    );

    // Logging
    this.channel.publish('logs', '', Buffer.from(JSON.stringify(reply)), { headers: { source: 'erp-service' }});

    // an den gRPC-Client
    return reply;
  }
}