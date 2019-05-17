const Controller = require('../../common/controller/controller.js');

class Shipping extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/shipping/regions', handler: this.getShippingRegions },
			{ path: '/shipping/regions/:shipping_region_id', handler: this.getShippingRegionMethods },
		];
	}
	
	/**
	 * returns all shipping regions
	 */
	async getShippingRegions() {
		this.body = await this.db.selectAll('select shipping_region_id, shipping_region from shipping_region');
	}
	
	/**
	 * get shipping region info request handler - returns the shipping methods in a shipping region
	 * @throws SHP_01 - The ID is not a number.
	 */
	async getShippingRegionMethods(ctx) {
		if (isNaN(ctx.params.shipping_region_id)) this.throw('SHP_01', 'The ID is not a number.');
		this.body = await this.db.selectAll('select * from shipping where shipping_region_id = ?', [ ctx.params.shipping_region_id ]);
	}

}

// exported user related functions
module.exports = new Shipping();