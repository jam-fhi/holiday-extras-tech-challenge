import APIServer from '../../src/server';
import superagent from 'superagent';
import { PORT, HOST, LOGIN, BASE } from '../../src/models/RouteConstants';

describe('The host server will provide access to backend functionality', () => {
	const InternalServerError = 'Internal Server Error';
	const Unauthorized = 'Unauthorized';

	const doLogin = jest.fn((email, password) => {
		return true;
	});

	const doLoginFail = jest.fn((email, password) => {
		return false;
	});

	const doLoginError = jest.fn((email, password) => {
		throw Error('TEST ERROR');
	});

	const mockUserService = { doLogin };
	const mockUserServiceFail = { doLogin: doLoginFail };
	const mockUserServiceError = { doLogin: doLoginError };

	let server;

	afterEach(async () => {
		await server.stopServer();
	});

	it('Will login successfully', async () => {
		server = new APIServer(mockUserService);
		await server.startServer(PORT);
		const serverReply = await superagent.post(
			`${HOST}:${PORT}/${BASE}/${LOGIN}`
		);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});

	it('Will fail login', async () => {
		server = new APIServer(mockUserServiceFail);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent.post(
				`${HOST}:${PORT}/${BASE}/${LOGIN}`
			);
		} catch (e) {
			expect(e.message).toBe(Unauthorized);
		}
	});

	it('Will have an error on login', async () => {
		server = new APIServer(mockUserServiceError);
		await server.startServer(PORT);
		try {
			const serverReply = await superagent.post(
				`${HOST}:${PORT}/${BASE}/${LOGIN}`
			);
		} catch (e) {
			expect(e.message).toBe(InternalServerError);
		}
	});
});
