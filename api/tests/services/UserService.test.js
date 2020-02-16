import UserService from '../../src/services/UserService';

describe('User Service', () => {
	const validEmail = 'test@holextra.com';
	const validPassword = 'password';
	const invalidEmail = '123';
	const invalidPassword = '123';

	const validUser = {
		id: 0,
		email: 'tom@holextra.com',
		givenName: 'Tom',
		familyName: 'Solomon',
		created: '2020-02-15T13:07:01.000Z',
		password: 'password',
		about: 'I like music'
	};

	const getUserByEmailPassword = jest.fn((email, password) => {
		return validUser;
	});

	const getUserByEmailPasswordFail = jest.fn((email, password) => {
		return null;
	});

	const mockUserRepo = { getUserByEmailPassword };
	const mockUserRepoFail = {
		getUserByEmailPassword: getUserByEmailPasswordFail
	};

	let userService;

	beforeEach(() => {
		userService = new UserService(mockUserRepo);
	});

	it('Will return true for a valid login', async () => {
		const login = await userService.doLogin(validEmail, validPassword);
		expect(login).toBe(true);
	});

	it('Will return false for an invalid login', async () => {
		userService = new UserService(mockUserRepoFail);
		const failLogin = await userService.doLogin(invalidEmail, invalidPassword);
		expect(failLogin).toBe(false);
	});
});
