const {Stake} = require('../index')

test('Create stake', () => {
    const stake = new Stake('initial_address')
    expect(stake.balance.hasOwnProperty('initial_address'))
    expect(stake.addresses[0]).toBe('initial_address')
})