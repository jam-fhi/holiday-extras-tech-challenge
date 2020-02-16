import UserService from '../../src/services/UserService';
import {
	validID,
	validGivenName,
	validFamilyName,
	validAbout,
	validEmail,
	validPwd,
	invalidEmail,
	invalidPwd
} from '../CommonData';

describe('User Service', () => {
	const secretKey = 'TRFTS';
	const validToken = 'abcd';

	const validUser = {
		id: 0,
		email: 'tom@holextra.com',
		givenName: 'Tom',
		familyName: 'Solomon',
		created: '2020-02-15T13:07:01.000Z',
		password: 'password',
		about: 'I like music'
	};

	const saveAuthToken = jest.fn((email, password, token) => {
		return true;
	});

	const saveAuthTokenFail = jest.fn((email, password, token) => {
		return false;
	});

	const getUserByEmailPassword = jest.fn((email, password) => {
		return validUser;
	});

	const getUserByEmailPasswordFail = jest.fn((email, password) => {
		return null;
	});

	const insertUser = jest.fn(
		(id, email, givenName, familyName, created, password, about) => {
			return true;
		}
	);

	const insertUserFail = jest.fn(
		(id, email, givenName, familyName, created, password, about) => {
			return false;
		}
	);

	const mockUserRepo = { insertUser, saveAuthToken, getUserByEmailPassword };
	const mockUserRepoFail = {
		insertUser: insertUserFail,
		saveAuthToken: saveAuthTokenFail,
		getUserByEmailPassword: getUserByEmailPasswordFail
	};

	let userService;

	beforeEach(() => {
		userService = new UserService(mockUserRepo, secretKey);
	});

	it('Will return true for a valid login', async () => {
		const login = await userService.doLogin(validEmail, validPwd);
		expect(login).toBe(true);
	});

	it('Will return false for an invalid login', async () => {
		userService = new UserService(mockUserRepoFail, secretKey);
		const failLogin = await userService.doLogin(invalidEmail, invalidPwd);
		expect(failLogin).toBe(false);
	});

	it('Will return email and password validation schema', () => {
		const schema = userService.getUserLoginValidationSchema();
		expect(schema).toMatchSnapshot();
	});

	it('Will validate valid emails and password successfully', () => {
		const valid = userService.validateLogin(validEmail, validPwd);
		expect(valid).toBe(true);
	});

	it('Will fail validation of invalid emails and passwords', () => {
		const invalid = userService.validateLogin(invalidEmail, invalidPwd);
		expect(invalid).toBe(false);
	});

	it('Will generate an auth token', () => {
		const token = userService.generateAuthToken(validEmail, validPwd);
		// TODO: Test generate an auth token that changes on every call?
		//expect(token).toMatchSnapshot(token);
	});

	it('Will save a user token', async () => {
		const savedToken = await userService.saveToken(
			validEmail,
			validPwd,
			validToken
		);
		expect(savedToken).toBe(true);
	});

	it('Will fail to save a user token', async () => {
		userService = new UserService(mockUserRepoFail, secretKey);
		const savedToken = await userService.saveToken(
			validEmail,
			validPwd,
			validToken
		);
		expect(savedToken).toBe(false);
	});

	it('Will insert a new user', async () => {
		const user = await userService.insertUser(
			validID,
			validEmail,
			validGivenName,
			validFamilyName,
			validPwd,
			validAbout
		);
		expect(user).toBe(true);
	});

	it('Will fail to save a new user', async () => {
		userService = new UserService(mockUserRepoFail, secretKey);
		const user = await userService.insertUser(
			validID,
			invalidEmail,
			validGivenName,
			validFamilyName,
			invalidPwd,
			validAbout
		);
		expect(user).toBe(false);
	});
});
