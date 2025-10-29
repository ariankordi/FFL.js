# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## Features

* Rendering
  - Full rendering of Mii head models from the [FFL decomp by aboood40091](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
  - Accurate shaders from Wii U, Miitomo, and Switch (`FFLShaderMaterial`, `LUTShaderMaterial`, `SampleShaderMaterial`).
    * For THREE.WebGPURenderer, only the Wii U shader is ported (`FFLShaderNodeMaterial`).
    * The shaders work exclusively in sRGB. If you don't know what this means and want to opt out, [see this post from Don McCurdy.](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791#post_1).
  - Linear color support from FFL, enabled with `ffl.module._FFLSetLinearGammaMode(1)`. Useful for built-in Three.js materials.
  - Misc: Multiple expressions, texture mipmaps, bounding box, head-only icon creation, `CharModel.partsTransform` and `FFLModelFlag` for headwear
* Data
  - 3DS/Wii U Mii Data (`FFLStoreData`)
  - Mii Studio data (raw "codes" or obfuscated URL "data")
  - Wii Mii Data (`RFLCharData`, `RFLStoreData`)
  - All data is verified by FFL.
  - (Cannot currently edit/export data.)
* Compatibility
  - Implemented in JSDoc annotated and fully typed JavaScript calling into FFL in WASM.
    * Just ESM import `ffl.js` and materials. In dist/ there are `.d.ts` definitions and browser non-module versions.
    * Base library is 140 KB minified.
    <!-- 140 = ffl.browser.min.js = 38.5 + ffl-emscripten.js = 12.5 + ffl-emscripten.wasm = 86.4 -->
    <!-- (ffl-emscripten built with em_inflate without checksum) -->
  - Tested from Three.js r144 up to r180 (latest as of writing), WebGL 1/2 and WebGPU.
    * For WebGPU, use `FFLShaderNodeMaterial`. For r152 and later, opt out of sRGB by following the link above.

There are currently two demos within `examples`: `demo-basic.html` and `demo-minimal.html`, both of which just show spinning Mii heads.

<img width="350" src="https://github.com/user-attachments/assets/853b4159-4cb0-47ac-b929-220299a3017a">

<img width="400" src="https://github.com/user-attachments/assets/7059cc73-463e-4091-baec-642b67ae4993">

<img width="200" src="https://github.com/user-attachments/assets/2376e69b-ef53-49a9-a98f-29d4df0eb1c6">

## Usage

The main library is in `ffl.js`, and the materials are included in `materials/`, but built-in Three.js materials such as `THREE.MeshStandardMaterial` should work too.

To get started, I recommend looking at the demo code in `examples/`. In order to run them, you need to download the resource file `AFLResHigh_2_3.dat` (See the [FFL-Testing README](https://github.com/ariankordi/FFL-Testing/blob/master/README.md) (search "resource file") for details), or use your own and change `content` property of `meta#ffl-js-resource-fetch-path`.

For more help, you can either examine the `ffl.js` source, or, generate documentation with [TypeDoc, install it](https://typedoc.org/#quick-start) and run: `typedoc ffl.js`

### Importing as module

For projects using npm, since this isn't on NPM as of writing you'll need to install it like so: `npm install https://github.com/ariankordi/FFL.js#v2.0.0` (You may replace v2.0.0 with whatever is latest)

For the browser, you have to use `<script type="module">`, as well as adding import maps.

<details><summary>Include the following on your page.</summary>

```html
	<!-- Import maps. This correlates "import" statements
			with the actual links for where to get them.
			This example is using esm.sh, which acts most like
			importing modules from npm.
		-->
	<script type="importmap">
		{
			"imports": {
				"three": "https://esm.sh/three@0.180.0",
				"three/": "https://esm.sh/three@0.180.0/",
				"https://esm.sh/three?target=es2022": "https://esm.sh/three@0.180.0",
				"FFL.js": "https://esm.sh/gh/ariankordi/FFL.js@v2.0.0",
				"FFL.js/": "https://esm.sh/gh/ariankordi/FFL.js@v2.0.0/"
			}
		}
	</script>
	<!-- The "esm.sh/three?target=es2022" import is to make
			sure FFL.js uses the same version of Three.js. -->

	<!-- This is your JS code. It can be in a file too. -->
	<script type="module">
		import * as THREE from 'three'; // Include Three.js.
		// Imports from FFL.js. More may be added as needed.
		import { FFL, CharModel, FFLCharModelDescDefault, ModelIcon } from 'FFL.js';
		import FFLShaderMaterial from 'FFL.js/materials/FFLShaderMaterial.js';
		// NOTE:
		// - In the browser, when not using esm.sh, ffl-emscripten.cjs needs
		// to be included in a <script> tag since it's not a proper ES module.
		// - For Node.js, you need to use examples/ffl-emscripten-single-file.cjs.
		import ModuleFFL from 'FFL.js/ffl-emscripten.cjs';

		// The example below renders a simple icon.
		(async function () {
			const renderer = new THREE.WebGLRenderer({ alpha: true });
			renderer.setSize(300, 300);
			document.body.append(renderer.domElement);
			// You need to get AFLResHigh_2_3.dat from somewhere.
			const ffl = await FFL.initWithResource(fetch('../AFLResHigh_2_3.dat'),
				// If not using a CDN like esm.sh, then pass just "ModuleFFL" to CharModel directly.
				ModuleFFL({locateFile: () => 'https://esm.sh/gh/ariankordi/FFL.js@v2.0.0/ffl-emscripten.wasm'}));
			/** Mii data from NNID: JasmineChlora */
			const data = Uint8Array.fromHex('000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1');
			const model = new CharModel(ffl, data, FFLCharModelDescDefault,
				FFLShaderMaterial, renderer);
			const scene = new THREE.Scene();
			scene.add(model.meshes);
			renderer.render(scene, /* camera */ ModelIcon.getCamera());
		})();
	</script>
```

</details>

### Importing in the browser without modules

There are builds that don't need ES modules/"import" available in `dist/`, for example: `dist/ffl.browser.js`.

Shaders are available in global namespace (`window.FFLShaderMaterial`), but FFL.js itself is dropped in the `FFLjs` namespace. Example: `await FFLjs.FFL.initWithResource(fetch('../AFLResHigh_2_3.dat'), ModuleFFL)`

For these, you'll need to use a UMD build of Three.js, which are no longer supported. The last one is r160: `https://unpkg.com/three@0.160.0/build/three.min.js`

### Building `ffl-emscripten.js`/`.wasm`

This library depends on FFL built for Emscripten (in WASM). **NOTE** that this is already included in the repository as of writing, but you may either need to rebuild it, or I may remove it at some point.

<details>
	<summary>Click to reveal build instructions.</summary>

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

</details>

## Contributing

The library is using eslint, so I recommend linting if you ever want to contribute back. Install dev dependencies with `npm install -D` then use `npm run-script lint`.

Additionally use `npm run-script check-types` to validate types, and `npm run-script prepare` to make `.d.ts` definitions and `.browser.js` builds.

### Wishlist
* **I would love to have more demos/examples.**
	- Body model rendering and accurate scaling
	- Editing Mii data (CharInfo)
	- Export models using Three.js GLTFExporter
	- Render a ton of icons + make random Mii data
	- TBD: Headwear, linear gamma

* Add an option to switch color space (`FFLSetLinearGammaMode`), needs to be kept track of per-CharModel.
* Create unit tests with good coverage.
  - Can be split into non-rendering, WebGL 1.0, and WebGPU.
  - There can be tests for each branch/expected feature, and material class.
  - Tests for matching renders - icon images or model exports would be fantastic.
* Consider a "minimal" WASM binary (<70K?) w/o ninTexUtils, FFLiDatabaseRandom, maybe using DecompressionStream from JS
* Potentially split code into files. This has already been planned, search: `// TODO PATH:`
  - But since the library is just 4000 lines and relatively thin (40 KB as of writing), there's a risk of overcomplication.
* Make this easier to use as time goes on. This includes: solving ambiguities, maybe adding JSDoc @example tags... (Like all projects.)

## Future

This project was only meant to be a simple port to use FFL in Three.js, like an "adapter". The goals are for it to be light, and reuse as much code from FFL as possible. This is so that we'd have to avoid rewriting the entire library just to use it in JS.

But, I've realized that this isn't the best solution forever, and I'm aware of how obtuse it may be to call into a native library, deal with WASM, not be able to extend its internals as easily... etc.

So, I'm not planning to work on this library as much, in the hopes that I can make a successor. Along with rendering, it could also manage Mii data in a cleaner way. The plans for this are TBD, but this is a repo I'm toying around with: https://github.com/ariankordi/mii-fusion-experiments

# Acknowledgements
* [aboood40091/AboodXD](https://github.com/aboood40091) for the [FFL decompilation and port to RIO](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
* [mrdoob](https://github.com/mrdoob) for [Three.js](https://github.com/mrdoob/three.js).
* Nintendo for making FFL.
