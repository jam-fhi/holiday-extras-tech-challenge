import APIServer from '../../src/server/server';
import superagent from 'superagent';
import UserService from '../../src/services/UserService';
import MongoConnection from '../../src/connection/MongoConnection';
import UserRepository from '../../src/repository/UserRepository';
import { pino, logConfig } from '../../src/services/logger';
import { fail } from 'assert';
import {
	dbSetup,
	dbTeardown,
	dbClearCollection,
} from '../fixture/mongoDBFixture';
import HttpStatusCodes from 'http-status-codes';
import {
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
	secretKey,
	validNotExistingUser,
	invalidCollection,
} from '../fixture/CommonData';

describe('The host server will provide access to backend functionality', () => {
	const validCollection = 'userServerTest';
	const InternalServerError = 'Internal Server Error';
	const Unauthorized = 'Unauthorized';
	const BadRequest = 'Bad Request';
	const NotFound = 'Not Found';
	const headerUnderscoreID = '_id';
	const headerEmail = 'email';
	const headerPassword = 'password';
	const PORT = 3002;
	const HOST = 'http://localhost';

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
	let badUserRepo;
	let badUserService;
	let badServer;

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
		userService = new UserService(userRepo, secretKey, pino);
		server = new APIServer(userService, pino, logConfig);
		badUserRepo = new UserRepository(mongoConn, invalidCollection);
		badUserService = new UserService(badUserRepo, secretKey, pino);
		badServer = new APIServer(badUserService, pino, logConfig);
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
				.set(headerEmail, validNotExistingUser.email)
				.set(headerPassword, validPwd);
			fail();
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
			fail();
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will give an internal server error when logging in with a bad db connection', async () => {
		try {
			server.stopServer();
			badServer.startServer(PORT);
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set(headerEmail, validEmail)
				.set(headerPassword, validPwd);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
		}
	});

	it('Will add a new user', async () => {
		delete validNotExistingUser.created;
		const serverReply = await superagent
			.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
			.send(validNotExistingUser);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to add a new user on invalid data', async () => {
		try {
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.send(badDataUser);
			fail();
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will not add a duplicate email address', async () => {
		try {
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.send(duplicateUser);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will give an internal server error when registering on a bad db connection', async () => {
		try {
			server.stopServer();
			badServer.startServer(PORT);
			delete validNotExistingUser.created;
			await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.send(validNotExistingUser);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
		}
	});

	it('Will update a user', async () => {
		const existingUser = await userRepo.getUserByEmail(validEmail);
		const updateUser = {
			_id: existingUser._id,
			id: existingUser.id,
			email: validNotExistingUser.email,
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
			await dbClearCollection(
				validUsername,
				validPassword,
				validHost,
				validAuthDB,
				validDB,
				validCollection
			);
			const updateUser = {
				_id: existingUser._id,
				id: existingUser.id,
				email: existingUser.email,
				givenname: existingUser.givenName,
				familyname: existingUser.familyName,
				password: existingUser.password,
				about: existingUser.about,
			};
			await superagent
				.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
				.send(updateUser);
			fail();
		} catch (e) {
			expect(e.message).toBe(NotFound);
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
			fail();
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will give an internal server error when updating a user on a bad db connection', async () => {
		try {
			const existingUser = await userRepo.getUserByEmail(validEmail);
			server.stopServer();
			badServer.startServer(PORT);
			const updateUser = {
				_id: existingUser._id,
				id: existingUser.id,
				email: validEmail,
				givenname: existingUser.givenName,
				familyname: existingUser.familyName,
				password: existingUser.password,
				about: existingUser.about,
			};
			await superagent
				.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
				.send(updateUser);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
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
			const existingUser = await userRepo.getUserByEmail(validEmail);
			await dbClearCollection(
				validUsername,
				validPassword,
				validHost,
				validAuthDB,
				validDB,
				validCollection
			);
			await superagent
				.delete(`${HOST}:${PORT}/${BASE}/${DELETE}`)
				.set(headerUnderscoreID, existingUser._id);
			fail();
		} catch (e) {
			expect(e.message).toBe(NotFound);
		}
	});

	it('Will give an internal server error when deleting on a bad db connection', async () => {
		try {
			server.stopServer();
			badServer.startServer(PORT);
			const existingUser = await userRepo.getUserByEmail(validEmail);
			await dbClearCollection(
				validUsername,
				validPassword,
				validHost,
				validAuthDB,
				validDB,
				validCollection
			);
			await superagent
				.delete(`${HOST}:${PORT}/${BASE}/${DELETE}`)
				.set(headerUnderscoreID, existingUser._id);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
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
			const existingUser = await userRepo.getUserByEmail(validEmail);
			await dbClearCollection(
				validUsername,
				validPassword,
				validHost,
				validAuthDB,
				validDB,
				validCollection
			);
			await superagent
				.get(`${HOST}:${PORT}/${BASE}/${USER}`)
				.set(headerUnderscoreID, existingUser._id);
			fail();
		} catch (e) {
			expect(e.message).toBe(NotFound);
		}
	});

	it('Will give an internal server error when there is a bad db connection', async () => {
		try {
			server.stopServer();
			badServer.startServer(PORT);
			const existingUser = await userRepo.getUserByEmail(validEmail);
			await dbClearCollection(
				validUsername,
				validPassword,
				validHost,
				validAuthDB,
				validDB,
				validCollection
			);
			await superagent
				.get(`${HOST}:${PORT}/${BASE}/${USER}`)
				.set(headerUnderscoreID, existingUser._id);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
		}
	});

	it('Will give an internal server error on a bad db connection when getting a user', async () => {
		try {
			server.stopServer();
			badServer.startServer(PORT);
			const existingUser = await userRepo.getUserByEmail(validEmail);
			await superagent
				.get(`${HOST}:${PORT}/${BASE}/${USER}`)
				.set(headerUnderscoreID, existingUser._id);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
		}
	});

	it('Will get all users', async () => {
		const serverReply = await superagent.get(
			`${HOST}:${PORT}/${BASE}/${ALL_USERS}`
		);
		expect(serverReply.body).toMatchSnapshot();
	});

	it('Will return an empty array when there are no users', async () => {
		await dbClearCollection(
			validUsername,
			validPassword,
			validHost,
			validAuthDB,
			validDB,
			validCollection
		);
		const response = await superagent.get(
			`${HOST}:${PORT}/${BASE}/${ALL_USERS}`
		);
		expect(response.body).toMatchSnapshot();
	});

	it('Will give an internal server error on a bad db connection when getting all users', async () => {
		try {
			server.stopServer();
			badServer.startServer(PORT);
			await superagent.get(`${HOST}:${PORT}/${BASE}/${ALL_USERS}`);
			fail();
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		} finally {
			badServer.stopServer();
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
