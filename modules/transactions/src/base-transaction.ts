import { Helper } from '@danielyandev/qr-utils';
import Wallet from '@danielyandev/qr-wallet';
import { TRANSACTION_FEE } from '@danielyandev/qr-constants';
import { IBaseTransactionInput } from '@danielyandev/qr-utils/build/src/interfaces';

abstract class BaseTransaction {
  public readonly id: string;
  public type: string;
  public fee: number;
  public input: IBaseTransactionInput;
  public output: object;
  public timestamp: number;
  protected constructor() {
    this.id = Helper.id();
    this.type = '';
    this.fee = TRANSACTION_FEE;
    this.timestamp = Date.now();

    this.input = {
      sender: '',
      signature: '',
    };
    this.output = {};
  }

  /**
   * Create new transaction after checking balance
   *
   * @param senderWallet
   * @param output
   */
  public create(senderWallet: Wallet, output: object): this | boolean {
    if (!this.validateOutput(output)) {
      return false;
    }
    return this.generate(senderWallet, output);
  }

  /**
   * Generate new transaction instance
   * and set output
   *
   * @param senderWallet
   * @param output
   * @returns {this}
   */
  private generate(senderWallet: Wallet, output: object): this {
    this.applyOutput(output);
    this.sign(senderWallet);
    return this;
  }

  /**
   * Sign the transaction with sender private key
   * and set transaction's input
   *
   * @param senderWallet
   */
  private sign(senderWallet: Wallet) {
    this.input = {
      sender: senderWallet.publicKey,
      signature: senderWallet.sign(Helper.hash(this.output)),
    };
  }

  /**
   * Validate transaction output
   */
  public validateOutput(output: object): boolean {
    return !!Object.keys(output).length;
  }

  /**
   * Apply transaction output
   *
   * @param output
   */
  public applyOutput(output: object): void {
    this.output = output;
  }

  /**
   * Verify transaction
   *
   * @param transaction
   * @returns {*}
   */
  static verifyTransaction(transaction: BaseTransaction) {
    return Helper.verifySignature(
      transaction.input.sender,
      transaction.input.signature,
      Helper.hash(transaction.output),
    );
  }
}

export default BaseTransaction;
