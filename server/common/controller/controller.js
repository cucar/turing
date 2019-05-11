const _ = require('lodash');
const config = require('./../config/config');

/*
 * base controller - contains common routines and business logic
 */
class Controller {

	/*
	 * connect routes with handlers for a controller
	 */
	setupRoutes(router, api) {

		// setup reference to the object in koa and vice versa
		let object = this;
		let objectName = this.constructor.name.toLowerCase();
		api.use(async function(ctx, next) {
			
			// create new object for the request
			let handlerObject = _.cloneDeep(object);

			// set reference to koa in this object and various useful objects in koa
			handlerObject.koa = ctx;
			
			// set reference to this object in koa
			ctx[objectName] = handlerObject;
			
			// prepare an interface for koa to return the controller based on its name - this would also be implemented by the job class, which is the other possible host we may have
			handlerObject.koa.getController = function(controller) { return this[controller]; };

			// follow on to the next route
			await next();
		});

		// setup the routes for the object - default method is GET
		for (let route of this.routes()) {
			const method = (_.get(route, 'method') || 'GET').toLowerCase();
			router[method](route.path, (ctx, next) => ctx[objectName][route.handler.name](ctx, next));
		}
	}

	/*
	 * getter for the config
	 */
	static get config() {
		return config;
	}

	/*
	 * body setter - pass it on to the koa object body setter
	 */
	set body(response) {
		this.koa.body = response;
	}

	/*
	 * refers to the koa request object
	 */
	get request() {
		return this.koa.request;
	}

	/*
	 * mysql reference
	 */
	get db() {
		return this.koa.db;
	}

	/*
	 * returns current environment (dev/prod)
	 */
	get env() {
		return this.koa.app.env;
	}

	/**
	* returns controller from the host
	*/
	getController(controller) {
		return this.koa.getController(controller);
	}

	/*
	 * refers to the koa ip address (the connecting client's ip address)
	 */
	get ipAddress() {
		return this.koa.ip_address;
	}

	/*
	 * refers to the koa ip address
	 */
	get protocol() {
		return this.request.protocol;
	}

	/*
	 * returns the current customer information
	 */
	get customer() {
		return this.koa.customer;
	}

	/*
	 * sets the current user information
	 */
	set customer(customer) {
		this.koa.customer = customer;
	}

	/*
	 * parameters shorthand
	 */
	get params() {
		return this.request.body;
	}

	/*
	 * returns a parameter sent to the api
	 */
	param(field) {
		return this.request.body[field];
	}

	/**
	 * throws an exception
	 */
	throw(err) {
		this.koa.throw(err);
	}

	/*
	 * validate required fields
	 */
	validateRequired(code, fields, object) {
		for (let field of fields)
			if (!(field in (object || this.params))) this.throw({ code: code, message: 'The field(s) are/is required.', field: field });
	}

	/**
	 * lists handling - return a page from database directly to the client side
	 */
	async list(table, filters, columns, params, pageSize, groupBy, transformations) {

		// page number and order inputs are required
		this.validateRequired([ 'page_number', 'order_by' ]);
		this.body = await this.getListData(table, filters, columns, params, pageSize, groupBy, transformations);
	}

	/**
	 * lists handling - return a page from database
	 */
	async getListData(table, filters, columns = '*', params, pageSize, groupBy, transformations) {

		// get the parameters
		const pageNumber = this.param('page_number') || 1;
		const orderBy = this.param('order_by');
		const orderAscending = this.param('order_ascending');

		// prepare filters sql if any filters are given
		let filtersSql = filters.join(' and ');
		if (filtersSql) filtersSql = ` where ${filtersSql}`;

		// get record count for pagination - adjusted for grouped queries as needed
		let listCount = 0;
		if (groupBy || table.toLowerCase().includes('group by')) listCount = await this.db.select_val(`select count(*) from (select 1 as group_counts from ${table} ${filtersSql} ${groupBy ? groupBy : ''}) q`, params);
		else listCount = await this.db.select_val(`select count(*) from ${table} ${filtersSql}`, params);

		// if the page number goes higher than the maximum count, return error
		if (pageSize && pageNumber !== 1 && listCount <= (pageNumber - 1) * pageSize) this.throw(`Incorrect page number: ${pageNumber}`);

		// prepare query parameters - add to existing parameters if there are any
		let sqlParams = (params ? params : []);
		sqlParams.push((pageNumber - 1) * pageSize);
		sqlParams.push(pageSize);

		// get the records in the page
		let sql = `
			select ${columns}
			from ${table}
			${filtersSql}
			${groupBy ? groupBy : ''}
			${orderBy ? `order by ${this.db.escape(orderBy).replace(/'/g, '')}
			${orderAscending ? 'asc' : 'desc'}` : ''}
			${pageSize ? 'limit ?, ?' : ''}
		`;
		let listRecords = await this.db.selectAll(sql, sqlParams);
		if (!listRecords) this.throw('No data in results');

		// in order to improve query performance, we sometimes do data transformations to list records after the data is retrieved
		if (transformations) listRecords = _.map(listRecords, listRecord => _.merge(_.cloneDeep(listRecord), transformations(listRecord)));

		// return the data in the page along with total count
		return {
			status: 'Success',
			list_count: listCount,
			list_records: listRecords
		};
	}
}

// export controller class
module.exports = Controller;