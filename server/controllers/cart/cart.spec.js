describe('Shopping Cart Tests', function() {

	let testCartId = 'test'; // it will be updated from the tests below
	let testProductId = 1;
	let testAttributes = 'L, Red';
	
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
		response[0].item_id.should.exist;
		response[0].cart_id.should.equal(testCartId);
		response[0].product_id.should.equal(testProductId);
		response[0].attributes.should.equal(testAttributes);
		response[0].quantity.should.be.at.least(0);
		response[0].buy_now.should.exist;
		response[0].added_on.should.exist;
	});
	
	it('should get products in cart', async function() {
		const response = await callApi(`shoppingcart/${testCartId}`);
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(0);
		response[0].item_id.should.exist;
		response[0].cart_id.should.equal(testCartId);
		response[0].product_id.should.equal(testProductId);
		response[0].attributes.should.equal(testAttributes);
		response[0].quantity.should.be.at.least(0);
		response[0].buy_now.should.exist;
		response[0].added_on.should.exist;
	});

});
