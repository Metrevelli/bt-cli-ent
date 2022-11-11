'use strict';
const tracker = require('./src/tracker');
const torrentParsers = require('./src/torrent-parser');

const torrent = torrentParsers.open(process.argv[2]);

tracker.getPeers(torrent, (peers) => {
  console.log('peers: ', peers);
});
