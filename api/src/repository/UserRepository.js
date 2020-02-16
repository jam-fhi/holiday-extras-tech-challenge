export default class DatabaseRepository {
	constructor(mongoClient, db, collection) {
		this.mongoClient = mongoClient;
		this.db = db;
		this.collection = collection;
	}

	async getUserByEmailPassword(email, password) {
		const dbConn = await this.mongoClient.getMongoDBConnection();
		const user = await this.mongoClient.findOne(
			dbConn,
			this.db,
			this.collection,
			{
				email,
				password
			}
		);
		await this.mongoClient.closeConnection(dbConn);
		return user;
	}

	async saveAuthToken(email, password, token) {
		const dbConn = await this.mongoClient.getMongoDBConnection();
		const user = await this.mongoClient.updateOne(
			dbConn,
			this.db,
			this.collection,
			{
				email,
				password
			},
			{
				token
			}
		);
		await this.mongoClient.closeConnection(dbConn);
		return user;
	}
}
