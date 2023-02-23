
import amqp, { Message } from "amqplib/callback_api";
import { Logtail } from "@logtail/node";
require("dotenv").config();
const logtail = new Logtail( process.env.LOGTAILKEY|| "");
amqp.connect(
  process.env.RABBITMQ_URL || "http://localhost:5672",
  function (error0: any, connection: any) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1: any, channel: any) {
      if (error1) {
        throw error1;
      }

      channel.assertQueue(
        "datalake",
        {
          durable: true,
        },
        function (error2: any, q: any) {
          if (error2) {
            throw error2;
          }
          console.log(
            "[*] Waiting for messages in %s. To exit press CTRL+C",
          );

          channel.consume(
            q.queue,
            async function (msg: any) {
              if (msg.content) {
                console.log(" [x] %s", msg.content.toString());

                await logtail.info(
                   JSON.parse( msg.content
                      .toString()
                      .replace(/'/g, '"')
                      .replace("False", "false")
                  
                ));
              }
            },
            {
              noAck: true,
            }
          );
        }
      );
    });
  }
);
