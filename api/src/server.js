import express from 'express';
import { SERVER_COPY } from './models/DisplayCopyConstants';
import { LOGIN, BASE, APIDOCS, REGISTER } from './models/RouteConstants';
import HttpStatusCodes from 'http-status-codes';
import SWAGGER from '../swagger/swagger.json';

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
		 * /register:
		 *   post:
		 *     description: Allows a user to register for an awesome profile
		 *     produces:
		 *       - application/json
		 *     parameters:
		 *       - name: id
		 *         description: It was in the requirements, but mongo uses _id. It'll be a special number.
		 *         in: formData
		 *         required: true
		 *         type: integer
		 *       - name: email
		 *         description: Email address to use for login.
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: givenName
		 *         description: User's given name
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: familyName
		 *         description: User's family name
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: password
		 *         description: User's password.
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: about
		 *         description: Information about a user
		 *         in: formData
		 *         required: true
		 *         type: string
		 *     responses:
		 *       200:
		 *         description: created account
		 *       500:
		 *         description: internal server error
		 *       400:
		 *         description: details failed validation
		 */
		await this.server.post(`/${BASE}/${REGISTER}`, async (req, res) => {
			try {
				if (
					this.userService.validateUser(
						req.headers.id,
						req.headers.email,
						req.headers.givenname,
						req.headers.familyname,
						req.headers.password,
						req.headers.about
					)
				) {
					const userInserted = await this.userService.insertUser(
						req.headers.id,
						req.headers.email,
						req.headers.givenname,
						req.headers.familyname,
						req.headers.password,
						req.headers.about
					);
					if (userInserted) {
						res.sendStatus(HttpStatusCodes.OK);
					} else {
						res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
					}
				} else {
					res.sendStatus(HttpStatusCodes.BAD_REQUEST);
				}
			} catch (e) {
				console.log(e);
				res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}
		});

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
						this.userService.saveToken(
							req.headers.email,
							req.headers.password,
							token
						);
						res.json({ token });
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

		/**
		 * @swagger
		 *
		 * /api-docs:
		 *   post:
		 *     description: Displays api docs
		 *     produces:
		 *       - application/json
		 *     responses:
		 *       200:
		 *         description: Display api docs
		 */
		this.server.get(`/${BASE}/${APIDOCS}`, (req, res) => {
			res.json(SWAGGER);
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
