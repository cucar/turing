describe('API - Login Integration Tests', function() {

	it('should fail login - missing password', async function() {
		const response = await callApi('customers/login', { email: 'test@test.com' }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_02');
		response.message.should.equal('The field(s) are/is required.');
		response.field.should.equal('password');
	});
	
	it('should login and get session token', async function() {
		const response = await callApi('customers/login', { email: 'test@test.com', password: 'test' }, 'POST');
		console.log(response);
		// global.lastHttpResponseCode.should.equal(400);
		// response.code.should.equal('USR_02');
		// response.message.should.equal('The field(s) are/is required.');
		// response.field.should.equal('password');
	});
	
});
