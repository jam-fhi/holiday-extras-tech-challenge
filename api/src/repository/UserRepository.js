import { ObjectID } from 'mongodb';

export default class DatabaseRepository {
	constructor(mongoClient, collection) {
		this.mongoClient = mongoClient;
		this.collection = collection;
	}

	async getUserByEmailPassword(email, password) {
		try {
			const user = await this.mongoClient.findOne(this.collection, {
				email,
				password,
			});
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async getUserByEmail(email) {
		try {
			const user = await this.mongoClient.findOne(this.collection, {
				email,
			});
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async getAllUserByEmail(email) {
		try {
			const user = await this.mongoClient.findAllByQuery(this.collection, {
				email,
			});
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async getUserByDBID(id) {
		try {
			const user = await this.mongoClient.findOne(this.collection, {
				_id: ObjectID(id),
			});
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async updateUser(_id, id, email, givenName, familyName, password, about) {
		try {
			const user = await this.mongoClient.updateOne(
				this.collection,
				{
					_id: ObjectID(_id),
				},
				{
					id,
					email,
					givenName,
					familyName,
					password,
					about,
				}
			);
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async insertUser(id, email, givenName, familyName, created, password, about) {
		try {
			const user = await this.mongoClient.insertOne(this.collection, {
				id,
				email,
				givenName,
				familyName,
				created,
				password,
				about,
			});
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async saveAuthToken(email, password, token) {
		try {
			const user = await this.mongoClient.updateOne(
				this.collection,
				{
					email,
					password,
				},
				{
					token,
				}
			);
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async deleteUser(_id) {
		try {
			const user = await this.mongoClient.deleteOne(this.collection, {
				_id: ObjectID(_id),
			});
			return user;
		} catch (e) {
			console.log(e.message);
		}
	}

	async getAllUsers() {
		try {
			const users = await this.mongoClient.findAllByQuery(this.collection, {});
			return users;
		} catch (e) {
			console.log(e.message);
		}
	}
}
