describe('Product Tests', function() {
	
	let testEmail = 'test@test.com';
	let testPassword = 'Test1234!';
	let testToken = ''; // will be filled out in tests

	it('should get products - cut description at 10 characters - set page size to 5 records', async function() {
		const response = await callApi('products', { description_length: 10, limit: 5 });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
		response.rows.length.should.be.at.most(5);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].description.length.should.equal(13);
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});
	
	it('should search products', async function() {
		const response = await callApi('products/search', { limit: 5, order: 'product_id', description_length: 10, query_string: 'fellow', all_words: 'on' });
		global.lastHttpResponseCode.should.equal(200);
		response.rows.length.should.be.at.most(5);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].description.length.should.equal(13);
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});

	it('should error with incorrect id when getting product', async function() {
		const response = await callApi('products/9873432');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('PRD_01');
		response.message.should.equal('No record with this ID.');
	});

	it('should get product', async function() {
		const response = await callApi('products/1');
		global.lastHttpResponseCode.should.equal(200);
		response.product_id.should.equal(1);
		response.name.should.exist;
		response.description.should.exist;
		response.price.should.exist;
		response.discounted_price.should.exist;
		response.image.should.exist;
		response.image_2.should.exist;
		response.thumbnail.should.exist;
		response.display.should.exist;
	});
	
	it('should get products of a category', async function() {
		const response = await callApi('products/inCategory/1', { limit: 5, order: 'product_id', description_length: 10 });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
		response.rows.length.should.equal(5);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].description.length.should.equal(13);
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});
	
	it('should get products of a department', async function() {
		const response = await callApi('products/inDepartment/1', { limit: 5, order: 'product_id', description_length: 10 });
		global.lastHttpResponseCode.should.equal(200);
		response.rows.length.should.equal(5);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].description.length.should.equal(13);
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});
	
	it('should get product details', async function() {
		const response = await callApi('products/1/details');
		global.lastHttpResponseCode.should.equal(200);
		response.product_id.should.equal(1);
		response.name.should.exist;
		response.description.should.exist;
		response.price.should.exist;
		response.discounted_price.should.exist;
		response.image.should.exist;
		response.image2.should.exist;
	});
	
	it('should get product locations', async function() {
		const response = await callApi('products/81/locations');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(1);
		response[0].category_id.should.exist;
		response[0].category_name.should.exist;
		response[0].department_id.should.exist;
		response[0].department_name.should.exist;
	});
	
	it('should register new customer', async function() {
		const response = await callApi('customers', { name: 'Test User', email: testEmail, password: testPassword }, 'POST');
		global.lastHttpResponseCode.should.equal(200);
		response.customer.schema.name.should.equal('Test User');
		response.customer.schema.email.should.equal('test@test.com');
		response.accessToken.should.startWith('Bearer');
		response.expires_in.should.equal('24h');
		testToken = response.accessToken;
	});
	
	it('should post a product review', async function() {
		const response = await callApi('products/81/reviews', { product_id: 81, review: 'test review', rating: 4 }, 'POST', { Authorization: testToken });
		global.lastHttpResponseCode.should.equal(200);
		response.should.exist;
	});

	it('should get product reviews', async function() {
		const response = await callApi('products/81/reviews');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.at.least(1);
		response[0].name.should.exist;
		response[0].review.should.exist;
		response[0].rating.should.exist;
		response[0].created_on.should.exist;
	});
	
	it('should delete test customer and review that was posted in this test', async function() {
		await getDatabaseConnection();
		await db.delete('customer', 'email', testEmail);
		await db.delete('review', 'review', 'test review');
		await db.release();
	});
	
});