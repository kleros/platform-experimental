import { Logtail } from "@logtail/node";
import client, { Connection, Channel, ConsumeMessage, Message } from "amqplib";
require("dotenv").config();
const logtail = new Logtail(process.env.LOGTAILKEY || "");

async function rabbitMqConnection() {
  // consumer for the queue.
  // We use currying to give it the channel required to acknowledge the message
  const promise = new Promise(async (resolve, reject) => {
    const consumer =
      (channel: Channel) =>
      async (msg: ConsumeMessage | null): Promise<void> => {
        if (msg) {
          let a = msg.content
            .toString()
            .replace(/'/g, '"')
            .replace("False", "false");
          console.log(a);
          await channel.ack(msg);
          await logtail.info(a);
        }
        resolve(true);
      };
    const connection: Connection = await client.connect(
      process.env.RABBITMQ_URL || ""
    );

    // Create a channel
    const channel: Channel = await connection.createChannel();

    // Makes the queue available to the client
    let k = await channel.assertQueue("datalake");

    // Start the consumer
    await channel.consume("datalake", consumer(channel));
  });
  return promise;
}

rabbitMqConnection()
  .then(async () => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
