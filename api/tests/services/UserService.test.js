import UserService from '../../src/services/UserService';
import {
	validID,
	validGivenName,
	validFamilyName,
	validAbout,
	validEmail,
	validPwd,
	invalidEmail,
	invalidPwd,
	invalidID,
	invalidGivenName,
	invalidFamilyName,
	invalidAbout,
	validUnderscoreID,
	validUser
} from '../CommonData';

describe('User Service', () => {
	const secretKey = 'TRFTS';
	const validToken = 'abcd';

	const getUserByDBID = jest.fn(_id => {
		return true;
	});

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

	const getAllUsers = jest.fn(() => {
		return [validUser, validUser];
	});

	const getAllUsersFail = jest.fn(() => {
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

	const updateUser = jest.fn(
		(_id, id, email, givenName, familyName, password, about) => {
			return true;
		}
	);

	const deleteUser = jest.fn(_id => {
		return true;
	});

	const updateUserFail = jest.fn(
		(_id, id, email, givenName, familyName, password, about) => {
			return false;
		}
	);

	const getUserByEmailFail = jest.fn(email => {
		return false;
	});

	const mockUserRepo = {
		insertUser,
		saveAuthToken,
		getUserByEmailPassword,
		updateUser,
		getUserByEmail: getUserByEmailFail,
		getUserByDBID,
		deleteUser,
		getAllUsers
	};
	const mockUserRepoUpdate = {
		insertUser,
		saveAuthToken,
		getUserByEmailPassword,
		updateUser,
		getUserByEmail: getUserByEmailFail,
		getUserByDBID
	};
	const mockUserRepoFail = {
		insertUser: insertUserFail,
		saveAuthToken: saveAuthTokenFail,
		getUserByEmailPassword: getUserByEmailPasswordFail,
		updateUser: updateUserFail,
		getUserByEmail: getUserByEmailFail,
		getUserByDBID,
		getAllUsers: getAllUsersFail
	};

	let userService;
	let invalidUserService;
	let updateUserService;
	beforeEach(() => {
		userService = new UserService(mockUserRepo, secretKey);
		invalidUserService = new UserService(mockUserRepoFail, secretKey);
		updateUserService = new UserService(mockUserRepoUpdate, secretKey);
	});

	it('Will return true for a valid login', async () => {
		const login = await userService.doLogin(validEmail, validPwd);
		expect(login).toBe(true);
	});

	it('Will return false for an invalid login', async () => {
		const failLogin = await invalidUserService.doLogin(
			invalidEmail,
			invalidPwd
		);
		expect(failLogin).toBe(false);
	});

	it('Will return email and password validation schema', () => {
		const schema = userService.getUserLoginValidationSchema();
		expect(schema).toMatchSnapshot();
	});

	it('Will return user validation schema', () => {
		const schema = userService.getUserValidationSchema();
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

	it('Will validate valid user details successfully', () => {
		const valid = userService.validateUser(
			validID,
			validEmail,
			validGivenName,
			validFamilyName,
			validPwd,
			validAbout
		);
		expect(valid).toBe(true);
	});

	it('Will fail validation of invalid user details', () => {
		const invalid = userService.validateUser(
			invalidID,
			invalidEmail,
			invalidGivenName,
			invalidFamilyName,
			invalidPwd,
			invalidAbout
		);
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
		const savedToken = await invalidUserService.saveToken(
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
		const user = await invalidUserService.insertUser(
			validID,
			invalidEmail,
			validGivenName,
			validFamilyName,
			invalidPwd,
			validAbout
		);
		expect(user).toBe(false);
	});

	it('Will update a user', async () => {
		const user = await updateUserService.updateUser(
			validUnderscoreID,
			validID,
			validEmail,
			validGivenName,
			validFamilyName,
			validPwd,
			validAbout
		);
		expect(user).toBe(true);
	});

	it('Will fail to update a user', async () => {
		const user = await invalidUserService.updateUser(
			validUnderscoreID,
			invalidID,
			invalidEmail,
			invalidGivenName,
			invalidFamilyName,
			invalidPwd,
			invalidAbout
		);
		expect(user).toBe(false);
	});

	it('Will get a user', async () => {
		const user = await userService.getUser(validUnderscoreID);
		expect(user).toBe(true);
	});

	it('Will get all users', async () => {
		const users = await userService.getAllUsers();
		expect(users).toMatchSnapshot();
	});

	it('Will fail to get all usres', async () => {
		const users = await invalidUserService.getAllUsers();
		expect(users).toBe(false);
	});

	it('Will delete a user', async () => {
		const user = await userService.deleteUser(validUnderscoreID);
		expect(user).toBe(true);
	});
});
