// const { NodeClient, Miner } = require('bcoin');
const bcoin = require('../..');
// const {NodeClient, Network} = require('bcoin');
const network = bcoin.Network.get('testnet');

const clientOptions = {
  network: network.type,
  port: network.rpcPort,
  apiKey: 'api-key'
}

const client = new bcoin.NodeClient(clientOptions);

// (async () => {
//   const result = await client.execute('getblockchaininfo');
//   console.log(result);
// })();


// (async () => {
//   const result = await client.execute('getchaintips');
//   console.log(result);
// })();

let numblocks, address;
numblocks=1;
address='tb1qv28sya5jjnw3sz0p8pw5cch2ffeehmfgf4wqd8';

const blocks = bcoin.blockstore.create({
  memory: true
});
const chain = new bcoin.Chain({
  network: 'testnet',
  memory: true,
  blocks: blocks
});
const mempool = new bcoin.Mempool({
  chain: chain
});
const miner = new bcoin.Miner({
  chain: chain,
  mempool: mempool,

  // Make sure miner won't block the main thread.
  useWorkers: true
});

(async () => {
  const result = await client.execute('getmempoolinfo');
  console.log(result);
})();

async function mineBlock() {
  // Instantiate a new bcoin node client
  // const client = new NodeClient({
  //   network: 'testnet', // or 'main'
  //   apiKey: 'your-api-key', // if necessary
  // });

  // // Connect to the Bitcoin network
  // await client.open();

  // Create a new miner instance
  await blocks.open();
  await chain.open();

  // Open the miner (initialize the databases, etc).
  // Miner will implicitly call `open` on mempool.
  await miner.open();


    // Create a Cpu miner job
  // const job = await miner.createJob();

  //   // run miner
  // const block = await job.mineAsync();

  // Wait for the miner to find a block
  miner.on('block', (block) => {
    console.log('Block mined:', block);
  });
}

mineBlock().catch(console.error);
