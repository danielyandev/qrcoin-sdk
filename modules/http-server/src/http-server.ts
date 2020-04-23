import express, { Express, Request } from 'express';
import { IpFilter } from 'express-ipfilter';
import bodyParser from 'body-parser';
import Logger from '@danielyandev/qr-logger';
import { BlockchainRouter, TransactionsRouter } from './routes';
import { Blockchain } from '@danielyandev/qr-blockchain';
import TransactionPool from '@danielyandev/qr-transaction-pool';

class HttpServer {
  server: Express;
  port: number;
  whiteList: string[];
  blockchain: Blockchain;
  transactionPool: TransactionPool;

  constructor(config: any, blockchain: Blockchain, transactionPool: TransactionPool) {
    this.port = config.network.httpPort;
    this.whiteList = config.network.whiteList;
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.server = express();
    this.setup();
    this.initRoutes();
  }

  detectIp(req: Request): string {
    // @ts-ignore
    return req.connection.remoteAddress;
  }

  setup(): void {
    this.server.use(bodyParser.json());

    this.server.use(IpFilter(this.whiteList, { detectIp: this.detectIp, log: false }));
  }

  listen(): void {
    const port = this.port;
    this.server.listen(port, () => {
      Logger.log('Listening http requests on port ' + port);
    });
  }

  initRoutes(): void {
    this.server.use('/blockchain', BlockchainRouter.routes(this.blockchain));
    this.server.use('/transactions', TransactionsRouter.routes(this.blockchain, this.transactionPool));
  }
}

export default HttpServer;
