import { Handler, HandlerEvent, HandlerContext, schedule } from "@netlify/functions";
<<<<<<< HEAD

const upload_report: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("Received event:", event);
  // Logic in English: Attach as a durable queue called reporting to the Filebase Exchange on RabbitMQ
  // From there, once a day this cron (as a Netlify background function) runs.
  // Objective: A daily report of all new CIDs, and upload that report back to Filebase
  // Cronjob ends

  // If this design pattern works well, we'll implement a lot more flows like this (i.e. for Tokens Curate)

  return {
=======
import { ethers } from "ethers";
import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js'

const env = process.env

// IPFS Gateway / Receipts storage
const gateway = env['IPFS_GATEWAY']

// Configuration
const config_version = env['ipfs_config_cid'] as string

// Database
const SUPABASE_KEY = process.env.SUPABASE_CLIENT_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string);

// Datastore
const IPFS_UPLOAD_URL = env.IPFS_UPLOAD_URL as string

// Create a single supabase client for interacting with your database



async function loadIPFSObjectAsJSON(hash: string) {
    const url = gateway + hash
    const response = await fetch(url);
    return await response.json();
}

let doc = loadIPFSObjectAsJSON(config_version)


async function read_cid() {
    const { data, error } = await supabase.from('cids').select("latest")
    console.log(error)
    return data
}

async function write_cid(content: string) {
    const { data, error } = await supabase.from('cids ').upsert({ id: "latest", cid: content })
    console.log(error)
    return data
}

async function read_network_height(network: string) {
    const { data, error } = await supabase.from('networks').select(network)
    console.log(error)
    return data
}

async function upsert_network_height(network: string, height: number) {
    const { data, error } = await supabase.from('networks').upsert({ network: network, preferences: height})
    console.log(error)
    return data
}


async function process_events(cid: any, address: string, provider: any, _from: any, _to: any) {
    let abi = await loadIPFSObjectAsJSON(cid)
    const contract = new ethers.Contract(
        address,
        abi,
        provider
      )

    let events = await contract.queryFilter("*", _from, _to)
    let json = Object()
    json.events = events
    return json
}


async function upload(data: object) { // untested
    const response = await fetch(IPFS_UPLOAD_URL, {
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "File-Name": "output.log"
        },
        method: "POST"
        })
    const output= await response.json()
    console.log(output)
    return output
}



const main: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    const data = Object()
    data.previous = read_cid()

    // this could use a major overhaul to make it prettier
    for (var network in doc) {
        let network_data = Object()
        let rpc = env[network]
        let provider = new ethers.providers.JsonRpcProvider(rpc)
        let _from = Number(read_network_height(network))
        let _to = Number(provider.getBlock("latest") - 50) // Figure something out here to minimize risk of block reorgs -- previously reduced by 50 blocks to be safe
        network_data.to = _to
        network_data.from = _from
        for (let contract  in doc[network]['contracts']) {
            let cid = doc[network]['contracts'][contract]
            network_data[contract] = await process_events(cid, "0x" + contract, provider, _from, _to)

        	data[network] = network_data
    }

    }
    let output = await upload(data)
    let update_db = await write_cid(output.message.Metadata['CID']) // untested
    console.log(update_db)

    return {
>>>>>>> 7b86bae (feat(wip) generalized event listener)
        statusCode: 200,
    };
};

<<<<<<< HEAD
const handler = schedule("@daily", upload_report)

export { handler };

=======
const handler = schedule("*/15 * * * *", main)

export { handler };


>>>>>>> 7b86bae (feat(wip) generalized event listener)
