import express from 'express';
import { SERVER_COPY } from '../models/DisplayCopyConstants';
import {
	LOGIN,
	BASE,
	APIDOCS,
	REGISTER,
	UPDATE,
	DELETE,
	USER,
	ALL_USERS,
} from '../models/RouteConstants';
import HttpStatusCodes from 'http-status-codes';
import SWAGGER from '../../swagger/swagger.json';
import cors from 'cors';
import multer from 'multer';
import logger from 'pino-http';

export default class APIServer {
	constructor(userService, pino, logConfig) {
		this.server = express();
		this.activeServer = null;
		this.userService = userService;
		this.pino = pino;
		this.logConfig = logConfig;
	}

	async setupServer() {
		await this.server.use(express.json());
		await this.server.use(logger(this.logConfig));
		await this.server.use(express.urlencoded({ extended: true }));
		await this.server.use(cors());
		await this.buildAPI();
	}

	async buildAPI() {
		const upload = multer();

		/**
		 * @swagger
		 *
		 * /allusers:
		 *   get:
		 *     description: Gets all users in the system
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - multipart/form-data
		 *     responses:
		 *       200:
		 *         description: all users returned
		 *       500:
		 *         description: internal server error
		 *       404:
		 *         description: not found error
		 */
		await this.server.get(`/${BASE}/${ALL_USERS}`, async (req, res) => {
			try {
				const users = await this.userService.getAllUsers();
				return res.json(users);
			} catch (e) {
				req.log.error(`There was an error finding all users: ${e.message}`);
				return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}
		});

		/**
		 * @swagger
		 *
		 * /user:
		 *   get:
		 *     description: Allows a user to get their profile details
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - text/plain; charset=utf-8
		 *     parameters:
		 *       - name: _id
		 *         description: The mongo database id for the user
		 *         in: header
		 *         required: true
		 *         type: string
		 *     responses:
		 *       200:
		 *         description: users details returned
		 *       500:
		 *         description: internal server error
		 *       404:
		 *         description: not found error
		 */
		await this.server.get(`/${BASE}/${USER}`, async (req, res) => {
			try {
				const user = await this.userService.getUser(req.headers._id);
				if (user) {
					return res.json(user);
				} else {
					return res.sendStatus(HttpStatusCodes.NOT_FOUND);
				}
			} catch (e) {
				req.log.error(`Error finding user ${req.headers._id}: ${e.message}`);
				return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}
		});

		/**
		 * @swagger
		 *
		 * /delete:
		 *   delete:
		 *     description: Allows a user to update their profile
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - text/plain; charset=utf-8
		 *     parameters:
		 *       - name: _id
		 *         description: The mongo database id for the user
		 *         in: header
		 *         required: true
		 *         type: string
		 *     responses:
		 *       200:
		 *         description: deleted account
		 *       500:
		 *         description: internal server error
		 */
		await this.server.delete(`/${BASE}/${DELETE}`, async (req, res) => {
			try {
				const userDeleted = await this.userService.deleteUser(req.headers._id);
				if (userDeleted) {
					return res.sendStatus(HttpStatusCodes.OK);
				} else {
					req.log.info(`User not found ${req.headers._id}`);
					return res.sendStatus(HttpStatusCodes.NOT_FOUND);
				}
			} catch (e) {
				req.log.error(`Error deleting user ${req.headers._id}: ${e.message}`);
				return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}
		});

		/**
		 * @swagger
		 *
		 * /update:
		 *   patch:
		 *     description: Allows a user to update their profile
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - multipart/form-data
		 *     parameters:
		 *       - name: _id
		 *         description: The mongo database id for the user
		 *         in: formData
		 *         required: true
		 *         type: string
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
		 *       - name: givenname
		 *         description: User's given name
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: familyname
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
		 *         description: updated account
		 *       500:
		 *         description: internal server error
		 *       400:
		 *         description: details failed validation
		 */
		await this.server.patch(
			`/${BASE}/${UPDATE}`,
			upload.none(),
			async (req, res) => {
				if (
					this.userService.validateUser(
						req.body.id,
						req.body.email,
						req.body.givenname,
						req.body.familyname,
						req.body.password,
						req.body.about
					)
				) {
					try {
						const userUpdated = await this.userService.updateUser(
							req.body._id,
							req.body.id,
							req.body.email,
							req.body.givenname,
							req.body.familyname,
							req.body.password,
							req.body.about
						);
						if (userUpdated) {
							return res.send(req.body);
						} else {
							req.log.info(`User ${req.body._id} not found`);
							return res.sendStatus(HttpStatusCodes.NOT_FOUND);
						}
					} catch (e) {
						req.log.error(`Error updating user ${req.body._id} ${e.message}`);
						return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
					}
				} else {
					return res.sendStatus(HttpStatusCodes.BAD_REQUEST);
				}
			}
		);

		/**
		 * @swagger
		 *
		 * /register:
		 *   post:
		 *     description: Allows a user to register for an awesome profile
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - multipart/form-data
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
		 *       - name: givenname
		 *         description: User's given name
		 *         in: formData
		 *         required: true
		 *         type: string
		 *       - name: familyname
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
		await this.server.post(
			`/${BASE}/${REGISTER}`,
			upload.none(),
			async (req, res) => {
				if (
					this.userService.validateUser(
						req.body.id,
						req.body.email,
						req.body.givenname,
						req.body.familyname,
						req.body.password,
						req.body.about
					)
				) {
					try {
						const userInserted = await this.userService.insertUser(
							req.body.id,
							req.body.email,
							req.body.givenname,
							req.body.familyname,
							req.body.password,
							req.body.about
						);
						if (userInserted) {
							return res.sendStatus(HttpStatusCodes.OK);
						} else {
							req.log.error(`Failed to insert new user ${req.body.email}`);
							return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
						}
					} catch (e) {
						req.log.error(
							`Failed to insert new user ${req.body.email} ${e.message}`
						);
						return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
					}
				} else {
					return res.sendStatus(HttpStatusCodes.BAD_REQUEST);
				}
			}
		);

		/**
		 * @swagger
		 *
		 * /login:
		 *   post:
		 *     description: Login to the application
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - text/plain; charset=utf-8
		 *     parameters:
		 *       - name: email
		 *         description: Email address to use for login.
		 *         in: header
		 *         required: true
		 *         type: string
		 *       - name: password
		 *         description: User's password.
		 *         in: header
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
			if (
				this.userService.validateLogin(req.headers.email, req.headers.password)
			) {
				try {
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
						return res.json({ token });
					} else {
						req.log.info(`Unautherized login ${req.headers.email}`);
						return res.sendStatus(HttpStatusCodes.UNAUTHORIZED);
					}
				} catch (e) {
					req.log.error(`Failed login ${req.headers.email} ${e.message}`);
					return res.sendStatus(HttpStatusCodes.INTERNAL_SERVER_ERROR);
				}
			} else {
				return res.sendStatus(HttpStatusCodes.BAD_REQUEST);
			}
		});

		/**
		 * @swagger
		 *
		 * /api-docs:
		 *   get:
		 *     description: Displays api docs
		 *     produces:
		 *       - application/json
		 *     consumes:
		 *       - text/plain; charset=utf-8
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
			this.pino().info(`${SERVER_COPY.liveOn} ${port}`);
		});
	}

	async stopServer() {
		if (this.activeServer) {
			await this.activeServer.close();
			this.activeServer = null;
		}
	}
}
