describe('API - DB Tests', function() {

	it('should select value', async function() {
		await getDatabaseConnection();
		const result = await db.selectVal('select 1');
		await db.release();
		result.should.equal(1);
	});

	it('should drop table if exists', async function() {
		await getDatabaseConnection();
		db.execute('drop table if exists test');
		const result = await db.selectVal('select 1 from information_schema.tables where table_schema = ? and table_name = ?', [ 'turing', 'test' ]);
		await db.release();
		result.should.equal(false);
	});

	it('should create table', async function() {
		await getDatabaseConnection();
		await db.execute('create table if not exists test (k varchar(10), v varchar(100), update_time timestamp)');
		let result = await db.selectVal('select 1 from information_schema.tables where table_schema = ? and table_name = ?', [ 'turing', 'test' ]);
		await db.release();
		result.should.equal(1);
	});

	it('should insert records', async function() {
		await getDatabaseConnection();
		await db.execute('truncate table test');
		await db.insert('test', { k: 'user1', v: 'v1' });
		await db.insert('test', { k: 'user2', v: 'v2' });
		await db.insert('test', { k: 'user3', v: 'v3' });
		const result = await db.selectVal('select count(*) from test');
		await db.release();
		result.should.equal(3);
	});

	it('should select row', async function() {
		await getDatabaseConnection();
		const result = await db.selectRow('select * from test where k = ?', [ 'user1' ]);
		await db.release();
		result.v.should.equal('v1');
	});

	it('should update values', async function() {
		await getDatabaseConnection();
		await db.update('test', { k: 'user1', v: 'v12' }, 'k');
		const result = await db.selectRow('select * from test where k = ?', [ 'user1' ]);
		await db.release();
		result.v.should.equal('v12');
	});

	it('should upsert values', async function() {
		await getDatabaseConnection();
		await db.upsert('test', { k: 'user4', v: 'v4' });
		const result = await db.selectRow('select * from test where k = ?', [ 'user4' ]);
		await db.release();
		result.v.should.equal('v4');
	});

	it('should update constant', async function() {
		await getDatabaseConnection();
		const prevTimestamp = await db.selectVal('select update_time from test where k = ?', [ 'user1' ]);
		await db.update('test', { k: 'user1', v: 'v22' }, 'k', [ 'update_time' ]);
		const nextTimestamp = await db.selectVal('select update_time from test where k = ?', [ 'user1' ]);
		await db.release();
		prevTimestamp.toString().should.equal(nextTimestamp.toString());
	});

	it('should update expression', async function() {
		await getDatabaseConnection();
		const prevTimestamp = await db.selectVal('select update_time from test where k = ?', [ 'user1' ]);
		await db.update('test', { k: 'user1', v: 'v23' }, 'k', null, { update_time: 'now() - interval 1 hour' });
		const nextTimestamp = await db.selectVal('select update_time from test where k = ?', [ 'user1' ]);
		await db.release();
		prevTimestamp.toString().should.not.equal(nextTimestamp.toString());
	});

	it('should update key', async function() {
		await getDatabaseConnection();
		const result1 = await db.selectVal('select 1 from test where k = ?', [ 'user2' ]);
		// console.log(result1);
		result1.should.equal(1);
		await db.update('test', { k: 'user2' }, 'k', null, null, 'user23');
		const result2 = await db.selectVal('select 1 from test where k = ?', [ 'user2' ]);
		await db.release();
		result2.should.equal(false);
	});

	it('should delete record', async function() {
		await getDatabaseConnection();
		const result1 = await db.selectVal('select 1 from test where k = ?', [ 'user3' ]);
		result1.should.equal(1);
		await db.delete('test', 'k', 'user3');
		const result2 = await db.selectVal('select 1 from test where k = ?', [ 'user3' ]);
		await db.release();
		result2.should.equal(false);
	});

	it('should select associative record', async function() {
		await getDatabaseConnection();
		const result = await db.selectAssoc('select k, v from test');
		await db.release();
		result.user1.should.equal('v23');
	});

	it('should escape string', async function() {
		await getDatabaseConnection();
		db.connection.escape('O\'Reilly').should.equal('\'O\\\'Reilly\'');
		await db.release();
	});
	
	it('should drop table', async function() {
		await getDatabaseConnection();
		db.execute('drop table test');
		const result = await db.selectVal('select 1 from information_schema.tables where table_schema = ? and table_name = ?', [ 'turing', 'test' ]);
		await db.release();
		result.should.equal(false);
	});
	
});