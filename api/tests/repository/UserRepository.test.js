import UserRepository from '../../src/repository/UserRepository';
import {
	MockMongoClient,
	MockMongoClientDBError,
	validUsername,
	validPassword,
	validHost,
	validAuthDB
} from './MongoClientMocks';
import MongoConnection from '../../src/repository/MongoConnection';

describe('User Repository', () => {
	const db = 'tests';
	const collection = 'test';
	const validEmail = 'test@holextra.com';
	const validPwd = 'password';
	const validToken = 'abcd';
	const invalidEmail = '123';
	const invalidPwd = '123';
	let validMongoClient;
	let invalidMongoClient;
	let userRepo;

	beforeEach(() => {
		validMongoClient = new MongoConnection(
			MockMongoClient,
			validUsername,
			validPassword,
			validHost,
			validAuthDB
		);
		invalidMongoClient = new MongoConnection(
			MockMongoClientDBError,
			validUsername,
			validPassword,
			validHost,
			validAuthDB
		);
		userRepo = new UserRepository(validMongoClient, db, collection);
	});

	it('Will find one user', async () => {
		const user = await userRepo.getUserByEmailPassword(validEmail, validPwd);
		expect(user).toMatchSnapshot();
	});

	it('Will fail to find a user', async () => {
		userRepo = new UserRepository(invalidMongoClient, db, collection);
		const noUser = await userRepo.getUserByEmailPassword(
			invalidEmail,
			invalidPwd
		);
		expect(noUser).toBe(null);
	});

	it('Will update the users token', async () => {
		const userUpdate = await userRepo.saveAuthToken(
			validEmail,
			validPwd,
			validToken
		);
		expect(userUpdate).toBe(true);
	});
});
