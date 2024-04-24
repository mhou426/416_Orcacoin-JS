const bcoin = require('../../lib/bcoin');
const network = bcoin.Network.get('testnet');
const crypto = require('crypto');

const nodeClient = new bcoin.NodeClient({
    port: network.rpcPort
});
const walletClient = new bcoin.WalletClient({
    port: network.walletPort
  });

const commands={}
commands['getBalanceCommand']="getbalance"
commands['sendToAddressCommand']="sendtoaddress"
commands['generateCommand']="generate"
commands['walletPassphraseCommand']="walletpassphrase"
commands['getWalletAddressCommand']="getaddressesbyaccount"
commands['getAllAccountsCommand']="listaccounts"

const result = await walletClient.execute('getbalance');

async function executecommand(command){
    const result = await walletClient.execute(command);

}
