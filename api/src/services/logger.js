import pino from 'pino';

export { pino };
export const logConfig = {
	// Reuse an existing logger instance
	logger: pino(),

	// Define a custom request id function
	genReqId: function (req) {
		return req.id;
	},

	// Define custom serializers
	serializers: {
		err: pino.stdSerializers.err,
		req: pino.stdSerializers.req,
		res: pino.stdSerializers.res,
	},

	// Set to `false` to prevent standard serializers from being wrapped.
	wrapSerializers: true,

	// Define a custom logger level
	customLogLevel: function (res, err) {
		if (res.statusCode >= 400 && res.statusCode < 500) {
			return 'warn';
		} else if (res.statusCode >= 500 || err) {
			return 'error';
		}
		return 'info';
	},

	// Define a custom success message
	customSuccessMessage: function (res) {
		if (res.statusCode === 404) {
			return 'resource not found';
		}
		return 'request completed';
	},

	// Define a custom error message
	customErrorMessage: function (error, res) {
		return 'request errored with status code: ' + res.statusCode;
	},
	// Override attribute keys for the log object
	customAttributeKeys: {
		req: 'request',
		res: 'response',
		err: 'error',
		responseTime: 'timeTaken',
	},

	// Define additional custom request properties
	reqCustomProps: function (req) {
		return {
			customProp: req.customProp,
		};
	},
};
