import APIServer from '../../src/server';
import superagent from 'superagent';
import {
	PORT,
	HOST,
	LOGIN,
	BASE,
	APIDOCS,
	REGISTER,
	UPDATE,
	DELETE,
	USER,
	ALL_USERS
} from '../../src/models/RouteConstants';
import {
	validID,
	validGivenName,
	validFamilyName,
	validAbout,
	validEmail,
	validPwd,
	validToken,
	invalidEmail,
	invalidPwd,
	invalidID,
	invalidGivenName,
	invalidFamilyName,
	invalidAbout,
	validUnderscoreID,
	validUserDisplay
} from '../CommonData';
import { valid } from 'joi';

describe('The host server will provide access to backend functionality', () => {
	const InternalServerError = 'Internal Server Error';
	const Unauthorized = 'Unauthorized';
	const BadRequest = 'Bad Request';
	const NotFound = 'Not Found';
	const headerUnderscoreID = '_id';
	const headerID = 'id';
	const headerEmail = 'email';
	const headerGivenName = 'givenName';
	const headerFamilyName = 'familyName';
	const headerPassword = 'password';
	const headerAbout = 'about';

	const generateAuthToken = jest.fn((email, password) => {
		return validToken;
	});

	const getAllUsers = jest.fn(() => {
		return [validUserDisplay, validUserDisplay];
	});

	const getAllUsersFail = jest.fn(() => {
		return null;
	});

	const getUser = jest.fn(_id => {
		return true;
	});

	const getUserFail = jest.fn(_id => {
		return false;
	});

	const updateUser = jest.fn(
		(_id, id, email, givenName, familyName, password, about) => {
			return true;
		}
	);

	const updateUserFail = jest.fn(
		(_id, id, email, givenName, familyName, password, about) => {
			return false;
		}
	);

	const insertUser = jest.fn(
		(id, email, givenName, familyName, password, about) => {
			return true;
		}
	);

	const insertUserFail = jest.fn(
		(id, email, givenName, familyName, password, about) => {
			return false;
		}
	);

	const validateUser = jest.fn(
		(id, email, givenName, familyName, password, about) => {
			return true;
		}
	);

	const validateUserFail = jest.fn(
		(id, email, givenName, familyName, password, about) => {
			return false;
		}
	);

	const validateLogin = jest.fn((email, password) => {
		return true;
	});

	const validateLoginFail = jest.fn((email, password) => {
		return false;
	});

	const saveToken = jest.fn((email, password, token) => {
		return true;
	});

	const doLogin = jest.fn((email, password) => {
		return true;
	});

	const doLoginFail = jest.fn((email, password) => {
		return false;
	});

	const deleteUser = jest.fn(_id => {
		return true;
	});

	const deleteUserFail = jest.fn(_id => {
		return false;
	});

	const doLoginError = jest.fn((email, password) => {
		throw Error('TEST ERROR');
	});

	const mockUserService = {
		insertUser,
		validateUser,
		saveToken,
		generateAuthToken,
		validateLogin,
		doLogin,
		updateUser,
		deleteUser,
		getUser,
		getAllUsers
	};
	const mockUserServiceFail = {
		validateUser,
		validateLogin,
		doLogin: doLoginFail,
		insertUser: insertUserFail,
		updateUser: updateUserFail,
		deleteUser: deleteUserFail,
		getUser: getUserFail,
		getAllUsers: getAllUsersFail
	};
	const mockUserServiceError = {
		validateUser,
		validateLogin,
		doLogin: doLoginError
	};
	const mockUserServiceValidationFail = {
		validateUser: validateUserFail,
		validateLogin: validateLoginFail
	};

	let server;

	afterEach(async () => {
		await server.stopServer();
	});

	it('Will login successfully', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent
			.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
			.set(headerEmail, validEmail)
			.set(headerPassword, validPwd);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail login authorization', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set(headerEmail, validEmail)
				.set(headerPassword, validPwd);
		} catch (e) {
			expect(e.message).toBe(Unauthorized);
		}
	});

	it('Will fail login validation', async () => {
		server = new APIServer(mockUserServiceValidationFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set(headerEmail, invalidEmail)
				.set(headerPassword, invalidPwd);
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will have an error on login', async () => {
		server = new APIServer(mockUserServiceError);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set(headerEmail, validEmail)
				.set(headerPassword, validPwd);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will add a new user', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent
			.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
			.set(headerID, validID)
			.set(headerEmail, validEmail)
			.set(headerGivenName, validGivenName)
			.set(headerFamilyName, validFamilyName)
			.set(headerPassword, validPwd)
			.set(headerAbout, validAbout);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to add a new user on invalid data', async () => {
		server = new APIServer(mockUserServiceValidationFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.set(headerID, invalidID)
				.set(headerEmail, invalidEmail)
				.set(headerGivenName, invalidGivenName)
				.set(headerFamilyName, invalidFamilyName)
				.set(headerPassword, invalidPwd)
				.set(headerAbout, invalidAbout);
		} catch (e) {
			expect(e.message).toBe(BadRequest);
		}
	});

	it('Will update a user', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent
			.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
			.set(headerUnderscoreID, validUnderscoreID)
			.set(headerID, validID)
			.set(headerEmail, validEmail)
			.set(headerGivenName, validGivenName)
			.set(headerFamilyName, validFamilyName)
			.set(headerPassword, validPwd)
			.set(headerAbout, validAbout);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to update a user', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.patch(`${HOST}:${PORT}/${BASE}/${UPDATE}`)
				.set(headerUnderscoreID, validUnderscoreID)
				.set(headerID, invalidID)
				.set(headerEmail, invalidEmail)
				.set(headerGivenName, invalidGivenName)
				.set(headerFamilyName, invalidFamilyName)
				.set(headerPassword, invalidPwd)
				.set(headerAbout, invalidAbout);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will delete a user', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent
			.delete(`${HOST}:${PORT}/${BASE}/${DELETE}`)
			.set(headerUnderscoreID, validUnderscoreID);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to delete a user', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.delete(`${HOST}:${PORT}/${BASE}/${DELETE}`)
				.set(headerUnderscoreID, validUnderscoreID);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will get a user', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent
			.get(`${HOST}:${PORT}/${BASE}/${USER}`)
			.set(headerUnderscoreID, validUnderscoreID);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to get a user', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.get(`${HOST}:${PORT}/${BASE}/${USER}`)
				.set(headerUnderscoreID, validUnderscoreID);
		} catch (e) {
			expect(e.message).toBe(NotFound);
		}
	});

	it('Will get all users', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent.get(
			`${HOST}:${PORT}/${BASE}/${ALL_USERS}`
		);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to get all users', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent.get(
				`${HOST}:${PORT}/${BASE}/${ALL_USERS}`
			);
		} catch (e) {
			expect(e.message).toBe(NotFound);
		}
	});

	it('Will give out swagger docs', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent.get(
			`${HOST}:${PORT}/${BASE}/${APIDOCS}`
		);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});
});
