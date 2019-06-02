const Controller = require('../../common/controller/controller.js');

class Category extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/categories', handler: this.getCategories },
			{ path: '/categories/:category_id', handler: this.getCategory },
			{ path: '/categories/inDepartment/:department_id', handler: this.getDepartmentCategories },
			{ path: '/categories/inProduct/:product_id', handler: this.getProductCategories },
		];
	}
	
	/**
	 * returns all categories paginated
	 */
	async getCategories() {
		await this.list({ table: 'category' });
	}
	
	/**
	 * get category info request handler
	 * @throws CAT_01 - No record with this ID.
	 */
	async getCategory(ctx) {
		const category = await this.db.selectRow('select * from category where category_id = ?', [ ctx.params.category_id ]);
		if (!category) this.throw('CAT_01', 'No record with this ID.');
		this.body = category;
	}
	
	/**
	 * returns categories of a department
	 */
	async getDepartmentCategories(ctx) {
		this.body = await this.db.selectAll('select * from category where department_id = ?', [ ctx.params.department_id ]);
	}
	
	/**
	 * returns categories of a department
	 */
	async getProductCategories(ctx) {
		this.body = await this.db.selectAll('select * from category where category_id in (select category_id from product_category where product_id = ?)', [ ctx.params.product_id ]);
	}
	
}

// exported user related functions
module.exports = new Category();