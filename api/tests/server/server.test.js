import APIServer from '../../src/server';
import superagent from 'superagent';
import { PORT, HOST, LOGIN } from '../../src/models/RouteConstants';

describe('The host server will provide access to backend functionality', () => {
	const server = new APIServer();

	beforeEach(async () => {
		await server.startServer(PORT);
	});

	afterEach(async () => {
		await server.stopServer();
	});

	it('Will run the server', async () => {
		const serverReply = await superagent.get(`${HOST}:${PORT}/${LOGIN}`);
		delete serverReply.header.date;
		expect(serverReply).toMatchSnapshot();
	});
});
