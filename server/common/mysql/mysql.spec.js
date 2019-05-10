describe('API - DB Tests', function() {

	it('should select value', async function() {
		await getDatabaseConnection();
		const result = await db.select_val('select 1');
		await db.release();
		result.should.equal(1);
	});

	it('should drop table', async function() {
		await getDatabaseConnection();
		db.execute('drop table if exists test');
		const result = await db.select_val('select 1 from information_schema.tables where table_schema = \'turing\' and table_name = \'test\'');
		await db.release();
		result.should.equal(false);
	});

	it('should create table', async function() {
		await getDatabaseConnection();
		await db.execute('create table if not exists test (k varchar(10), v varchar(100), update_time timestamp)');
		let result = await db.select_val('select 1 from information_schema.tables where table_schema = \'turing\' and table_name = \'test\'');
		await db.release();
		result.should.equal(1);
	});

	it('should insert records', async function() {
		await getDatabaseConnection();
		await db.execute('truncate table test');
		await db.insert('test', { k: 'user1', v: 'eng' });
		await db.insert('test', { k: 'user2', v: 'dev' });
		await db.insert('test', { k: 'user3', v: 'finance' });
		const result = await db.select_val('select count(*) from test');
		await db.release();
		result.should.equal(3);
	});

	it('should select row', async function() {
		await getDatabaseConnection();
		const result = await db.select_row('select * from test where k = \'user1\'');
		await db.release();
		result.v.should.equal('eng');
	});

	it('should update values', async function() {
		await getDatabaseConnection();
		await db.update('test', { k: 'user1', v: 'eng2' }, 'k');
		const result = await db.select_row('select * from test where k = \'user1\'');
		await db.release();
		result.v.should.equal('eng2');
	});

	it('should upsert values', async function() {
		await getDatabaseConnection();
		await db.upsert('test', { k: 'user4', v: 'qa' });
		const result = await db.select_row('select * from test where k = \'user4\'');
		await db.release();
		result.v.should.equal('qa');
	});

	it('should upsert values', async function() {
		await getDatabaseConnection();
		await db.upsert('test', { k: 'user4', v: 'qa' });
		const result = await db.select_row('select * from test where k = \'user4\'');
		await db.release();
		result.v.should.equal('qa');
	});

	it('should update constant', async function() {
		await getDatabaseConnection();
		const prevTimestamp = await db.select_val('select update_time from test where k = \'cagdas\'');
		await db.update('test', { k: 'cagdas', v: 'eng3' }, 'k', [ 'update_time' ]);
		const nextTimestamp = await db.select_val('select update_time from test where k = \'cagdas\'');
		await db.release();
		prevTimestamp.toString().should.equal(nextTimestamp.toString());
	});

	it('should update expression', async function() {
		await getDatabaseConnection();
		const prevTimestamp = await db.select_val('select update_time from test where k = \'cagdas\'');
		await db.update('test', { k: 'cagdas', v: 'eng2' }, 'k', null, { update_time: 'now() - interval 1 hour' });
		const nextTimestamp = await db.select_val('select update_time from test where k = \'cagdas\'');
		await db.release();
		prevTimestamp.toString().should.not.equal(nextTimestamp.toString());
	});

	it('should update key', async function() {
		await getDatabaseConnection();
		const result1 = await db.select_val('select 1 from test where k = \'jeff\'');
		// console.log(result1);
		result1.should.equal(1);
		await db.update('test', { k: 'jeff' }, 'k', null, null, 'jeff2');
		const result2 = await db.select_val('select 1 from test where k = \'jeff\'');
		await db.release();
		result2.should.equal(false);
	});

	it('should delete record', async function() {
		await getDatabaseConnection();
		const result1 = await db.select_val('select 1 from test where k = \'lory\'');
		result1.should.equal(1);
		await db.delete('test', 'k', 'lory');
		const result2 = await db.select_val('select 1 from test where k = \'lory\'');
		await db.release();
		result2.should.equal(false);
	});

	it('should select associative record', async function() {
		await getDatabaseConnection();
		const result = await db.select_assoc('select k, v from test');
		await db.release();
		result.cagdas.should.equal('eng2');
	});

	it('should escape string', async function() {
		await getDatabaseConnection();
		db.connection.escape('O\'Reilly').should.equal('\'O\\\'Reilly\'');
		await db.release();
	});

});