describe('Shopping Cart Tests', function() {

	let testCartId = 'test'; // it will be updated from the tests below
	let testItemId = 1; // it will be updated from the tests below
	let testProductId = 1;
	let testAttributes = 'L, Red';
	
	it('should get new cart ID', async function() {
		const response = await callApi('shoppingcart/add', { product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.cart_id.should.exist;
		response.product_count.should.equal(1);
	});
	
	it('should add product to cart', async function() {
		const response = await callApi('shoppingcart/add', { cart_id: testCartId, product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.cart_id.should.equal(testCartId);
		response.product_count.should.be.at.least(1);
	});
	
	it('should get products in cart', async function() {
		const response = await callApi(`shoppingcart/${testCartId}`);
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(0);
		response[0].item_id.should.exist;
		response[0].name.should.exist;
		response[0].attributes.should.equal(testAttributes);
		response[0].product_id.should.equal(testProductId);
		response[0].price.should.exist;
		response[0].quantity.should.be.at.least(0);
		response[0].image.should.exist;
		response[0].subtotal.should.exist;
		testItemId = response[0].item_id;
	});
	
	it('should get checkout data for cart', async function() {
		
		// register a customer and get login token back
		const testEmail = `${Math.random().toString().substr(2)}@test.com`;
		const registerResponse = await callApi('customers', { name: 'Test User', email: testEmail, password: 'Test1234!' }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		// console.log('register response', testEmail, registerResponse);
		registerResponse.accessToken.should.exist;
		const accessToken = registerResponse.accessToken;

		// now get the cart data with the registered customer
		const checkoutResponse1 = await callApi(`shoppingcart/checkout/${testCartId}`, {}, 'GET', { Authorization: accessToken });
		global.lastHttpResponseCode.should.equal(200);
		// console.log('checkout response 1', checkoutResponse1);
		checkoutResponse1.products.length.should.be.at.least(0);
		checkoutResponse1.products[0].item_id.should.exist;
		checkoutResponse1.products[0].name.should.exist;
		checkoutResponse1.products[0].attributes.should.equal(testAttributes);
		checkoutResponse1.products[0].product_id.should.equal(testProductId);
		checkoutResponse1.products[0].price.should.exist;
		checkoutResponse1.products[0].quantity.should.be.at.least(1);
		checkoutResponse1.products[0].image.should.exist;
		checkoutResponse1.products[0].subtotal.should.exist;
		checkoutResponse1.products[0].buy_now.should.equal(true);
		checkoutResponse1.shipping_methods.length.should.equal(0); // since the new customer does not have address on file, the shipping methods array should be empty
		checkoutResponse1.tax_amount.should.be.at.least(0.1); // no customer address on file means full tax amount - non-zero
		
		// update address on file
		const updateResponse = await callApi('customers/address',
			{ address_1: '555 test st', address_2: '', city: 'San Diego', region: 'CA', postal_code: '92101', country: 'US', shipping_region_id: 2 }, 'PUT', { Authorization: accessToken });
		global.lastHttpResponseCode.should.equal(200);
		updateResponse.should.exist;
		// console.log('update response', updateResponse);
		
		// now get the cart data with the registered customer
		const checkoutResponse2 = await callApi(`shoppingcart/checkout/${testCartId}`, {}, 'GET', { Authorization: accessToken });
		global.lastHttpResponseCode.should.equal(200);
		// console.log('checkout response 2', checkoutResponse2);
		checkoutResponse2.products.length.should.be.at.least(1);
		checkoutResponse2.shipping_methods.length.should.be.at.least(1);
		checkoutResponse2.tax_amount.should.equal(0);
		
		// delete the test customer (un-register)
		await getDatabaseConnection();
		await db.delete('customer', 'email', testEmail);
		await db.release();
	});

	it('should get cart total', async function() {
		const response = await callApi(`shoppingcart/totalAmount/${testCartId}`);
		global.lastHttpResponseCode.should.equal(200);
		response.total_amount.should.be.at.least(0);
	});
	
	it('should update cart product quantity', async function() {
		const response = await callApi(`shoppingcart/update/${testItemId}`, { quantity: 5 }, 'PUT');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(0);
		response[0].item_id.should.exist;
		response[0].name.should.exist;
		response[0].attributes.should.equal(testAttributes);
		response[0].product_id.should.equal(testProductId);
		response[0].price.should.exist;
		response[0].quantity.should.be.at.least(0);
		response[0].image.should.exist;
		response[0].subtotal.should.exist;
		for (let item of response) if (item.item_id === testItemId) item.quantity.should.equal(5);
	});
	
	it('should remove product from cart', async function() {
		const response = await callApi(`shoppingcart/removeProduct/${testItemId}`, {}, 'DELETE');
		response.should.exist;
		global.lastHttpResponseCode.should.equal(200);
	});
	
	it('should add a product to cart and then empty it', async function() {
		const addResponse = await callApi('shoppingcart/add', { cart_id: testCartId, product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		addResponse.product_count.should.be.at.least(0);
		const emptyResponse = await callApi(`shoppingcart/empty/${testCartId}`, {}, 'DELETE');
		global.lastHttpResponseCode.should.equal(200);
		emptyResponse.should.exist;
	});
	
	it('should add a product to cart and then save it for later', async function() {
		const addResponse = await callApi('shoppingcart/add', { cart_id: testCartId, product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		addResponse.product_count.should.be.at.least(0);
		const cartProducts = await callApi(`shoppingcart/${testCartId}`);
		global.lastHttpResponseCode.should.equal(200);
		cartProducts.length.should.be.at.least(0);
		testItemId = cartProducts[0].item_id;
		const emptyResponse = await callApi(`shoppingcart/saveForLater/${testItemId}`);
		global.lastHttpResponseCode.should.equal(200);
		emptyResponse.should.exist;
	});
	
	it('should move a product saved for later back to cart', async function() {
		const moveResponse = await callApi(`shoppingcart/moveToCart/${testItemId}`);
		global.lastHttpResponseCode.should.equal(200);
		moveResponse.should.exist;
		const cartProducts = await callApi(`shoppingcart/${testCartId}`);
		global.lastHttpResponseCode.should.equal(200);
		cartProducts.length.should.be.at.least(0);
		let productInCart = false;
		for (let item of cartProducts) if (item.product_id === testProductId) productInCart = true;
		productInCart.should.be.true;
	});
	
	it('should empty a cart', async function() {
		const emptyResponse = await callApi(`shoppingcart/empty/${testCartId}`, {}, 'DELETE');
		global.lastHttpResponseCode.should.equal(200);
		emptyResponse.should.exist;
	});
});
