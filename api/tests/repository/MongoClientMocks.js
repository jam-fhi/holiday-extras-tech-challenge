const validFoundDocument = {
	document: 'found'
};

const connect = jest.fn((url, options, callback) => {
	callback(null, dbConn);
});

const connectFail = jest.fn((url, options, callback) => {
	callback(connFailedMsg, { client: false });
});

const connectDBFail = jest.fn((url, options, callback) => {
	callback(null, dbConnFail);
});

const close = jest.fn(() => {
	return null;
});

const db = jest.fn(db => {
	return { collection };
});

const collection = jest.fn(collection => {
	return { findOne, updateOne, insertOne };
});

const insertOne = jest.fn(insert => {
	return validFoundDocument;
});

const findOne = jest.fn(query => {
	return validFoundDocument;
});

const updateOne = jest.fn((query, update) => {
	return true;
});

const findOneFail = jest.fn(query => {
	return findOneNoResult;
});

const collectionFail = jest.fn(collection => {
	return { findOne: findOneFail };
});

const dbFail = jest.fn(db => {
	return { collection: collectionFail };
});

export const MockMongoClient = { connect };
export const MockMongoClientError = { connect: connectFail };
export const MockMongoClientDBError = { connect: connectDBFail };
export const dbConn = { close, db, findOne };
export const dbConnFail = { close, db: dbFail };
export const validUsername = 'test';
export const validPassword = 'test';
export const validHost = 'localhost';
export const validAuthDB = 'test';
export const findOneNoResult = null;
export const connFailedMsg = 'Connection Failed';
