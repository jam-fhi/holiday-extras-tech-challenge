import { ObjectID } from 'mongodb';

export default class DatabaseRepository {
	constructor(mongoClient, collection) {
		this.mongoClient = mongoClient;
		this.collection = collection;
	}

	async getUserByEmailPassword(email, password) {
		const user = await this.mongoClient.findOne(this.collection, {
			email,
			password
		});
		return user;
	}

	async getUserByEmail(email) {
		const user = await this.mongoClient.findOne(this.collection, {
			email
		});
		return user;
	}

	async getUserByDBID(id) {
		const user = await this.mongoClient.findOne(this.collection, {
			_id: ObjectID(id)
		});
		return user;
	}

	async updateUser(_id, id, email, givenName, familyName, password, about) {
		const user = await this.mongoClient.updateOne(
			this.collection,
			{
				_id: ObjectID(_id)
			},
			{
				id,
				email,
				givenName,
				familyName,
				password,
				about
			}
		);
		return user;
	}

	async insertUser(id, email, givenName, familyName, created, password, about) {
		const user = await this.mongoClient.insertOne(this.collection, {
			id,
			email,
			givenName,
			familyName,
			created,
			password,
			about
		});
		return user;
	}

	async saveAuthToken(email, password, token) {
		const user = await this.mongoClient.updateOne(
			this.collection,
			{
				email,
				password
			},
			{
				token
			}
		);
		return user;
	}

	async deleteUser(_id) {
		const user = await this.mongoClient.deleteOne(this.collection, {
			_id: ObjectID(_id)
		});
		return user;
	}

	async getAllUsers() {
		const users = await this.mongoClient.findAll(this.collection);
		return users;
	}
}
