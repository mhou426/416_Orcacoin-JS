'use strict';

const bcoin = require('../..');
const plugin = bcoin.wallet.plugin;
const network = bcoin.Network.get('testnet');
const assert = require('assert');
const blockhash = global.blockhash;

const node = new bcoin.FullNode({
  network: 'testnet',
  memory: true
});

node.use(plugin);

const walletClient = new bcoin.WalletClient({
  port: network.walletPort,
  apiKey: 'api-key'
});

const nodeClient = new bcoin.NodeClient({
  port: network.rpcPort,
  apiKey: 'api-key'
});

// const walletdb = new bcoin.wallet.WalletDB({
//   network: 'testnet',
//   memory: true
// });

const client = nodeClient;

async function fundWallet(wdb) {
  // Coinbase ==let say coinbase transaction is already created but we are using 
  //            it or making a copy of it to our wallet so our wallet can have coin
  //const mtx = new bcoin.MTX();
  //mtx.addOutpoint(new bcoin.Outpoint(bcoin.consensus.ZERO_HASH, 0));
  const result = await client.execute('getblock', [blockhash]);
  console.log(result.tx);//get coinbase transaction hash

  const tx = await client.getTX(result.tx);//get transaction by hash

  //mtx.addOutput(addr, 50460);
  //mtx.addOutput(addr, 50460);
  //mtx.addOutput(addr, 50460);
  //mtx.addOutput(addr, 50460);

  //const tx = mtx.toTX();

  walletClient.bind('balance', (walletID, balance) => {
    console.log('New Balance:');
    console.log(walletID, balance); 
  });

  walletClient.bind('address', (walletID, receive) => {
    console.log('New Receiving Address:');
    console.log(walletID, receive);
  });

  walletClient.bind('tx', (walletID, details) => {
    console.log('New Wallet TX:');
    console.log(walletID, details);
  });

  await wdb.addTX(tx);
  await new Promise(r => setTimeout(r, 300));
}

async function sendTX(addr, value) {
  const options = {
    passphrase: "secret123",
    rate: 10000,
    outputs: [{
      value: value,
      address: addr
    }]
  };

  // API call: walletClient.send('test', options)
  //const tx = await walletClient.request('POST', '/wallet/test/send', options);
  const tx = await walletClient.wallet('primary').send(options);//id?

  return tx.hash;
}

async function callNodeApi() {
  // API call: nodeClient.getInfo()
  const info = await client.request('GET', '/');

  console.log('Server Info:');
  console.log(info);

  const json = await client.execute(
    'getblocktemplate',
    [{rules: ['segwit']}]
  );

  console.log('Block Template (RPC):');
  console.log(json);
}

(async () => {
  const wdb = node.require('walletdb').wdb;

  await node.open();

  // API call: walletClient.createWallet('test')
  const testWallet = await walletClient.createWallet('primary');
  //const testWallet = await walletClient.request('PUT', '/wallet/test');

  console.log('Wallet:');
  console.log(testWallet);

  // open socket to listen for events
  await walletClient.open();

  // subscribe to events from all wallets
  walletClient.all();

  // Fund default account.
  // API call: walletClient.createAddress('test', 'default')
  const receive = await walletClient.createAddress('primary', 'default');
  // const receive = await walletClient.request(
  //   'POST',
  //   '/wallet/test/address',
  //   {account: 'default'}
  // );
  await fundWallet(wdb, receive.address);

  // API call: walletClient.getBalance('test', 'default')
  const balance = await walletClient.getBalance('primary', 'default');
  // const balance = await walletClient.request(
  //   'GET',
  //   '/wallet/test/balance',
  //   {account: 'default'}
  // );

  console.log('Balance:');
  console.log(balance);

  // API call: walletClient.createAccount('test', 'foo')
  const acct2 = await walletClient.createAccount('primary', 'default');
  //const acct = await walletClient.request('PUT', '/wallet/test/account/foo');

  console.log('Account:');
  console.log(acct2);

  // Send to our new account.
  const hash = await sendTX(acct2.receiveAddress, 500000000);//5 btc

  console.log('Sent TX:');
  console.log(hash);

  // API call: walletClient.getTX('test', hash)
  const tx = await walletClient.request('GET', `/wallet/${'primary'}/tx/${hash}`);

  console.log('Sent TX details:');
  console.log(tx);

  await callNodeApi();
  await walletClient.close();
  await node.close();
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
