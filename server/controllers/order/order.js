const Controller = require('../../common/controller/controller.js');
const Stripe = require('../../common/stripe/stripe.js');

class Order extends Controller {
	
	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/orders', method: 'POST', handler: this.createOrder, auth: true },
			{ path: '/orders/inCustomer', handler: this.getCustomerOrders, auth: true },
			{ path: '/orders/shortDetail/:order_id', handler: this.getOrderShortDetails, auth: true },
			{ path: '/orders/:order_id', handler: this.getOrderProducts, auth: true },
			{ path: '/orders/stripe/webhooks', method: 'POST', handler: this.postOrderEvent },
		];
	}
	
	/**
	 * creates a new order from a cart
	 * @throws ORD_01 - fields required.
	 * @throws ORD_03 - card declined.
	 * @throws ORD_04 - invalid response from stripe
	 * @throws ORD_11 - no product in cart
	 */
	async createOrder() {
		
		this.validateRequired('PRD_01', [ 'cart_id', 'shipping_id' ]);
		
		if (this.param('shipping_id') === 0) this.throw('ORD_01', 'Shipping method is required.');
		
		// get order total to be charged to the customer from the cart
		const cartTotal = parseFloat(await this.db.selectVal(`
			select sum(coalesce(nullif(p.discounted_price, 0), p.price)) as total_amount
			from shopping_cart sc
			join product p on sc.product_id = p.product_id
			where sc.cart_id = ?
			and sc.buy_now = 1
		`, [ this.param('cart_id') ]));
		
		// if there are no products in cart, do not allow creation of order
		if (!cartTotal) this.throw('ORD_11', 'No products in cart.');
		
		// get the cost of the shipping method
		const shippingAmount = parseFloat(await this.db.selectVal('select shipping_cost from shipping where shipping_id = ?', [ this.param('shipping_id') ]));
		// debug: console.log('shipping amount', shippingAmount);
		
		// calculate the tax amount we should use - we use the same routine in cart controller that was used to shown the tax amount at checkout
		const taxAmount = this.getController('cart').getCheckoutTaxAmount(await this.getController('cart').getCartProducts(this.param('cart_id')));
		// debug: console.log('tax amount', taxAmount);
		
		// set the order amount - add up cart products total, tax and shipping
		const orderTotal = Math.round((cartTotal + shippingAmount + taxAmount) * 100) / 100;
		// debug: console.log('order total', orderTotal);
		
		// insert a new record into orders and obtain the new order ID
		const orderId = await this.db.insert('orders', {
			created_on: new Date(),
			customer_id: this.customerInfo.customer_id,
			shipping_id: this.param('shipping_id'),
			tax_amount: taxAmount,
			total_amount: orderTotal
		});
		
		// we create the order ID initially to be able to send it to stripe but it is not finalized yet. if the charges don't succeed we will delete that order and leave the cart as-is.
		try {

			// prepare the api parameters to be sent to stripe to charge the card
			let stripeTransaction = {
				amount: orderTotal * 100, // needs to be sent in cents
				currency: 'usd',
				description: 'Customer Turing Order',
				metadata: { order_id: orderId },
				receipt_email: this.customerInfo.email // sends order notification email to the customer from stripe if charges are successful
			};

			// determine the source to use for the stripe charge. if stripe token is sent, use that. stripe token is created on the client side from credit card data without coming to our server
			// this makes sure we are PCI compliant. if stripe token is not sent, it means customer wants to use card on file (stripe customer id). collect the charges either with new card or card on file.
			// if stripe token is not sent and there was no card on file (UI should not allow this to happen) this call would error out.
			// in order to simulate declined card, just send a bad token - response should include error object with details
			if (this.param('stripe_token')) stripeTransaction.source = this.param('stripe_token');
			else stripeTransaction.customer = this.customerInfo.credit_card;
			
			// now make the actual call to stripe to charge the card
			const charge = await Stripe.charge(stripeTransaction);
			// debug:
			console.log('stripe successful', stripeTransaction, charge);

			// check to make sure the charges were successful
			if (!charge || !charge.id || !charge.balance_transaction) this.throw('ORD_04', `Invalid response: ${JSON.stringify(charge)}`);
			
			// update order auth code and reference and set it paid (status = 1 means paid)
			await this.db.update('orders', { auth_code: charge.id, reference: charge.balance_transaction, status: 1, order_id: orderId }, 'order_id');
			
			// save the charge response as an audit log for the order
			await this.db.insert('audit', { order_id: orderId, created_on: new Date(), message: JSON.stringify(charge), code: 0, event_id: 'original_charge' });
		}
		catch (ex) {
			
			// debug:
			console.log('stripe declined', ex);
			
			// delete the temporary order record
			await this.db.delete('orders', 'order_id', orderId);
			
			// return error to the client side - allow the user to re-try - don't continue to checkout final page
			this.throw('ORD_03', `Card declined: ${ex.message}`);
		}
		
		// charges were successful - now we will complete the order by populating order_detail table and clearing the cart
		await this.db.execute(`
			insert into order_detail (order_id, product_id, attributes, product_name, quantity, unit_cost)
			select ?, p.product_id, sc.attributes, p.name, sc.quantity, coalesce(nullif(p.discounted_price, 0), p.price) as unit_cost
			from shopping_cart sc
			join product p on sc.product_id = p.product_id
			where sc.cart_id = ?
			and sc.buy_now = 1
		`, [ orderId, this.param('cart_id') ]);
		
		// clear the shopping cart
		await this.db.executeSP('shopping_cart_empty', [ this.param('cart_id') ]);
		
		// return successful response with order ID
		this.body = { order_id: orderId };
	}
	
	/**
	 * get order short info request handler
	 * @throws ORD_02 - Unauthorized access.
	 */
	async getOrderShortDetails(ctx) {
		await this.checkOrderAccess(ctx.params.order_id);
		this.body = await this.db.selectRow(`
			select o.order_id, o.total_amount, date_format(o.created_on, "%Y-%m-%d") as created_on, o.auth_code, o.reference, s.shipping_type, o.tax_amount
			from orders o
			left join shipping s on o.shipping_id = s.shipping_id
			where o.order_id = ?
		`, [ ctx.params.order_id ]);
	}
	
	/**
	 * checks if order access is authorized
	 * @throws ORD_02 - Unauthorized access.
	 */
	async checkOrderAccess(orderId) {
		if (this.customerInfo.customer_id !== await this.db.selectVal('select customer_id from orders where order_id = ?', [ orderId ])) this.throw('ORD_02', 'Unauthorized access.');
	}
	
	/**
	 * get order products request handler
	 * @throws ORD_02 - Unauthorized access.
	 */
	async getOrderProducts(ctx) {
		await this.checkOrderAccess(ctx.params.order_id);
		await this.list({
			table: 'order_detail',
			columns: 'order_id, product_id, attributes, product_name, quantity, unit_cost, (quantity * unit_cost) AS subtotal',
			filters: [ 'order_id = ?' ],
			params: [ ctx.params.order_id ],
			pagination: false // send all order products in one page
		});
	}
	
	/**
	 * returns customer orders
	 */
	async getCustomerOrders() {
		await this.list({
			table: 'orders o left join shipping s on o.shipping_id = s.shipping_id',
			columns: 'o.order_id, o.total_amount, date_format(o.created_on, "%Y-%m-%d") as created_on, o.auth_code, o.reference, s.shipping_type, o.tax_amount',
			filters: [ 'customer_id = ?' ],
			params: [ this.customerInfo.customer_id ]
		});
	}
	
	/**
	 * this endpoint is used by stripe to send event updates about an order (charged, refunded, etc.)
	 * @throws ORD_05 - Cannot verify webhook stripe signature
	 * @throws ORD_06 - Livemode not allowed in development.
	 * @throws ORD_07 - Test transactions not allowed in production.
	 * @throws ORD_08 - Event type not allowed.
	 * @throws ORD_09 - Event order ID missing.
	 * @throws ORD_10 - Event ID missing.
	 */
	async postOrderEvent() {
		
		// get the event sent in the webhook
		const event = this.getStripeWebhookEvent();
		// debug: const event = this.params;
		
		// check the event format to make sure it's something we can process
		this.checkStripeEventFormat(event);
		
		// assign order and event IDs to local variables for better readability
		const orderId = event.data.object.metadata.order_id;
		const eventId = event.id;
		
		// check if the event was sent before - if so, ignore the duplicate request
		const eventFound = await this.db.selectVal('select 1 from audit where order_id = ? and event_id = ?', [ orderId, eventId ]);
		if (eventFound) {
			this.body = { received: true };
			return;
		}
		
		// event was not sent before - save it for the order in audit log
		await this.db.insert('audit', { order_id: orderId, created_on: new Date(), message: JSON.stringify(event), code: 0, event_id: eventId });
		
		// return a response to acknowledge receipt of the event
		this.body = { received: true };
	}
	
	/**
	 * checks the incoming webhook event format from stripe
	 * @throws ORD_06 - Livemode not allowed in development.
	 * @throws ORD_07 - Test transactions not allowed in production.
	 * @throws ORD_08 - Event type not allowed.
	 * @throws ORD_09 - Event order ID missing.
	 * @throws ORD_10 - Event ID missing.
	 */
	checkStripeEventFormat(event) {
		
		// check livemode against env - livemode not allowed in dev - same if env is prod and livemode is false - do not accept such cases
		if (this.env === 'dev' && event.livemode)  this.throw('ORD_06', 'Livemode not allowed in development.');
		if (this.env !== 'dev' && !event.livemode) this.throw('ORD_07', 'Test transactions not allowed in production.');
		
		// we only process the charge events for now - do not accept others - should not be set up without some development on this side
		if (!event.type || !event.type.startsWith('charge') || !event.data || !event.data.object || !event.data.object.object || event.data.object.object !== 'charge')
			this.throw('ORD_08', 'Event type not allowed.');
		
		// we always send charge requests with order ID in the metadata so we should see an order ID in the metadata of the charge object sent to us in the event
		// if we can't find that information, we will ignore the webhook because we have no way of associating it to an order
		if (!event.data.object.metadata || !event.data.object.metadata.order_id) this.throw('ORD_09', 'Event order ID missing.');
		
		// we use the event ID as the audit code. if it was not sent, we can't detect if it was sent before - error out
		if (!event.id) this.throw('ORD_10', 'Event ID missing.');
	}
	
	/**
	 * returns the stripe event data from the webhook post data
	 * @throws ORD_05 - Cannot verify webhook stripe signature
	 */
	getStripeWebhookEvent() {
		
		// now verify the signature and construct event data in one api call and return the result - signature is used to verify the authenticity of the message
		try {
			return Stripe.constructEvent(this.request.rawBody, this.request.headers['stripe-signature']);
		}
		catch (ex) {
			this.throw('ORD_05', `Cannot verify webhook stripe signature: ${ex.message}`);
			return null; // this statement is unreachable - the only reason it's here is because eslint cannot understand that this.throw is an exception
		}
	}
	
}

// exported user related functions
module.exports = new Order();