import UserRepository from '../../src/repository/UserRepository';
import MongoConnection from '../../src/connection/MongoConnection';
import { dbSetup, dbTeardown } from '../fixture/mongoDBFixture';
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
	invalidPwd,
	invalidUnderscoreID,
	validDB,
	validUsername,
	validPassword,
	validHost,
	validAuthDB,
	validNoFoundDocument,
	validInsertDocument,
	validDeleteResult,
	invalidDeleteResult,
	validAllDocsLength,
	invalidCollection,
	invalidCollectionError,
} from '../fixture/CommonData';
import { fail } from 'assert';

describe('User Repository', () => {
	const validCollection = 'repoTest';
	const validUpdateByUnderscoreId = true;
	const invalidUpdateByUserscoreId = false;

	let userRepo;
	let badUserRepo;

	beforeEach(async () => {
		await dbSetup(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
		const mongoClient = new MongoConnection(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB
		);
		userRepo = new UserRepository(mongoClient, validCollection);
		badUserRepo = new UserRepository(mongoClient, invalidCollection);
	});

	afterEach(async () => {
		await dbTeardown(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
	});

	it('Will find one user by email and password', async () => {
		const user = await userRepo.getUserByEmailPassword(validEmail, validPwd);
		delete user._id;
		expect(user).toMatchSnapshot();
	});

	it('Will not find one user by invalid email and password', async () => {
		const user = await userRepo.getUserByEmailPassword(invalidEmail, validPwd);
		expect(user).toBe(validNoFoundDocument);
	});

	it('Will not find one user by email and invalid password', async () => {
		const user = await userRepo.getUserByEmailPassword(validEmail, invalidPwd);
		expect(user).toBe(validNoFoundDocument);
	});

	it('Will fail to find one user by email and password', async () => {
		try {
			await badUserRepo.getUserByEmailPassword(validEmail, validPwd);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will find all users by email', async () => {
		const user = await userRepo.getAllUserByEmail(validEmail);
		delete user[0]._id;
		expect(user).toMatchSnapshot();
	});

	it('Will fail to find all users by email', async () => {
		try {
			await badUserRepo.getAllUserByEmail(validEmail);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will find one user by email', async () => {
		const user = await userRepo.getUserByEmail(validEmail);
		delete user._id;
		expect(user).toMatchSnapshot();
	});

	it('Will find not find a user with an invalid email', async () => {
		const user = await userRepo.getUserByEmail(invalidEmail);
		expect(user).toBe(validNoFoundDocument);
	});

	it('Will fail to find one user by email', async () => {
		try {
			await badUserRepo.getUserByEmail(validEmail);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will find one user by _id', async () => {
		const userByEmail = await userRepo.getUserByEmail(validEmail);
		const user = await userRepo.getUserByDBID(userByEmail._id);
		delete user._id;
		expect(user).toMatchSnapshot();
	});

	it('Will fail to find one user by _id', async () => {
		try {
			const userByEmail = await userRepo.getUserByEmail(validEmail);
			await badUserRepo.getUserByDBID(userByEmail._id);
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will not find a user by invalid _id', async () => {
		const user = await userRepo.getUserByDBID(invalidUnderscoreID);
		expect(user).toBe(validNoFoundDocument);
	});

	it('Will update a user', async () => {
		const userByEmail = await userRepo.getUserByEmail(validEmail);
		const userUpdate = await userRepo.updateUser(
			userByEmail._id,
			validID,
			validEmail,
			validGivenName,
			validFamilyName,
			validPassword,
			validAbout
		);
		expect(userUpdate).toBe(validUpdateByUnderscoreId);
	});

	it('Will fail to update a user', async () => {
		const userUpdate = await userRepo.updateUser(
			invalidUnderscoreID,
			validID,
			validEmail,
			validGivenName,
			validFamilyName,
			validPassword,
			validAbout
		);
		expect(userUpdate).toBe(invalidUpdateByUserscoreId);
	});

	it('Will fail to update a user', async () => {
		try {
			const userByEmail = await userRepo.getUserByEmail(validEmail);
			await badUserRepo.updateUser(
				userByEmail._id,
				validID,
				validEmail,
				validGivenName,
				validFamilyName,
				validPassword,
				validAbout
			);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
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
		expect(userInsert).toBe(validInsertDocument);
	});

	it('Will fail to insert a new user', async () => {
		try {
			await badUserRepo.insertUser(
				validID,
				validEmail,
				validGivenName,
				validFamilyName,
				validCreated,
				validPassword,
				validAbout
			);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will update the users token', async () => {
		const userUpdate = await userRepo.saveAuthToken(
			validEmail,
			validPwd,
			validToken
		);
		expect(userUpdate).toBe(validInsertDocument);
	});

	it('Will fail to update the users token', async () => {
		try {
			await badUserRepo.saveAuthToken(validEmail, validPwd, validToken);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will delete a user', async () => {
		const userByEmail = await userRepo.getUserByEmail(validEmail);
		const userDelete = await userRepo.deleteUser(userByEmail._id);
		expect(userDelete).toBe(validDeleteResult);
	});

	it('Will fail to delete a user with an invalid _id', async () => {
		const userDelete = await userRepo.deleteUser(invalidUnderscoreID);
		expect(userDelete).toBe(invalidDeleteResult);
	});

	it('Will fail to delete a user', async () => {
		try {
			const userByEmail = await userRepo.getUserByEmail(validEmail);
			await badUserRepo.deleteUser(userByEmail._id);
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});

	it('Will find all users', async () => {
		const users = await userRepo.getAllUsers();
		expect(users.length).toBe(validAllDocsLength);
	});

	it('Will fail to find all users', async () => {
		try {
			await badUserRepo.getAllUsers();
			fail();
		} catch (e) {
			expect(e.message).toBe(invalidCollectionError);
		}
	});
});
