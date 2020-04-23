import BaseTransaction from './base-transaction';
import Wallet from '@danielyandev/qr-wallet';
import { Enums } from '@danielyandev/qr-utils';
import { ITransferTransactionOutput } from '@danielyandev/qr-utils/build/src/interfaces';

const { TransactionTypes } = Enums;

class TransferTransaction extends BaseTransaction {
  type: string = TransactionTypes.transferTransaction;
  output: ITransferTransactionOutput;

  constructor(senderWallet: Wallet, output: object) {
    super();
    this.output = super.output as ITransferTransactionOutput;
    this.create(senderWallet, output);
  }

  /**
   * Validate transaction output
   */
  public validateOutput(output: ITransferTransactionOutput): boolean {
    return !!(output.recipient && output.amount);
  }

  /**
   * Apply transaction output
   *
   * @param output
   */
  public applyOutput(output: ITransferTransactionOutput): void {
    this.output = output;
  }
}

export default TransferTransaction;
