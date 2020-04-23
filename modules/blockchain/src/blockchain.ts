import Block from './block';
import Wallet from '@danielyandev/qr-wallet';
import { Account, Validators, Stake } from '@danielyandev/qr-account';
import TransactionPool from '@danielyandev/qr-transaction-pool';
import Logger from '@danielyandev/qr-logger';

import { Enums } from '@danielyandev/qr-utils';
const TransactionTypes = Enums.TransactionTypes;

class Blockchain {
  chain: any[];
  account: Account;
  stake: Stake;
  validators: Validators;
  config: any;
  transactionPool: TransactionPool;
  constructor(genesis: any, config: any, transactionPool: TransactionPool) {
    this.config = config;
    this.transactionPool = transactionPool;
    this.chain = [genesis];
    this.account = new Account(this.config.accounts);
    this.stake = new Stake(this.config.accounts[0]);
    this.validators = new Validators(this.config.accounts[0]);
  }

  /**
   * Add block to the chain (received from other nodes)
   *
   * @param block
   * @returns {Block}
   */
  addBlock(block: Block) {
    this.executeTransactions(block);
    this.chain.push(block);

    return block;
  }

  /**
   * Create own block
   *
   * @param transactions
   * @param wallet
   * @returns {Block}
   */
  createBlock(transactions: any[], wallet: Wallet) {
    return Block.createBlock(this.chain[this.chain.length - 1], transactions, wallet);
  }

  /**
   * Check if chain is valid
   *
   * @param chain
   * @returns {boolean}
   */
  isValidChain(chain: any[]) {
    if (JSON.stringify(chain[0]) !== this.chain[0]) {
      Logger.log('Genesis does not match');
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      // if current chain has a block with index
      // compare it's block with block received
      if (this.chain.hasOwnProperty(i)) {
        if (JSON.stringify(this.chain[i]) !== JSON.stringify(block)) {
          return false;
        }
      }
      // the block is new one, and it's index is higher than current blockchain length,
      // so check if transactions were not tampered
      else if (this.chain.length > 1) {
        if (!this.verifyNewBlockTransactions(block.transactions)) {
          return false;
        }
      }
      if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) return false;
    }

    return true;
  }

  /**
   *
   * @param transactions
   * @returns {boolean}
   */
  verifyNewBlockTransactions(transactions: any[]) {
    for (const transaction of transactions) {
      const balance = this.calculateBalance(transaction.input.from, transaction.id);
      if (balance < transaction.output.amount + transaction.output.fee) {
        // transaction was tampered, sender did't have needed amount to make transaction
        return false;
      }
    }

    return true;
  }

  /**
   * Replace current chain if new one is longer
   *
   * @param newChain
   */
  replaceChain(newChain: any[]) {
    if (newChain.length <= this.chain.length) {
      Logger.log('Received chain is not longer than the current chain');
      return;
    } else if (!this.isValidChain(newChain)) {
      Logger.log('Received chain is invalid');
      return;
    }

    Logger.log('Replacing the current chain with new chain');
    this.chain = newChain;
    this.executeChain();
  }

  /**
   * Execute all blocks transactions
   */
  executeChain() {
    Logger.log('Executing chain');
    this.chain.forEach((block) => this.executeTransactions(block));
  }

  /**
   * Get balance using public key
   *
   * @param publicKey
   * @returns {*}
   */
  getBalance(publicKey: string) {
    return this.account.getBalance(publicKey);
  }

  /**
   * Calculate balance looping through all transactions,
   * used in replacing chain to avoid hacked chains
   *
   * @param address
   * @param tillTransactionId
   * @returns {number}
   */
  calculateBalance(address: string, tillTransactionId = null) {
    let balance = 0;
    let breakParentLoop = false;
    for (let i = 0; i < this.chain.length && !breakParentLoop; i++) {
      const block = this.chain[i];

      for (const transaction of block.transactions) {
        // break if transaction id provided
        if (transaction.id === tillTransactionId) {
          breakParentLoop = true;
          break;
        }

        // decrement if amount was sent from address
        if (transaction.input.from === address) {
          balance -= transaction.output.amount + transaction.output.fee;
        }
        // increment if amount was sent to address
        if (transaction.output.to === address) {
          balance += transaction.output.amount;
        }
      }
    }

    return balance;
  }

  /**
   * Get the leader
   *
   * @returns {*}
   */
  getLeader() {
    return this.stake.getLeader(this.validators.list);
  }

  /**
   * Check if block is valid
   *
   * @param block
   * @returns {boolean}
   */
  isValidBlock(block: Block) {
    const lastBlock = this.chain[this.chain.length - 1];
    /**
     * check hash
     * check last hash
     * check signature
     * check leader
     */
    if (
      block.lastHash === lastBlock.hash &&
      block.hash === Block.blockHash(block) &&
      Block.verifyBlock(block) &&
      Block.verifyLeader(block, this.getLeader())
    ) {
      Logger.log('Block is valid');
      return true;
    } else {
      Logger.log('Block is invalid');
      return false;
    }
  }

  /**
   * Execute block transactions and update chain state
   *
   * @param block
   */
  executeTransactions(block: Block) {
    block.transactions.forEach((transaction) => {
      switch (transaction.type) {
        case TransactionTypes.transferTransaction:
          this.account.update(transaction);
          this.account.transferFee(block, transaction);
          break;
        case TransactionTypes.stake:
          this.stake.update(transaction);
          this.account.decrement(transaction.input.sender, transaction.output.amount);
          this.account.transferFee(block, transaction);

          break;
        case TransactionTypes.validatorRequest:
          if (this.validators.update(transaction)) {
            this.account.decrement(transaction.input.sender, transaction.output.amount);
            this.account.transferFee(block, transaction);
          }
          break;
      }
    });
  }

  /**
   * Check if block is the last in chain
   *
   * @param block
   * @returns {boolean}
   */
  isLastBlock(block: Block) {
    return this.chain[this.chain.length - 1].hash === block.hash;
  }
}

export default Blockchain;
