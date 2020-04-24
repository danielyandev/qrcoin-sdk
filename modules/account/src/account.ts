import { Block } from '@danielyandev/qr-blockchain';
import { TransferTransaction, BaseTransaction } from '@danielyandev/qr-transactions';
import { INITIAL_COINS } from '@danielyandev/qr-constants';

class Account {
  addresses: string[];
  balance: any;
  constructor(addresses: string[]) {
    this.addresses = addresses;
    this.balance = {
      [this.addresses[0]]: INITIAL_COINS,
    };
  }

  /**
   * If address does not exist in addresses
   * assign 0 value and push to addresses
   *
   * @param address
   */
  initialize(address: string) {
    if (this.balance[address] === undefined) {
      this.balance[address] = 0;
      this.addresses.push(address);
    }
  }

  /**
   * Transfer given amount from one address to another
   *
   * @param from
   * @param to
   * @param amount
   */
  transfer(from: string, to: string, amount: number) {
    this.initialize(from);
    this.initialize(to);
    this.increment(to, amount);
    this.decrement(from, amount);
  }

  /**
   * Increment address amount
   *
   * @param to
   * @param amount
   */
  increment(to: string, amount: number) {
    this.balance[to] += amount;
  }

  /**
   * Decrement address amount
   *
   * @param from
   * @param amount
   */
  decrement(from: string, amount: number) {
    this.balance[from] -= amount;
  }

  /**
   * Get balance of address
   *
   * @param address
   * @returns {*}
   */
  getBalance(address: string) {
    this.initialize(address);
    return this.balance[address];
  }

  /**
   * Main method to use from outside to transfer amount between addresses
   *
   * @param transaction
   */
  update(transaction: any) {
    const amount = transaction.output.amount;
    const from = transaction.input.sender;
    const to = transaction.output.recipient;
    this.transfer(from, to, amount);
  }

  /**
   * Send transaction fee to leader validator
   *
   * @param block
   * @param transaction
   */
  transferFee(block: Block, transaction: BaseTransaction) {
    const amount = transaction.fee;
    const from = transaction.input.sender;
    const to = block.validator;
    this.transfer(from, to, amount);
  }
}

export default Account;
