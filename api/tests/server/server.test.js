import APIServer from '../../src/server';
import superagent from 'superagent';
import {
	PORT,
	HOST,
	LOGIN,
	BASE,
	APIDOCS
} from '../../src/models/RouteConstants';

describe('The host server will provide access to backend functionality', () => {
	const InternalServerError = 'Internal Server Error';
	const Unauthorized = 'Unauthorized';
	const BadRequest = 'Bad Request';
	const validEmail = 'test@holextra.com';
	const validPassword = 'password';
	const invalidEmail = '123';
	const invalidPassword = '123';
	const validAuthToken = 'abcd';

	const generateAuthToken = jest.fn((email, password) => {
		return validAuthToken;
	});

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
		saveToken,
		generateAuthToken,
		validateLogin,
		doLogin
	};
	const mockUserServiceFail = { validateLogin, doLogin: doLoginFail };
	const mockUserServiceError = { validateLogin, doLogin: doLoginError };
	const mockUserServiceValidationFail = { validateLogin: validateLoginFail };

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
			.set('password', validPassword);
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
				.set('password', validPassword);
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
				.set('password', invalidPassword);
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
				.set('password', validPassword);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
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
