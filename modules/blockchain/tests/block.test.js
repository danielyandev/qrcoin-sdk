const {Block} = require('../index')

test('Create block', () => {
    const block = new Block(Date.now(), 'last-hash', 'new-hash', [], 'test-validator', 'test-signature')
    expect(block.hash === Block.blockHash(block))
})