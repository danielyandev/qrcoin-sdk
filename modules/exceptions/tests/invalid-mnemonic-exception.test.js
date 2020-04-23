const {InvalidMnemonicException} = require('../index')

test('throw InvalidMnemonicException exception', () => {
    const exception = () => {
        throw new InvalidMnemonicException()
    }

    expect(exception).toThrow(InvalidMnemonicException)
})