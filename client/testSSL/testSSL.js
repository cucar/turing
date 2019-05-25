let path = require('path');
let fs = require('fs');
let express = require('express');
let https = require('https');

https.createServer({ key: fs.readFileSync(path.resolve('testSSL.key')), cert: fs.readFileSync(path.resolve('testSSL.crt')) }, express().use(express.static('../build'))).listen(443);