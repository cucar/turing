describe('Customer Facebook Tests', function() {

	it('should test facebook login', async function() {
		const response = await callApi('customers/facebook', { access_token: 'jhsddfsd' }, 'POST');
		console.log(response);
	});
});
