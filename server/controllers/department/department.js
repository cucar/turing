const Controller = require('../../common/controller/controller.js');

/**
 * department object to house department related functions
 */
class Department extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/departments', method: 'GET', handler: this.getDepartments },
			{ path: '/departments/:department_id', method: 'GET', handler: this.getDepartment },
		];
	}
	
	/**
	 * returns all departments
	 */
	async getDepartments() {
		this.body = await this.db.selectAll('select * from department');
	}
	
	/**
	 * get department info request handler
	 */
	async getDepartment(ctx) {
		console.log(ctx.params.department_id);
		this.body = await this.db.selectRow('select * from department where department_id = ?', [ ctx.params.department_id ]);
	}

}

// exported user related functions
module.exports = new Department();