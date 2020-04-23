import express from 'express';
import { Blockchain } from '@danielyandev/qr-blockchain';
import TransactionPool from '@danielyandev/qr-transaction-pool';

class TransactionsRouter {
  static routes(blockchain: Blockchain, transactionPool: TransactionPool) {
    const router = express.Router();

    router.get('/', (req, res) => {
      res.json(transactionPool.transactions);
    });

    return router;
  }
}

export default TransactionsRouter;
