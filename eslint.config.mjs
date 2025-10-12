import eslint from '@eslint/js';
import eslintCommentPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import stylisticPlugin from '@stylistic/eslint-plugin';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import-x';
import jsdoc from 'eslint-plugin-jsdoc';
// import sortClassMembers from 'eslint-plugin-sort-class-members';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const stylisticConfig = stylisticPlugin.configs.customize({
	indent: 'tab',
	quotes: 'single',
	semi: true,
	commaDangle: 'never',
	braceStyle: '1tbs'
});

const ecmaVersion = 2022;

export default [
	// https://eslint.org/docs/rules/
	eslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion,
			sourceType: 'module',
			globals: {
				...globals.browser
			}
		},
		rules: {
			'require-atomic-updates': 'off', // This rule is widely controversial and causes false positives
			'no-console': 'off',
			'prefer-const': ['error', {
				destructuring: 'all' // Only error if all destructured variables can be const
			}],
			'no-var': 'error',
			// TODO: 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' }],
			'one-var': ['error', 'never'],
			'curly': ['error', 'all'], // Always require curly braces

			'class-methods-use-this': 'error',
			'no-return-assign': 'error',
			'template-curly-spacing': 'error'
			// The following will trigger a bunch of errors:
			// 'no-param-reassign': 'error', // This is used but ig alternative is larger code
			// 'no-use-before-define': 'error', // We don't have imports right now
			// 'func-names': 'error', // While ()=>{} is preferred, sometimes this is needed
			// 'no-underscore-dangle': 'warn', // I prefer underscore to # right now as it's not always supported
			// 'no-unused-expressions': 'warn', // This is the (condition) && function() substitute for one-line if
			// 'new-cap': 'error', // Three.js node materials definitely violate this
			// 'no-plusplus': 'warn', // This is very standard convention in JS, C/C++
		}
	},

	// https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/
	eslintCommentPlugin.recommended,
	{
		rules: {
			'@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
			'@eslint-community/eslint-comments/require-description': 'error'
		}
	},

	// https://typescript-eslint.io/rules/
	// (tseslint.configs.recommended: unused)

	// https://eslint.style/rules
	stylisticConfig,
	{
		rules: {
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/yield-star-spacing': ['error', 'after'],
			'@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
			'@stylistic/curly-newline': ['error', {
				multiline: true,
				consistent: true
			}],
			'@stylistic/object-curly-newline': ['error', {
				multiline: true,
				consistent: true
			}],
			'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
			'@stylistic/indent': ['error', 'tab', {
				SwitchCase: 1,
				ignoredNodes: ['Program > ExpressionStatement > CallExpression > :last-child > *']
			}],
			'@stylistic/max-len': ['warn', {
				code: 100,
				comments: 120,
				ignoreUrls: true, // Ignore long URLs
				ignoreStrings: true, // Ignore long strings
				ignoreTemplateLiterals: true, // Ignore long template literals
				ignoreRegExpLiterals: true, // Ignore regex
				ignoreTrailingComments: false, // Enforce trailing comment length
				ignoreComments: false // Enforce all comment lines
			}]
		}
	},

	// https://www.npmjs.com/package/eslint-plugin-import
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.warnings,
	{
		rules: {
			'import-x/order': ['warn', {
				'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
				'newlines-between': 'never'
			}],
			'import-x/first': 'error',
			'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level']
		},
		languageOptions: {
			ecmaVersion // Default sets this to 2018???, so let's reset this to the default
		}
	},

	// https://www.npmjs.com/package/eslint-plugin-import - but specifically for TypeScript
	// (importPlugin.flatConfigs.typescript: unused)

	// https://www.npmjs.com/package/eslint-plugin-sort-class-members
	// sortClassMembers.configs['flat/recommended'],
	// ^ Not a fan of this. Not sure if the order always matters
	// , shouldn't we organize by functional area instead of just "type"?

	// https://www.npmjs.com/package/eslint-plugin-unicorn
	eslintPluginUnicorn.configs.unopinionated,
	{
		rules: {
			// Not a fan of the numeric separators, since I don't think those are a thing in C/C++.
			'unicorn/numeric-separators-style': 'off',
			// The below enforces that hex is always uppercase.
			'unicorn/number-literal-case': 'off',
			// 'unicorn/no-static-only-class': 'off',
			'unicorn/prefer-string-replace-all': 'off', // ES2021 only
			'unicorn/no-array-sort': 'off', // ES2023 only
			'unicorn/prefer-code-point': 'off', // Nullability does not match
			// This is, in fact, only called in CLIs.
			'unicorn/no-process-exit': 'off'
		}
	},

	// https://www.npmjs.com/package/eslint-plugin-jsdoc
	jsdoc.configs['flat/recommended'],
	{
		settings: {
			jsdoc: {
				mode: 'typescript', // For templates and type "&" syntax.
				// Use `Object` for single and `Object<>` for multiple. That works in TS and Closure.
				preferredTypes: { 'object': 'Object', 'object.<>': 'Object<>', 'Object.<>': 'Object<>', 'object<>': 'Object<>' }
			}
		},
		rules: {
			// Lots of structs don't need detailed descriptions.
			'jsdoc/require-property-description': 'off',

			// Rules not enabled in recommended:
			'jsdoc/sort-tags': 'warn',
			'jsdoc/require-throws': 'warn',
			'jsdoc/require-template': 'warn',
			'jsdoc/check-template-names': 'warn',
			// Require hyphen before param descriptions but not before return description.
			'jsdoc/require-hyphen-before-param-description': ['warn', 'always', { tags: { returns: 'never' } }],
			'jsdoc/require-asterisk-prefix': 'warn',
			'jsdoc/check-syntax': 'warn',
			'jsdoc/check-line-alignment': 'warn',
			'jsdoc/check-indentation': 'warn',
			'jsdoc/convert-to-jsdoc-comments': 'warn',
			'jsdoc/multiline-blocks': ['warn', {
				noMultilineBlocks: true,
				minimumLengthForMultiline: 80,
				multilineTags: []
			}]

		}
	},

	{
		ignores: [
			'**/ffl-emscripten*', // Do not lint Emscripten-emitted code.
			'docs/**/*', // TypeDoc output
			'three-r*.js',

			// Defaults
			'**/dist/', // Common build output directory
			'**/*.min.js' // Minified JavaScript files
		]
	}
];
