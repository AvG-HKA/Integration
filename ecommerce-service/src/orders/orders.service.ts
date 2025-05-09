import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { OrderDTO } from '../dtos/order.dto';
import { ProductDTO } from '../dtos/product.dto';
import { v4 as uuidv4 } from 'uuid';
import * as amqp from 'amqplib';
import { Observable, lastValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface ERPService {
  processOrder(data: {
    orderId: string;
    productId: string;
    customerId: string;
    quantity: number;
  }): Observable<{
    orderId: string;
    status: string;
    deliveryDate: string;
  }>;
}

@Injectable()
export class OrdersService implements OnModuleInit{
  private products = new Map<string, ProductDTO>();
  private orders = new Map<string, OrderDTO>();
  private erpService!: ERPService;
  private channel!: amqp.Channel;

  constructor(
    @Inject('ERP_PACKAGE') private client: ClientGrpc,
  ) {
    // Test-Produkt
    this.products.set('prod-1', {
      productId: 'prod-1',
      productName: 'Demo',
      category: 'General',
      price: 9.99,
      stockQuantity: 100,
    });

    // RabbitMQ
    amqp.connect('amqp://guest:guest@rabbitmq:5672').then(conn =>
      conn.createChannel().then(ch => {
        this.channel = ch;
        ch.assertQueue('order.created', { durable: true });
        ch.assertQueue('order.status', { durable: true });
        ch.assertExchange('logs', 'fanout', { durable: true });

        // Status-Updates konsumieren
        ch.consume('order.status', msg => {
          if (!msg) return;
          const data = JSON.parse(msg.content.toString());
          const ord = this.orders.get(data.orderId);
          if (ord) {
            ord.deliveryStatus = data.status;
            ord.deliveryDate = new Date(data.deliveryDate);
          }
          // Logging
          ch.publish('logs', '', msg.content);
          ch.ack(msg);
        });
      }),
    );
  }

  onModuleInit() {
    this.erpService = this.client.getService<ERPService>('ERPService');
  }

  async create(dto: OrderDTO) {
    // Bestellung anlegen
    const id = uuidv4();
    dto.orderId = id;
    dto.orderDate = new Date();
    dto.deliveryStatus = 'Processing';

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    dto.deliveryDate = deliveryDate
    this.orders.set(id, dto);

    // CRM-Event
    this.channel.sendToQueue('order.created', Buffer.from(JSON.stringify(dto)));
    // Logging
    this.channel.publish('logs', '', Buffer.from(JSON.stringify(dto)));

    // gRPC-Aufruf an ERP
    const reply = await lastValueFrom(
      this.erpService.processOrder({
        orderId:    id,
        productId:  dto.productId!,
        customerId: dto.customerId!,
        quantity:   dto.quantity!,
      }),
    );

    // Antwort verarbeiten und Status aktualisieren
    const order = this.orders.get(id)!;
    order.deliveryStatus = reply.status as 'Processing' | 'Shipped' | 'Delivered';
    order.deliveryDate     = new Date(reply.deliveryDate);
    return { orderId: id, status: reply.status, deliveryDate: reply.deliveryDate };
  }

  getStatus(id: string) {
    const ord = this.orders.get(id)!;
    return { orderId: id, status: ord.deliveryStatus, deliveryDate: ord.deliveryDate };
  }

  getProduct(id: string) {
    return this.products.get(id);
  }
}