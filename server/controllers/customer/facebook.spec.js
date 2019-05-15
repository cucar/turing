describe('Customer Facebook Tests', function() {

	it('should test facebook login', async function() {
		// this is not tested - difficult to get a test access token in development (setup a test app, setup a test Facebook login page served with https in development, grab the access token, etc.)
		const response = await callApi('customers/facebook', { access_token: 'jhsddfsd' }, 'POST');
		console.log(response);
	});
});
