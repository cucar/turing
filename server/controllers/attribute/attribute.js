const Controller = require('../../common/controller/controller.js');

class Attribute extends Controller {

	/**
	 * handled routes
	 */
	routes() {
		return [
			{ path: '/attributes', handler: this.getAttributes },
			{ path: '/attributes/:attribute_id', handler: this.getAttribute },
			{ path: '/attributes/values/:attribute_id', handler: this.getAttributeValues },
			{ path: '/attributes/inProduct/:product_id', handler: this.getProductAttributes },
		];
	}
	
	/**
	 * returns all attributes
	 */
	async getAttributes() {
		this.body = await this.db.selectAll('select * from attribute');
	}
	
	/**
	 * get attribute info request handler
	 * @throws ATR_01 - No record with this ID.
	 */
	async getAttribute(ctx) {
		const attribute = await this.db.selectRow('select * from attribute where attribute_id = ?', [ ctx.params.attribute_id ]);
		if (!attribute) this.throw('ATR_01', 'No record with this ID.');
		this.body = attribute;
	}
	
	/**
	 * returns values of an attribute
	 */
	async getAttributeValues(ctx) {
		this.body = await this.db.selectAll('select attribute_value_id, value from attribute_value where attribute_id = ?', [ ctx.params.attribute_id ]);
	}
	
	/**
	 * returns attributes of a product
	 */
	async getProductAttributes(ctx) {
		this.body = await this.db.selectAll(`
		select a.name, av.attribute_value_id, av.value as attribute_value
		from product_attribute pa
		join attribute_value av on av.attribute_value_id = pa.attribute_value_id
		join attribute a on av.attribute_id = a.attribute_id
		where pa.product_id = ?
		`, [ ctx.params.product_id ]);
	}
	
}

// exported user related functions
module.exports = new Attribute();