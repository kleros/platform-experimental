// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.ts

import {
    Handler,
    HandlerEvent,
    HandlerContext,
    schedule,
  } from "@netlify/functions";
  import * as fs from "fs";
  import client, { Connection, Channel, ConsumeMessage } from "amqplib";
  const myHandler: Handler = async (
    event: HandlerEvent,
    context: HandlerContext
  ) => {
    try {
      await rabbitmqconsume("filebase");
    } catch (error) {
      console.log(error);
    }
    return {
      statusCode: 200,
    };
  };
  
  export { handler };
  
  // };
  const handler = schedule("* * * * *", myHandler);
  
  const rabbitmqconsume = async (exchange: any) => {
    const promise = new Promise(async (resolve, reject) => {
      const conn1 = await client.connect(process.env.RABBITMQ_URL);
      const channel1 = await conn1.createChannel();
      await channel1.assertExchange(exchange, "fanout", { durable: true });
      let a = await channel1.assertQueue("queuefilebase", { durable: true });
      await channel1.bindQueue("queuefilebase", exchange, "", { durable: true });
      let arrayOfCIds = [];
      const consumer =
        (channel: Channel) =>
        async (msg: ConsumeMessage | null): Promise<void> => {
          if (msg) {
            // Display the received message
            console.log(msg.content.toString());
            // a.push(msg.content.toString());
            // fs.appendFileSync('message.txt', msg.content.toString()+'\n');
            // let d =  fs.readFileSync('message.txt', 'utf-8');
            //console.log(d);
  
            await channel.ack(msg);
          }
        };
      await channel1.consume("queuefilebase", consumer(channel1));
  
      resolve(true);
    });
    return promise;
  };
  