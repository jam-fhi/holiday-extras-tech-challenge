import APIServer from '../../src/server';
import superagent from 'superagent';
import {
	PORT,
	HOST,
	LOGIN,
	BASE,
	APIDOCS,
	REGISTER
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
	invalidAbout
} from '../CommonData';

describe('The host server will provide access to backend functionality', () => {
	const InternalServerError = 'Internal Server Error';
	const Unauthorized = 'Unauthorized';
	const BadRequest = 'Bad Request';

	const generateAuthToken = jest.fn((email, password) => {
		return validToken;
	});

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

	const doLoginError = jest.fn((email, password) => {
		throw Error('TEST ERROR');
	});

	const mockUserService = {
		insertUser,
		validateUser,
		saveToken,
		generateAuthToken,
		validateLogin,
		doLogin
	};
	const mockUserServiceFail = {
		validateUser,
		validateLogin,
		doLogin: doLoginFail,
		insertUser,
		insertUserFail
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
			.set('email', validEmail)
			.set('password', validPwd);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail login authorization', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.post(`${HOST}:${PORT}/${BASE}/${LOGIN}`)
				.set('email', validEmail)
				.set('password', validPwd);
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
				.set('email', invalidEmail)
				.set('password', invalidPwd);
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
				.set('email', validEmail)
				.set('password', validPwd);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});

	it('Will add a new user', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent
			.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
			.set('id', validID)
			.set('email', validEmail)
			.set('givenName', validGivenName)
			.set('familyName', validFamilyName)
			.set('password', validPwd)
			.set('about', validAbout);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail to add a new user on invalid data', async () => {
		server = new APIServer(mockUserServiceValidationFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent
				.post(`${HOST}:${PORT}/${BASE}/${REGISTER}`)
				.set('id', invalidID)
				.set('email', invalidEmail)
				.set('givenName', invalidGivenName)
				.set('familyName', invalidFamilyName)
				.set('password', invalidPwd);
			set('about', invalidAbout);
		} catch (e) {
			expect(e.message).toBe(BadRequest);
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
