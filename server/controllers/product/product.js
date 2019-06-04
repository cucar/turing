const Controller = require('../../common/controller/controller.js');

class Product extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/products', handler: this.getProducts },
			{ path: '/products/:product_id', handler: this.getProduct },
			{ path: '/products/:product_id/details', handler: this.getProductDetails },
			{ path: '/products/:product_id/locations', handler: this.getProductLocations },
			{ path: '/products/:product_id/reviews', handler: this.getProductReviews },
			{ path: '/products/:product_id/reviews', method: 'POST', handler: this.postProductReview, auth: true },
			{ path: '/products/reviews/inCustomer', handler: this.getCustomerReviews, auth: true },
		];
	}
	
	/**
	 * returns all products paginated
	 * note: the catalog_get_products_on_catalog SP was using a filter for diplay in (1,3) - not sure why that was needed but it's not included here - we may need to add it later
	 */
	async getProducts() {
		
		// debug slow response:
		// await require('../../common/utils/utils.js').wait(10);
		
		const { sqlFilters, sqlParams } = this.getProductFiltersAndParams();
		await this.list({ table: Product.getProductListTables(), columns: Product.getProductListColumns(), filters: sqlFilters, params: sqlParams });
	}
	
	/**
	 * returns the sql filters and parameters to be used for products list
	 */
	getProductFiltersAndParams() {
		let sqlFilters = [];
		let sqlParams = [];
		
		if (this.param('discounted')) {
			sqlFilters.push('p.discounted_price > 0');
		}
		
		if (this.param('min_price')) {
			sqlFilters.push('(p.discounted_price >= ? or (p.discounted_price = 0 and p.price >= ?))');
			sqlParams.push(this.param('min_price'));
			sqlParams.push(this.param('min_price'));
		}
		
		if (this.param('max_price')) {
			sqlFilters.push('((p.discounted_price > 0 and p.discounted_price <= ?) or (p.discounted_price = 0 and p.price <= ?))');
			sqlParams.push(this.param('max_price'));
			sqlParams.push(this.param('max_price'));
		}
		
		if (this.param('department_ids')) {
			let departmentIds = this.param('department_ids').split(',').map(departmentId => parseInt(departmentId));
			sqlFilters.push(`c.department_id in (${departmentIds.join(',')})`);
		}
		
		if (this.param('category_ids')) {
			let categoryIds = this.param('category_ids').split(',').map(categoryId => parseInt(categoryId));
			sqlFilters.push(`c.category_id in (${categoryIds.join(',')})`);
		}
		
		if (this.param('search')) {
			sqlFilters.push(`match (p.name, p.description) against (? in ${Product.searchInBooleanMode(this.param('search')) ? 'boolean' : 'natural language'} mode)`);
			sqlParams.push(this.param('search'));
		}
		
		if (this.param('attribute_value_ids')) {
			let attributeValueIds = this.param('attribute_value_ids').split(',').map(attributeValueId => parseInt(attributeValueId));
			sqlFilters.push(`p.product_id in (select pa.product_id from product_attribute pa where pa.attribute_value_id in (${attributeValueIds.join(',')}))`);
		}
		
		return { sqlFilters, sqlParams };
	}
	
	/**
	 * returns the tables sql expression used in sending products list
	 */
	static getProductListTables() {
		return `
			product p
			join product_category pc on p.product_id = pc.product_id
			join category c on pc.category_id = c.category_id
		`;
	}
	
	/**
	 * returns the description column sql expression used in sending products list
	 */
	static getProductListColumns() {
		return `
			p.product_id, p.name,
			if(length(p.description) <= 200, p.description, concat(left(p.description, 200), '...')) as description,
			p.price, p.discounted_price, p.thumbnail, p.display
		`;
	}

	/**
	 * determines the search mode we should use for mysql full text product search - boolean match or natural language match
	 */
	static searchInBooleanMode(term) {
		
		// if the search term starts with paranthesis or plus sign, it's boolean search - examples:
		// +apple +juice: Find rows that contain both words
		// +apple macintosh: Find rows that contain the word “apple”, but rank rows higher if they also contain “macintosh”.
		// (apple banana): Find rows that contain at least one of the two words.
		if (term.startsWith('+') || term.startsWith('(')) return true;
		
		// if the search term contains a dash, it's probably boolean search. example: +apple -macintosh: Find rows that contain the word “apple” but not “macintosh”.
		// it's definitely possible to have a case like search for dodd-frank and have it misdiagnose the search type but in general it holds true
		if (term.includes('-')) return true;

		// if the term contains tilde, star or greater/smaller than, it's boolean search - examples:
		// +apple ~macintosh: Find rows that contain the word “apple”, but if the row also contains the word “macintosh”, rate it lower than if row does not.
		// +apple +(>turnover <strudel): Find rows that contain the words “apple” and “turnover”, or “apple” and “strudel” (in any order), but rank “apple turnover” higher than “apple strudel”.
		// apple*: Find rows that contain words such as “apple”, “apples”, “applesauce”, or “applet”.
		if (term.includes('~') || term.includes('>') || term.includes('<') || term.includes('*')) return true;
		
		// in other cases we assume that it will be natural language mode - it's certainly possible to get it wrong but both modes perform pretty good in general
		return false;
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
	
	/**
	 * returns customer reviews
	 */
	async getCustomerReviews() {
		await this.list({
			table: 'review r left join product p on r.product_id = p.product_id',
			columns: 'p.name as product_name, r.created_on, r.rating, r.review',
			filters: [ 'r.customer_id = ?' ],
			params: [ this.customerInfo.customer_id ]
		});
	}
}

// exported user related functions
module.exports = new Product();