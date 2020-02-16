import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import Users from './users.json';

dotenv.config();

const database = process.env.MONGO_DB;
const collection = process.env.MONGO_COLLECTION;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_INTERNAL_URL;
const authDB = process.env.MONGO_AUTH_DB;

const connectionOptions = {
	useNewUrlParser: true,
	autoReconnect: true,
	numberOfRetries: 10,
	reconnectInterval: 1000,
	useUnifiedTopology: true
};

async function getMongoDBConnection(connectionOptions) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(
			`mongodb://${username}:${password}@${host}/${authDB}`,
			connectionOptions,
			async (err, client) => {
				if (!err) {
					resolve(client);
				} else {
					reject(err);
				}
			}
		);
	});
}

async function databaseSeed() {
	const dbClient = await getMongoDBConnection(connectionOptions);

	await Promise.all(
		Users.map(async user => {
			await dbClient
				.db(database)
				.collection(collection)
				.insertOne(user);
		})
	);

	await dbClient.close();
}

try {
	databaseSeed();
} catch (e) {
	console.log(`Failed to seed database ${e.message}`);
}
