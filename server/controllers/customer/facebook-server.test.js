let path = require('path');
let fs = require('fs');
let express = require('express');
let https = require('https');

https.createServer({ key: fs.readFileSync(path.resolve('facebook.key')), cert: fs.readFileSync(path.resolve('facebook.crt')) }, express().use(express.static('.'))).listen(443);