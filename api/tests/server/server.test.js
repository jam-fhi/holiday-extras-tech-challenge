import APIServer from '../../src/server';
import superagent from 'superagent';
import { PORT, HOST, LOGIN, BASE } from '../../src/models/RouteConstants';

describe('The host server will provide access to backend functionality', () => {
	const doLogin = jest.fn((email, password) => {
		return true;
	});

	const mockUserService = { doLogin };

	const server = new APIServer(mockUserService);

	beforeEach(async () => {
		await server.startServer(PORT);
	});

	afterEach(async () => {
		await server.stopServer();
	});

	it('Will run the server', async () => {
		const serverReply = await superagent.post(
			`${HOST}:${PORT}/${BASE}/${LOGIN}`
		);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});
});
