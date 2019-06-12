describe('Order Tests', function() {
	
	let testCustomerName = 'Test User';
	let testEmail = 'test@test.com';
	let testPassword = 'Test1234!';
	let testProductId = 1;
	let testAttributes = 'L, Red';
	let testToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcl9pZCI6NjksImlhdCI6MTU2MDM0OTQ4OSwiZXhwIjoxNTYwNDM1ODg5fQ.Jk8EP58eAkNrzINfNHw3Cg8K0Sy6rcNnnZNh4FWIR_E'; // updated in the tests below
	let testOrderId = 32; // updated in the tests below
	let testCartId = '838lo5bke3x'; // updated in the tests below
	
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
	
	it('should add product to cart and get cart ID', async function() {
		const response = await callApi('shoppingcart/add', { product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.cart_id.should.exist;
		response.product_count.should.be.at.least(0);
		testCartId = response.cart_id;
	});
	
	it('should error trying to create order from cart', async function() {
		let testShippingMethodId = 1;
		const orderResponse = await callApi('orders', { cart_id: testCartId, shipping_id: testShippingMethodId }, 'POST', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(400);
		orderResponse.code.should.equal('ORD_03');
		orderResponse.message.should.startWith('Card declined');
	});
	
	it('should create order from cart', async function() {
		let testShippingMethodId = 1;
		await getDatabaseConnection();
		testOrderId = await db.insert('orders', {
			created_on: new Date(),
			customer_id: await db.selectVal('select customer_id from customer where email = ?', [ testEmail ]),
			shipping_id: testShippingMethodId,
			tax_amount: 4.50,
			total_amount: 24.50 + Math.round(parseFloat(await db.selectVal('select price from product where product_id = ?', [ testProductId ])) * 100) / 100
		});
		await db.execute(`
			insert into order_detail (order_id, product_id, attributes, product_name, quantity, unit_cost)
			select ?, p.product_id, sc.attributes, p.name, sc.quantity, coalesce(nullif(p.discounted_price, 0), p.price) as unit_cost
			from shopping_cart sc
			join product p on sc.product_id = p.product_id
			where sc.cart_id = ?
			and sc.buy_now = 1
		`, [ testOrderId, testCartId ]);
		await db.executeSP('shopping_cart_empty', [ testCartId ]);
		await db.release();
	});

	it('should get order short details', async function() {
		const response = await callApi(`orders/shortDetail/${testOrderId}`, {}, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.order_id.should.equal(testOrderId);
		parseFloat(response.total_amount).should.be.at.least(1);
		response.created_on.should.exist;
	});
	
	it('should get order products', async function() {
		const response = await callApi(`orders/${testOrderId}`, {}, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.at.least(1);
		response.rows.length.should.be.at.least(1);
		response.rows[0].order_id.should.equal(testOrderId);
		response.rows[0].product_id.should.equal(testProductId);
		response.rows[0].attributes.should.equal(testAttributes);
		response.rows[0].product_name.should.exist;
		response.rows[0].quantity.should.equal(1);
		response.rows[0].unit_cost.should.exist;
		response.rows[0].subtotal.should.exist;
	});
	
	it('should get orders by customer', async function() {
		const response = await callApi('orders/inCustomer', {}, 'GET', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.at.least(1);
		response.rows.length.should.be.at.least(1);
		response.rows[0].order_id.should.exist;
		response.rows[0].total_amount.should.exist;
		response.rows[0].created_on.should.exist;
		response.rows[0].shipping_type.should.exist;
		response.rows[0].tax_amount.should.exist;
	});

	it('should delete test customer and order that was registered in this test', async function() {
		await getDatabaseConnection();
		await db.delete('customer', 'email', testEmail);
		await db.delete('orders', 'order_id', testOrderId);
		await db.delete('order_detail', 'order_id', testOrderId);
		await db.release();
	});

});
