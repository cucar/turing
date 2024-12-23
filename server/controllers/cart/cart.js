const Controller = require('../../common/controller/controller.js');

class Cart extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/shoppingcart/add', method: 'POST', handler: this.addProductToCart },
			{ path: '/shoppingcart/:cart_id', handler: this.returnCartProducts },
			{ path: '/shoppingcart/checkout/:cart_id', handler: this.returnCheckoutData, auth: true },
			{ path: '/shoppingcart/update/:item_id', method: 'PUT', handler: this.updateCartProductQuantity },
			{ path: '/shoppingcart/removeProduct/:item_id', method: 'DELETE', handler: this.removeCartProduct },
			{ path: '/shoppingcart/saveForLater/:item_id', handler: this.saveCartProductForLater },
			{ path: '/shoppingcart/moveToCart/:item_id', handler: this.moveProductSavedForLaterToCart },
			
			// following calls are not used at this point - empty cart could have been used from an admin interface but we have an automatic event that cleans up old carts
			// get cart total is just not needed either - the design does not have it. I don't think it's good to remind the customer how much money they are spending.
			{ path: '/shoppingcart/totalAmount/:cart_id', handler: this.getCartTotal },
			{ path: '/shoppingcart/empty/:cart_id', method: 'DELETE', handler: this.emptyCart },
		];
	}
	
	/**
	 * returns a new cart ID - get a random number, express it in base 36 and return after decimal
	 * this should be stored on the client side and used for all other calls
	 */
	static getNewCartId() {
		return Math.random().toString(36).substr(2);
	}
	
	/**
	 * adds a product to a cart
	 * @throws CRT_01 - cart_id/product_id/attributes required.
	 */
	async addProductToCart() {
		
		this.validateRequired('CRT_01', [ 'product_id', 'attributes' ]);
		
		// if no cart id is sent, we're starting a new one - generate it here and return in response
		let cartId = (this.param('cart_id') ? this.param('cart_id') : Cart.getNewCartId());
		
		// add the product to cart in database
		await this.db.executeSP('shopping_cart_add_product', [ cartId, this.param('product_id'), this.param('attributes') ]);

		// return the cart id with the number of products in it so that it can be shown in cart icon
		this.body = {
			cart_id: cartId,
			product_count: parseInt(await this.db.selectVal('select sum(quantity) from shopping_cart where cart_id = ? and buy_now = 1', [ cartId ]))
		};
	}
	
	/**
	 * returns the products in a cart to be bought now
	 */
	async returnCartProducts(ctx) {
		// slow response debug: await require('../../common/utils/utils.js').wait(5);
		this.body = await this.getCartProducts(ctx.params.cart_id);
	}
	
	/**
	 * returns the products in a cart to be bought now
	 * we're not using shopping_cart_get_products or shopping_cart_get_saved_products SP because it seems to be missing product_id and image fields - it's pretty much the same query, though
	 */
	getCartProducts(cartId) {
		return this.db.selectAll(`
			select c.item_id, p.name, c.attributes, c.product_id, coalesce(nullif(p.discounted_price, 0), p.price) AS price,
			       c.quantity, p.thumbnail as image, coalesce(nullif(p.discounted_price, 0), p.price) * c.quantity as subtotal, c.buy_now
    		from shopping_cart c
    		join product p on c.product_id = p.product_id
    		where c.cart_id = ?
    	`, [ cartId ]);
	}
	
	/**
	 * returns the shipping methods for the logged in customer - if there is no address on file, returns empty array
	 * returning empty array here effectively prevents the order from being placed at checkout page. that means customers with no address on file would not be able to place an order.
	 * checkout page requires the customer to update address on file before placing the order.
	 * shipping_region_id gets default value of 1 (select value) at registration and that does not have any shipping methods associated with it, so newly registered customers won't have any methods available.
	 */
	getCheckoutShippingMethods() {
		return this.db.selectAll('select * from shipping where shipping_region_id = ?', [ this.customerInfo.shipping_region_id ]);
	}
	
	/**
	 * returns the tax amount to be used for a cart/order
	 */
	getCheckoutTaxAmount(products) {
		
		// there would be more logic here in the future - maybe even contact a tax calculation service like Avalara with the order information and get the exact tax amount
		// until then we're just emulating as if we're doing any processing - if it's California, no tax, otherwise add 8.5% tax
		return (this.customerInfo.region === 'CA' ? 0 : Math.round(products.reduce((total, product) => total + parseFloat(product.subtotal), 0) * 8.5) / 100);
	}

	/**
	 * returns the data used for the checkout screen
	 */
	async returnCheckoutData(ctx) {
		
		const products = await this.getCartProducts(ctx.params.cart_id);
		
		this.body = {
			products: products.filter(product => product.buy_now), // filter out the products saved for later
			shipping_methods: await this.getCheckoutShippingMethods(),
			tax_amount: this.getCheckoutTaxAmount(products)
		};
	}
	
	/**
	 * returns the cart total
	 */
	async getCartTotal(ctx) {
		this.body = { total_amount: parseFloat(await this.db.selectValSP('shopping_cart_get_total_amount', [ ctx.params.cart_id ])) };
	}
	
	/**
	 * update product quantity in a cart
	 * @throws CRT_01 - fields required.
	 */
	async updateCartProductQuantity(ctx) {
		
		this.validateRequired('CRT_01', [ 'quantity' ]);
		
		await this.db.executeSP('shopping_cart_update', [ ctx.params.item_id, this.param('quantity') ]);
		
		await this.returnCartProducts({ params: { cart_id: await this.db.selectVal('select cart_id from shopping_cart where item_id = ?', [ ctx.params.item_id ]) } });
	}
	
	/**
	 * removes a product from a cart
	 */
	async removeCartProduct(ctx) {
		
		let cartId = await this.db.selectVal('select cart_id from shopping_cart where item_id = ?', [ ctx.params.item_id ]);
		
		await this.db.executeSP('shopping_cart_remove_product', [ ctx.params.item_id ]);
		
		await this.returnCartProducts({ params: { cart_id: cartId } });
	}
	
	/**
	 * removes all product from a cart
	 */
	async emptyCart(ctx) {
		
		await this.db.executeSP('shopping_cart_empty', [ ctx.params.cart_id ]);
		
		this.body = {};
	}
	
	/**
	 * saves a product in cart for later
	 */
	async saveCartProductForLater(ctx) {

		// we're not using shopping_cart_save_product_for_later SP because it resets the quantity to 1
		await this.db.update('shopping_cart', { buy_now: false, item_id: ctx.params.item_id }, 'item_id');
		
		await this.returnCartProducts({ params: { cart_id: await this.db.selectVal('select cart_id from shopping_cart where item_id = ?', [ ctx.params.item_id ]) } });
	}
	
	/**
	 * moves a product saved for later back to cart
	 */
	async moveProductSavedForLaterToCart(ctx) {
		
		// we're not using shopping_cart_move_product_to_cart SP because it resets the quantity to 1
		await this.db.update('shopping_cart', { buy_now: true, item_id: ctx.params.item_id }, 'item_id');
		
		await this.returnCartProducts({ params: { cart_id: await this.db.selectVal('select cart_id from shopping_cart where item_id = ?', [ ctx.params.item_id ]) } });
	}
}

// exported user related functions
module.exports = new Cart();