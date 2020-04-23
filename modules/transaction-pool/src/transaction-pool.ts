import { BaseTransaction } from '@danielyandev/qr-transactions';
import { TRANSACTIONS_PER_BLOCK } from '@danielyandev/qr-constants';
import Logger from '@danielyandev/qr-logger';

class TransactionPool {
  transactions: any[];
  constructor() {
    this.transactions = [];
  }

  /**
   * Add transaction and check if TRANSACTIONS_PER_BLOCK limit reached
   *
   * @param transaction
   * @returns {boolean}
   */
  addTransaction(transaction: any) {
    if (BaseTransaction.verifyTransaction(transaction)) {
      this.transactions.push(transaction);
      return true;
    }

    return false;
  }

  /**
   * Filter valid transactions
   *
   * @returns {[]}
   */
  validTransactions() {
    return this.transactions.filter((transaction) => {
      if (!BaseTransaction.verifyTransaction(transaction)) {
        Logger.log(`Invalid signature from ${transaction.data.from}`);
        return;
      }

      return transaction;
    });
  }

  /**
   * Check if transaction exists in pool
   *
   * @param transaction
   * @returns {}
   */
  transactionExists(transaction: any) {
    return this.transactions.find((t) => t && t.id === transaction.id);
  }

  /**
   * Clear the pool
   */
  clear() {
    this.transactions = [];
  }

  thresholdReached() {
    return this.transactions.length >= TRANSACTIONS_PER_BLOCK;
  }
}

export default TransactionPool;
