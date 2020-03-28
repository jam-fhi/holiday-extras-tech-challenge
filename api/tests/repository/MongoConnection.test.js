// Mongo exceptions take a long time to appear.
jest.setTimeout(45000);

import MongoConnection from '../../src/repository/MongoConnection';
import UserFixture from './fixture/users.json';

describe('MongoConnection', () => {
	const validCollection = 'test';
	const validDB = 'users';
	const validQuery = {
		email: 'sally@holextra.com'
	};
	const validUpdate = {
		email: 'sally2@holextra.com'
	};
	const validDelete = {
		email: 'sally@holextra.com'
	};
	const validInsert = {
		id: 1,
		email: 'jerry@holextra.com',
		givenName: 'Jerry',
		familyName: 'Solomon',
		created: '2020-02-17T13:07:01.000Z',
		password: 'password',
		about: 'I like fishing',
		token: ''
	};
	const validUpdateResult = true;
	const invalidUpdateResult = false;
	const validInsertResult = true;
	const validDeleteResult = true;
	const invalidDeleteResult = false;
	const validUsername = 'accounts';
	const validPassword = 'password';
	const validHost = 'localhost';
	const validAuthDB = 'admin';
	const validNoFoundDocument = null;
	const validAllDocsLength = 4;
	const validNoDocsLength = 0;
	const invalidUsername = 'notvalid';
	const invalidPassword = 'password1';
	const invalidHost = 'remotehost';
	const invalidAuthDB = 'blah';
	const invalidDB = 'nodb';
	const invalidCollection = 'nocollection';
	const invalidQuery = {
		email: 'sally1@holextra.com'
	};
	const invalidUpdate = {
		email: 'sally@holextra.com'
	};
	const invalidDelete = {
		email: 'samuel@holextra.com'
	};
	const invalidInsert = null;
	const authenticationFailedMessage = 'Authentication failed.';
	const invalidHostMessage = 'getaddrinfo ENOTFOUND remotehost';
	const invalidDBMessage = 'not authorized on nodb to execute command';
	const invalidInsertMessage = "Cannot read property '_id' of null";
	let mongoConn;

	beforeEach(async () => {
		mongoConn = new MongoConnection(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB
		);
		const client = await mongoConn.getMongoDBConnection();
		await client
			.db(validDB)
			.collection(validCollection)
			.insertMany(UserFixture);
		await client.close();
	});

	afterEach(async () => {
		const client = await mongoConn.getMongoDBConnection();
		await client
			.db(validDB)
			.collection(validCollection)
			.remove({});
		await client
			.db(validDB)
			.collection(validCollection)
			.drop();
		await client.close();
	});

	it('Will return Mongo Connection options', () => {
		const connectionOptions = mongoConn.getConnectionOptions();
		expect(connectionOptions).toMatchSnapshot();
	});

	it('Will find one result', async () => {
		const docResult = await mongoConn.findOne(validCollection, validQuery);
		delete docResult._id;
		expect(docResult).toMatchSnapshot();
	});

	it('Will throw an error on invalid username', async done => {
		const badMongoConn = new MongoConnection(
			invalidUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB
		);
		try {
			await badMongoConn.findOne(validQuery);
		} catch (e) {
			expect(e.message).toBe(authenticationFailedMessage);
			done();
		}
	});

	it('Will throw an error on invalid password', async done => {
		const badMongoConn = new MongoConnection(
			validUsername,
			invalidPassword,
			validHost,
			validAuthDB,
			validDB
		);
		try {
			await badMongoConn.findOne(validCollection, validQuery);
		} catch (e) {
			expect(e.message).toBe(authenticationFailedMessage);
			done();
		}
	});

	it('Will throw an error on invalid host', async done => {
		const badMongoConn = new MongoConnection(
			validUsername,
			validPassword,
			invalidHost,
			validAuthDB,
			validDB
		);
		try {
			await badMongoConn.findOne(validCollection, validQuery);
		} catch (e) {
			expect(e.message).toBe(invalidHostMessage);
			done();
		}
	});

	it('Will throw an error on invalid authdb', async done => {
		const badMongoConn = new MongoConnection(
			validUsername,
			validPassword,
			validHost,
			invalidAuthDB,
			validDB
		);
		try {
			await badMongoConn.findOne(validCollection, validQuery);
		} catch (e) {
			expect(e.message).toBe(authenticationFailedMessage);
			done();
		}
	});

	it('Will throw an error on invalid db', async done => {
		const badMongoConn = new MongoConnection(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			invalidDB
		);
		try {
			await badMongoConn.findOne(validCollection, validQuery);
		} catch (e) {
			expect(e.message).toMatch(invalidDBMessage);
			done();
		}
	});

	it('Will return nothing when nothing is found', async () => {
		const noResult = await mongoConn.findOne(validCollection, invalidQuery);
		expect(noResult).toBe(validNoFoundDocument);
	});

	it('Will return nothing when nothing is found', async () => {
		const noResult = await mongoConn.findOne(invalidCollection, validQuery);
		expect(noResult).toBe(validNoFoundDocument);
	});

	it('Will update the database with new values', async () => {
		const update = await mongoConn.updateOne(
			validCollection,
			validQuery,
			validUpdate
		);
		expect(update).toBe(validUpdateResult);
	});

	it('Will fail to update the database with new values on an invalid query', async () => {
		const update = await mongoConn.updateOne(
			validCollection,
			invalidQuery,
			validUpdate
		);
		expect(update).toBe(invalidUpdateResult);
	});

	it('Will fail to update the database with new values on an invalid update', async () => {
		const update = await mongoConn.updateOne(
			validCollection,
			validQuery,
			invalidUpdate
		);
		expect(update).toBe(invalidUpdateResult);
	});

	it('Will fail to update the database with an invalid collection', async () => {
		const update = await mongoConn.updateOne(
			invalidCollection,
			validQuery,
			validUpdate
		);
		expect(update).toBe(invalidUpdateResult);
	});

	it('Will insert to the database with new values', async () => {
		const insert = await mongoConn.insertOne(validCollection, validInsert);
		expect(insert).toBe(validInsertResult);
	});

	it('Will create a new collection if the collection does not exist', async () => {
		const insert = await mongoConn.insertOne(invalidCollection, validInsert);
		// Mongo Default behaviour is to create collections that do not exist.
		expect(insert).toBe(validInsertResult);
		// Teardown
		const client = await mongoConn.getMongoDBConnection();
		await client
			.db(validDB)
			.collection(invalidCollection)
			.remove({});
		await client
			.db(validDB)
			.collection(invalidCollection)
			.drop();
		await client.close();
	});

	it('Will fail to insert to the database with an invalid document', async done => {
		try {
			await mongoConn.insertOne(validCollection, invalidInsert);
		} catch (e) {
			expect(e.message).toBe(invalidInsertMessage);
			done();
		}
	});

	it('Will delete a document', async () => {
		const deleteDoc = await mongoConn.deleteOne(validCollection, validDelete);
		expect(deleteDoc).toBe(validDeleteResult);
	});

	it('Will not delete a not found document', async () => {
		const deleteDoc = await mongoConn.deleteOne(validCollection, invalidDelete);
		expect(deleteDoc).toBe(invalidDeleteResult);
	});

	it('Will not delete a document in a not found collection', async () => {
		const deleteDoc = await mongoConn.deleteOne(invalidCollection, validDelete);
		expect(deleteDoc).toBe(invalidDeleteResult);
	});

	it('Will find all documents', async () => {
		const foundDoc = await mongoConn.findAll(validCollection);
		expect(foundDoc.length).toBe(validAllDocsLength);
	});

	it('Will not find any documents for an invalid collection', async () => {
		const foundDoc = await mongoConn.findAll(invalidCollection);
		expect(foundDoc.length).toBe(validNoDocsLength);
	});
});
