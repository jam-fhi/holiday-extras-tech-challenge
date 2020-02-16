import Joi from 'joi';
import jwt from 'jsonwebtoken';

export default class UserService {
	constructor(userRepo, secretKey) {
		this.userRepo = userRepo;
		this.secretKey = secretKey;
	}

	getUserLoginValidationSchema() {
		return Joi.object()
			.keys({
				email: Joi.string().email({ minDomainAtoms: 2 }),
				password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
			})
			.with('email', 'password');
	}

	validateLogin(email, password) {
		const { error, value } = Joi.validate(
			{ email, password },
			this.getUserLoginValidationSchema()
		);
		console.log(value);
		return error ? false : true;
	}

	generateAuthToken(email, password) {
		return jwt.sign({ email, password }, this.secretKey);
	}

	async doLogin(email, password) {
		const user = await this.userRepo.getUserByEmailPassword(email, password);
		if (user) {
			return true;
		}
		return false;
	}
}
