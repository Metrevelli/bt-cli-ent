'use strict';

const torrentParsers = require('./src/torrent-parser');
const download = require('./src/download');

const torrent = torrentParsers.open(process.argv[2]);

download(torrent, torrent.info.name);
