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
	 * returns the products in a cart
	 */
	async getCartProducts(ctx) {
		this.body = await this.db.selectAll('select * from shopping_cart where cart_id = ?', [ ctx.params.cart_id ]);
	}
}

// exported user related functions
module.exports = new Cart();