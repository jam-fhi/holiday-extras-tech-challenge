import Joi from 'joi';
import jwt from 'jsonwebtoken';

export default class UserService {
	constructor(userRepo, secretKey) {
		this.userRepo = userRepo;
		this.secretKey = secretKey;
	}

	getUserValidationSchema() {
		return Joi.object()
			.keys({
				id: Joi.number()
					.integer()
					.min(0)
					.max(2020),
				email: Joi.string().email({ minDomainAtoms: 2 }),
				givenName: Joi.string()
					.alphanum()
					.min(3)
					.max(30)
					.required(),
				familyName: Joi.string()
					.alphanum()
					.min(3)
					.max(30)
					.required(),
				password: Joi.string()
					.regex(/^[a-zA-Z0-9]{3,30}$/)
					.required(),
				about: Joi.string()
					.regex(/^[a-zA-Z0-9 .-:;]{3,255}$/)
					.required()
			})
			.with('email', 'password');
	}

	getUserLoginValidationSchema() {
		return Joi.object()
			.keys({
				email: Joi.string().email({ minDomainAtoms: 2 }),
				password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
			})
			.with('email', 'password');
	}

	async doLogin(email, password) {
		const user = await this.userRepo.getUserByEmailPassword(email, password);
		return user ? true : false;
	}

	validateLogin(email, password) {
		const { error, value } = Joi.validate(
			{ email, password },
			this.getUserLoginValidationSchema()
		);
		return this.isValid(error, value);
	}

	isValid(error, value) {
		if (error) {
			console.log(error.details, value);
			return false;
		}
		return true;
	}

	validateUser(id, email, givenName, familyName, password, about) {
		const { error, value } = Joi.validate(
			{ id, email, givenName, familyName, password, about },
			this.getUserValidationSchema()
		);
		return this.isValid(error, value);
	}

	generateAuthToken(email, password) {
		return jwt.sign({ email, password }, this.secretKey);
	}

	async saveToken(email, password, token) {
		const savedToken = await this.userRepo.saveAuthToken(
			email,
			password,
			token
		);
		return savedToken ? true : false;
	}

	async insertUser(id, email, givenName, familyName, password, about) {
		const currentDate = new Date();
		let user;
		if (!(await this.userRepo.getUserByEmail(email))) {
			user = await this.userRepo.insertUser(
				id,
				email,
				givenName,
				familyName,
				currentDate.toISOString(),
				password,
				about
			);
		}
		return user ? true : false;
	}

	async isUserEmailDuplicated(_id, email) {
		const users = await this.userRepo.getAllUserByEmail(email);
		let duplicate = 0;
		users.forEach(user => {
			if (`${user._id}`.indexOf(_id) < 0) ++duplicate;
		});
		return duplicate > 0 ? true : false;
	}

	async updateUser(_id, id, email, givenName, familyName, password, about) {
		const updateUser = await this.userRepo.getUserByDBID(_id);
		const duplicateUser = await this.isUserEmailDuplicated(_id, email);
		let user;
		if (!duplicateUser && updateUser) {
			user = await this.userRepo.updateUser(
				_id,
				id,
				email,
				givenName,
				familyName,
				password,
				about
			);
		}
		return user ? true : false;
	}

	async deleteUser(_id) {
		const user = await this.userRepo.deleteUser(_id);
		return user ? true : false;
	}

	async getUser(_id) {
		const user = await this.userRepo.getUserByDBID(_id);
		return user;
	}

	async getAllUsers() {
		const users = await this.userRepo.getAllUsers();
		if (users) {
			const displayUsers = users.map(user => {
				return {
					name: `${user.givenName} ${user.familyName}`,
					about: user.about
				};
			});
			return displayUsers;
		}
		return false;
	}
}
