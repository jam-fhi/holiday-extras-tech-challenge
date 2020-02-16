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
		/**
		 * @swagger
		 *
		 * /login:
		 *   post:
		 *     description: Login to the application
		 *     produces:
		 *       - application/json
		 *     parameters:
		 *       - name: email
		 *         description: Email address to use for login.
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: password
		 *         description: User's password.
		 *         in: formData
		 *         required: true
		 *         type: string
		 *     responses:
		 *       200:
		 *         description: login
		 *       500:
		 *         description: internal server error
		 *       400:
		 *         description: login details failed validation
		 *       401:
		 *         description: login details failed authentication
		 */
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
						const token = this.userService.generateAuthToken(
							req.headers.email,
							req.headers.password
						);
						res.json({ token }).sendStatus(HttpStatusCodes.OK);
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
