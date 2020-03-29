import MongoConnection from '../../../src/repository/MongoConnection';
import UserFixture from './users.json';

function getMongoClient(username, password, host, authDB, DB) {
	const mongoConn = new MongoConnection(username, password, host, authDB, DB);
	return mongoConn;
}

export async function dbSetup(
	username,
	password,
	host,
	authDB,
	DB,
	collection
) {
	const mongoConn = getMongoClient(username, password, host, authDB, DB);
	const client = await mongoConn.getMongoDBConnection();
	await client
		.db(DB)
		.collection(collection)
		.insertMany(UserFixture);
	await client.close();
}

export async function dbTeardown(
	username,
	password,
	host,
	authDB,
	DB,
	collection
) {
	const mongoConn = getMongoClient(username, password, host, authDB, DB);
	const client = await mongoConn.getMongoDBConnection();
	await client
		.db(DB)
		.collection(collection)
		.deleteMany({});
	await client
		.db(DB)
		.collection(collection)
		.drop();
	await client.close();
}
