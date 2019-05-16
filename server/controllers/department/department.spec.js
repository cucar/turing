describe('Department Tests', function() {

	it('should get departments', async function() {
		const response = await callApi('departments');
		global.lastHttpResponseCode.should.equal(200);
		response[0].department_id.should.exist;
		response[0].name.should.exist;
		response[0].description.should.exist;
	});
	
	it('should get department', async function() {
		const response = await callApi('departments/1');
		global.lastHttpResponseCode.should.equal(200);
		response.department_id.should.equal(1);
		response.name.should.exist;
		response.description.should.exist;
	});
});
