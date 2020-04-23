import TransferTransaction from './transfer-transaction';
import Wallet from '@danielyandev/qr-wallet';
import { VALIDATORS_FEE } from '@danielyandev/qr-constants';
import { Enums } from '@danielyandev/qr-utils';
import { ITransferTransactionOutput } from '@danielyandev/qr-utils/build/src/interfaces';

const { TransactionTypes } = Enums;

const VALIDATOR_OUTPUT = {
  recipient: '0',
  amount: VALIDATORS_FEE,
};
class ValidatorRequestTransaction extends TransferTransaction {
  type: string = TransactionTypes.validatorRequest;
  output: ITransferTransactionOutput;
  constructor(senderWallet: Wallet) {
    super(senderWallet, VALIDATOR_OUTPUT);
    this.output = super.output as ITransferTransactionOutput;
    this.create(senderWallet, VALIDATOR_OUTPUT);
  }
}

export default ValidatorRequestTransaction;
