const Controller = require('../../common/controller/controller.js');

class Tax extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			
			// NOTE: these calls are not currently used - they are kept here to conform with the specs but the flow of the checkout does not lend itself to a scenario where
			// the shopper can specify what kind of tax they would want - that's calculated on the server side and shown as information at checkout - tax scheme is not selectable.
			// when we get the request to create an order from a cart, we calculate the tax amount at that time and record that amount with the order information.
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