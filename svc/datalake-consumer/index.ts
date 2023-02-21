import { Logtail } from "@logtail/node";
import client, { Connection, Channel, ConsumeMessage, Message } from "amqplib";
const logtail = new Logtail(process.env.LOGTAIL_KEY || "null");


async function rabbitMqConnection() {
  // consumer for the queue.
  // We use currying to give it the channel required to acknowledge the message
  const consumer =
    (channel: Channel) =>
    async (msg: ConsumeMessage | null): Promise<void> => {
      if (msg) {
        let a = msg.content
          .toString()
          .replace(/'/g, '"')
          .replace("False", "false");
        console.log(a);
        channel.ack(msg);
        await logtail.info(JSON.parse(a));
      }
    };
  const connection: Connection = await client.connect(process.env.RABBITMQ_URL || "http://localhost:5672");
  console.log("connection");

  // Create a channel
  const channel: Channel = await connection.createChannel();
  console.log("channel");
  // Makes the queue available to the client
  let k = await channel.assertQueue("datalake");
  console.log(k, "queue");
  // Start the consumer
  await channel.consume("datalake", consumer(channel));
}
rabbitMqConnection()
  .then(async () => {
    await new Promise((f) => setTimeout(f, 10000));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
