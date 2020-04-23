import { SHA256 } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { eddsa as EDDSA } from 'elliptic';

const eddsa = new EDDSA('ed25519');

class Helper {
  /**
   * Generate public and private keys from secret
   *
   * @param secret
   * @returns {*}
   */
  static generateKeyPair(secret: string | undefined): any {
    if (secret) {
      return eddsa.keyFromSecret(secret);
    }

    return null;
  }

  /**
   * Get uuid V4
   *
   * @returns {*}
   */
  static id(): string {
    return uuidv4();
  }

  /**
   * Hash the data
   *
   * @param data
   * @returns {*}
   */
  static hash(data: any): string {
    return SHA256(JSON.stringify(data)).toString();
  }

  /**
   *
   * @param publicKey
   * @param signature
   * @param dataHash
   */
  static verifySignature(publicKey: string, signature: string, dataHash: string): boolean {
    return eddsa.keyFromPublic(publicKey).verify(dataHash, signature);
  }

  /**
   * Change config with env variables
   *
   * @param config
   */
  static makeConfig(config: any): any {
    if (process.env.HTTP_PORT) {
      config.network.httpPort = process.env.HTTP_PORT;
    }
    if (process.env.WS_PORT) {
      config.network.wsPort = process.env.WS_PORT;
    }

    if (process.env.PEERS) {
      config.knownPeers = [...new Set([...config.knownPeers, ...this.parsePeersFromString(process.env.PEERS)])];
    }

    return config;
  }

  /**
   * Peer pattern {host, port}
   *
   * Return peer pattern from string given
   * @param str
   */
  static parsePeersFromString(str: string): any[] {
    const peers: any[] = [];
    const peersSplited = str.split(',');

    for (const peerStr of peersSplited) {
      const peer = peerStr.split(':');
      if (peer.hasOwnProperty(0)) {
        peers.push({
          host: peer[0],
          port: peer.hasOwnProperty(1) ? peer[1] : '',
        });
      }
    }

    return peers;
  }
}

export default Helper;
