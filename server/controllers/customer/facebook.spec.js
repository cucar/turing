/**
 * Facebook test is not easy to set up. You need to have the access token to test it and getting that is difficult. Here are the steps to run this test:
 * 1- Register a test app in Facebook and get its ID. Update that ID in facebook.html file in this folder (in appId property).
 * 2- Run node facebook-server.test.js in this folder to start up the local SSL server. Make sure there are no other web servers that would conflict with port 443.
 * 3- Now go to https://localhost/facebook.html - you will get certificate warning. Ignore that and continue.
 * 4- Login to facebook and authorize app. The test page should display the email and access token to be used in this test.
 * 5- Create your user in customer table with that email.
 * 6- Copy and paste the access token and email to this test and run it.
 */
let accessToken = '';
let email = 'test@test.com';
	
describe('Customer Facebook Tests', function() {
	
	it('should test facebook login', async function() {
		const response = await callApi('customers/facebook', { access_token: accessToken }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.customer.schema.email.should.equal(email);
		response.accessToken.should.startWith('Bearer');
		response.expires_in.should.equal('24h');
	});
});
