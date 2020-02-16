import express from 'express';
import { SERVER_COPY } from './models/DisplayCopyConstants';
import { LOGIN, BASE } from './models/RouteConstants';
import HttpStatusCodes from 'http-status-codes';

export default class APIServer {
	constructor(userService) {
		this.server = express();
		this.activeServer = null;
		this.userService = userService;
	}

	async setupServer() {
		await this.server.use(express.json());
		await this.server.use(express.urlencoded({ extended: true }));
		await this.buildAPI();
	}

	async buildAPI() {
		await this.server.post(`/${BASE}/${LOGIN}`, async (req, res) => {
			try {
				if (
					this.userService.validateLogin(
						req.headers.email,
						req.headers.password
					)
				) {
					const userLogin = await this.userService.doLogin(
						req.headers.email,
						req.headers.password
					);
					if (userLogin) {
						res.sendStatus(HttpStatusCodes.OK);
					} else {
						res.sendStatus(HttpStatusCodes.UNAUTHORIZED);
					}
				} else {
					res.sendStatus(HttpStatusCodes.BAD_REQUEST);
				}
			} catch (e) {
				console.log(e);
				res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}
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
