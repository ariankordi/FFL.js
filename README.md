# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## Features

* Full rendering of Mii heads using the Wii U (`FFLShaderMaterial`) and Miitomo (`LUTShaderMaterial`) shaders.
* Implemented in JSDoc annotated JavaScript directly calling into the FFL library.
* Supports importing 3DS/Wii U Mii Data (`FFLStoreData`), Mii Studio data, and exporting FFLStoreData.
* Supported FFL features: Expressions, mipmaps, bounding box, `partsTransform` and model flags for headwear, `FFLiVerifyReason`, (head only) icon creation
* Tested with Three.js r109 up to r160

There are currently two demos: `demo-basic.html` and `demo-minimal.html`, both of which are pretty underwhelming. Read TODOs further down for more plaannnnnsssss

<img width="350" src="https://github.com/user-attachments/assets/853b4159-4cb0-47ac-b929-220299a3017a">

<img width="400" src="https://github.com/user-attachments/assets/7059cc73-463e-4091-baec-642b67ae4993">

<img width="200" src="https://github.com/user-attachments/assets/2376e69b-ef53-49a9-a98f-29d4df0eb1c6">


## Building

This library depnds on FFL built for Emscripten (in WASM). This import is called `ffl-emscripten.js`/`.wasm`, here's how to build it.

0. You will need to make sure [emsdk](https://emscripten.org/docs/tools_reference/emsdk.html) is installed and you can build binaries with Emscripten. This is mostly left as an exercise to the reader, but don't forget to activate your emsdk environment before continuing.

1. Pull FFL and its dependencies. For simplicity, you can actually just pull [FFL-Testing (active branch)](https://github.com/ariankordi/FFL-Testing/tree/renderer-server-prototype) which has the dependencies.

```
git clone -b renderer-server-prototype --recursive https://github.com/ariankordi/FFL-Testing
```

2. Recurse into `ffl` within `FFL-Testing`.

```
cd FFL-Testing/ffl
```

3. Build using CMake with Emscripten.

Note that the argument to `-DCMAKE_TOOLCHAIN_FILE=` has to be within your emsdk directory, so **please change that in the command below:**

```
cmake -S . -B build-em -DCMAKE_TOOLCHAIN_FILE=/path/to/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DFFL_WITH_RIO=../rio/ -DCMAKE_BUILD_TYPE=Release
 # Remember to find and fill in emsdk path:   ^^^^^^^^^
cmake --build build
```

(You may want to use -DFFL_NO_NINTEXUTILS=ON if you don't have it or want a smaller build but you will not be able to use resource (.dat) files for Wii U)

4. If that worked, find and copy the library.
* It should be sitting in `build-em` (or whatever folder you chose) as:
  - `ffl-emscripten.js`, `ffl-emscripten.wasm`
  - (To build JS only you can use `-DFFL_BUILD_WASM=OFF`, which may be more convenient/compatible at 2x the size of the wasm binary.)

5. Finally, in order to use the library, you'll need an FFL resource such as `FFLResHigh.dat`, `AFLResHigh_2_3.dat`, etc.
  - See the ffl or FFL-Testing repo to know how to acquire this.
  - (_If you have somehow made your own custom one with mipmaps:_ if it is AFLResHigh_2_3.dat you MUST build with `-DCMAKE_CXX_FLAGS="-DFFL_ALLOW_MIPMAPS_FOR_AFL_2_3"`)
  - **Currently the demos hardcode the location of the resource in `meta#ffl-js-resource-fetch-path` so you will need to change that. For now.**

If you run into issues with dependencies here, see the FFL-Testing repo.

### ESLint
The only reason this has package.json at the time of writing is for eslint, npm install and run: `eslint`

## TODO

I apologize in advance for the enormous library in one file, I was under pressure by myself to get this out unpolished.

#### Severe

* End use of globals, pass instances around:
  - window.Module (Emscripten module)
    - _Support async/promise Emscripten module_ (`-s MODULARIZE=1`)
    - Adding above should fix a bug where it keeps waiting for module to be ready
  - window.FFLTextures (TextureManager)
  - `_resourceDesc` (FFLResourceDesc, currently allocated resource pointers)
  - Potential settings:
    - Debug options `_noCharModelCleanupDebug`, `_displayRenderTexturesElement`
    - Color space (`FFLSetLinearGammaMode`), scale (`FFLSetScale`), coordinate mode (`FFLSetCoordinateMode`)
* Export public functions, use UMD for now (Depends on above)

#### Improvements

* Throw errors with more specificity ([See FFLSharp's approach for details](https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs))
  - Include reverse enum to string tables for `FFLResult`, `FFLiVerifyReason`
* Validate code with TypeScript (`--checkJs`) and complete adding types.
  - (Can someone harshly criticize my code, naming conventions and whatnot 🥺)
* (Eliminate all memory leaks? Most should be gone now tho. Strip console.debug?)

### Wishlist
* Need more demos: body model, CharInfo editing, mass icons
* **Refactor**: Split code into files, export as ESM module, refactor to TypeScript(???)
* Resolve JSDoc formatting inconsistencies? (param order, add space after description?, line breaking, etc.)
* _Port shaders to TSL and use NodeMaterial for WebGPURenderer support?????_

# Acknowledgements
* [aboood40091/AboodXD](https://github.com/aboood40091) for the [FFL decompilation and port to RIO](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
* [Nathan Vander Wilt](https://github.com/natevw) for [struct-fu](https://github.com/natevw/struct-fu) (this is using a [fork](https://github.com/ariankordi/struct-fu)).
* [Mister F*cking Doob](https://github.com/mrdoob) himself for [Three.js](https://github.com/mrdoob/three.js).
* Nintendo for making FFL.
