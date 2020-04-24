import { ValidatorRequestTransaction } from '@danielyandev/qr-transactions';
import { VALIDATORS_FEE } from '@danielyandev/qr-constants';
import Logger from '@danielyandev/qr-logger';

class Validators {
  list: string[];
  constructor(initialValidator: string) {
    this.list = [initialValidator];
  }

  update(transaction: any) {
    if (transaction.output.amount >= VALIDATORS_FEE && transaction.output.recipient === '0') {
      Logger.log('New validator added');
      this.list.push(transaction.input.sender);
      return true;
    }
    return false;
  }
}

export default Validators;
