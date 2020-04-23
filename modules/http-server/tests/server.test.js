const HttpServer = require('../index')

test('server does not start without params', () => {
    const create = () => {
        const server = new HttpServer()
    }

    expect(create).toThrow(Error)
})