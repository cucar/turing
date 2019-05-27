describe('Customer Tests', function() {

	let testEmail = 'test@test.com';
	let testPassword = 'Test1234!';
	let testToken = ''; // will be filled out in login test
	
	it('should fail registration - missing password', async function() {
		const response = await callApi('customers', { name: 'Test User', email: testEmail }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_02');
		response.message.should.equal('The field(s) are/is required.');
		response.field.should.equal('password');
	});
	
	it('should fail registration - invalid email', async function() {
		const response = await callApi('customers', { name: 'Test User', email: 'test@test', password: 'test' }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_03');
		response.message.should.equal('The email is invalid.');
	});
	
	it('should fail registration - insecure password', async function() {
		const response = await callApi('customers', { name: 'Test User', email: testEmail, password: 'test' }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_10');
		response.message.should.equal('The password is insecure. Please use a password of at least 8 characters with at least one upper case, lower case, number and a special character.');
	});
	
	it('should register new customer', async function() {
		const response = await callApi('customers', { name: 'Test User', email: testEmail, password: testPassword }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.customer.schema.name.should.equal('Test User');
		response.customer.schema.email.should.equal('test@test.com');
		response.accessToken.should.startWith('Bearer');
		response.expires_in.should.equal('24h');
	});
	
	it('should fail registration - duplicate customer', async function() {
		const response = await callApi('customers', { name: 'Test User', email: testEmail, password: testPassword }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_04');
		response.message.should.equal('The email already exists.');
	});
	
	it('should fail login - missing password', async function() {
		const response = await callApi('customers/login', { email: testEmail }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_02');
		response.message.should.equal('The field(s) are/is required.');
		response.field.should.equal('password');
	});
	
	it('should fail login - invalid customer', async function() {
		const response = await callApi('customers/login', { email: 'test@test2.com', password: testPassword }, 'POST');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_05');
		response.message.should.equal('The email does not exist.');
	});
	
	it('should login as new customer', async function() {
		const response = await callApi('customers/login', { email: testEmail, password: testPassword }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.customer.schema.name.should.equal('Test User');
		response.customer.schema.email.should.equal('test@test.com');
		response.accessToken.should.startWith('Bearer');
		response.expires_in.should.equal('24h');
		testToken = response.accessToken;
	});
	
	it('should fail getting customer info - no auth', async function() {
		const response = await callApi('customer', { email: testEmail, password: testPassword }, 'GET');
		global.lastHttpResponseCode.should.equal(401);
		response.code.should.equal('AUT_01');
		response.message.should.equal('No authorization header sent.');
	});
	
	it('should fail getting customer info - no bearer', async function() {
		const response = await callApi('customer', { email: testEmail, password: testPassword }, 'GET', { Authorization: '' });
		global.lastHttpResponseCode.should.equal(401);
		response.code.should.equal('AUT_02');
		response.message.should.equal('Authorization header does not have bearer.');
	});
	
	it('should fail getting customer info - bad token', async function() {
		const response = await callApi('customer', { email: testEmail, password: testPassword }, 'GET', { Authorization: 'Bearer 12345' });
		global.lastHttpResponseCode.should.equal(401);
		response.code.should.equal('AUT_03');
		response.message.should.equal('Expired or malformed token. Please re-login.');
	});

	it('should get customer info', async function() {
		const response = await callApi('customer', { email: testEmail, password: testPassword }, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.name.should.equal('Test User');
		response.email.should.equal('test@test.com');
	});
	
	it('should get customer info', async function() {
		const response = await callApi('customer', { email: testEmail, password: testPassword }, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.name.should.equal('Test User');
		response.email.should.equal('test@test.com');
	});
	
	it('should fail updating customer info due to bad password', async function() {
		const response = await callApi('customer', { name: 'Test User2', email: 'test2@test.com', password: '12345' }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_10');
		response.message.should.equal('The password is insecure. Please use a password of at least 8 characters with at least one upper case, lower case, number and a special character.');
	});
	
	it('should fail updating customer info due to bad phone number', async function() {
		const response = await callApi('customer', { name: 'Test User2', email: 'test2@test.com', password: 'Test1234!!', mob_phone: '39084' }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_06');
		response.message.should.equal('Invalid phone number.');
	});

	it('should update customer info', async function() {
		const response = await callApi('customer', { name: 'Test User2', email: 'test2@test.com', password: 'Test1234!!', mob_phone: '858-717-5446' }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.name.should.equal('Test User2');
		response.email.should.equal('test2@test.com');
		response.mob_phone.should.equal('858-717-5446');
	});
	
	it('should fail updating customer address due to bad country code', async function() {
		const response = await callApi('customers/address',
			{ address_1: '555 test st', address_2: '', city: 'San Diego', region: 'CA', postal_code: '92101', country: 'USA', shipping_region_id: 2 }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_12');
		response.message.should.equal('Invalid country code.');
	});
	
	it('should fail updating customer address due to bad postal code', async function() {
		const response = await callApi('customers/address',
			{ address_1: '555 test st', address_2: '', city: 'San Diego', region: 'CA', postal_code: '92101AB', country: 'US', shipping_region_id: 2 }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_13');
		response.message.should.equal('Invalid zip code.');
	});
	
	it('should fail updating customer address due to bad shipping region', async function() {
		const response = await callApi('customers/address',
			{ address_1: '555 test st', address_2: '', city: 'San Diego', region: 'CA', postal_code: '92101', country: 'US', shipping_region_id: 'ABC' }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_09');
		response.message.should.equal('The Shipping Region ID is not number');
	});

	it('should update customer address', async function() {
		const response = await callApi('customers/address',
			{ address_1: '555 test st', address_2: '', city: 'San Diego', region: 'CA', postal_code: '92101', country: 'US', shipping_region_id: 2 }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.address_1.should.equal('555 test st');
		response.address_2.should.equal('');
		response.city.should.equal('San Diego');
		response.region.should.equal('CA');
		response.postal_code.should.equal('92101');
		response.country.should.equal('US');
		response.shipping_region_id.should.equal(2);
	});
	
	it('should fail updating customer credit card due to bad card', async function() {
		const response = await callApi('customers/creditCard', { credit_card: '4111111111111115' }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('USR_08');
		response.message.should.equal('This is an invalid Credit Card.');
	});
	
	it('should update customer credit card', async function() {
		const response = await callApi('customers/creditCard', { credit_card: '4111111111111111' }, 'PUT', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.credit_card.should.equal('XXXXXXXXXXXX1111');
	});

	it('should delete test customer that was registered in this test', async function() {
		await getDatabaseConnection();
		await db.delete('customer', 'email', 'test2@test.com');
		await db.release();
	});

});
