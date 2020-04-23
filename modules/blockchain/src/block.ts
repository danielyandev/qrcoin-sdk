import { Helper } from '@danielyandev/qr-utils';
import { TransferTransaction } from '@danielyandev/qr-transactions';

class Block {
  readonly timestamp: number;
  readonly lastHash: string;
  readonly hash: string;
  transactions: TransferTransaction[];
  validator: string;
  signature: string;

  constructor(
    timestamp: number,
    lastHash: string,
    hash: string,
    transactions: TransferTransaction[],
    validator: string,
    signature: string,
  ) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.transactions = transactions;
    this.validator = validator;
    this.signature = signature;
  }

  toString(): string {
    return `Block - 
        Timestamp    : ${this.timestamp}
        Last Hash    : ${this.lastHash}
        Hash         : ${this.hash}
        Transactions : ${this.transactions}
        Validator    : ${this.validator}
        Signature    : ${this.signature}`;
  }

  /**
   * Hash the data
   *
   * @param timestamp
   * @param lastHash
   * @param transactions
   * @returns {*}
   */
  static hash(timestamp: number, lastHash: string, transactions: TransferTransaction[]) {
    return Helper.hash(`${timestamp}${lastHash}${transactions}`);
  }

  /**
   * Create new block instance
   *
   * @param lastBlock
   * @param transactions
   * @param wallet
   * @returns {Block}
   */
  static createBlock(lastBlock: Block, transactions: TransferTransaction[], wallet: any) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const hash = Block.hash(timestamp, lastHash, transactions);

    // get the validators public key
    const validator = wallet.getPublicKey();

    // Sign the block
    const signature = Block.signBlockHash(hash, wallet);
    return new this(timestamp, lastHash, hash, transactions, validator, signature);
  }

  /**
   * Hash the block
   *
   * @param block
   * @returns {*}
   */
  static blockHash(block: Block) {
    // destructuring
    const { timestamp, lastHash, transactions } = block;
    return Block.hash(timestamp, lastHash, transactions);
  }

  /**
   * Return wallet sign method
   *
   * @param hash
   * @param wallet
   * @returns {Buffer | Signature | Buffer | string | number | PromiseLike<ArrayBuffer> | * | PromiseLike<ArrayBuffer>}
   */
  static signBlockHash(hash: string, wallet: any) {
    return wallet.sign(hash);
  }

  /**
   *
   * @param block
   * @returns {*}
   */
  static verifyBlock(block: Block) {
    return Helper.verifySignature(
      block.validator,
      block.signature,
      Block.hash(block.timestamp, block.lastHash, block.transactions),
    );
  }

  /**
   *
   * @param block
   * @param leader
   * @returns {boolean}
   */
  static verifyLeader(block: Block, leader: any) {
    return block.validator === leader;
  }
}

export default Block;
