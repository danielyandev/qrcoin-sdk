const {Validators} = require('../index')

test('Create stake', () => {
    const validators = new Validators('initial_address')
    expect(validators.list[0]).toBe('initial_address')
})