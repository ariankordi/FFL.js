# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## TODO
* Screenshots
* Mention testing with: Three.js versions, browser versions, WebGL versions...
* Explanation of demos

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

If you run into issues with dependencies here, see the FFL-Testing repo.

## ESLint
The only reason this has package.json at the time of writing is for eslint, npm install and run: `eslint`

## Wishlist
* Pass these around rather than using a global:
  - window.Module (Emscripten module)
  - window.FFLTextures (TextureManager)
* Support async Emscripten module (`-s MODULARIZE=1`)
* Throw errors with more specificity ([See FFLSharp's approach for details](https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs))
  - Include reverse enum to string tables for `FFLResult`, `FFLiVerifyReason`
* (Eliminate all memory leaks? Most should be gone now tho)
  - **NOTE**: All console.debug statements should be stripped out when not debugging because they will forever hold whatever is printed.
* (Resolve JSDoc formatting inconsistencies?)

#### Future
* _Port shaders to TSL and use NodeMaterial for WebGPURenderer support(???)_
* **Refactor**: Split code into files, export as ESM module, refactor to TypeScript(???)

# Acknowledgements
* [aboood40091/AboodXD](https://github.com/aboood40091) for the [FFL decompilation and port to RIO](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
* [Nathan Vander Wilt](https://github.com/natevw) for [struct-fu](https://github.com/natevw/struct-fu) (this is using a [fork](https://github.com/ariankordi/struct-fu)).
* [Mister F*cking Doob](https://github.com/mrdoob) himself for [Three.js](https://github.com/mrdoob/three.js).
* Nintendo for making FFL.
