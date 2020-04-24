const {TransferTransaction} = require('../build')

test('throw error with wrong params', () => {
    const create = () => {
        const tx = new TransferTransaction()
    }

    expect(create).toThrow(Error)
})