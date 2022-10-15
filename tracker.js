'use strict';

const dgram = require('dgram');
const { Buffer } = require('buffer');
const urlParse = require('url').parse;

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
  // ...
}

function parseConnResp(resp) {
  // ...
}

function buildAnnounceReq(connId) {
  // ...
}

function parseAnnounceResp(resp) {
  // ...
}
