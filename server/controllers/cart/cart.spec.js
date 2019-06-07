describe('Shopping Cart Tests', function() {

	let testCartId = 'test'; // it will be updated from the tests below
	let testItemId = 1; // it will be updated from the tests below
	let testProductId = 1;
	let testAttributes = 'L, Red';
	
	it('should get new cart ID', async function() {
		const response = await callApi('shoppingcart/add', { product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.cart_id.should.exist;
		response.product_count.should.equal('1');
	});
	
	it('should add product to cart', async function() {
		const response = await callApi('shoppingcart/add', { cart_id: testCartId, product_id: testProductId, attributes: testAttributes }, 'POST');
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
		addResponse.length.should.be.at.least(0);
		testItemId = addResponse[0].item_id;
		const emptyResponse = await callApi(`shoppingcart/empty/${testCartId}`, {}, 'DELETE');
		global.lastHttpResponseCode.should.equal(200);
		emptyResponse.should.exist;
	});
	
	it('should add a product to cart and then save it for later', async function() {
		const addResponse = await callApi('shoppingcart/add', { cart_id: testCartId, product_id: testProductId, attributes: testAttributes }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		addResponse.length.should.be.at.least(0);
		testItemId = addResponse[0].item_id;
		const emptyResponse = await callApi(`shoppingcart/saveForLater/${testItemId}`);
		global.lastHttpResponseCode.should.equal(200);
		emptyResponse.should.exist;
	});
	
	it('should get products in cart that are saved for later', async function() {
		const productsSavedForLater = await callApi(`shoppingcart/getSaved/${testCartId}`);
		global.lastHttpResponseCode.should.equal(200);
		productsSavedForLater.length.should.be.at.least(0);
		productsSavedForLater[0].item_id.should.exist;
		productsSavedForLater[0].name.should.exist;
		productsSavedForLater[0].attributes.should.equal(testAttributes);
		productsSavedForLater[0].product_id.should.equal(testProductId);
		productsSavedForLater[0].price.should.exist;
		productsSavedForLater[0].quantity.should.be.at.least(0);
		productsSavedForLater[0].image.should.exist;
		productsSavedForLater[0].subtotal.should.exist;
		let productInCart = false;
		for (let item of productsSavedForLater) if (item.product_id === testProductId) productInCart = true;
		productInCart.should.be.true;
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
