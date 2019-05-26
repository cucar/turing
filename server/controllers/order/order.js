const Controller = require('../../common/controller/controller.js');

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
		];
	}
	
	/**
	 * creates a new order from a cart
	 * @throws ORD_01 - fields required.
	 * @throws ORD_03 - card declined.
	 * @throws ORD_04 - invalid response from stripe
	 */
	async createOrder() {
		
		this.validateRequired('PRD_01', [ 'cart_id', 'shipping_id', 'tax_id', 'stripe_token' ]);
		
		// get order total to be charged to the customer from the cart
		const orderTotal = await this.db.selectVal(`
			select sum(coalesce(nullif(p.discounted_price, 0), p.price)) as total_amount
			from shopping_cart sc
			join product p on sc.product_id = p.product_id
			where sc.cart_id = ?
			and sc.buy_now = 1
		`, [ this.param('cart_id') ]);
		
		// insert a new record into orders and obtain the new order ID
		const orderId = await this.db.insert('orders', {
			created_on: new Date(),
			customer_id: this.customerInfo.customer_id,
			shipping_id: this.param('shipping_id'),
			tax_id: this.param('tax_id'),
			total_amount: orderTotal
		});
		
		// we create the order ID initially to be able to send it to stripe but it is not finalized yet. if the charges don't succeed we will delete that order and leave the cart as-is.
		try {
			
			// get stripe handle - using secret key (not publishable key) - got it from https://dashboard.stripe.com/account/apikeys
			const stripe = require('stripe')('sk_test_NjRQY4OeXsQD0ijJ7rbI4FNI00QLcA5CYY');
			
			// stripe token is created on the client side from credit card data without coming to our server for PCI compliance - we collect the charges here with it
			// in order to simulate declined card, just send a bad token - response should include error object with details
			const charge = await stripe.charges.create({
				amount: orderTotal * 100, // needs to be sent in cents
				currency: 'usd',
				description: 'Customer Turing Order',
				source: this.param('stripe_token'),
				metadata: { order_id: orderId },
				receipt_email: this.customerInfo.email // sends order notification email to the customer from stripe if charges are successful
			});
			// debug: console.log('stripe successful', charge);
			
			// check to make sure the charges were successful
			if (!charge || !charge.id || !charge.balance_transaction) this.throw('ORD_04', `Invalid response: ${JSON.stringify(charge)}`);
			
			// update order auth code and reference and set it paid (status = 1 means paid)
			await this.db.update('orders', { auth_code: charge.id, reference: charge.balance_transaction, status: 1, order_id: orderId }, 'order_id');
			
			// save the charge response as an audit log for the order
			await this.db.insert('audit', { order_id: orderId, created_on: new Date(), message: JSON.stringify(charge), code: 0 });
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
		const order = await this.db.selectRowSP('orders_get_order_short_details', [ ctx.params.order_id ]);
		order.total_amount = parseFloat(order.total_amount);
		order.status = (order.status === 1 ? 'paid' : 'unpaid');
		this.body = order;
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
		this.body = await this.db.selectAllSP('orders_get_order_details', [ ctx.params.order_id ]);
	}

	/**
	 * returns customer orders
	 */
	async getCustomerOrders() {
		let orders = await this.db.selectAllSP('orders_get_by_customer_id', [ this.customerInfo.customer_id ]);
		for (let order of orders) {
			order.total_amount = parseFloat(order.total_amount);
			order.status = (order.status === 1 ? 'paid' : 'unpaid');
		}
		this.body = orders;
	}
}

// exported user related functions
module.exports = new Order();