import UserService from '../../src/services/UserService';

describe('User Service', () => {
	const validEmail = 'test@holextra.com';
	const validPassword = 'password';
	const invalidEmail = '123';
	const invalidPassword = '123';
	const secretKey = 'TRFTS';

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
		userService = new UserService(mockUserRepo, secretKey);
	});

	it('Will return true for a valid login', async () => {
		const login = await userService.doLogin(validEmail, validPassword);
		expect(login).toBe(true);
	});

	it('Will return false for an invalid login', async () => {
		userService = new UserService(mockUserRepoFail, secretKey);
		const failLogin = await userService.doLogin(invalidEmail, invalidPassword);
		expect(failLogin).toBe(false);
	});

	it('Will return email and password validation schema', () => {
		const schema = userService.getUserLoginValidationSchema();
		expect(schema).toMatchSnapshot();
	});

	it('Will validate valid emails and password successfully', () => {
		const valid = userService.validateLogin(validEmail, validPassword);
		expect(valid).toBe(true);
	});

	it('Will fail validation of invalid emails and passwords', () => {
		const invalid = userService.validateLogin(invalidEmail, invalidPassword);
		expect(invalid).toBe(false);
	});

	it('Will generate an auth token', () => {
    const token = userService.generateAuthToken(validEmail, validPassword);
    // TODO: Test generate an auth token that changes on every call?
		//expect(token).toMatchSnapshot(token);
	});
});
