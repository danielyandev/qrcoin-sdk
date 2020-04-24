import { Block } from '@danielyandev/qr-blockchain';
import Wallet from '@danielyandev/qr-wallet';
import * as WebSocket from 'ws';
import { Enums } from '@danielyandev/qr-utils';
import Logger from '@danielyandev/qr-logger';

const MessageTypes = Enums.MessageTypes;

class P2pServer {
  wallet: Wallet;
  nodes: WebSocket[];
  peers: any[];
  port: number;

  constructor(config: any, wallet: Wallet) {
    this.port = config.network.wsPort;
    this.peers = config.knownPeers || [];
    this.wallet = wallet;
    // each node is a socket connection
    this.nodes = [];
  }

  /**
   * Create a new p2p server and connections
   */
  listen() {
    // create the p2p server with port as argument
    const options: WebSocket.ServerOptions = {
      port: this.port,
    };
    const server = new WebSocket.Server(options);

    // event listener and a callback function for any new connection
    // on any new connection the current instance will send the current chain
    // to the newly connected peer
    server.on('connection', (node) => this.connectNode(node));

    // to connect to the peers that we have specified
    this.connectToPeers();

    Logger.log(`Listening for peer to peer connection on port : ${this.port}`);
  }

  /**
   * Add the node to the nodes
   *
   * @param socket
   * @param requestChain
   */
  connectNode(socket: WebSocket, requestChain: boolean = false) {
    // handle close and error methods in connection to reach
    // all further connected nodes events
    socket.on('close', (event: WebSocket.CloseEvent) => this.disconnectNode(event, socket));
    socket.on('error', (error: WebSocket.ErrorEvent) => this.errorOnNode(error, socket));

    Logger.log('Node connected');

    this.nodes.push(socket);
    // register a message event listener to the node
    this.messageHandler(socket);
    // on new connection send the request to receive peer's chain
    if (requestChain) {
      this.sendChainRequest(socket);
    }
  }

  /**
   * Remove node from active nodes
   *
   * @param event
   * @param socket
   */
  disconnectNode(event: WebSocket.CloseEvent, socket: WebSocket) {
    Logger.log('Node disconnected');
    if (event.wasClean) {
      Logger.log(`Socket connection was closed clean, code=${event.code} reason=${event.reason}`);
    } else {
      // server killed process or there were network error
      // mostly event.code 1006
      Logger.log(`Socket connection was dropped, code=${event.code}`);
    }
    this.nodes = this.nodes.filter((node) => node !== socket);
  }

  /**
   * Handle node error
   *
   * @param error
   * @param socket
   */
  errorOnNode(error: WebSocket.ErrorEvent, socket: WebSocket) {
    Logger.log('Error on socket');
    Logger.log(error);
  }

  /**
   * Connect to all nodes
   */
  connectToPeers() {
    // connect to each peer
    this.peers.forEach((peer) => {
      const url = 'ws://' + peer.host + ':' + peer.port;

      try {
        // create a socket for each peer
        const socket = new WebSocket(url);

        socket.on('close', (event: WebSocket.CloseEvent) => this.disconnectNode(event, socket));
        socket.on('error', (error: WebSocket.ErrorEvent) => this.errorOnNode(error, socket));
        // open event listener is emitted when a connection is established
        // saving the socket in the array
        socket.on('open', () => this.connectNode(socket, true));

        Logger.log('Connected to peer ' + url);
      } catch (e) {
        Logger.log("Could't connect to " + url);
      }
    });
  }

  /**
   * Income messages handler
   *
   * @param socket
   */
  messageHandler(socket: WebSocket) {
    // on receiving a message execute a callback function
    socket.on('message', (message: string) => {
      const data = JSON.parse(message);
      switch (data.type) {
        case MessageTypes.chain:
          this.handleReceivedChain(data.chain);
          break;

        case MessageTypes.chain_request:
          this.sendChain(socket);
          break;

        case MessageTypes.block:
          this.handleReceivedBlock(data.block);
          break;

        case MessageTypes.transaction:
          this.handleReceivedTransaction(data.transaction);
          break;
      }
    });
  }

  /**
   * Send current chain to node
   *
   * @param socket
   */
  sendChain(socket: WebSocket) {
    socket.send(
      JSON.stringify({
        type: MessageTypes.chain,
        chain: this.wallet.blockchain.chain,
      }),
    );
  }

  sendChainRequest(socket: WebSocket) {
    socket.send(
      JSON.stringify({
        type: MessageTypes.chain_request,
      }),
    );
  }

  /**
   * Sync current chain with other nodes
   */
  syncChain() {
    this.nodes.forEach((node) => {
      this.sendChain(node);
    });
  }

  /**
   * Send transaction to other nodes
   *
   * @param transaction
   */
  broadcastTransaction(transaction: any) {
    if (transaction) {
      this.nodes.forEach((node) => {
        this.sendTransaction(node, transaction);
      });
    } else {
      Logger.log('Invalid transaction');
    }
  }

  /**
   * Send transaction to given node
   *
   * @param socket
   * @param transaction
   */
  sendTransaction(socket: WebSocket, transaction: any) {
    socket.send(
      JSON.stringify({
        type: MessageTypes.transaction,
        transaction,
      }),
    );
  }

  /**
   * Send block to other nodes
   *
   * @param block
   */
  broadcastBlock(block: Block) {
    this.nodes.forEach((node) => {
      this.sendBlock(node, block);
    });
  }

  /**
   * Send block to given node
   *
   * @param socket
   * @param block
   */
  sendBlock(socket: WebSocket, block: Block) {
    socket.send(
      JSON.stringify({
        type: MessageTypes.block,
        block,
      }),
    );
  }

  /**
   *
   * @param chain
   */
  handleReceivedChain(chain: any[]) {
    this.wallet.blockchain.replaceChain(chain);
  }

  /**
   *
   * @param block
   */
  handleReceivedBlock(block: Block) {
    // check if received block is not the last in chain,
    // if it's the last one, then it's already broadcasted
    if (!this.wallet.blockchain.isLastBlock(block)) {
      Logger.log('New block received');
      if (this.wallet.blockchain.isValidBlock(block)) {
        this.wallet.blockchain.addBlock(block);
        this.broadcastBlock(block);
        this.wallet.blockchain.transactionPool.clear();
      }
    }
  }

  /**
   *
   * @param transaction
   */
  handleReceivedTransaction(transaction: any) {
    // add and broadcast transaction if it's not exist in pool
    if (!this.wallet.blockchain.transactionPool.transactionExists(transaction)) {
      const added = this.wallet.blockchain.transactionPool.addTransaction(transaction);
      if (added) {
        this.broadcastTransaction(transaction);
      }
    }
    // create and broadcast block if leader and threshold reached
    if (this.wallet.blockchain.transactionPool.thresholdReached()) {
      if (this.wallet.blockchain.getLeader() === this.wallet.getPublicKey()) {
        Logger.log('Creating block');
        const block = this.wallet.blockchain.createBlock(
          this.wallet.blockchain.transactionPool.transactions,
          this.wallet,
        );
        this.broadcastBlock(block);
      }
    }
  }
}

export default P2pServer;
