# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## Features

* Full rendering of Mii heads using the Wii U (`FFLShaderMaterial`) and Miitomo (`LUTShaderMaterial`) shaders.
* Implemented in JSDoc annotated JavaScript (fully typed) directly calling into the FFL library.
* Supports importing 3DS/Wii U Mii Data (`FFLStoreData`), Mii Studio data, and exporting FFLStoreData.
* Supported FFL features: Expressions, mipmaps, bounding box, `partsTransform` and model flags for headwear, `FFLiVerifyReason`, basic head only icon creation
* Tested from Three.js r109 up to r180 (latest as of writing), WebGL 1.0 (for servers) and 2.0
  - Both included shaders work exclusively in sRGB. If you don't know what this means and want to opt out, [see this post from Don McCurdy.](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791#post_1).
  - If you are using built-in Three.js materials and need colors to be linear, try: `moduleFFL._FFLSetLinearGammaMode(1)`

There are currently two demos within `examples`: `demo-basic.html` and `demo-minimal.html`, both of which just show spinning Mii heads.

<img width="350" src="https://github.com/user-attachments/assets/853b4159-4cb0-47ac-b929-220299a3017a">

<img width="400" src="https://github.com/user-attachments/assets/7059cc73-463e-4091-baec-642b67ae4993">

<img width="200" src="https://github.com/user-attachments/assets/2376e69b-ef53-49a9-a98f-29d4df0eb1c6">

## Usage
This library is using ESM "import", meaning you have to use `script type="module"` until I eventually make a UMD build that'll work without it.

<details><summary>Include the following on your page.</summary>

```html

	<!-- Path/URL to the FFL resource file in `content` (FFLResHigh.dat, AFLResHigh_2_3.dat, etc.) -->
	<meta itemprop="ffl-js-resource-fetch-path" content="AFLResHigh_2_3.dat">
	<!-- Emscripten module (not an ES6 module)/ffl-emscripten.js -->
	<script src="ffl-emscripten.js"></script>

	<!-- Import maps. This correlates "import" statements
		 	 with the actual links for where to get them. -->
	<script type="importmap">
		{
			"imports": {
				"three": "https://esm.sh/three@0.180.0",
				"three/": "https://esm.sh/three@0.180.0/",
				"fflate": "https://esm.sh/fflate@0.8.2"
			}
		}
	</script>
	<script type="module">
		// Export Three.js to window for shader material.
		// This is not needed if you bundle the shader materials together with the library.
		import * as THREE from 'three';
		window.THREE = globalThis.THREE = THREE;
	</script>

	<!-- This is your JS code. It can be in a file too. -->
	<script type="module">
		import * as THREE from 'three'; // Include Three.js.
		import {
			// Add the functions that you need into here.
			initializeFFL, setRendererState, createCharModel,
			initCharModelTextures, parseHexOrB64ToUint8Array,
			FFLCharModelDescDefault, CharModel, exitFFL
		} from '../ffl.js'; // Include FFL.js.
		import * as FFLShaderMaterialImport from '../FFLShaderMaterial.js';
		// Hack to get library globals recognized throughout the file.
		/**
		 * @typedef {import('../ffl-emscripten.js')} ModuleFFL
		 * @typedef {import('../FFLShaderMaterial.js')} FFLShaderMaterial
		 * @typedef {import('three')} THREE
		 */
		/* eslint-disable no-self-assign -- Get TypeScript to identify global imports. */
		/** @type {FFLShaderMaterial} */
		let FFLShaderMaterial = /** @type {*} */ (globalThis).FFLShaderMaterial;
		FFLShaderMaterial = (!FFLShaderMaterial) ? FFLShaderMaterialImport : FFLShaderMaterial;
		// You will need to repeat the above pattern for each shader material, for now.
		/* eslint-enable no-self-assign -- Get TypeScript to identify global imports. */

		// The rest of your code goes here.
	</script>

```

</details>

I recommend looking at the demo code. In order to run them, you need to download the resource file `AFLResHigh_2_3.dat` (see _Building_ step **6** for details), or use your own and change `content` property of `meta#ffl-js-resource-fetch-path`.

