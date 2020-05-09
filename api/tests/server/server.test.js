import APIServer from '../../src/server';
import superagent from 'superagent';
import UserService from '../../src/services/UserService';
import MongoConnection from '../../src/repository/MongoConnection';
import UserRepository from '../../src/repository/UserRepository';
import {
	dbSetup,
	dbTeardown,
	dbClearCollection,
} from '../fixture/mongoDBFixture';
import HttpStatusCodes from 'http-status-codes';
import {
	HOST,
	LOGIN,
	BASE,
	APIDOCS,
	REGISTER,
	UPDATE,
	DELETE,
	USER,
	ALL_USERS,
} from '../../src/models/RouteConstants';
import {
	validID,
	validGivenName,
	validFamilyName,
	validAbout,
	validEmail,
	validPwd,
	invalidEmail,
	invalidPwd,
	validUsername,
	validPassword,
	validHost,
	validAuthDB,
	validDB,
	invalidUnderscoreID,
} from '../CommonData';

describe('The host server will provide access to backend functionality', () => {
	const InternalServerError = 'Internal Server Error';
	const Unauthorized = 'Unauthorized';
	const BadRequest = 'Bad Request';
	const NotFound = 'Not Found';
	const headerUnderscoreID = '_id';
	const headerEmail = 'email';
	const headerPassword = 'password';
	const PORT = 3002;
	const validCollection = 'userServerTest';
	const secretKey = 'TRFTS';
	const notUserEmail = 'jeronomo@holextra.com';
	const failedToThrow = 'Failed to throw';
	const newValidUser = {
		id: validID,
		email: notUserEmail,
		givenname: validGivenName,
		familyname: validFamilyName,
		password: validPwd,
		about: validAbout,
	};

	const duplicateUser = {
		id: validID,
		email: validEmail,
		givenname: validGivenName,
		familyname: validFamilyName,
		password: validPwd,
		about: validAbout,
	};

	const badDataUser = {
		id: validID,
		email: invalidEmail,
		givenname: validGivenName,
		familyname: validFamilyName,
		password: validPwd,
		about: validAbout,
	};

	let server;
	let mongoConn;
	let userRepo;
	let userService;

	beforeEach(async () => {
		await dbSetup(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
		mongoConn = new MongoConnection(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB
		);
		userRepo = new UserRepository(mongoConn, validCollection);
		userService = new UserService(userRepo, secretKey);
		server = new APIServer(userService);
		await server.startServer(PORT);
	});

	afterEach(async () => {
		await server.stopServer();
		await dbTeardown(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
	});

	it('Will login successfully', async () => {
		const serverReply = await superagent
			.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
			.set(headerEmail, validEmail)
			.set(headerPassword, validPwd);
		delete serverReply.header.date;
		delete serverReply.header.etag;
		delete serverReply.text;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail login authorization', async () => {
		try {
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set(headerEmail, notUserEmail)
				.set(headerPassword, validPwd);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(Unauthorized);
		}
	});

	it('Will fail login validation', async () => {
		try {
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set(headerEmail, invalidEmail)
				.set(headerPassword, invalidPwd);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will add a new user', async () => {
		const serverReply = await superagent
			.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
			.send(newValidUser);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to add a new user on invalid data', async () => {
		try {
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.send(badDataUser);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will not add a duplicate email address', async () => {
		try {
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.send(duplicateUser);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will update a user', async () => {
		const existingUser = await userRepo.getUserByEmail(validEmail);
		const updateUser = {
			_id: existingUser._id,
			id: existingUser.id,
			email: notUserEmail,
			givenname: existingUser.givenName,
			familyname: existingUser.familyName,
			password: existingUser.password,
			about: existingUser.about,
		};
		const serverReply = await superagent
			.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
			.send(updateUser);
		delete serverReply.body._id;
		expect(serverReply.body).toMatchSnapshot();
	});

	it('Will fail to update a user', async () => {
		try {
			const existingUser = await userRepo.getUserByEmail(validEmail);
			const updateUser = {
				_id: invalidUnderscoreID,
				id: existingUser.id,
				email: notUserEmail,
				givenname: existingUser.givenName,
				familyname: existingUser.familyName,
				password: existingUser.password,
				about: existingUser.about,
			};
			await superagent
				.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
				.send(updateUser);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will fail to validate a user', async () => {
		try {
			const existingUser = await userRepo.getUserByEmail(validEmail);
			const updateUser = {
				_id: existingUser._id,
				id: existingUser.id,
				email: invalidEmail,
				givenname: existingUser.givenName,
				familyname: existingUser.familyName,
				password: existingUser.password,
				about: existingUser.about,
			};
			await superagent
				.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
				.send(updateUser);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will delete a user', async () => {
		const existingUser = await userRepo.getUserByEmail(validEmail);
		const serverReply = await superagent
			.delete(`${HOST}:${PORT}/${BASE}/${DELETE}`)
			.set(headerUnderscoreID, existingUser._id);
		expect(serverReply.status).toBe(HttpStatusCodes.OK);
	});

	it('Will fail to delete a user', async () => {
		try {
			await superagent
				.delete(`${HOST}:${PORT}/${BASE}/${DELETE}`)
				.set(headerUnderscoreID, invalidUnderscoreID);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will get a user', async () => {
		const existingUser = await userRepo.getUserByEmail(validEmail);
		const serverReply = await superagent
			.get(`${HOST}:${PORT}/${BASE}/${USER}`)
			.set(headerUnderscoreID, existingUser._id);
		delete serverReply.body._id;
		expect(serverReply.body).toMatchSnapshot();
	});

	it('Will fail to get a user', async () => {
		try {
			await superagent
				.get(`${HOST}:${PORT}/${BASE}/${USER}`)
				.set(headerUnderscoreID, invalidUnderscoreID);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(NotFound);
		}
	});

	it('Will get all users', async () => {
		const serverReply = await superagent.get(
			`${HOST}:${PORT}/${BASE}/${ALL_USERS}`
		);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to get all users', async () => {
		try {
			await dbClearCollection(
				validUsername,
				validPassword,
				validHost,
				validAuthDB,
				validDB,
				validCollection
			);
			await superagent.get(`${HOST}:${PORT}/${BASE}/${ALL_USERS}`);
			throw new Error(failedToThrow);
		} catch (e) {
			expect(e.message).toBe(NotFound);
		}
	});

	it('Will give out swagger docs', async () => {
		const serverReply = await superagent.get(
			`${HOST}:${PORT}/${BASE}/${APIDOCS}`
		);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will not give an error if stop server is called when server is not running', async () => {
		await server.stopServer();
		await server.stopServer();
	});
});
