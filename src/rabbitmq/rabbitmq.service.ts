import * as amqp from 'amqplib';
import { Injectable } from '@nestjs/common';
@Injectable()
export class RabbitmqService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  // async init() {
  //   try {
  //     this.connection = await amqp.connect('amqp://rabbitmq:5672');
  //     this.channel = await this.connection.createChannel();
  //     // const queue = 'hello';
  //     // await this.channel.assertQueue(queue, { durable: false });
  //     // this.channel.consume(queue, (msg) => {
  //     //   if (msg !== null) {
  //     //     const message = msg.content.toString();
  //     //     const parsed = JSON.parse(message);
  //     //     console.log('Recieved message: ', parsed.username);
  //     //     console.log('Recieved message: ', parsed.password);
  //     //     this.channel.ack(msg);
  //     //   }
  //     // });
  //   } catch (error) {}
  // }
  // // async getUpdateResponse() {
  // //   return new Promise(async (resolve, reject) => {
  // //     try {
  // //       this.connection = await amqp.connect('amqp://rabbitmq:5672');
  // //       this.channel = await this.connection.createChannel();
  // //       const queue = 'ResponseQueue';
  // //       await this.channel.assertQueue(queue, { durable: false });
  // //       this.channel.consume(queue, (msg) => {
  // //         if (msg !== null) {
  // //           const message = msg.content.toString();
  // //           const parsed = JSON.parse(message);
  // //           this.channel.ack(msg);
  // //           console.log(parsed);
  // //           resolve(parsed); // Resolve the promise with the parsed value
  // //         } else {
  // //           reject('There was an error, please try again'); // Reject the promise in case of an error
  // //         }
  // //       });
  // //     } catch (error) {
  // //       reject(error); // Reject the promise in case of any exception
  // //     }
  // //   });
  // // }
  // async close() {
  //   await this.channel.close();
  //   await this.connection.close();
  // }

  private requestQ = 'hello';
  private responseQ = 'NestResponse';
  constructor() {
    this.handleRequests();
  }

  async handleRequests() {
    this.connection = await amqp.connect('amqp://rabbitmq:5672');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('hello', { durable: false });
    this.channel.consume('hello', async (msg) => {
      const requestData = msg.content.toString();
      const requestObj = JSON.parse(requestData);
      // console.log(requestObj);
      const response = `Hello! ${requestObj.username}`;
      // await this.channel.assertQueue('hello', { durable: true });
      // console.log('Sending message to response queue');
      this.channel.sendToQueue('NestResponse', Buffer.from(response));
      // console.log('Sent..........');
      this.channel.ack(msg);
    });
  }
}
