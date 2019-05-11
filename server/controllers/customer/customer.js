const Controller = require('../../common/controller/controller.js');

/**
 * customer object to house customer related functions
 */
class Customer extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/customers/login', method: 'POST', handler: this.login },
		];
	}
	
	/**
	 * login handling
	 */
	async login() {
		
		// check to make sure username and password are sent
		this.validateRequired('USR_02', [ 'email', 'password' ]);
		
		// let customer = await this.db.selectRow('select * from customer where email = ?', [ this.params.email ]);
		let customer = await this.db.selectRowSP('customer_get_login_info', [ this.params.email ]);
		
		this.body = {
			customer: {
				schema: customer
			},
			accessToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE1NTA0MjQ0OTgsImV4cCI6MTU1MDUxMDg5OH0.aEFrNUPRWuRWx0IOEL-_A4J4Ti39iXEHAScm6GI61RR',
			expires_in: '24h'
		};
	}

}

// exported user related functions
module.exports = new Customer();