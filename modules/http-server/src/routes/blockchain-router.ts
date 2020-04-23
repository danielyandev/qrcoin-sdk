import express from 'express';
import { Blockchain } from '@danielyandev/qr-blockchain';

class BlockchainRouter {
  static routes(blockchain: Blockchain) {
    const router = express.Router();
    router.get('/', (req, res) => {
      res.redirect('/blockchain/blocks');
    });

    router.get('/blocks', (req, res) => {
      res.send(blockchain.chain);
    });

    return router;
  }
}

export default BlockchainRouter;
