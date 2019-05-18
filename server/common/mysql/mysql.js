/*
 * mysql functions - decorating standard mysql2 connection with additional convenience functions
 */
const _ = require('lodash');
const fs = require('fs');
const nodeCleanup = require('node-cleanup');

// use utils to read the environment information
const utils = require('../utils/utils.js');

// get the standard promise-mysql object to decorate
const mysql = require('mysql2/promise');

const config = require('./../config/config');

/**
 * returns the database configuration
 * @returns {object} - the database settings
 */
function getDatabaseSettings() {

	// read the database configuration
	try { return config.mysql; }
	catch (e) { console.log('Error parsing config JSON: ', e); }

	// something happened. return an empty object
	return {};
}

/**
 * returns true if the error message is for an abrupt disconnection, i.e. poor network conditions
 * @param {string} errorMessage
 * @returns {boolean}
 */
function isConnErrForRetry(errorMessage) {

	// these are the errors we consider abrupt disconnections
	var connectionErrors = [
		'ended by the other party',
		'ECONNRESET',
		'connection is in closed state'
	];

	// return true if the error is a match
	for (let connectionError of connectionErrors) if (errorMessage.includes(connectionError)) return true;

	// not an abrupt disconnect error
	return false;
}

/**
 * @param {boolean} [multipleStatements] set to true if you want to be able to execute multiple statements in a single call - should never be used in API server and currently only use used batch execution of db patches
 * @param {boolean} [noDatabase] - set to true if you don't want to associate the pool with any database - used at the moment in "npm run bootstrap" to create the database
 * @returns {object} - the database object used to interface with MySQL
 */
