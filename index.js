'use strict';
const fs = require('fs');
const bencode = require('bencode');
const tracker = require('./tracker');
const torrentParsers = require('./torrent-parser');

const torrent = torrentParsers.open('test.torrent');

tracker.getPeers(torrent, (peers) => {
  console.log('peers: ', peers);
});
