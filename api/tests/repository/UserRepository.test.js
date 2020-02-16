import UserRepository from '../../src/repository/UserRepository';
import {
	MockMongoClient,
	MockMongoClientDBError,
	validUsername,
	validPassword,
	validHost,
	validAuthDB,
	validFoundDocument
} from './MongoClientMocks';
import {
	validID,
	validGivenName,
	validFamilyName,
	validCreated,
	validAbout,
	validEmail,
	validPwd,
	validToken,
	invalidEmail,
	invalidPwd
} from '../CommonData';
import MongoConnection from '../../src/repository/MongoConnection';

describe('User Repository', () => {
	const db = 'tests';
	const collection = 'test';

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

	it('Will find one user by email and password', async () => {
		const user = await userRepo.getUserByEmailPassword(validEmail, validPwd);
		expect(user).toMatchSnapshot();
	});

	it('Will find one user by email', async () => {
		const user = await userRepo.getUserByEmail(validEmail);
		expect(user).toMatchSnapshot();
	});

	it('Will fail to find a user by email and password', async () => {
		userRepo = new UserRepository(invalidMongoClient, db, collection);
		const noUser = await userRepo.getUserByEmailPassword(
			invalidEmail,
			invalidPwd
		);
		expect(noUser).toBe(null);
	});

	it('Will fail to find a user by email', async () => {
		userRepo = new UserRepository(invalidMongoClient, db, collection);
		const noUser = await userRepo.getUserByEmail(invalidEmail);
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

	it('Will insert a new user', async () => {
		const userInsert = await userRepo.insertUser(
			validID,
			validEmail,
			validGivenName,
			validFamilyName,
			validCreated,
			validPassword,
			validAbout
		);
		expect(userInsert).toBe(validFoundDocument);
	});
});
