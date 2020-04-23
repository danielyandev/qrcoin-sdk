const TransactionPool = require('../index').default

test('transactions array is empty', () => {
    const transactionPool = new TransactionPool()

    expect(transactionPool.transactions).toBeInstanceOf(Array)
})