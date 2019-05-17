describe('Tax Tests', function() {

	it('should get taxes', async function() {
		const response = await callApi('tax');
		global.lastHttpResponseCode.should.equal(200);
		response[0].tax_id.should.exist;
		response[0].tax_type.should.exist;
		response[0].tax_percentage.should.exist;
	});
	
	it('should error with non-numeric id when getting tax', async function() {
		const response = await callApi('tax/sdjk');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('TAX_01');
		response.message.should.equal('The ID is not a number.');
	});
	
	it('should error with incorrect id when getting tax', async function() {
		const response = await callApi('tax/9873432');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('TAX_02');
		response.message.should.equal('No record with this ID.');
	});

	it('should get tax', async function() {
		const response = await callApi('tax/1');
		global.lastHttpResponseCode.should.equal(200);
		response.tax_id.should.equal(1);
		response.tax_type.should.exist;
		response.tax_percentage.should.exist;
	});
});
