describe('Category Tests', function() {
	
	it('should error getting categories due to invalid order direction', async function() {
		const response = await callApi('categories', { limit: 5, order: 'category_id', direction: 'bad_dir' });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('PAG_01');
		response.message.should.equal('Invalid order direction. Use asc or desc.');
	});
	
	it('should error getting categories due to invalid order field', async function() {
		const response = await callApi('categories', { limit: 5, order: 'bad_field', direction: 'asc' });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('PAG_02');
		response.message.should.equal('The field of order is not allow sorting.');
	});
	
	it('should error getting categories due to invalid page number', async function() {
		const response = await callApi('categories', { limit: 5, page: 10000 });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('PAG_03');
		response.message.should.include('Incorrect page number');
	});
	
	it('should error getting categories due to sql injection attack', async function() {
		const response = await callApi('categories', { limit: '5; truncate customer', order: 'category_id', direction: 'asc' });
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('PAG_04');
		response.message.should.include('Invalid page size');
	});
	
	it('should get categories', async function() {
		const response = await callApi('categories');
		global.lastHttpResponseCode.should.equal(200);
		response.count.should.be.above(0);
		response.rows[0].category_id.should.exist;
		response.rows[0].department_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
	});
	
	it('should get categories for custom page size', async function() {
		const response = await callApi('categories', { limit: 5 });
		global.lastHttpResponseCode.should.equal(200);
		response.rows.length.should.be.at.most(5);
		response.rows[0].category_id.should.exist;
		response.rows[0].department_id.should.exist;
		response.rows[0].name.should.exist;
		response.rows[0].description.should.exist;
	});
	
	it('should error with incorrect id when getting category', async function() {
		const response = await callApi('categories/9873432');
		global.lastHttpResponseCode.should.equal(400);
		response.code.should.equal('CAT_01');
		response.message.should.equal('No record with this ID.');
	});

	it('should get category', async function() {
		const response = await callApi('categories/1');
		global.lastHttpResponseCode.should.equal(200);
		response.category_id.should.equal(1);
		response.department_id.should.exist;
		response.name.should.exist;
		response.description.should.exist;
	});
	
	it('should get categories of a department', async function() {
		const response = await callApi('categories/inDepartment/1');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.above(0);
		response[0].category_id.should.exist;
		response[0].department_id.should.exist;
		response[0].name.should.exist;
		response[0].description.should.exist;
	});
	
	it('should get categories of a product', async function() {
		const response = await callApi('categories/inProduct/81');
		global.lastHttpResponseCode.should.equal(200);
		response.length.should.be.above(0);
		response[0].category_id.should.exist;
		response[0].department_id.should.exist;
		response[0].name.should.exist;
		response[0].description.should.exist;
	});

});
