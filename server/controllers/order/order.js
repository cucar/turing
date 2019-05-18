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
	 */
	async createOrder() {
		
		this.validateRequired('PRD_01', [ 'cart_id', 'shipping_id', 'tax_id' ]);
		
		const orderId = await this.db.selectValSP('shopping_cart_create_order', [ this.param('cart_id'), this.customerInfo.customer_id, this.param('shipping_id'), this.param('tax_id') ]);
		
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