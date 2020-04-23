interface IBaseTransactionInput {
  sender: string;
  signature: string;
}

interface ITransferTransactionOutput {
  recipient: string;
  amount: number;
}

interface IStakeTransactionOutput {
  amount: number;
}

export { IBaseTransactionInput, ITransferTransactionOutput, IStakeTransactionOutput };
