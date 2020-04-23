class InvalidMnemonicException {
  message: string;
  constructor(message: string = '') {
    this.message = message || 'Invalid mnemonic passed';
  }

  toString() {
    return this.message;
  }
}

export default InvalidMnemonicException;
