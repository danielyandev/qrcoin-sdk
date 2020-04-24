import { Blockchain } from '@danielyandev/qr-blockchain';
import Wallet from '@danielyandev/qr-wallet';
import TransactionPool from '@danielyandev/qr-transaction-pool';
import P2pServer from '@danielyandev/qr-p2p-server';
import Logger from '@danielyandev/qr-logger';
import HttpServer from '@danielyandev/qr-http-server';
import * as bip39 from 'bip39';

import { Helper } from '@danielyandev/qr-utils';

class Node {
  private p2pServer: P2pServer;
  private httpServer: HttpServer;
  public logger: Logger;
  constructor(genesisBlock: any, cfg?: any) {
    const config = cfg || this.initConfig();

    // create new mnemonic for new wallet secret
    let newSecretCreated = false;
    let secret = process.env.WALLET_SECRET;
    if (!secret) {
      newSecretCreated = true;
      secret = bip39.generateMnemonic();
    }

    const transactionPool = new TransactionPool();
    const blockchain = new Blockchain(genesisBlock, config, transactionPool);
    const wallet = new Wallet(secret, blockchain);
    this.p2pServer = new P2pServer(config, wallet);
    this.httpServer = new HttpServer(config, blockchain, transactionPool);

    this.logger = new Logger();
    this.logger.info(wallet.getPublicKey());
    if (newSecretCreated) {
      this.logger.warn('************* New wallet created, keep this passphrase very secret *************');
      this.logger.warn(secret);
      this.logger.warn('********************************************************************************');
    }
  }

  initConfig(): any {
    const network = process.env.NETWORK || 'devnet';
    const config = require('./defaults/' + network + '/config.json');

    return Helper.makeConfig(config);
  }

  async run(): Promise<any> {
    this.p2pServer.listen();
    this.httpServer.listen();
    return new Promise((resolve) => {
      resolve();
    });
  }
}

export default Node;
