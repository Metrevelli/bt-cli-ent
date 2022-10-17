'use strict';

const dgram = require('dgram');
const { Buffer } = require('buffer');
const urlParse = require('url').parse;
const crypto = require('crypto');
const torrentParser = require('./torrent-parser');
const util = require('./util');

module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4');
  const url = socket.announce.toString('utf8');

  udpSend(socket, buildConnReq(), url);
  socket.on('message', (response) => {
    if (respType(response) === 'connect') {
      const connResp = parseConnResp(response);

      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
      udpSend(socket, announceReq, url);
    } else if (respType(response) === 'announce') {
      const announceResp = parseAnnounceResp(response);
      callback(announceResp.peers);
    }
  });
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
  // ...
}

function buildConnReq() {
  const buf = Buffer.alloc(16);

  // 64-bit integer connectionId
  buf.writeUInt32Be(0x1417, 0);
  buf.writeUInt32Be(0x27101980, 4);

  // 32-bit integer action which in this case always should be 4 bytes with value 0.
  buf.writeUInt32BE(0, 8);

  // 32-bit integer transactionId
  crypto.randomBytes(4).copy(buf, 12);

  return buf;
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32Be(0),
    transactionId: resp.readUInt32Be(4),
    // response connectionId is 64 byte so we just slice it and leave as buffer.
    connectionId: resp.slice(8)
  };
}

function buildAnnounceReq(connId, torrent, port = 6881) {
  const buf = Buffer.allocUnsafe(98);

  // connectionId
  connId.copy(buf, 0);

  // action 1 - for announce
  buf.writeUInt32Be(1, 8);

  // transaction id
  crypto.randomBytes(4).copy(buf, 12);

  // info hash
  torrentParser.infoHash(torrent).copy(buf, 16);

  // peerId
  util.genId().copy(buf, 36);

  // downloaded
  Buffer.alloc(8).copy(56);

  // left
  torrentParser.size(torrent).copy(buf, 64);

  // uploaded
  Buffer.alloc(8).copy(buf, 72);

  // event
  buf.writeUInt32BE(0, 80);

  // ip address
  buf.writeUint32BE(0, 84);

  // key
  crypto.randomBytes(4).copy(buf, 88);

  // num want
  buf.writeInt32BE(-1, 92);

  // port
  buf.writeUint16BE(port, 96);
}

function parseAnnounceResp(resp) {
  function group(iterable, groupSize) {
    const groups = [];
    for (let i = 0; i < iterable.length; i += groupsize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: resp.readUInt32Be(0),
    transactionId: resp.readUInt32Be(4),
    leechers: resp.readUInt32Be(12),
    seeders: resp.readUInt32Be(16),
    peers: group(resp.slice(20), 6).map((address) => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.slice(4)
      };
    })
  };
}
