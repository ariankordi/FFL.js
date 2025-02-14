// TODO: npm install eslint @eslint/js @eslint-community/eslint-plugin-eslint-comments @stylistic/eslint-plugin eslint-plugin-import globals

import eslint from '@eslint/js';
import eslintCommentPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import stylisticPlugin from '@stylistic/eslint-plugin';

import importPlugin from 'eslint-plugin-import';
import globals from 'globals'

// Customize the stylistic rules as desired.
const stylisticConfig = stylisticPlugin.configs.customize({
	indent: 'tab',
	quotes: 'single',
	semi: true,
	commaDangle: 'never',
	braceStyle: '1tbs'
});

export default [
	// Base recommended configuration for plain JavaScript.
	// (No "extends" key is used here; we include the shared config object directly.)
	eslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
                                THREE: 'readonly',  // TODO three.js
                                Module: 'readonly', // TODO emscripten
                                _: 'readonly'       // TODO struct-fu
			}
		},
		rules: {
			'require-atomic-updates': 'off', // Disabled due to occasional false positives
			'no-console': 'off',
			'prefer-const': ['error', { destructuring: 'all' }],
			'no-var': 'error',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' }],
			'one-var': ['error', 'never'],
			curly: ['error', 'all'] // Always require curly braces
		}
	},

	// ESLint comments plugin configuration.
	eslintCommentPlugin.recommended,
	{
		rules: {
			'@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
			'@eslint-community/eslint-comments/require-description': 'error'
		}
	},

	// Stylistic plugin configuration.
	stylisticConfig,
	{
		rules: {
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/yield-star-spacing': ['error', 'after'],
			'@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
			'@stylistic/curly-newline': ['error', { multiline: true, consistent: true }],
			'@stylistic/object-curly-newline': ['error', { multiline: true, consistent: true }],
			'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }]
		}
	},

	// Import plugin configuration.
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.warnings,
	{
		languageOptions: {
			ecmaVersion: 'latest' // Ensure modern syntax is recognized
		},
		rules: {
			'import/order': ['warn', {
				groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
				'newlines-between': 'never'
			}],
			'import/first': 'error',
			'import/consistent-type-specifier-style': ['error', 'prefer-top-level']
		}
	},

	// Global ignore patterns to skip build directories and minified files.
	{
		ignores: [
			'**/dist/',
			'**/*.min.js',
			'struct-fu*.js',
			'ffl-*.js',
			'*Material.js'
		]
	}
];
