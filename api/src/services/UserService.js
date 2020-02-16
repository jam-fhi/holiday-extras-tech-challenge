export default class UserService {
	constructor(userRepo) {
		this.userRepo = userRepo;
	}

	async doLogin(email, password) {
		const user = await this.userRepo.getUserByEmailPassword(email, password);
		if (user) {
			return true;
		}
		return false;
	}
}
