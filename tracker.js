'use strict';

const dgram = require('dgram');
const { Buffer } = require('buffer');
const urlParse = require('url').parse;
const crypto = require('crypto');

module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4');
  const url = socket.announce.toString('utf8');

  udpSend(socket, buildConnReq(), url);
  socket.on('message', (response) => {
    if (respType(response) === 'connect') {
      const connResp = parseConnResp(response);

      const announceReq = buildAnnounceReq(connResp.connectionId);
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

  buf.writeUInt32Be(0x1417, 0);
  buf.writeUInt32Be(0x27101980, 4);
  buf.writeUInt32BE(0, 8);

  crypto.randomBytes(4).copy(buf, 12);

  return buf;
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32Be(0),
    transactionId: resp.readUInt32Be(4),
    connectionId: resp.slice(8)
  };
}

function buildAnnounceReq(connId) {
  // ...
}

function parseAnnounceResp(resp) {
  // ...
}
