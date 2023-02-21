import { Logtail } from "@logtail/node";
import client, { Connection, Channel, ConsumeMessage, Message } from "amqplib";
import { consumers } from "stream";
const logtail = new Logtail("tEL7p1rqCXc1oTJxG1zfCJ8p");

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
        await logtail.info( JSON.parse(a));
      }
    };
  const connection: Connection = await client.connect(
    "amqps://gbvfmiqs:5QBmlTOSx_FsewCRK2mvo6Gp0_620nzZ@shark.rmq.cloudamqp.com/gbvfmiqs"
  );
  console.log("connection");

  // Create a channel
  const channel: Channel = await connection.createChannel();
  console.log("channel");
  // Makes the queue available to the client
  let k = await channel.assertQueue("datalake");
  console.log(k, "queue");
  await channel.sendToQueue("datalake",Buffer.from("demo"))
  // Start the consumer
  await channel.consume("datalake", consumer(channel));
}
rabbitMqConnection()
  .then(async () => {
    await new Promise((f) => setTimeout(f, 10000));
    await process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });