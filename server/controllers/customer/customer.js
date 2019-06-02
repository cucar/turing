const _ = require('lodash');
const jwt = require('jsonwebtoken');
const addressValidator = require('validator');
const emailValidator = require('email-validator');
const passwordValidator = (new (require('password-validator'))()).is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits().has().symbols();
const phoneValidator = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const fetch = require('node-fetch');

const Controller = require('../../common/controller/controller.js');
const Stripe = require('../../common/stripe/stripe.js');

class Customer extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/customers', method: 'POST', handler: this.register },
			{ path: '/customers/login', method: 'POST', handler: this.login },
			{ path: '/customers/facebook', method: 'POST', handler: this.loginViaFacebook },
			{ path: '/customer', method: 'GET', handler: this.getCustomer, auth: true },
			{ path: '/customer', method: 'PUT', handler: this.updateCustomer, auth: true },
			{ path: '/customers/address', method: 'PUT', handler: this.updateCustomerAddress, auth: true },
			{ path: '/customers/creditCard', method: 'PUT', handler: this.updateCustomerCreditCard, auth: true },
		];
	}
	
	/**
	 * registers a new customer
	 * @throws USR_02 - The field(s) are/is required.
	 * @throws USR_03 - The email is invalid.
	 * @throws USR_10 - The password is insecure.
	 * @throws USR_04 - The email already exists.
	 */
	async register() {

		this.validateRequired('USR_02', [ 'name', 'email', 'password' ]);
		
		if (!emailValidator.validate(this.param('email')))
			this.throw('USR_03', 'The email is invalid.');
		
		if (!passwordValidator.validate(this.param('password')))
			this.throw('USR_10', 'The password is insecure. Please use a password of at least 8 characters with at least one upper case, lower case, number and a special character.');
		
		if (await this.db.selectRowSP('customer_get_login_info', [ this.param('email') ]))
			this.throw('USR_04', 'The email already exists.');
		
		const encryptedPassword = await this.encryptPassword(this.param('password'));
		
		const customerId = await this.db.insert('customer', { name: this.param('name'), email: this.param('email'), password: encryptedPassword });
		
		let token = jwt.sign({ customer_id: customerId }, this.config.token_encryption_key, { expiresIn: '24h' });
		
		this.body = {
			customer: { schema: await this.getCustomerReturnDataById(customerId) },
			accessToken: `Bearer ${token}`,
			expires_in: '24h'
		};
	}
	
	/**
	 * login handling
	 * @throws USR_02 - The field(s) are/is required.
	 * @throws USR_05 - The email doesn't exist.
	 * @throws USR_15 - Invalid password.
	 */
	async login() {
		
		this.validateRequired('USR_02', [ 'email', 'password' ]);
		
		let customer = await this.getCustomerByEmail(this.param('email'));
		if (_.isEmpty(customer)) this.throw('USR_05', 'The email does not exist.');
		
		if (await this.encryptPassword(this.param('password')) !== customer.password) this.throw('USR_15', 'Invalid password.');
		
		let token = jwt.sign({ customer_id: customer.customer_id }, this.config.token_encryption_key, { expiresIn: '24h' });
		
		this.body = {
			customer: { schema: _.omit(customer, 'password') },
			accessToken: `Bearer ${token}`,
			expires_in: '24h'
		};
	}
	
	/**
	 * login via Facebook request
	 * @throws USR_02 - The field(s) are/is required.
	 * @throws USR_05 - The email doesn't exist.
	 * @throws USR_14 - Facebook email information could not be retrieved.
	 */
	async loginViaFacebook() {
		
		this.validateRequired('USR_02', [ 'access_token' ]);
		
		// get customer email by calling Facebook to get access token information
		let response = await fetch(`https://graph.facebook.com/me?access_token=${this.params.access_token}&fields=email`);
		let facebookCustomer = await response.json();
		
		// error out if email cannot be retrieved from access token
		if (!facebookCustomer.email) this.throw('USR_14', 'Facebook email information could not be retrieved.');

		// check if we can find the customer from email
		let customer = _.omit(await this.getCustomerByEmail(facebookCustomer.email), 'password');
		if (_.isEmpty(customer)) this.throw('USR_05', 'The email does not exist.');

		// create a token as usual as if the customer email was sent directly for login - no need for password authentication - Facebook did that
		let token = jwt.sign({ customer_id: customer.customer_id }, this.config.token_encryption_key, { expiresIn: '24h' });
		
		this.body = {
			customer: { schema: customer },
			accessToken: `Bearer ${token}`,
			expires_in: '24h'
		};
	}
	
	/**
	 * get customer info request handler
	 */
	async getCustomer() {
		this.body = await this.getCustomerReturnDataById();
	}
	
	/**
	 * update customer info request handler
	 * @throws USR_02 - The field(s) are/is required.
	 * @throws USR_03 - The email is invalid.
	 * @throws USR_06 - Invalid phone number.
	 * @throws USR_10 - The password is insecure.
	 * @throws USR_16 - Email already in use.
	 */
	async updateCustomer() {
		
		this.validateRequired('USR_02', [ 'name', 'email' ]);
		
		if (!emailValidator.validate(this.param('email')))
			this.throw('USR_03', 'The email is invalid.');
		
		let customerUpdateData = {
			customer_id: this.customerInfo.customer_id,
			name: this.param('name'),
			email: this.param('email')
		};
		
		if (await this.db.selectVal('select 1 from customer where email = ? and customer_id != ?', [ this.param('email'), this.customerInfo.customer_id ]))
			this.throw('USR_16', 'Email already in use.');
		
		if (this.param('password')) {
			if (!passwordValidator.validate(this.param('password')))
				this.throw('USR_10', 'The password is insecure. Please use a password of at least 8 characters with at least one upper case, lower case, number and a special character.');
			customerUpdateData.password = await this.encryptPassword(this.param('password'));
		}
		
		for (let phoneField of [ 'day_phone', 'eve_phone', 'mob_phone' ]) {
			
			// TODO: only do phone validation for US phone numbers for now - the others can be added but would require a more strict check of country codes
			if (this.param(phoneField) && !phoneValidator.isValidNumber(phoneValidator.parse(this.param(phoneField), 'US'))) this.throw('USR_06', 'Invalid phone number.');
			
			customerUpdateData[ phoneField ] = this.param(phoneField);
		}
		
		await this.db.update('customer', customerUpdateData, 'customer_id');
		
		this.body = await this.getCustomerReturnDataById();
	}
	
	/**
	 * update customer address request handler
	 * @throws USR_02 - The field(s) are/is required.
	 * @throws USR_09 - The Shipping Region ID is not number
	 * @throws USR_12 - Invalid country code.
	 * @throws USR_13 - Invalid zip code.
	 */
	async updateCustomerAddress() {
		
		// debug: await require('../../common/utils/utils').wait(5);

		this.validateRequired('USR_02', [ 'address_1', 'city', 'region', 'postal_code', 'country', 'shipping_region_id' ]);
		
		if (!addressValidator.isPostalCodeLocales.includes(this.param('country')))
			this.throw('USR_12', 'Invalid country code.');
		
		if (!addressValidator.isPostalCode(this.param('postal_code'), this.param('country')))
			this.throw('USR_13', 'Invalid zip code.');
		
		if (isNaN(this.param('shipping_region_id')))
			this.throw('USR_09', 'The Shipping Region ID is not number');
		
		await this.db.update('customer', {
			customer_id: this.customerInfo.customer_id,
			address_1: this.param('address_1'),
			address_2: this.param('address_2'),
			city: this.param('city'),
			region: this.param('region'),
			postal_code: this.param('postal_code'),
			country: this.param('country'),
			shipping_region_id: this.param('shipping_region_id')
		}, 'customer_id');
		
		this.body = await this.getCustomerReturnDataById();
	}
	
	/**
	 * update customer credit card token request handler. Note that this is NOT the actual card number. It's a token from stripe obtained on the client side.
	 * token creation process does not touch our server. that way we can stay PCI compliant and still charge the customer saved card on file at checkout.
	 * @throws USR_02 - The field(s) are/is required.
	 * @throws USR_08 - This is an invalid Credit Card.
	 */
	async updateCustomerCreditCard() {
		
		this.validateRequired('USR_02', [ 'credit_card' ]);
		
		// if we already saved this customer on stripe before, just update the default payment method and we're done
		if (this.customerInfo.credit_card) {
			Stripe.updateCustomer(this.customerInfo.credit_card, this.param('credit_card'));
			this.body = await this.getCustomerReturnDataById();
			return;
		}
		
		// never saved this customer in stripe before - save the card token with the customer email on stripe - this will get us a new customer ID and we'll store that
		const stripeCustomer = await Stripe.createCustomer(this.param('credit_card'), this.customerInfo.email);
		await this.db.update('customer', { customer_id: this.customerInfo.customer_id, credit_card: stripeCustomer.id }, 'customer_id');
		this.body = await this.getCustomerReturnDataById();
	}
	
	/*
	 * returns customer information for a given customer ID
	 */
	async getCustomerReturnDataById(customerId) {
		return _.omit(await this.getCustomerById(customerId || this.customerInfo.customer_id), 'password');
	}

	/*
	 * encrypts a password
	 */
	async encryptPassword(clearPassword) {
		const encryptedPassword = await this.db.selectVal(`select hex(aes_encrypt(?, '${this.config.password_encryption_key}'))`, [ clearPassword ]);
		if (!encryptedPassword) this.throw('USR_11', 'Cannot encrypt password.');
		return encryptedPassword;
	}
	
	/*
	 * returns customer information for a given customer email
	 */
	getCustomerByEmail(email) {
		// we could also do selectRowSP('customer_get_login_info', [ email ]) but that only returns 2 fields - it should probably be altered
		return this.db.selectRow('select * from customer where email = ?', [ email ]);
	}
	
}

// exported user related functions
module.exports = new Customer();