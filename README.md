# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## Features

* Full rendering of Mii heads using the Wii U (`FFLShaderMaterial`) and Miitomo (`LUTShaderMaterial`) shaders.
* Implemented in JSDoc annotated JavaScript (_compatible with TypeScript!_) directly calling into the FFL library.
* Supports importing 3DS/Wii U Mii Data (`FFLStoreData`), Mii Studio data, and exporting FFLStoreData.
* Supported FFL features: Expressions, mipmaps, bounding box, `partsTransform` and model flags for headwear, `FFLiVerifyReason`, basic head only icon creation
* Tested from Three.js r109 up to r174, latest as of writing
  - Both included shaders work exclusively in sRGB. If you don't know what this means and want to opt out, [see this post from Don McCurdy.](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791#post_1).
  - If you are using built-in Three.js materials and need colors to be linear, try: `moduleFFL._FFLSetLinearGammaMode(1)`

There are currently two demos within `examples`: `demo-basic.html` and `demo-minimal.html`, both of which just show spinning Mii heads.

<img width="350" src="https://github.com/user-attachments/assets/853b4159-4cb0-47ac-b929-220299a3017a">

<img width="400" src="https://github.com/user-attachments/assets/7059cc73-463e-4091-baec-642b67ae4993">

<img width="200" src="https://github.com/user-attachments/assets/2376e69b-ef53-49a9-a98f-29d4df0eb1c6">

## Usage
This section is TBD because the library needs to be modularized - it's only made to work with browsers in global scope, making it obtuse to use for now.
<details><summary>On your page, include these in order.</summary>

```html

	<!-- Path/URL to the FFL resource file in `content` (FFLResHigh.dat, AFLResHigh_2_3.dat, etc.) -->
	<meta itemprop="ffl-js-resource-fetch-path" content="AFLResHigh_2_3.dat">
	<!-- Emscripten module (not modularized)/ffl-emscripten.js -->
	<script src="ffl-emscripten.js"></script>

	<!-- Include Three.js. Outdated version 0.137.5 from 2022 included here: -->
	<script src="https://unpkg.com/three@0.137.5/build/three.min.js"></script>

	<script src="struct-fu.js"></script> <!-- Dependency for ffl.js. -->
	<!-- Include shader materials here, such as FFLShaderMaterial. -->
	<script src="FFLShaderMaterial.js"></script>

	<!-- Include ffl.js, must be after Three.js. -->
	<script src="ffl.js"></script>
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
* Find out how to easily strip out/disable all console.debug statements when not debugging, if possible.
* Investigate how to make unit tests for the library, further reading: [Three.js Discourse](https://discourse.threejs.org/t/how-to-unit-test-three-js/57736/2 )
* **Needed refactoring:** Split code into files, use ESM imports/exports, _MAAAYBE_ consider switching to TypeScript??
* **More refactoring?**
  - Refactor into classes/true OOP. Should functionality be implemented in class patterns?
  - Improve documentation as code (TypeDoc output). Add JSDoc @example tags? Or write real docs/tutorial?
  - 🤔 Can someone scrutinize my code? Style, naming conventions, ease of use and import, low quality sections...?
* Port `TextureShaderMaterial` to TSL and use NodeMaterial for WebGPURenderer support?

# Acknowledgements
* [aboood40091/AboodXD](https://github.com/aboood40091) for the [FFL decompilation and port to RIO](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
* [Nathan Vander Wilt](https://github.com/natevw) for [struct-fu](https://github.com/natevw/struct-fu) (this is using a [fork](https://github.com/ariankordi/struct-fu)).
* [Mister F*cking Doob](https://github.com/mrdoob) himself for [Three.js](https://github.com/mrdoob/three.js).
* Nintendo for making FFL.
