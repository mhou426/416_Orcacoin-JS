const bcoin = require('../..');
const network = bcoin.Network.get('testnet');
const crypto = require('crypto');

const clientOptions = {
  network: network.type,
  port: network.rpcPort,
  apiKey: 'api-key'
}

const client = new bcoin.NodeClient(clientOptions);

// function littleEndian(value) {
//   let hex = value.toString(16);
//   return '0'.repeat(8 - hex.length) + hex.match(/.{1,2}/g).reverse().join('');
// }

// // Function to swap endianness of a hex string
// function swapOrder(hex) {
//   return hex.match(/.{1,2}/g).reverse().join('');
// }

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

const walletdb = new bcoin.wallet.WalletDB({ memory: true });

const pool = new bcoin.Pool({
  chain: chain,
  maxOutbound: 1
});

// (async () => {
//   const result = await client.execute('getmempoolinfo');
//   console.log(result);
// })();

// (async () => {
//   // Timeout error
//   const result = await client.execute('generate', [ 1 ]);
//   console.log(result);
// })();

async function mineBlock() {

  await blocks.open();
  await chain.open();


  await pool.open();
  await walletdb.open();
  await pool.connect();

  await miner.open();

  const wallet = await walletdb.create();
  const walletAddress = await wallet.receiveAddress();
  console.log('Created wallet with address %s', walletAddress);


  // Create a Cpu miner job
  const job = await miner.createJob();

  const block = await job.mineAsync();
  console.log('Adding %s to the blockchain.', block.rhash());
  console.log(block);
  await chain.add(block);
  console.log('Added block!');
  console.log(chain)



  // console.log(pool)
  // pool.startSync();
  

  // pool.watchAddress(walletAddress);


  // pool.on('tx', (tx) => {
  //   console.log('Received TX:\n', tx);

  //   walletdb.addTX(tx);
  //   console.log('TX added to wallet DB!');
  // });

  // wallet.on('balance', (balance) => {
  //   console.log('Balance updated:\n', balance.toJSON());
  // });

  


  // const serializedHeader = Buffer.concat([
  //   Buffer.from(block.version.toString(16), 'hex').reverse(),
  //   Buffer.from(String(block.prev_block), 'hex').reverse(),
  //   Buffer.from(String(block.merkle_root), 'hex').reverse(),
  //   Buffer.from(String(block.timestamp), 'hex').reverse(),
  //   Buffer.from(String(block.bits), 'hex').reverse(),
  //   Buffer.from(String(block.nonce), 'hex').reverse()
  // ]);

  // // Double SHA-256 hash the serialized header
  // const hash = crypto.createHash('sha256').update(serializedHeader).digest();
  // const blockHash = crypto.createHash('sha256').update(hash).digest();

  // // Convert the hash to hexadecimal string
  // const hexBlockHash = blockHash.toString('hex');
  // console.log(hexBlockHash);





  // let version = littleEndian(block.version);
  // let prevBlockHash = swapOrder(String(block.prevBlock));
  // // console.log( typeof String(block.prevBlock));
  // let rootHash = swapOrder(String(block.merkleRoot));
  // let time = littleEndian(block.time);
  // let bits = littleEndian(block.bits);
  // let nonce = littleEndian(block.nonce);

  // let header_hex = version + prevBlockHash + rootHash + time + bits + nonce;
  // console.log(header_hex);

  // const work = await client.execute('getworklp');
  // console.log(work);
  // console.log(work.data);

  // const result = await client.execute('submitblock', [ hexBlockHash ]);
  // console.log(result);
  // const result = await client.execute('getblockchaininfo');
  // console.log(result);

  // Wait for the miner to find a block
  // miner.on('block', (block) => {
  //   console.log('Block mined:', block);
  // });
}

mineBlock().catch(console.error);


