import MongoConnection from '../../src/repository/MongoConnection';
import {
	MockMongoClient,
	MockMongoClientError,
	dbConn,
	dbConnFail,
	validUsername,
	validPassword,
	validHost,
	validAuthDB,
	findOneNoResult,
	connFailedMsg
} from './MongoClientMocks';

describe('MongoConnection', () => {
	let mongoConn;

	beforeEach(() => {
		mongoConn = new MongoConnection(
			MockMongoClient,
			validUsername,
			validPassword,
			validHost,
			validAuthDB
		);
	});

	it('Will create a client object', async () => {
		const client = await mongoConn.getMongoDBConnection();
		expect(client).toMatchSnapshot();
	});

	it('Will throw an error on connection failure', async done => {
		mongoConn = new MongoConnection(
			MockMongoClientError,
			validUsername,
			validPassword,
			validHost,
			validAuthDB
		);
		try {
			await mongoConn.getMongoDBConnection();
			done();
		} catch (e) {
			expect(e).toBe(connFailedMsg);
			done();
		}
	});

	it('Will return Mongo Connection options', () => {
		const connectionOptions = mongoConn.getConnectionOptions();
		expect(connectionOptions).toMatchSnapshot();
	});

	it('Will find one result', async () => {
		const docResult = await mongoConn.findOne(dbConn);
		expect(docResult).toMatchSnapshot();
	});

	it('Will return nothing when nothing is found', async () => {
		const noResult = await mongoConn.findOne(dbConnFail);
		expect(noResult).toBe(findOneNoResult);
	});

	it('Will update the database with new values', async () => {
		const update = await mongoConn.updateOne(dbConn);
		expect(update).toBe(true);
	});

	it('Will insert the database with new values', async () => {
		const insert = await mongoConn.insertOne(dbConn);
		expect(insert).toMatchSnapshot();
	});

	it('Will delete a document', async () => {
		const deleteDoc = await mongoConn.deleteOne(dbConn);
		expect(deleteDoc).toMatchSnapshot();
	});
});
