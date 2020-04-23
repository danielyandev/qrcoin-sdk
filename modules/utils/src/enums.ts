enum TransactionTypes {
  transferTransaction = 'TRANSFER_TRANSACTION',
  validatorRequest = 'VALIDATOR_REQUEST',
  stake = 'STAKE',
}

enum MessageTypes {
  chain = 'CHAIN',
  chain_request = 'CHAIN_REQUEST',
  block = 'BLOCK',
  transaction = 'TRANSACTION',
}

enum ConsoleColors {
  red = '\x1b[31m',
  green = '\x1b[32m',
  yellow = '\x1b[33m',
  blue = '\x1b[34m',

  reset = '\x1b[0m',
}

export { TransactionTypes, MessageTypes, ConsoleColors };
