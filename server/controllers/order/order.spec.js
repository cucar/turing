describe('Order Tests', function() {
	
	let testCustomerName = 'Test User';
	let testEmail = 'test@test.com';
	let testPassword = 'Test1234!';
	let testProductId = 1;
	let testAttributes = 'L, Red';
	let testToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcl9pZCI6MjgsImlhdCI6MTU1ODE4NjczNSwiZXhwIjoxNTU4MjczMTM1fQ.dJ3EPC9Gccs7LmBYt7EuhbPGIkEMFm4J5vNjBP3obeM'; // updated in the tests below
	let testOrderId = 3; // updated in the tests below
	let testCartId = 'ibumxykfsla'; // updated in the tests below
	
	it('should register new customer', async function() {
		const response = await callApi('customers', { name: testCustomerName, email: testEmail, password: testPassword }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.customer.schema.name.should.equal('Test User');
		response.customer.schema.email.should.equal('test@test.com');
		response.accessToken.should.startWith('Bearer');
		response.expires_in.should.equal('24h');
		testToken = response.accessToken;
		// console.log(testToken);
	});
	
	it('should get new cart ID', async function() {
		const response = await callApi('shoppingcart/generateUniqueId');
		global.lastHttpResponseCode.should.equal(200);
		response.cart_id.should.exist;
		testCartId = response.cart_id;
	});
	
	it('should add product to cart', async function() {
		const response = await callApi('shoppingcart/add', { cart_id: testCartId, product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(0);
		response[0].product_id.should.equal(testProductId);
	});
	
	it('should create order from cart', async function() {
		let testShippingMethodId = 1;
		let testTaxMethodId = 1;
		const orderResponse = await callApi('orders', { cart_id: testCartId, shipping_id: testShippingMethodId, tax_id: testTaxMethodId }, 'POST', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		orderResponse.order_id.should.be.at.least(0);
		testOrderId = orderResponse.order_id;
		// console.log(testOrderId);
	});
	
	it('should get order short details', async function() {
		const response = await callApi(`orders/shortDetail/${testOrderId}`, {}, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.order_id.should.equal(testOrderId);
		response.total_amount.should.be.at.least(1);
		response.created_on.should.exist;
		response.hasOwnProperty('shipped_on').should.be.true;
		response.status.should.equal('unpaid');
		response.name.should.equal(testCustomerName);
	});
	
	it('should get order products', async function() {
		const response = await callApi(`orders/${testOrderId}`, {}, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(1);
		response[0].order_id.should.equal(testOrderId);
		response[0].product_id.should.equal(testProductId);
		response[0].attributes.should.equal(testAttributes);
		response[0].product_name.should.exist;
		response[0].quantity.should.equal(1);
		response[0].unit_cost.should.exist;
		response[0].subtotal.should.exist;
	});
	
	it('should get orders by customer', async function() {
		const response = await callApi('orders/inCustomer', {}, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(1);
		response[0].order_id.should.equal(testOrderId);
		response[0].total_amount.should.exist;
		response[0].created_on.should.exist;
		response[0].hasOwnProperty('shipped_on').should.be.true;
		response[0].status.should.equal('unpaid');
		response[0].name.should.equal(testCustomerName);
	});

	it('should delete test customer and order that was registered in this test', async function() {
		await getDatabaseConnection();
		await db.delete('customer', 'email', testEmail);
		await db.delete('orders', 'order_id', testOrderId);
		await db.delete('order_detail', 'order_id', testOrderId);
		await db.release();
	});

});
