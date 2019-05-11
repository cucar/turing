const queryString = require('querystring');
const fetch = require('node-fetch');

// testing libraries
global.should = require('chai').should();
global.sinon = require('sinon');
global.mocha = require('mocha');
global.describe = mocha.describe;
global.it = mocha.it;
global.before = mocha.before;
global.expect = require('chai').expect;

// get mysql object for database tests
const mysql = require('../mysql/mysql.js');

// api test routine wrapper
global.lastHttpResponseCode = 0;
global.callApi = async function(endpoint, args = {}, method = 'GET', headers = {}) {

	// call the api and return the results - it may be get or post
	let response;
	if (method === 'POST' || method === 'PUT') {
		response = await fetch(`http://localhost:3000/api/${endpoint}`, {
			method: method,
			body: JSON.stringify(args),
			headers: Object.assign({
				'Content-Type': 'application/json',
				'x-forwarded-for': '127.0.0.1'
			}, headers),
		});
	} else if (method === 'GET' || method === 'DELETE') {
		response = await fetch(`http://localhost:3000/api/${endpoint}?${queryString.stringify(args)}`, {
			method: method,
			headers: Object.assign({
				'Content-Type': 'application/json',
				'x-forwarded-for': '127.0.0.1'
			}, headers),
		});
	} else throw new Error(`Unknown request method: ${method}`);
	
	// save the last http response in case the test wants to check it
	global.lastHttpResponseCode = response.status;
	
	// clone the response because the response is a stream. It can only be read once.
	const clone = response.clone();
	// try to parse the json - if we can't return it as text
	let text;
	let json;
	try {
		[ text, json ] = await Promise.all([ clone.text(), response.json() ]);
		return json;
	}
	catch (ex) {
		return text;
	}
};

// server side database test wrapper
// global.db;
global.getDatabaseConnection = async () => {

	// get database connection if needed
	if (!global.db) {
		// console.log('Get db connection');
		global.db = await mysql.getDatabaseConnection();
		// console.log('Connected to MySQL.');
	}
	return global.db;
};