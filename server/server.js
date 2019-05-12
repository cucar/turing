const _ = require('lodash');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBodyParser = require('koa-bodyparser');
const koaBunyanLogger = require('koa-bunyan-logger');
const bunyanLogger = require('bunyan');
const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');

const mysql = require('./common/mysql/mysql.js');
const config = require('./common/config/config');

// check for log folder. If not there, create it.
try {
	mkdir.sync('./log');
} catch (err) {
	throw Error('There was an issue creating or reading the ./log folder. Please check for read or write access to the log folder.');
}

// set up application controllers which are api request handlers
const controllersDir = path.resolve(__dirname, './controllers');
const controllerFoldersDir = fs.readdirSync(controllersDir);
let controllers = [];
for (let controllerFolderDir of controllerFoldersDir) {
	const controllersFileNames = fs.readdirSync(path.resolve(controllersDir, controllerFolderDir));
	controllers = controllers.concat(
		_.map(
			_.filter(controllersFileNames, fileName => !fileName.includes('.spec.js')),
			fileName => require(path.resolve('./controllers', controllerFolderDir, fileName))
		)
	);
}

// initialize and export application
const api = new Koa();

// setup logging for errors
api.use(koaBunyanLogger(bunyanLogger.createLogger({ name: 'turing', streams: [ { type: 'rotating-file', path: './log/api-error.log', level: 'error', period: '1d', count: 7 } ] })));

/**
 * handle thrown or uncaught exceptions
 * @param {Error} err - the error that we caught. this should be an Error object
 * @param {object} ctx - the koa.js context
 */
function handleError(err, ctx) {

	// if we handled the request successfully everything's ok we return 200 - otherwise return 400 status code for most errors - the only exception is authorization errors - those are 401
	ctx.status = (err.code && err.code.startsWith('AUT') ? 401 : 400);

	// return error code and message with HTTP status code
	ctx.body = { code: (err.code || 'SRV_01'), message: (err.message || 'Unknown error') };
	
	// add field detail if given
	if (err.field) ctx.body.field = err.field;

	// add stack trace in development for unknown errors
	if ((api.env === 'dev') && err.stack && !err.code) ctx.response.body.message += ` ${err.stack}`;

	// save the error to the application error logs file
	ctx.log.error(err);

	// release the db connection if not already done
	ctx.db.release();
}

// await control down the line - the error handler is executed when the control is coming back up
api.use(async function(ctx, next) {
	try {
		await next();
	} catch (err) {
		handleError(err, ctx);
	}
});

// centralized standard error handling that does not go through the standard throw mechanisms - similar handling
api.on('error', (err, ctx) => handleError(err, ctx));

// parse json post request body
api.use(koaBodyParser());

/**
 * quick access function for ip address
 */
function getKoaIP(request) {
	
	// ip address to be returned - this is populated from koa ip variable by default but we need some additional processing (see below)
	let ip = request.request.ip;
	
	// we can also retrieve the ip address from x-forwarded-for header - sent in tests
	if (request.request.header['x-forwarded-for']) {
		
		// request can be forwarded for multiple IPs
		const forwardedForIPs = request.request.header['x-forwarded-for'].split(',');
		
		// if any one of the forwarded IPs contain localhost, return that
		if (forwardedForIPs.includes('::1') || forwardedForIPs.includes('::ffff:127.0.0.1')) return '127.0.0.1';
		
		// we have to return only one IP from this function - even if there are more IPs than one that the request is forwarded for, grab the first one
		ip = forwardedForIPs[0];
	}

	// if the ip address is some form of localhost, return that - otherwise return it directly from koa
	return (ip.includes('::1') || ip.includes('::ffff:127.0.0.1') ? '127.0.0.1' : ip);
}
api.use(async function(ctx, next) {
	ctx.ip_address = getKoaIP(ctx);
	await next();
});

// create MySQL connection pool with max process limit
api.use(mysql.connect);

// setup routes with every controller
const router = new KoaRouter({ prefix: '/api' });
for (let controller of controllers) controller.setupRoutes(router, api);

// now register the routes
api.use(router.routes());

// handle unknown requests
api.use(ctx => ctx.throw(`Unknown Request: ${ctx.request.url}`));

// initialize application
api.listen(config.port);

console.log('Server started');
console.log(`Environment: ${api.env}`);
console.log(`Port: ${config.port}`);

module.exports = api;