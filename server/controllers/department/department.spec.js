describe('Department Tests', function() {

	it('should get departments', async function() {
		const response = await callApi('departments');
		global.lastHttpResponseCode.should.equal(200);
		response[0].department_id.should.exist;
		response[0].name.should.exist;
		response[0].description.should.exist;
	});
	
	it('should error with non-numeric id when getting department', async function() {
		const response = await callApi('departments/sdjk');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('DEP_01');
		response.message.should.equal('The ID is not a number.');
	});
	
	it('should error with incorrect id when getting department', async function() {
		const response = await callApi('departments/9873432');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('DEP_02');
		response.message.should.equal('No record with this ID.');
	});

	it('should get department', async function() {
		const response = await callApi('departments/1');
		global.lastHttpResponseCode.should.equal(200);
		response.department_id.should.equal(1);
		response.name.should.exist;
		response.description.should.exist;
	});
});
