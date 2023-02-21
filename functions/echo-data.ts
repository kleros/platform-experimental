import amqp from 'amqplib'

// Configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL
const PRE_SHARED_KEY = process.env.PRE_SHARED_KEY

export const handler = async function(event: any, context: any) {
  console.log(event)
  const pre_shared_key = event.headers['pre_shared_key']
  const cid = event.headers['cid']
  // Verify the pre-shared key
  if (pre_shared_key !== PRE_SHARED_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({message: "Unauthorized"})
    }
  }

  // Connect to RabbitMQ
  const conn = await amqp.connect(RABBITMQ_URL)
  const channel = await conn.createChannel()
  const exchange = 'ipfs_cids'
  await channel.assertExchange(exchange, 'fanout', { durable: true })

  // Publish the IPFS CID to the exchange
  channel.publish(exchange, '', Buffer.from(cid))
  console.log(`Sent IPFS CID ${cid} to exchange ${exchange}`)

  // Close the connection and return success
  await channel.close()
  await conn.close()
  return {
    statusCode: 200,
    body: JSON.stringify({message: "OK"})
  }
}

