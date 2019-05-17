const Controller = require('../../common/controller/controller.js');

class Tax extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/tax', handler: this.getTaxes },
			{ path: '/tax/:tax_id', handler: this.getTax },
		];
	}
	
	/**
	 * returns all departments
	 */
	async getTaxes() {
		this.body = await this.db.selectAll('select * from tax');
	}
	
	/**
	 * get tax info request handler
	 * @throws TAX_01 - The ID is not a number.
	 * @throws TAX_02 - No record with this ID.
	 */
	async getTax(ctx) {
		if (isNaN(ctx.params.tax_id)) this.throw('TAX_01', 'The ID is not a number.');
		const tax = await this.db.selectRow('select * from tax where tax_id = ?', [ ctx.params.tax_id ]);
		if (!tax) this.throw('TAX_02', 'No record with this ID.');
		this.body = tax;
	}

}

// exported user related functions
module.exports = new Tax();