async function getDatabaseConnection(multipleStatements, noDatabase) {

	// initialize the connection pool if it was not initialized already
	if (!global.connectionPool) {
		const databaseSettings = getDatabaseSettings();

		const dbConfig = {
			connectionLimit: 100,
			host: databaseSettings.host,
			user: databaseSettings.user,
			password: databaseSettings.password,
			database: noDatabase ? null : databaseSettings.database,
			multipleStatements: multipleStatements
		};

		if (databaseSettings.sslCertificate) dbConfig.ssl = { ca: fs.readFileSync(`${__dirname}/caSslCertificates/${databaseSettings.sslCertificate}`) };

		global.connectionPool = mysql.createPool(dbConfig);

		// close the connection pool when node exists to prevent any stray connections
		const exitHandler = () => global.connectionPool.end();

		// do something when app is closing
		nodeCleanup(exitHandler);
	}

	// get standard database connection from the pool
	let db;
	try {
		db = await global.connectionPool.getConnection();
	} catch (err) {
		if (!isConnErrForRetry(err.message)) throw err;

		// set a 5 second timeout to allow mysql to reboot if it had crashed
		await utils.wait(5);

		db = await global.connectionPool.getConnection();
	}

	// enable named parameters in queries
	db.connection.config.namedPlaceholders = true;

	// cache the native mysql2 node execute function
	db._execute = db.execute;

	// wrap the native execute method so we can convert properties of params from undefined to null because undefined crashes mysql2 and causes multiple restarts
	db.execute = async function (sql, params, errorSql) {

		if (params && typeof params === 'object') {

			for (let param in params) {

				if (!params.hasOwnProperty(param)) continue;

				// convert undefined to null to prevent mysql2 node module crashes
				if (params[param] === undefined) params[param] = null;
			}
		}

		try {
			return await db._execute(sql, params);
		} catch (err) {
			if (!isConnErrForRetry(err.message)) { if (errorSql) err.sql = sql; err.params = params; throw err; }

			// set a 5 second timeout to allow mysql to reboot if it had crashed
			await utils.wait(5);

			// we don't have access to the controller reference, but we can merge the new one with the old reference
			Object.assign(db, await getDatabaseConnection());
			return db._execute(sql, params);
		}
	};

	// cache the native mysql2 node query function
	db._query = db.query;

	// wrap the native query method so we can convert properties of params from undefined to null because undefined crashes mysql2 and causes multiple restarts
	db.query = async function (sql, params) {

		if (params instanceof Array) {

			for (let i = 0; i < params.length; i++) {

				// convert undefined to null to prevent mysql2 node module crashes
				if (params[i] === undefined) params[i] = null;
			}
		}

		try {
			return await db._query(sql, params);
		} catch (err) {
			if (!isConnErrForRetry(err.message)) throw err;

			// set a 5 second timeout to allow mysql to reboot if it had crashed
			await utils.wait(5);

			// we don't have access to the controller reference, but we can merge the new one with the old reference
			Object.assign(db, await getDatabaseConnection());
			return db._query(sql, params);
		}
	};

	/*
	 * function to copy a table to a new table name. used for ETL and drops the table if it exists already. This also brings data
	 */
	db.copyTable = async (tableToCopy, newTableName) => {
		await db.query(`DROP TABLE IF EXISTS ${newTableName}`);
		await db.query(`CREATE TABLE ${newTableName} LIKE ${tableToCopy}`);
		await db.query(`INSERT ${newTableName} SELECT * FROM ${tableToCopy}`);
	};

	/*
	 * function to return all rows from a select query
	 */
	db.selectAll = async function(sql, params) {

		// execute the query and get the results
		let result = await db.query(sql, params);

		// now go through the columns and convert booleans as needed
		for (let col of result[1]) if (col.columnType === 1 && col.columnLength === 1) for (let row of result[0]) row[col.name] = (row[col.name] === 1);
		
		// if there are no results, just return an empty array - otherwise the results are located in the first element of the array
		if (result[0]) return result[0]; else return [];
	};

	/*
	 * function to return first column of all rows from a select query
	 */
	db.selectColumn = async function(sql, params) {

		// execute the query and get the results
		let result = await db.query(sql, params);

		// now go through the columns and convert booleans as needed
		for (let col of result[1]) if (col.columnType === 1 && col.columnLength === 1) for (let row of result[0]) row[col.name] = (row[col.name] === 1);

		// if there are no results, just return an empty array - otherwise the results are located in the first property of each element of the array
		if (result[0] && result[0].length) return _.map(result[0], Object.keys(result[0][0])[0]); else return [];
	};

	/*
	 * function to return all rows from a select query as an associative array
	 */
	db.selectAssoc = async function(sql, params) {

		// execute the query and get the result
		const results = await this.selectAll(sql, params);

		// loop through the array and build an associative version of it (object)
		var assocResults = {};
		results.forEach(function (row) { assocResults[row[Object.keys(row)[0]]] = row[Object.keys(row)[1]]; });
		return assocResults;
	};
	
	/*
	 * function to call a stored procedure
	 */
	db.executeSP = function(sp, params) {
		return this.query(`call ${sp}(${params.map(() => '?').join(',')})`, params);
	};
	
	/*
	 * function to call a stored procedure that returns a result set
	 */
	db.selectAllSP = async function(sp, params) {
		
		// execute the stored procedure and get the results
		const result = await this.executeSP(sp, params);
		
		// now go through the columns and convert booleans as needed
		for (let col of result[1][0]) if (col.columnType === 1 && col.columnLength === 1) for (let row of result[0][0]) row[col.name] = (row[col.name] === 1);
		
		// if there are no results, just return an empty array - otherwise the results are located in the first element of the array
		if (result[0][0]) return result[0][0]; else return [];
	};
	
	/*
	 * function to return first row from a select query in a stored procedure
	 */
	db.selectRowSP = async function(sp, params) {
		
		// get all the records coming from select SQL
		const rows = await this.selectAllSP(sp, params);
		
		// if there are no rows, return false;
		if (!rows[0]) return false;
		
		// return the row
		return rows[0];
	};
	
	/*
	 * function to return first column of the first row from a select query in a stored procedure
	 */
	db.selectValSP = async function(sp, params) {
		
		// get the first row coming from the Select SQL SP
		const row = await this.selectRowSP(sp, params);
		
		// if there are no rows coming in the result, return false
		if (!row) return false;
		
		// return the first column of the first row
		return row[Object.keys(row)[0]];
	};
	
	/*
	 * function to return first row from a select query
	 */
	db.selectRow = async function(sql, params) {

		// get all the records coming from select SQL
		const rows = await this.selectAll(sql, params);

		// if there are no rows, return false;
		if (!rows[0]) return false;

		// return the row
		return rows[0];
	};

	/*
	 * function to return first column of the first row from a select query
	 */
	db.selectVal = async function(sql, params) {

		// get the first row coming from the Select SQL
		const row = await this.selectRow(sql, params);

		// if there are no rows coming in the result, return false
		if (!row) return false;

		// return the first column of the first row
		return row[Object.keys(row)[0]];
	};

	/*
	 * function to insert a record to a table
	 */
	db.insert = async function(table, fields, ignoreDuplicates, replace) {

		// prepare the insert SQL
		let sql = `${(replace ? 'replace ' : 'insert ') + (ignoreDuplicates ? 'ignore ' : '')} into ${table} set `;
		for (let field of Object.keys(fields)) sql += ` ${field} = :${field},`;
		sql = sql.slice(0, -1);

		// if some of the fields are boolean, convert them to integers
		for (let field of Object.keys(fields)) if (typeof(fields[field]) === 'boolean') fields[field] = (fields[field] ? 1 : 0);

		// execute the SQL and get the result in case the query returns an insert ID (for tables with auto_increment keys)
		const result = await this.execute(sql, fields);

		// return insert ID if there is one in the result set - otherwise return zero
		if (result[0] && result[0].insertId) return result[0].insertId; else return 0;
	};

	/*
	 * function to update a record in a table
	 */
	db.update = function(table, fields, keyfield, constantfields, sqlfields, keysfieldnewval) {

		// prepare the update sql statement
		let sql = `update ${table} set `;
		if (fields) for (let col of Object.keys(fields)) if (col !== keyfield) sql += ` ${col} = :${col},`;
		if (constantfields) constantfields.forEach(function (col) { if (col !== keyfield) sql += ` ${col} = ${col},`; });
		if (sqlfields) for (let col of Object.keys(sqlfields)) if (col !== keyfield) sql += ` ${col} = ${sqlfields[col]},`;
		if (keysfieldnewval) sql += ` ${keyfield} = :keyfieldnewval,`;
		sql = sql.slice(0, -1);
		sql += ` where ${keyfield} = :${keyfield}`;
		// debug: console.log(sql);

		// if some of the fields are boolean, convert them to integers
		for (let field of Object.keys(fields)) if (typeof(fields[field]) === 'boolean') fields[field] = (fields[field] ? 1 : 0);

		// if the key field is getting updated, add it to the parameters
		if (keysfieldnewval) fields.keyfieldnewval = keysfieldnewval;

		// execute the update sql statement
		return this.execute(sql, fields);
	};

	/*
	 * function to insert if record does not exist or update if existed
	 */
	db.upsert = (table, fields, keys = Object.keys(fields)) => db.upsertMultiple(table, keys, [ fields ]);

	/**
	 * upserts multiple rows at once
	 */
	db.upsertMultiple = (table, keys, arrayRowsObject) => {

		// if there are no rows to upsert, just return null to avoid an error
		if (!arrayRowsObject.length) return null;

		const arrayRowsArray = [];
		for (let row of arrayRowsObject) {
			arrayRowsArray.push(keys.map(key => row[key]));
		}

		// use 'INSERT ...ON DUPLICATE KEY UPDATE' -- update the existing row with the new values instead When you insert a new row into a table if the row causes a duplicate in UNIQUE index or PRIMARY KEY
		const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ? ON DUPLICATE KEY UPDATE ${keys.map(key => `${key} = VALUES(${key})`).join(',\n')}`;
		return db.query(sql, [ arrayRowsArray ]);
	};

	/*
	 * function to delete a record in a table
	 */
	db.delete = function(table, keyfield, keyval) {

		// prepare delete sql statement
		let sql = `delete from ${table} where ${keyfield} = ?`;

		// execute the delete sql statement
		return this.execute(sql, [ keyval ]);
	};

	/*
	 * function to delete a multiple records in a table
	 */
	db.deleteMultiple = function(table, keyfield, keyvals) {

		// prepare delete sql statement
		let sql = `DELETE FROM ${table} WHERE ${keyfield} IN (${_.map(keyvals, () => '?').join(', ')})`;

		// execute the delete sql statement
		return this.execute(sql, keyvals);
	};

	/*
	 * function to delete a record in a table
	 */
	db.deleteAll = function(table) {

		// prepare delete sql statement
		let sql = `truncate table ${table}`;

		// execute the delete sql statement
		return this.execute(sql);
	};

	// shorten the escape method
	db.escape = value => db.connection.escape(value);

	// return the new connection
	return db;
}

/**
 * mysql connection handler at the beginning of the request
 * @param {Object} ctx
 * @param {Function} next
 */
async function mysqlConnection(ctx, next) {

	// get a new mysql connection from the pool - the error handling for this is separate because we have not added the error handler middleware yet
	// adding the error handler middleware before this step somehow results in a lock-up after the first error - probably something to do with the release of db connection
	try {
		ctx.db = await getDatabaseConnection();
	} catch (err) {
		ctx.status = 400;
		ctx.body = { code: 'DBC_01', message: 'Cannot connect to the database.' };
		ctx.log.error(err);
		return;
	}

	// continue with the api handling middleware
	await next();

	// return connection back to the pool as the control comes back up (through error or success)
	ctx.db.release();
}

// export mysql connection generator function
module.exports = {
	connect: mysqlConnection,
	getDatabaseConnection: getDatabaseConnection
};