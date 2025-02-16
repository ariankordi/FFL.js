# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## TODO
* Screenshots
* Mention testing with: Three.js versions, browser versions, WebGL versions...
* Explanation of demos

## Building

This library depnds on FFL built for Emscripten (in WASM). This import is called `ffl-emscripten.js`/`.wasm`, here's how to build it.

0. You will need to make sure [emsdk](https://emscripten.org/docs/tools_reference/emsdk.html) (or otherwise) is installed and you can build binaries with Emscripten. This is left as an exercise to the reader, but don't forget to activate your emsdk environment.

1. Pull FFL and its dependencies. For simplicity, you can actually just pull FFL-Testing which has all of them.

```
git clone --recursive https://github.com/ariankordi/FFL-Testing
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

(You may want to use -DFFL_NO_NINTEXUTILS=ON if you don't have it or want a smaller build but you will not be able to use Wii U resources)

4. If that worked, find and copy the library.
* It should be sitting in `build-em` (or whatever you chose) as:
  - `ffl-emscripten.js`, `ffl-emscripten.wasm`
  - (Note that if you build with `-DFFL_BUILD_WASM=OFF`, you can build to JS only, which may be more convenient/compatible at 2x the size of the wasm binary.)

5. Finally, in order to use the library, you'll need an FFL resource such as `FFLResHigh.dat`, `AFLResHigh_2_3.dat`, etc.
  - See the ffl or FFL-Testing repo to know how to acquire this.

If you run into issues with dependencies here, see the FFL-Testing repo.

## ESLint
The only reason this has package.json at the time of writing is for eslint, npm install and run: `eslint`

## Wishlist
* **TODO: Remove all memory and resource leaks.**'
  - More debug logging will help with this.
* Diagnose why mipmaps are not being correctly added to textures.
* Pass these around rather than using a global:
    - window.Module (Emscripten module)
    - window.FFLTextures (TextureManager)
* Support async Emscripten module (`-s MODULARIZE=1`)
* Throw errors with more specificity ([See FFLSharp's approach for details](https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs))
* (Resolve JSDoc formatting inconsistencies?)

#### Future
* _Port shaders to TSL and use NodeMaterial for WebGPURenderer support(???)_
* **Refactor** to split out the codebase, or TypeScript.

# Acknowledgements
* [aboood40091/AboodXD](https://github.com/aboood40091) for the [FFL decompilation and port to RIO](https://github.com/aboood40091/ffl/tree/nsmbu-win-port).
* [Nathan Vander Wilt](https://github.com/natevw) for [struct-fu](https://github.com/natevw/struct-fu) (this is using a [fork](https://github.com/ariankordi/struct-fu)).
* [Mister F*cking Doob](https://github.com/mrdoob) himself for [Three.js](https://github.com/mrdoob/three.js).
* Nintendo for making FFL.
