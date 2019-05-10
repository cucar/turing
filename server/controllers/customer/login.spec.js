describe('API - Login Integration Tests', function() {

	it('should fail login - missing fields', async function() {
		const response = await callApi('customers/login', { email: 'test@test.com' }, 'POST');
		console.log(response);
		global.lastHttpResponseCode.should.equal(400);
		// response.code.should.equal('DBC_01');
	});

});
