// get stripe handle - using secret key (not publishable key) - got it from https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_NjRQY4OeXsQD0ijJ7rbI4FNI00QLcA5CYY');

// this is the endpoint secret is a token setup by creating the webhook on stripe - this is the key with which stripe will call us for event notifications
const endpointSecret = 'whsec_bJnTBcyIDvDREqNLymbVNfOzUokj8u23';

/**
 * wrapper class for stripe functions so that we can have the keys in a single place
 */
class Stripe {
	
	/**
	 * save the card and return new stripe customer id
	 */
	static createCustomer(token, email) {
		return stripe.customers.create({ source: token, email: email });
	}
	
	/**
	 * saves the card for an existing stripe customer id
	 */
	static updateCustomer(customerId, token) {
		return stripe.customers.update(customerId, { source: token });
	}

	/**
	 * charge customer card at checkout
	 */
	static charge(transaction) {
		return stripe.charges.create(transaction);
	}
	
	/**
	 * construct webhook event
	 */
	static constructEvent(event, signature) {
		return stripe.webhooks.constructEvent(event, signature, endpointSecret);
	}
}

module.exports = Stripe;