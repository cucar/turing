describe('Attribute Tests', function() {
	
	it('should get attributes', async function() {
		const response = await callApi('attributes');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.above(0);
		response[0].attribute_id.should.exist;
		response[0].name.should.exist;
	});
	
	it('should error with incorrect id when getting attribute', async function() {
		const response = await callApi('attributes/9873432');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('ATR_01');
		response.message.should.equal('No record with this ID.');
	});

	it('should get attribute', async function() {
		const response = await callApi('attributes/1');
		global.lastHttpResponseCode.should.equal(200);
		response.attribute_id.should.equal(1);
		response.name.should.exist;
	});
	
	it('should get values of an attribute', async function() {
		const response = await callApi('attributes/values/1');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.above(0);
		response[0].attribute_value_id.should.exist;
		response[0].value.should.exist;
	});
	
	it('should get attributes of a product', async function() {
		const response = await callApi('attributes/inProduct/9');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.above(0);
		response[0].attribute_value_id.should.exist;
		response[0].attribute_value.should.exist;
		response[0].name.should.exist;
	});

});
