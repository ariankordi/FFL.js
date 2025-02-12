# FFL.js
JavaScript bindings to use FFL, the Wii U Mii renderer decompilation, in Three.js.

## TODO!!!!!!!!!!!!!!
* Everything
* Build command (current): `emcc -g3 -I/home/arian/Downloads/rio/include -I/home/arian/Downloads/ffl/include -I/home/arian/Downloads/ninTexUtils/include -DRIO_DEBUG -DFFL_USE_TEXTURE_CALLBACK -DFFL_NO_RENDER_TEXTURE -DRIO_NO_GL_LOADER -include GLES2/gl2.h -include GLES2/gl2ext.h -DRIO_GLES (find ~/Downloads/ffl/src/ -name '*.cpp') -std=c++17 -DRIO_NO_GLFW_CALLS -DRIO_NO_CONTROLLERS_WIN -DRIO_NO_CLIP_CONTROL -DFFL_NO_DATABASE_FILE -DFFL_NO_MIDDLE_DB -DFFL_NO_DATABASE_RANDOM -DFFL_NO_FS -DRIO_NO_TEXTURE2D_FILE_CTOR -DFFL_NO_DRAW_MASK_ALPHA_VALUES ~/Downloads/ninTexUtils/src/ninTexUtils/gx2/gx2Surface.cpp ~/Downloads/ninTexUtils/src/ninTexUtils/gx2/tcl/addrlib.cpp -sUSE_ZLIB=1 -sALLOW_MEMORY_GROWTH -s EXPORTED_RUNTIME_METHODS=addFunction -s ALLOW_TABLE_GROWTH=1 -s EXPORTED_FUNCTIONS=['_malloc','_free','_FFLInitRes','_FFLInitResGPUStep','_FFLInitCharModelCPUStep','_FFLDeleteCharModel','_FFLSetExpression','_FFLExit','_FFLSetNormalIsSnorm8_8_8_8','_FFLSetTextureCallback','_FFLGetAdditionalInfo','_FFLiInvalidatePartsTextures','_FFLiInvalidateTempObjectFacelineTexture','_FFLiDeleteTempObjectFacelineTexture','_FFLiInvalidateRawMask','_FFLiDeleteTempObjectMaskTextures','_FFLiDeleteTextureTempObject'] -s MALLOC=emmalloc -s ENVIRONMENT=web -s EXIT_RUNTIME=0 -s WASM=1 -o ffl-module-g3.js -s EXPORTED_RUNTIME_METHODS=addFunction -s ALLOW_TABLE_GROWTH=1`

Just using this repo to store WIP versions at the moment.

### ESLint
The only reason this has package.json at the time of writing is for eslint, npm install and run: `eslint`
