import { Handler, HandlerEvent, HandlerContext, schedule } from "@netlify/functions";

const upload_report: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("Received event:", event);
  // Logic in English: Attach as a durable queue called reporting to the Filebase Exchange on RabbitMQ
  // From there, once a day this cron (as a Netlify background function) runs.
  // Objective: A daily report of all new CIDs, and upload that report back to Filebase
  // Cronjob ends

  // If this design pattern works well, we'll implement a lot more flows like this (i.e. for Tokens Curate)

  return {
        statusCode: 200,
    };
};

const handler = schedule("@daily", upload_report)

export { handler };

