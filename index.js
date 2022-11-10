'use strict';
const tracker = require('./tracker');
const torrentParsers = require('./torrent-parser');

const torrent = torrentParsers.open('test.torrent');

tracker.getPeers(torrent, (peers) => {
  console.log('peers: ', peers);
});
