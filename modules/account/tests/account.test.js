const {Account} = require('../index')

test('Create account', () => {
    const account = new Account(['initial_address'])
    expect(account.balance.hasOwnProperty('initial_address'))
})