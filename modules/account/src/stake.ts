import { StakeTransaction } from '@danielyandev/qr-transactions';
import Logger from '@danielyandev/qr-logger';

class Stake {
  addresses: string[];
  balance: any;
  constructor(initialAddress: string) {
    this.addresses = [initialAddress];
    this.balance = {
      [initialAddress]: 0,
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
   * Add amount to address
   *
   * @param from
   * @param amount
   */
  addStake(from: string, amount: number) {
    this.initialize(from);
    this.balance[from] += amount;
  }

  /**
   * Get address balance
   *
   * @param address
   * @returns {*}
   */
  getBalance(address: string) {
    this.initialize(address);
    return this.balance[address];
  }

  /**
   * Get an address with max amount staked
   *
   * @param addresses
   */
  getLeader(addresses: string[]) {
    let balance = -1;
    let leader = null;
    addresses.forEach((address) => {
      const addressBalance = this.getBalance(address);
      if (addressBalance > balance) {
        leader = address;
        balance = addressBalance;
      }
    });
    return leader;
  }

  /**
   * Main method to use from outside to add amount to stake
   *
   * @param transaction
   */
  update(transaction: any) {
    const amount = transaction.output.amount;
    const from = transaction.input.sender;
    Logger.log('New amount staked ' + amount);
    this.addStake(from, amount);
  }
}

export default Stake;
