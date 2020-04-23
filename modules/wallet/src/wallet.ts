import * as bip39 from 'bip39';
import { Blockchain } from '@danielyandev/qr-blockchain';
import { TransferTransaction, StakeTransaction, ValidatorRequestTransaction } from '@danielyandev/qr-transactions';
import { InvalidMnemonicException } from '@danielyandev/qr-exceptions';
import { TRANSACTION_FEE, VALIDATORS_FEE } from '@danielyandev/qr-constants';
import { Helper } from '@danielyandev/qr-utils';
import Logger from '@danielyandev/qr-logger';

class Wallet {
  blockchain: Blockchain;
  keyPair: any;
  publicKey: string;

  constructor(secret: string | undefined, blockchain: Blockchain) {
    if (secret && !bip39.validateMnemonic(secret)) {
      throw new InvalidMnemonicException();
    }

    this.blockchain = blockchain;
    this.keyPair = Helper.generateKeyPair(secret);
    this.publicKey = this.keyPair.getPublic('hex');
  }

  toString(): string {
    return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.getBalance()}`;
  }

  /**
   * Sign the data
   *
   * @param dataHash
   * @returns {Buffer | Signature | string | undefined | number | PromiseLike<ArrayBuffer>}
   */
  sign(dataHash: string) {
    return this.keyPair.sign(dataHash).toHex();
  }

  /**
   * Create new transfer transaction and add to pool
   *
   * @param recipient
   * @param amount
   * @returns {boolean|TransferTransaction}
   */
  transfer(recipient: string, amount: number): TransferTransaction | boolean {
    const balance = this.getBalance();
    if (amount + TRANSACTION_FEE > balance) {
      Logger.log(`Amount: ${amount} exceeds the current balance: ${balance}`);
      return false;
    }

    const output = {
      recipient,
      amount,
    };

    const transaction = new TransferTransaction(this, output);

    const added = this.blockchain.transactionPool.addTransaction(transaction);
    return added ? transaction : false;
  }

  /**
   * Create new stake transaction and add to pool
   *
   * @param amount
   * @returns {boolean|StakeTransaction}
   */
  stake(amount: number): StakeTransaction | boolean {
    const balance = this.getBalance();
    if (amount + TRANSACTION_FEE > balance) {
      Logger.log(`Amount: ${amount} exceeds the current balance: ${balance}`);
      return false;
    }

    const output = {
      amount,
    };

    const transaction = new StakeTransaction(this, output);

    const added = this.blockchain.transactionPool.addTransaction(transaction);
    return added ? transaction : false;
  }

  /**
   * Create new validator request transaction and add to pool
   *
   * @returns {boolean|ValidatorRequestTransaction}
   */
  transferValidatorFee(): ValidatorRequestTransaction | boolean {
    const balance = this.getBalance();
    if (VALIDATORS_FEE + TRANSACTION_FEE > balance) {
      Logger.log(`Amount: ${VALIDATORS_FEE} exceeds the current balance: ${balance}`);
      return false;
    }

    const transaction = new ValidatorRequestTransaction(this);

    const added = this.blockchain.transactionPool.addTransaction(transaction);
    return added ? transaction : false;
  }

  /**
   * Get wallet balance
   *
   * @returns {*}
   */
  getBalance() {
    return this.blockchain.getBalance(this.publicKey);
  }

  /**
   *
   * @returns {*}
   */
  getPublicKey() {
    return this.publicKey;
  }
}

export default Wallet;
