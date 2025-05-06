import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { OrderHistoryDTO } from '../dtos/orderHistory.dto';

@Injectable()
export class CrmService implements OnModuleInit {
  private channel!: amqp.Channel;
  private histories = new Map<string, OrderHistoryDTO[]>();

  async onModuleInit() {
    // RabbitMQ
    const conn = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    this.channel = await conn.createChannel();

    // Queue und Exchange
    await this.channel.assertQueue('order.created', { durable: true });
    await this.channel.assertExchange('logs', 'fanout', { durable: true });

    // Konsumieren der Bestellungsevents
    this.channel.consume('order.created', msg => {
      if (!msg) return;
      const data: any = JSON.parse(msg.content.toString());
      const history: OrderHistoryDTO = {
        orderId: data.orderId,
        orderDate: data.orderDate,
        totalAmount: data.quantity * (data.price || 0),
        status: data.deliveryStatus,
      };
      // Historie aktualisieren
      const list = this.histories.get(data.customerId) || [];
      list.push(history);
      this.histories.set(data.customerId, list);

      // Logging
      this.channel.publish('logs', '', msg.content);

      this.channel.ack(msg);
    });
  }
}