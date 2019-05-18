const Controller = require('../../common/controller/controller.js');

class Cart extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/shoppingcart/generateUniqueId', handler: this.getNewCartId },
			{ path: '/shoppingcart/add', method: 'POST', handler: this.addProductToCart },
			{ path: '/shoppingcart/:cart_id', handler: this.getCartProducts },
			{ path: '/shoppingcart/totalAmount/:cart_id', handler: this.getCartTotal },
			{ path: '/shoppingcart/update/:item_id', method: 'PUT', handler: this.updateCartProductQuantity },
			{ path: '/shoppingcart/removeProduct/:item_id', method: 'DELETE', handler: this.removeCartProduct },
			{ path: '/shoppingcart/empty/:cart_id', method: 'DELETE', handler: this.emptyCart },
			{ path: '/shoppingcart/saveForLater/:item_id', handler: this.saveCartProductForLater },
			{ path: '/shoppingcart/getSaved/:cart_id', handler: this.getCartProductsSavedForLater },
			{ path: '/shoppingcart/moveToCart/:item_id', handler: this.moveProductSavedForLaterToCart },
		];
	}
	
	/**
	 * returns a new cart ID - get a random number, express it in base 36 and return after decimal
	 * this should be stored on the client side and used for all other calls
	 */
	getNewCartId() {
		this.body = { cart_id: Math.random().toString(36).substr(2) };
	}
	
	/**
	 * adds a product to a cart
	 * @throws CRT_01 - cart_id/product_id/attributes required.
	 */
	async addProductToCart() {
		
		this.validateRequired('CRT_01', [ 'cart_id', 'product_id', 'attributes' ]);
		
		await this.db.executeSP('shopping_cart_add_product', [ this.param('cart_id'), this.param('product_id'), this.param('attributes') ]);
		
		await this.getCartProducts({ params: { cart_id: this.param('cart_id') } });
	}
	
	/**
	 * returns the products in a cart to be bought now
	 */
	async getCartProducts(ctx) {
		this.body = await this.getCartProductsData(ctx.params.cart_id, true);
	}
	
	/**
	 * returns the products in a cart that are saved for later
	 */
	async getCartProductsSavedForLater(ctx) {
		this.body = await this.getCartProductsData(ctx.params.cart_id, false);
	}
	
	/**
	 * returns the products in a cart - either saved for later or to be bought now
	 */
	getCartProductsData(cartId, buyNow) {
		// we're not using shopping_cart_get_products or shopping_cart_get_saved_products SP because it seems to be missing product_id and image fields - it's pretty much the same query, though
		return this.db.selectAll(`
			select c.item_id, p.name, c.attributes, c.product_id, coalesce(nullif(p.discounted_price, 0), p.price) AS price,
			       c.quantity, p.image, coalesce(nullif(p.discounted_price, 0), p.price) * c.quantity as subtotal
    		from shopping_cart c
    		join product p on c.product_id = p.product_id
    		where c.cart_id = ?
    		and   c.buy_now = ?
    	`, [ cartId, buyNow ]);
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
		
		await this.getCartProducts({ params: { cart_id: await this.db.selectVal('select cart_id from shopping_cart where item_id = ?', [ ctx.params.item_id ]) } });
	}
	
	/**
	 * removes a product from a cart
	 */
	async removeCartProduct(ctx) {
		
		await this.db.executeSP('shopping_cart_remove_product', [ ctx.params.item_id ]);
		
		this.body = {};
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
		
		await this.db.executeSP('shopping_cart_save_product_for_later', [ ctx.params.item_id ]);
		
		this.body = {};
	}
	
	/**
	 * moves a product saved for later back to cart
	 */
	async moveProductSavedForLaterToCart(ctx) {
		
		await this.db.executeSP('shopping_cart_move_product_to_cart', [ ctx.params.item_id ]);
		
		this.body = {};
	}
}

// exported user related functions
module.exports = new Cart();