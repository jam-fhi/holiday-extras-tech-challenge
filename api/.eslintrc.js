module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true
	},
	extends: 'eslint:recommended',
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	rules: {
		'eol-last': 2,
		'no-irregular-whitespace': 2,
		'no-mixed-requires': 2,
		'no-multi-spaces': 2,
		'no-underscore-dangle': 0,
		quotes: [2, 'single'],
		semi: [2, 'always'],
		strict: 0
	}
};
