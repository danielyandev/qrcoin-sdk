const {TransferTransaction} = require('../index')

test('throws error with wrong params', () => {
    const create = () => {
        const tx = new TransferTransaction()
    }

    expect(create).toThrow(Error)
})