/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
@Injectable()
export class RabbitMQPublisherService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor() {
    this.connectToRabbitMQ();
  }
  async connectToRabbitMQ() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();
  }

  async closeConnection() {
    await this.channel.close();
    await this.connection.close();
  }

  // async publishMessage(message: any) {
  //   return new Promise(async (resolve, _) => {
  //     await this.channel.assertQueue('NestQueue', message);
  //     await this.channel.sendToQueue(
  //       'NestQueue',
  //       Buffer.from(JSON.stringify(message)),
  //     );
  //     await this.channel.assertQueue('ResponseQueue', { durable: false });
  //     this.channel.consume('ResponseQueue', (msg) => {
  //       if (msg !== null) {
  //         const message = msg.content.toString();
  //         const parsed = JSON.parse(message);
  //         resolve(parsed);
  //         this.channel.ack(msg);
  //       } else {
  //         _('There Was An Error Please Try Again Later');
  //       }
  //     });
  //   });
  // }

  async sendRequestToDotNet(message: any): Promise<any> {
    // console.log('Connecting to Rmq...');
    await this.connectToRabbitMQ();
    // console.log('Connected to Rmq...');

    const requestQueue = 'NestQueue';
    const responseQueue = 'ResponseQueue';
    const correlationId = uuid();
    message.correlationId = correlationId;
    //this will contain the password's changing response from the repository
    message.response = '';
    await this.channel.assertQueue(requestQueue, { durable: true });
    await this.channel.sendToQueue(
      requestQueue,
      Buffer.from(JSON.stringify(message)),
      {
        replyTo: responseQueue,
        correlationId: correlationId,
      },
    );
    const responsePromise = new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        reject(new Error('Timeout  waiting for response from microservice'));
        // console.log('Disconnecting from Rmq...');
        await this.closeConnection();
        // console.log('Disconnected from Rmq...');
      }, 5000);
      this.channel.consume(responseQueue, (msg) => {
        if (msg && msg.properties.correlationId === correlationId) {
          clearTimeout(timeoutId);
          const responseMessage = JSON.parse(msg.content.toString());
          resolve(responseMessage);
          this.channel.ack(msg);
        }
      });
    });
    const response = await responsePromise;
    // console.log('Disconnecting from Rmq...');
    await this.closeConnection();
    // console.log('Disconnected from Rmq...');

    return response;
  }
}
