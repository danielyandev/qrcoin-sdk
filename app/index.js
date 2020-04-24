const {node:{Node, devnetGenesisBlock}} = require('qrcoin-sdk')

const app = new Node(devnetGenesisBlock)
app.run().then(() => {
    app.logger.info('Node bootstrapped')
})