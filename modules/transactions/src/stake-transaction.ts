import Wallet from '@danielyandev/qr-wallet';
import BaseTransaction from './base-transaction';

import { Enums } from '@danielyandev/qr-utils';
import { IStakeTransactionOutput } from '@danielyandev/qr-utils/build/src/interfaces';

const { TransactionTypes } = Enums;

class StakeTransaction extends BaseTransaction {
  type: string = TransactionTypes.stake;
  output: IStakeTransactionOutput;
  constructor(senderWallet: Wallet, output: object) {
    super();
    this.output = super.output as IStakeTransactionOutput;
    this.create(senderWallet, output);
  }
}

export default StakeTransaction;
