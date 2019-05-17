const Controller = require('../../common/controller/controller.js');

class Department extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/departments', handler: this.getDepartments },
			{ path: '/departments/:department_id', handler: this.getDepartment },
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
	 * @throws DEP_01 - The ID is not a number.
	 * @throws DEP_02 - No record with this ID.
	 */
	async getDepartment(ctx) {
		if (isNaN(ctx.params.department_id)) this.throw('DEP_01', 'The ID is not a number.');
		const department = await this.db.selectRowSP('catalog_get_department_details', [ ctx.params.department_id ]);
		if (!department) this.throw('DEP_02', 'No record with this ID.');
		this.body = Object.assign(department, { department_id: parseInt(ctx.params.department_id) });
	}

}

// exported user related functions
module.exports = new Department();