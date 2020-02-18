export default class MongoConnection {
	constructor(mongoClient, username, password, host, authdb) {
		this.username = username;
		this.password = password;
		this.host = host;
		this.authDB = authdb;
		this.mongoClient = mongoClient;
	}

	getConnectionOptions() {
		return {
			useNewUrlParser: true,
			numberOfRetries: 10,
			useUnifiedTopology: true
		};
	}

	async getMongoDBConnection() {
		return new Promise((resolve, reject) => {
			this.mongoClient.connect(
				`mongodb://${this.username}:${this.password}@${this.host}/${this.authDB}`,
				this.getConnectionOptions(),
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

	async findOne(dbConn, db, collection, query) {
		const foundDocument = await dbConn
			.db(db)
			.collection(collection)
			.findOne(query);
		return foundDocument;
	}

	async updateOne(dbConn, db, collection, query, update) {
		const updateDocument = await dbConn
			.db(db)
			.collection(collection)
			.updateOne(query, { $set: update });
		return updateDocument;
	}

	async deleteOne(dbConn, db, collection, query) {
		const deleteDocument = await dbConn
			.db(db)
			.collection(collection)
			.deleteOne(query);
		return deleteDocument;
	}

	async insertOne(dbConn, db, collection, insert) {
		const insertDocument = await dbConn
			.db(db)
			.collection(collection)
			.insertOne(insert);
		return insertDocument;
	}

	async closeConnection(dbConn) {
		await dbConn.close();
	}
}
