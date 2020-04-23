const P2pPServer = require('../index')

test('server does not start without params', () => {
    const create = () => {
        const server = new P2pPServer()
    }

    expect(create).toThrow(Error)
})