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
	login() {
		
		// check to make sure username and password are sent
		// this.validateRequired([ 'email', 'password' ]);
		
		console.log('login request came in');

		this.body = {
			customer: {
				schema: {
					customer_id: 1,
					name: 'Lannucci',
					email: 'lannucci@hotmail.com',
					address_1: 'QI 19',
					address_2: '',
					city: '',
					region: '',
					postal_code: '',
					country: '',
					shipping_region_id: 1,
					day_phone: '+351323213511235',
					eve_phone: '+452436143246123',
					mob_phone: '+351323213511235',
					credit_card: 'XXXXXXXX5100'
				}
			},
			accessToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE1NTA0MjQ0OTgsImV4cCI6MTU1MDUxMDg5OH0.aEFrNUPRWuRWx0IOEL-_A4J4Ti39iXEHAScm6GI61RR',
			expires_in: '24h'
		};
	}

}

// exported user related functions
module.exports = new Customer();