For more help, you can either examine the `ffl.js` source, or, generate documentation with [TypeDoc, install it](https://typedoc.org/#quick-start) and run: `typedoc ffl.js`

## Building `ffl-emscripten.js`/`.wasm`

This library depends on FFL built for Emscripten (in WASM). **NOTE** that this is already included in the repository as of writing, but you may either need to rebuild it, or I may remove it at some point.

1. You will need to make sure [emsdk](https://emscripten.org/docs/tools_reference/emsdk.html) is installed and you can build binaries with Emscripten. This is mostly left as an exercise to the reader, but don't forget to activate your emsdk environment before continuing.

2. Pull FFL and its dependencies. For simplicity, you can actually just pull [FFL-Testing (active branch)](https://github.com/ariankordi/FFL-Testing/tree/renderer-server-prototype) which has the dependencies.

```
git clone -b renderer-server-prototype --recursive https://github.com/ariankordi/FFL-Testing
```

3. Recurse into `ffl` within `FFL-Testing`.

```
cd FFL-Testing/ffl
```

4. Build using CMake with Emscripten.

Note that the argument to `-DCMAKE_TOOLCHAIN_FILE=` has to be within your emsdk directory, so **please change that in the command below:**

```
cmake -S . -B build-em -DCMAKE_TOOLCHAIN_FILE=/path/to/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DFFL_WITH_RIO=../rio/ -DCMAKE_BUILD_TYPE=Release
 # Remember to find and fill in emsdk path:   ^^^^^^^^^
cmake --build build
```

* Notable build options:
  - Use `-DFFL_NO_NINTEXUTILS=ON` for a smaller build if you will not be using resource (.dat) files for Wii U.
  - To build JS only you can use `-DFFL_BUILD_WASM=OFF`, which may be more convenient/compatible at 2x the size of the wasm binary.
  - If you want to pass other options to emcc, use `-DCMAKE_EXE_LINKER_FLAGS="-s SINGLE_FILE=1"`, for example.

5. If that worked, find and copy the library.
* It should be sitting in `build-em` (or whatever folder you chose) as:
  - `ffl-emscripten.js`, `ffl-emscripten.wasm`

6. Finally, in order to use the library, you'll need an FFL resource such as `FFLResHigh.dat`, `AFLResHigh_2_3.dat`, etc.
  - See the [FFL-Testing README](https://github.com/ariankordi/FFL-Testing/blob/master/README.md) (search "resource file") to know how to acquire this.

If you run into issues with dependencies here, see the FFL-Testing repo.

### ESLint
The library is using eslint, so I recommend linting if you ever want to contribute back.

Install it with `npm install -D` then use `npm run-script lint`. Additionally use `npm run-script check-types` to validate types, and `npm run-script build` to build a `.d.ts` definition for TypeScript.

### Wishlist for improvements to be made
* Need more demos: body model, CharInfo editing, glTF export?, mass icons

* Add an option to switch color space (`FFLSetLinearGammaMode`), needs to be kept track of per-CharModel.
* Improve resource loading by either not loading all resource in WASM heap or in memory in general. (IndexedDB streaming?)
* Strip out console.debug/assert statements when not debugging, or for a build.
  - As well as the TextureManager.logging property.
    * Terser is too dumb to see that it's always false, so perhaps it should be a shakable constant?
* Investigate how to make unit tests for the library, further reading: [Three.js Discourse](https://discourse.threejs.org/t/how-to-unit-test-three-js/57736/2 )
* **Switch to `"type": "module"` in package.json.**
  - Everything needs to be ESM-first.
    * struct-fu (in its own repo) and the shader materials all need to be converted.
  - Then, builds should be provided for UMD and ESM.
    * esbuild + Terser can be used, but look into Closure Compiler for more aggressive optimization.
* **Code needs to be split into files.** This has already been planned, search: `// TODO PATH:`
* **More refactoring?**
  - Refactor into classes/true OOP. Should functionality be implemented in class patterns?
  - Improve documentation as code (TypeDoc output). Add JSDoc @example tags? Or write real docs/tutorial?
  - 🤔 Can someone scrutinize my code? Style, naming conventions, ease of use and import, low quality sections...?
* Port more shaders to TSL for WebGPU support? (+ Address TODOs in existing ones)

# Acknowledgements
* [aboood40091/AboodXD](https://github.com/aboood40091) for the [FFL decompilation and port to RIO](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
* [Nathan Vander Wilt](https://github.com/natevw) for [struct-fu](https://github.com/natevw/struct-fu) (this is using a [fork](https://github.com/ariankordi/struct-fu)).
* [mrdoob](https://github.com/mrdoob) for [Three.js](https://github.com/mrdoob/three.js).
* Nintendo for making FFL.
