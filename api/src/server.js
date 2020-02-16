import express from 'express';
import { LOGIN } from './models/RouteConstants';
import HttpStatusCodes from 'http-status-codes';
import { SERVER_COPY } from './models/DisplayCopyConstants';

export default class APIServer {
	constructor() {
		this.server = express();
		this.activeServer = null;
	}

	async setupServer() {
		await this.server.use(express.json());
		await this.server.use(express.urlencoded({ extended: true }));

		await this.server.get(`/${LOGIN}`, async (req, res) => {
			res.sendStatus(HttpStatusCodes.OK);
		});
	}

	async startServer(port) {
		await this.setupServer();
		this.activeServer = this.server.listen(port, () => {
			console.log(`${SERVER_COPY.liveOn} ${port}`);
		});
	}

	async stopServer() {
		if (this.activeServer) {
			this.activeServer.close();
			this.activeServer = null;
		}
	}
}
