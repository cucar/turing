describe('Shipping Tests', function() {

	it('should get shipping regions', async function() {
		const response = await callApi('shipping/regions');
		global.lastHttpResponseCode.should.equal(200);
		response[0].shipping_region_id.should.exist;
		response[0].shipping_region.should.exist;
	});
	
	it('should error with non-numeric id when getting shipping region', async function() {
		const response = await callApi('shipping/regions/sdjk');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('SHP_01');
		response.message.should.equal('The ID is not a number.');
	});
	
	it('should get shipping region methods', async function() {
		const response = await callApi('shipping/regions/2');
		global.lastHttpResponseCode.should.equal(200);
		response[0].shipping_id.should.exist;
		response[0].shipping_type.should.exist;
		response[0].shipping_cost.should.exist;
		response[0].shipping_region_id.should.equal(2);
	});
});
