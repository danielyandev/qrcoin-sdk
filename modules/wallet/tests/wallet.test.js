const {InvalidMnemonicException} = require('@danielyandev/qr-exceptions')
const Wallet = require('../index').default


test('throw error on invalid mnemonic', () => {
    const create = () => {
        const wallet = new Wallet('invalid mnemonic', 'blockchain')
    }

    expect(create).toThrow(InvalidMnemonicException)
})