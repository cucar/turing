const _ = require('lodash');
const Controller = require('../../common/controller/controller.js');

class Product extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/products', handler: this.getProducts },
			{ path: '/products/:product_id', handler: this.getProduct },
			{ path: '/products/:product_id/reviews', handler: this.getProductReviews },
			{ path: '/products/:product_id/reviews', method: 'POST', handler: this.postProductReview, auth: true },
			{ path: '/products/reviews/inCustomer', handler: this.getCustomerReviews, auth: true },
		];
	}
	
	/**
	 * returns all products paginated
	 * note: the catalog_get_products_on_catalog SP was using a filter for diplay in (1,3) - not sure why that was needed but it's not included here - we may need to add it later
	 * @throws PRD_05 - Page size not allowed.
	 * @throws PRD_06 - Order not allowed.
	 */
	async getProducts() {
		
		// debug slow response:
		// await require('../../common/utils/utils.js').wait(10);
		
		// do not allow custom page sizes - only 10, 25 and 100 allowed
		const pageSizeOptions = [ 10, 25, 100 ];
		if (this.param('limit') && !pageSizeOptions.includes(parseInt(this.param('limit')))) this.throw('PRD_05', 'Page size not allowed.');
		
		// only allow product id and price ordering - others are not made available at this time
		const orderOptions = [ 'product_id_desc', 'product_id_asc', 'effective_price_desc', 'effective_price_asc' ];
		if (this.param('order') && !orderOptions.includes(this.param('order'))) this.throw('PRD_06', 'Order not allowed.');
		const orderField = (this.param('order') ? this.param('order').replace('_asc', '').replace('_desc', '') : 'product_id');
		const orderDirection = (this.param('order') && this.param('order').endsWith('asc') ? 'asc' : 'desc');

		// now get the products page data
		const { sqlFilters, sqlParams } = this.getProductFiltersAndParams();
		let products = await this.getListData({
			table: 'product p',
			columns: Product.getProductListColumns(),
			filters: sqlFilters,
			params: sqlParams,
			order: orderField,
			direction: orderDirection
		});

		// get attributes layered navigation information
		products.attributes = await this.getLayeredNavigationAttributes();
		products.categories = await this.db.selectAll('select category_id, name as category_name from category');
		products.departments = await this.db.selectAll('select department_id, name as department_name from department');
		products.prices = await this.getLayeredNavigationPrices(sqlFilters, sqlParams);
		
		// return the data along with the layered navigation information
		this.body = products;
	}
	
	/**
	 * returns the layered navigation available filters for non-attributes in a result set - departments, categories, price and discount filters
	 */
	getLayeredNavigationPrices(sqlFilters, sqlParams) {
		return this.db.selectRow(`
			select min(coalesce(nullif(p.discounted_price, 0), p.price)) as min_price, max(coalesce(nullif(p.discounted_price, 0), p.price)) as max_price
			from product p
			${sqlFilters.length > 0 ? `where ${sqlFilters.join(' and ')}` : ''}
		`, sqlParams);
	}
	
	/**
	 * returns the layered navigation available filters for attributes in a result set
	 */
	async getLayeredNavigationAttributes() {
		
		// get all attributes first
		let attributes = await this.db.selectAll('select attribute_id, name as attribute_name from attribute order by attribute_id');
		
		// now populate the values for each attribute
		for (let attribute of attributes)
			attribute.values = await this.db.selectAll('select attribute_value_id, value as attribute_value from attribute_value where attribute_id = ? order by attribute_value_id', [ attribute.attribute_id ]);

		return attributes;
	}
	
	/**
	 * returns the sql filters and parameters to be used for products list
	 */
	getProductFiltersAndParams() {
		let sqlFilters = [];
		let sqlParams = [];
		
		if (this.param('discounted') === '1') {
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
			sqlFilters.push(`p.product_id in (select pc.product_id from product_category pc join category c on pc.category_id = c.category_id where c.department_id in (${departmentIds.join(',')}))`);
		}
		
		if (this.param('category_ids')) {
			let categoryIds = this.param('category_ids').split(',').map(categoryId => parseInt(categoryId));
			sqlFilters.push(`p.product_id in (select pc.product_id from product_category pc where pc.category_id in (${categoryIds.join(',')}))`);
		}
		
		if (this.param('search')) {
			sqlFilters.push(`match (p.name, p.description) against (? in ${Product.searchInBooleanMode(this.param('search')) ? 'boolean' : 'natural language'} mode)`);
			sqlParams.push(this.param('search'));
		}
		
		if (this.param('attribute_value_ids')) {
			let attributeValueIds = this.param('attribute_value_ids').split(',').map(attributeValueId => parseInt(attributeValueId));
			sqlFilters.push(`p.product_id in (select paf.product_id from product_attribute paf where paf.attribute_value_id in (${attributeValueIds.join(',')}))`);
		}
		
		return { sqlFilters, sqlParams };
	}
	
	/**
	 * returns the description column sql expression used in sending products list
	 */
	static getProductListColumns() {
		return `
			p.product_id, p.name,
			if(length(p.description) <= 200, p.description, concat(left(p.description, 200), '...')) as description,
			p.price, p.discounted_price, coalesce(nullif(p.discounted_price, 0), p.price) as effective_price, p.thumbnail, p.display
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
		
		// get product information - NOTE: this query is efficient but limited in its use of group_concat - ideally we should use JSON_OBJECTAGG or JSON_ARRAYAGG but they are not available in MariaDB yet,
		// which is used on Linux server. group_concat limit is 1024 characters by default and when you run the attribute aggregation as below it does not take more than that. the other issue may be the use
		// of pipe or comma characters but none of the values contain them. so we should be good for now but when more attributes or attribute values are added this query should be amended to accommodate for it
		let product = await this.db.selectRow(`
			select p.product_id, p.name, p.description, p.price, p.discounted_price, p.image, p.image_2,
				(
					select concat(c.category_id, '|', c.name) as product_category
					from product_category pc
					join category c on c.category_id = pc.category_id
					where pc.product_id = p.product_id
					limit 1
				) as category,
				(
					select avg(r.rating)
					from review r
					where r.product_id = p.product_id
				) as avg_rating,
				(
					select group_concat(concat(av.attribute_id, '|', a.name, '|', pa.attribute_value_id, '|', av.value)) as attributes
					from product_attribute pa
					join attribute_value av on av.attribute_value_id = pa.attribute_value_id
					join attribute a on a.attribute_id = av.attribute_id
					where pa.product_id = p.product_id
				) as attributes
			from product p
			where p.product_id = ?
		`, [ ctx.params.product_id ]);
		if (!product) this.throw('PRD_01', 'No record with this ID.');
		
		// ideally the images of the products should be kept in a separate table - in this design we have them in the products table
		// because there are only 2 images per product but we return them in an array to prepare for a structure that would allow more images
		product.images = [ product.image, product.image_2 ];
		product = _.omit(product, [ 'image', 'image_2' ]);
		
		// we fetch category id and name together in sql - split them here for easier use on the client side
		product.category = {
			category_id: product.category.split('|')[0],
			category_name: product.category.split('|')[1]
		};
		
		// we fetch attribute values group_concat'ed together in sql for efficiency - split them here for easier use on the client side
		product.attributes = product.attributes.split(',').reduce((attributes, attributeValueString) => {
			
			// decode the attribute value information
			let attributeValueParts = attributeValueString.split('|');
			let attributeId = attributeValueParts[0];
			let attributeName = attributeValueParts[1];
			let attributeValueLabel = attributeValueParts[3];
			
			// this is the value object we will add under the attribute
			// NOTE: ideally we should be sending back the attribute value id as the value and when we get the add to cart request it should specify the attribute value id
			// however, the database specs were such that the ordered product attributes are saved as comma separated text in the cart (not normalized). so, in order to
			// work within that construct, we're sending the value as the text - that's what comes to us at the add to cart request
			// let attributeValueId = attributeValueParts[2];
			let attributeValue = { value: attributeValueLabel, label: attributeValueLabel };
			
			// find the attribute in the attributes array - if found, add the value to it - if not, add the attribute along with the first value of it
			let attribute = _.find(attributes, [ 'attribute_id', attributeId ]);
			if (!attribute) attributes.push({ attribute_id: attributeId, attribute_name: attributeName, values: [ attributeValue ] });
			else attribute.values.push(attributeValue);
			
			return attributes;
		}, []);
		
		this.body = product;
	}
	
	/**
	 * returns the reviews of a product
	 */
	async getProductReviews(ctx) {
		await this.list({
			table: 'review r join customer c on c.customer_id = r.customer_id',
			columns: 'c.name as customer_name, r.review, r.rating, r.created_on',
			filters: [ 'r.product_id = ?' ],
			params: [ ctx.params.product_id ],
			forcePageSize: 5
		});
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