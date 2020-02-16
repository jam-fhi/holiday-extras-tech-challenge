import APIServer from './src/server';
import { PORT } from './src/models/RouteConstants';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import MongoConnection from './src/repository/MongoConnection';
import UserRepository from './src/repository/UserRepository';
import UserService from './src/services/UserService';

dotenv.config();

const userDatabase = process.env.MONGO_USER_DB;
const userCollection = process.env.MONGO_USER_COLLECTION;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_INTERNAL_URL;
const authDB = process.env.MONGO_AUTH_DB;

const mongoConn = new MongoConnection(
	MongoClient,
	username,
	password,
	host,
	authDB
);
const userRepo = new UserRepository(mongoConn, userDatabase, userCollection);
const userService = new UserService(userRepo);

const apiServer = new APIServer(userService);

apiServer.startServer(PORT);
