// @ts-check
const entries = [
	{
		input: 'ffl.js',
		name: 'FFLjs',
		outFile: 'dist/ffl.browser.js'
	},
	{
		input: 'materials/FFLShaderMaterial.js',
		name: 'FFLShaderMaterial',
		outFile: 'dist/materials/FFLShaderMaterial.browser.js',
		exports: 'default'
	},
	{
		input: 'materials/LUTShaderMaterial.js',
		name: 'LUTShaderMaterial',
		outFile: 'dist/materials/LUTShaderMaterial.browser.js',
		exports: 'default'
	},
	{
		input: 'materials/SampleShaderMaterial.js',
		name: 'SampleShaderMaterial',
		outFile: 'dist/materials/SampleShaderMaterial.browser.js',
		exports: 'default'
	}
	// No NodeMaterials for now as the WebGPURenderer is required.
];

const baseGlobals = { three: 'THREE' };
const baseExternal = ['three'];

/** Built Rollup configs for each entry in both minified and non-minified form. */
export default entries.flatMap(({ input, name, outFile, exports }) => [
	// Unminified
	{
		input,
		output: {
			file: outFile,
			format: 'iife',
			name,
			globals: baseGlobals,
			exports
		},
		external: baseExternal
	}

	// Minified variant
	/*
	{
		input,
		output: {
			file: outFile.replace(/\.js$/, '.min.js'),
			format: 'iife',
			name,
			globals: baseGlobals,
			exports,
		},
		external: baseExternal,
		plugins: [terser()],
	}
	*/
]);
