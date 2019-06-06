const product = require('./product.js');

describe('Product Tests', function() {
	
	let testEmail = 'test@test.com';
	let testPassword = 'Test1234!';
	let testToken = ''; // will be filled out in tests

	it('should get products - set page size to 10 records', async function() {
		const response = await callApi('products', { limit: 10 });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
		response.rows.length.should.be.at.most(10);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});
	
	it('should test search decisions in boolean/natural language mode', function() {
		product.constructor.searchInBooleanMode('(apple banana)').should.be.true;
		product.constructor.searchInBooleanMode('+apple +juice').should.be.true;
		product.constructor.searchInBooleanMode('+apple macintosh').should.be.true;
		product.constructor.searchInBooleanMode('+apple -macintosh').should.be.true;
		product.constructor.searchInBooleanMode('+apple ~macintosh').should.be.true;
		product.constructor.searchInBooleanMode('+apple +(>turnover <strudel)').should.be.true;
		product.constructor.searchInBooleanMode('apple*').should.be.true;
		product.constructor.searchInBooleanMode('"some words"').should.be.false;
	});
	
	it('should search products', async function() {
		const response = await callApi('products', { order: 'product_id_desc', search_term: 'fellow' });
		global.lastHttpResponseCode.should.equal(200);
		response.rows.length.should.be.at.most(10);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
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
		response.category.category_id.should.exist;
		response.category.category_name.should.exist;
		response.images.length.should.equal(2);
	});
	
	it('should get products of a category', async function() {
		const response = await callApi('products', { category_ids: '1,3' });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
		response.rows.length.should.equal(10);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});
	
	it('should get products of a department', async function() {
		const response = await callApi('products', { department_ids: '1,3' });
		global.lastHttpResponseCode.should.equal(200);
		response.rows.length.should.equal(10);
		response.rows[0].product_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
		response.rows[0].price.should.exist;
		response.rows[0].discounted_price.should.exist;
		response.rows[0].thumbnail.should.exist;
	});
	
	it('should get discounted products', async function() {
		const response = await callApi('products', { discounted: 1 });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
	});
	
	it('should get products within price range', async function() {
		const response = await callApi('products', { min_price: 10, max_price: 20 });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
	});
	
	it('should get products with attribute values', async function() {
		const response = await callApi('products', { attribute_value_ids: '2,7' });
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
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