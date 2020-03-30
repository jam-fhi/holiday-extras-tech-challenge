// Mongo exceptions take a long time to appear.
jest.setTimeout(45000);

import MongoConnection from '../../src/repository/MongoConnection';
import { dbSetup, dbTeardown } from './fixture/mongoDBFixture';
import {
	validUsername,
	validPassword,
	validDB,
	validAuthDB,
	validHost,
	validEmail,
	invalidEmail,
	validNoFoundDocument,
	validInsertDocument,
	validDeleteResult,
	invalidDeleteResult,
	validAllDocsLength
} from '../CommonData';

describe('MongoConnection', () => {
	const validQuery = {
		email: validEmail
	};
	const validUpdate = {
		email: invalidEmail
	};
	const validDelete = {
		email: validEmail
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
	const validCollection = 'test';
	const validUpdateResult = true;
	const invalidUpdateResult = false;
	const validNoDocsLength = 0;
	const invalidUsername = 'notvalid';
	const invalidPassword = 'password1';
	const invalidHost = 'remotehost';
	const invalidAuthDB = 'blah';
	const invalidDB = 'nodb';
	const invalidCollection = 'nocollection';
	const invalidQuery = {
		email: invalidEmail
	};
	const invalidUpdate = {
		email: validEmail
	};
	const invalidDelete = {
		email: invalidEmail
	};
	const invalidInsert = null;
	const authenticationFailedMessage = 'Authentication failed.';
	const invalidHostMessage = 'getaddrinfo ENOTFOUND remotehost';
	const invalidDBMessage = 'not authorized on nodb to execute command';
	const invalidInsertMessage = "Cannot read property '_id' of null";
	const invalidDuplicateInsertMessage =
		'E11000 duplicate key error collection:';
	let mongoConn;

	beforeEach(async () => {
		mongoConn = new MongoConnection(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB
		);
		await dbSetup(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
	});

	afterEach(async () => {
		await dbTeardown(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
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
			await badMongoConn.getMongoDBConnection();
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
		expect(insert).toBe(validInsertDocument);
	});

	it('Will create a new collection if the collection does not exist', async () => {
		const insert = await mongoConn.insertOne(invalidCollection, validInsert);
		// Mongo Default behaviour is to create collections that do not exist.
		expect(insert).toBe(validInsertDocument);
		// Teardown
		await dbTeardown(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			invalidCollection
		);
	});

	it('Will fail to insert to the database with an invalid document', async done => {
		try {
			await mongoConn.insertOne(validCollection, invalidInsert);
		} catch (e) {
			expect(e.message).toBe(invalidInsertMessage);
			done();
		}
	});

	it('Will fail to insert to the same document twice', async () => {
		try {
			const docResult = await mongoConn.findOne(validCollection, validQuery);
			await mongoConn.insertOne(validCollection, docResult);
		} catch (e) {
			expect(e.message).toMatch(invalidDuplicateInsertMessage);
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

	it('Will close the connection', async () => {
		const dbConn = await mongoConn.getMongoDBConnection();
		await mongoConn.closeConnection(dbConn);
		expect(dbConn.isConnected()).toBe(false);
	});
});
