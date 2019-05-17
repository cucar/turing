const Controller = require('../../common/controller/controller.js');

class Product extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/products', handler: this.getProducts },
			{ path: '/products/search', handler: this.searchProducts },
			{ path: '/products/:product_id', handler: this.getProduct },
			{ path: '/products/:product_id/details', handler: this.getProductDetails },
			{ path: '/products/:product_id/locations', handler: this.getProductLocations },
			{ path: '/products/:product_id/reviews', handler: this.getProductReviews },
			{ path: '/products/:product_id/reviews', method: 'POST', handler: this.postProductReview, auth: true },
			{ path: '/products/inCategory/:category_id', handler: this.getCategoryProducts },
			{ path: '/products/inDepartment/:department_id', handler: this.getDepartmentProducts },
		];
	}
	
	/**
	 * returns all products paginated
	 */
	async getProducts() {
		
		// not sure why display filter is needed - it was implemented that way in SP
		await this.list('product', this.getProductColumnsSql(), [ 'display in (1, 3)' ]);
	}
	
	/**
	 * returns the description column sql expression used in sending product information
	 */
	getProductColumnsSql() {
		const descriptionLength = this.param('description_length') || 200;
		return `
			product_id, name,
			if(length(description) <= ${descriptionLength}, description, concat(left(description, ${descriptionLength}), '...')) as description,
			price, discounted_price, thumbnail, display
		`;
	}
	
	/**
	 * searches products table and returns matches paginated
	 * @throws PRD_02 - query_string field required.
	 */
	async searchProducts(ctx) {
		
		this.validateRequired('PRD_02', [ 'query_string' ], ctx.request.query);
		
		await this.list(
			'product',
			this.getProductColumnsSql(),
			[ (this.param('all_words') === 'on' ? 'match (name, description) against (? in boolean mode)' : 'match (name, description) against (?)') ],
			[ this.param('query_string') ]
		);
	}
	
	/**
	 * get product info request handler
	 * @throws PRD_01 - No record with this ID.
	 */
	async getProduct(ctx) {
		const product = await this.db.selectRow('select * from product where product_id = ?', [ ctx.params.product_id ]);
		if (!product) this.throw('PRD_01', 'No record with this ID.');
		this.body = product;
	}
	
	/**
	 * get product details request handler
	 * @throws PRD_01 - No record with this ID.
	 */
	async getProductDetails(ctx) {
		const product = await this.db.selectRow('select product_id, name, description, price, discounted_price, image, image_2 as image2 from product where product_id = ?', [ ctx.params.product_id ]);
		if (!product) this.throw('PRD_01', 'No record with this ID.');
		this.body = product;
	}
	
	/**
	 * returns products of a category
	 */
	async getCategoryProducts(ctx) {
		await this.list('product', this.getProductColumnsSql(), [ 'product_id in (select product_id from product_category where category_id = ?)' ], [ ctx.params.category_id ]);
	}
	
	/**
	 * returns products of a department
	 */
	async getDepartmentProducts(ctx) {
		await this.list(
			'product',
			this.getProductColumnsSql(),
			[
				'product_id in (select product_id from product_category pc join category c on pc.category_id = c.category_id where c.department_id = ?)',
				'display in (2,3)' // not sure why this is needed - it was implemented this way in catalog_get_products_on_department
			],
			[ ctx.params.department_id ]
		);
	}
	
	/**
	 * returns the locations of a product
	 */
	async getProductLocations(ctx) {
		this.body = await this.db.selectAll(`
			select c.category_id, c.name AS category_name, c.department_id, d.name as department_name
			from category c
			join department d on d.department_id = c.department_id
			where c.category_id in (select category_id from product_category where product_id = ?)
		`, [ ctx.params.product_id ]
		);
	}
	
	/**
	 * returns the reviews of a product
	 */
	async getProductReviews(ctx) {
		this.body = await this.db.selectAll(`
			select c.name, r.review, r.rating, r.created_on
			from review r
			join customer c on c.customer_id = r.customer_id
			where r.product_id = ?
			order by r.created_on desc
		`, [ ctx.params.product_id ]
		);
	}
	
	/**
	 * posts a review for a product
	 * @throws PRD_03 - product_id field required.
	 */
	async postProductReview() {

		this.validateRequired('PRD_03', [ 'product_id', 'review', 'rating' ]);
		
		await this.db.executeSP('catalog_create_product_review', [ this.customerInfo.customer_id, this.param('product_id'), this.param('review'), this.param('rating') ]);
		
		this.body = {}; // no data needed to be returned for success
	}
}

// exported user related functions
module.exports = new Product();