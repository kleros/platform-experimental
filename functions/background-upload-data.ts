// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.ts

import {
  Handler,
  HandlerEvent,
  HandlerContext,
  schedule,
} from "@netlify/functions";
import client, { Connection, Channel, ConsumeMessage } from "amqplib";
const myHandler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  console.log("Received event:");
  await rabbitmqconsume("filebase");
  return {
    statusCode: 200,
  };
};

export { handler };

// };
const handler = schedule("* * * * *", myHandler);

const rabbitmqconsume = async (exchange: any) => {
  const conn1 = await client.connect(process.env.RABBITMQ_URL);
  const channel1 = await conn1.createChannel();
  await channel1.assertExchange(exchange, "fanout", { durable: true });
  let a = await channel1.assertQueue("queuefilebase", { durable: true });
  console.log(a);
  await channel1.bindQueue("queuefilebase", exchange, "", { durable: true });
  const consumer =
    (channel: Channel) =>
    async (msg: ConsumeMessage | null): Promise<void> => {
      if (msg) {
        // Display the received message
        console.log(msg.content.toString());
        channel.ack(msg);
      }
    };
  console.log("here", a.queue);

  await channel1.consume("queuefilebase", consumer(channel1));
  console.log("here");

  channel1.close();
  conn1.close();
};