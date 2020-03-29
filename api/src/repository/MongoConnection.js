import { MongoClient } from 'mongodb';

export default class MongoConnection {
	constructor(username, password, host, authdb, db) {
		this.username = username;
		this.password = password;
		this.host = host;
		this.authDB = authdb;
		this.db = db;
		this.port = 27017;
		this.url = `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.db}?&authSource=${this.authDB}&socketTimeoutMS=500`;
	}

	getConnectionOptions() {
		return {
			useNewUrlParser: true,
			numberOfRetries: 0,
			useUnifiedTopology: true,
			connectTimeoutMS: 500
		};
	}

	async getMongoDBConnection() {
		const client = new MongoClient(this.url, this.getConnectionOptions());
		try {
			await client.connect();
			return client;
		} catch (e) {
			throw e;
		}
	}

	async findOne(collection, query) {
		const dbConn = await this.getMongoDBConnection();
		const foundDocument = await dbConn
			.db(this.db)
			.collection(collection)
			.findOne(query);
		await this.closeConnection(dbConn);
		return foundDocument;
	}

	async findAll(collection) {
		const dbConn = await this.getMongoDBConnection();
		const allDocs = await dbConn
			.db(this.db)
			.collection(collection)
			.find({})
			.toArray();
		await this.closeConnection(dbConn);
		return allDocs;
	}

	async updateOne(collection, query, update) {
		const dbConn = await this.getMongoDBConnection();
		const updateDocument = await dbConn
			.db(this.db)
			.collection(collection)
			.updateOne(query, { $set: update });
		await this.closeConnection(dbConn);
		return updateDocument.result.nModified == 1 ? true : false;
	}

	async deleteOne(collection, query) {
		const dbConn = await this.getMongoDBConnection();
		const deleteDocument = await dbConn
			.db(this.db)
			.collection(collection)
			.deleteOne(query);
		await this.closeConnection(dbConn);
		return deleteDocument.result.n == 1 ? true : false;
	}

	async insertOne(collection, insert) {
		const dbConn = await this.getMongoDBConnection();
		try {
			await dbConn
				.db(this.db)
				.collection(collection)
				.insertOne(insert);
		} catch (e) {
			// insertOne throws on insert error.
			throw e;
		} finally {
			await this.closeConnection(dbConn);
		}
		return true;
	}

	async closeConnection(dbConn) {
		await dbConn.close();
	}
}
