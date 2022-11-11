'use strict';

const net = require('net');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');

module.exports = (torrent) => {
  tracker.getPeers(torrent, (peers) => {
    peers.forEach(download);
  });
};

function download(peer) {
  const socket = new net.Socket();
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {});
  onWholeMsg(socket, (data) => {});
  socket.on('data', (data) => {});
}

function onWholeMsg(socket, callback) {
  let savedBuf = Buffer.alloc(0);
  // handshake message is allways recieved first and its only way to tell
  // if we are recieving handshake... it also doesnt tell its length
  // as part of the message
  let handshake = true;

  socket.on('data', (recvBuf) => {
    const msgLen = () =>
      // 68 is length of handshake buffer
      handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
    savedBuf = Buffer.concat([savedBuf, recvBuf]);

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
      callback(savedBuf.slice(0, msgLen()));
      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
}
