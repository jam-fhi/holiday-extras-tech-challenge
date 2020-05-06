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
		try {
			const foundDocument = await dbConn
				.db(this.db)
				.collection(collection)
				.findOne(query);
			return foundDocument;
		} catch (e) {
			throw e;
		} finally {
			await dbConn.close();
		}
	}

	async findAllByQuery(collection, query) {
		const dbConn = await this.getMongoDBConnection();
		try {
			const allDocs = await dbConn
				.db(this.db)
				.collection(collection)
				.find(query)
				.toArray();
			return allDocs;
		} catch (e) {
			throw e;
		} finally {
			await dbConn.close();
		}
	}

	async updateOne(collection, query, update) {
		const dbConn = await this.getMongoDBConnection();
		try {
			const updateDocument = await dbConn
				.db(this.db)
				.collection(collection)
				.updateOne(query, { $set: update });
			return updateDocument.result.nModified == 1 ? true : false;
		} catch (e) {
			throw e;
		} finally {
			await dbConn.close();
		}
	}

	async deleteOne(collection, query) {
		const dbConn = await this.getMongoDBConnection();
		try {
			const deleteDocument = await dbConn
				.db(this.db)
				.collection(collection)
				.deleteOne(query);
			return deleteDocument.result.n == 1 ? true : false;
		} catch (e) {
			throw e;
		} finally {
			await dbConn.close();
		}
	}

	async insertOne(collection, insert) {
		const dbConn = await this.getMongoDBConnection();
		try {
			await dbConn
				.db(this.db)
				.collection(collection)
				.insertOne(insert);
		} catch (e) {
			throw e;
		} finally {
			await dbConn.close();
		}
		return true;
	}
}
