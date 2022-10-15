'use strict';
const fs = require('fs');
const bencode = require('bencode');

const torrent = bencode.decode(fs.readFileSync('test.torrent'));

// const url = urlParse(torrent.announce.toString('utf8'));

// const socket = dgram.createSocket('udp4');

// const myMsg = Buffer.from('hello?', 'utf8');

// socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});

// socket.on('message', (message) => {
//   console.log('message is ' + message);
// });
// console.log(url);
// console.log(torrent.announce.toString('utf8'));
// console.log(torrent.toString('utf8'));
