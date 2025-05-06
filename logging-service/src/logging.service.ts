import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingService implements OnModuleInit {
  private channel!: amqp.Channel;
  private readonly logFile = path.join(process.cwd(), 'interactions.log');

  async onModuleInit() {
    // Logdatei anlegen
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '');
    }

    // RabbitMQ
    const conn = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    this.channel = await conn.createChannel();

    // Fanout-Exchange
    await this.channel.assertExchange('logs', 'fanout', { durable: true });

    // Exklusive Queue für diesen Consumer anlegen
    const q = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(q.queue, 'logs', '');

    // Nachrichten konsumieren und in Datei schreiben
    this.channel.consume(q.queue, msg => {
      if (!msg) return;
      fs.appendFileSync(this.logFile, msg.content.toString() + '\n');
      this.channel.ack(msg);
    });

    console.log('consuming from "logs" fanout exchange');
  }
}