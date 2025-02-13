// // ---------------------------------------------------------------------
// //                          FFL LIBRARY SECTION
// // ---------------------------------------------------------------------

// ---------------------- FFL STRUCT & CONSTANTS DEFINITIONS ------------------

const FFLiShapeType = {
	OPA_BEARD: 0,
	OPA_FACELINE: 1,
	OPA_HAIR_NORMAL: 2,
	OPA_FOREHEAD_NORMAL: 3,
	XLU_MASK: 4,
	XLU_NOSELINE: 5,
	OPA_NOSE: 6,
	OPA_HAT_NORMAL: 7,
	XLU_GLASS: 8,
	OPA_HAIR_CAP: 9,
	OPA_FOREHEAD_CAP: 10,
	OPA_HAT_CAP: 11,
	MAX: 12
};

const FFLAttributeBufferType = {
	POSITION: 0,
	TEXCOORD: 1,
	NORMAL: 2,
	TANGENT: 3,
	COLOR: 4,
	MAX: 5
};

const FFLCullMode = {
	NONE: 0,
	BACK: 1,
	FRONT: 2,
	MAX: 3
};

const FFLModulateMode = {
	CONSTANT: 0, // No Texture,  Has Color (R)
	TEXTURE_DIRECT: 1, // Has Texture, No Color
	RGB_LAYERED: 2, // Has Texture, Has Color (R + G + B)
	ALPHA: 3, // Has Texture, Has Color (R)
	LUMINANCE_ALPHA: 4, // Has Texture, Has Color (R)
	ALPHA_OPA: 5 // Has Texture, Has Color (R)
};

const FFLModulateType = {
	SHAPE_FACELINE: 0,
	SHAPE_BEARD: 1,
	SHAPE_NOSE: 2,
	SHAPE_FOREHEAD: 3,
	SHAPE_HAIR: 4,
	SHAPE_CAP: 5,
	SHAPE_MASK: 6,
	SHAPE_NOSELINE: 7,
	SHAPE_GLASS: 8,
	MUSTACHE: 9,
	MOUTH: 10,
	EYEBROW: 11,
	EYE: 12,
	MOLE: 13,
	FACE_MAKE: 14,
	FACE_LINE: 15,
	FACE_BEARD: 16,
	FILL: 17,
	SHAPE_MAX: 9
};

const FFLExpression = {
	NORMAL: 0,
	MAX: 70
};

const FFLModelFlag = {
	NORMAL: 1 << 0,
	HAT: 1 << 1, // Uses a variant of hair designed for hats.
	FACE_ONLY: 1 << 2, // Discards hair from the model for helmets, etc.
	FLATTEN_NOSE: 1 << 3, // Limits the Z depth on a nose for helmets, etc.
	NEW_EXPRESSIONS: 1 << 4, // Enables expression flag to use beyond 32 expressions.
	// This flag will only make new textures
	// when initializing a CharModel and not
	// initialize shapes. Note that this means
	// you cannot DrawOpa/Xlu when this is set.
	NEW_MASK_ONLY: 1 << 5
};

const FFLAttributeBuffer = _.struct([
	_.uint32le('size'),
	_.uint32le('stride'),
	_.uintptr('ptr')
]);

const FFLAttributeBufferParam = _.struct([
	_.struct('attributeBuffers', [FFLAttributeBuffer], 5)
]);

const FFLPrimitiveParam = _.struct([
	_.uint32le('primitiveType'),
	_.uint32le('indexCount'),
	_.uint32le('_8'),
	_.uintptr('pIndexBuffer')
]);

const FFLColor = _.struct([
	_.float32le('r'),
	_.float32le('g'),
	_.float32le('b'),
	_.float32le('a')
]);

const FFLModulateParam = _.struct([
	_.uint32le('mode'),
	_.uint32le('type'),
	_.uintptr('pColorR'),
	_.uintptr('pColorG'),
	_.uintptr('pColorB'),
	_.uintptr('pTexture2D')
]);

const FFLDrawParam = _.struct([
	_.struct('attributeBufferParam', [FFLAttributeBufferParam]),
	_.struct('modulateParam', [FFLModulateParam]),
	_.uint32le('cullMode'),
	_.struct('primitiveParam', [FFLPrimitiveParam])
]);

const FFLCreateID = _.struct([
	_.uint8('data', 10)
]);

const FFLiCharInfo = _.struct([
	_.int32le('miiVersion'),
	_.struct('faceline', [_.int32le('type'), _.int32le('color'),
		_.int32le('texture'), _.int32le('make')]),
	_.struct('hair', [_.int32le('type'), _.int32le('color'), _.int32le('flip')]),
	_.struct('eye', [_.int32le('type'), _.int32le('color'), _.int32le('scale'),
		_.int32le('aspect'), _.int32le('rotate'),
		_.int32le('x'), _.int32le('y')]),
	_.struct('eyebrow', [_.int32le('type'), _.int32le('color'),
		_.int32le('scale'), _.int32le('aspect'),
		_.int32le('rotate'), _.int32le('x'),
		_.int32le('y')]),
	_.struct('nose', [_.int32le('type'), _.int32le('scale'),
		_.int32le('y')]),
	_.struct('mouth', [_.int32le('type'), _.int32le('color'),
		_.int32le('scale'), _.int32le('aspect'),
		_.int32le('y')]),
	_.struct('beard', [_.int32le('mustache'), _.int32le('type'),
		_.int32le('color'), _.int32le('scale'),
		_.int32le('y')]),
	_.struct('glass', [_.int32le('type'), _.int32le('color'),
		_.int32le('scale'), _.int32le('y')]),
	_.struct('mole', [_.int32le('type'), _.int32le('scale'),
		_.int32le('x'), _.int32le('y')]),
	_.struct('body', [_.int32le('height'), _.int32le('build')]),
	_.struct('personal', [
		_.char16le('name', 22),
		_.char16le('creator', 22),
		_.int32le('gender'),
		_.int32le('birthMonth'),
		_.int32le('birthDay'),
		_.int32le('favoriteColor'),
		_.uint8('favorite'),
		_.uint8('copyable'),
		_.uint8('ngWord'),
		_.uint8('localonly'),
		_.int32le('regionMove'),
		_.int32le('fontRegion'),
		_.int32le('roomIndex'),
		_.int32le('positionInRoom'),
		_.int32le('birthPlatform')
	]),
	_.struct('createID', [FFLCreateID]),
	_.uint16le('padding_0'),
	_.int32le('authorType'),
	_.uint8('authorID', 8)
]);

const FFLAdditionalInfo = _.struct([
	_.char16le('name', 22),
	_.char16le('creator', 22),
	_.struct('createID', [FFLCreateID]),
	_.byte('_padding0', 2), // alignment
	_.struct('skinColor', [FFLColor]),
	_.uint32le('flags'),
	// _.ubitLE('hairFlip', 1),
	// _.ubitLE('fontRegion', 2),
	// _.ubitLE('ngWord', 1),
	// _.ubitLE('build', 7),
	// _.ubitLE('height', 7),
	// _.ubitLE('favoriteColor', 4),
	// _.ubitLE('birthDay', 5),
	// _.ubitLE('birthMonth', 4),
	// _.ubitLE('gender', 1),
	_.uint8('facelineType'),
	_.uint8('hairType'),
	_.byte('_padding1', 2) // alignment
]);

const FFLiRenderTexture = _.struct([
	// STUB: four pointers in one field
	_.uintptr('pTexture2DRenderBufferColorTargetDepthTarget', 4)
]);

const FFLiFacelineTextureTempObject = _.struct([
	_.uintptr('pTextureFaceLine'),
	_.struct('drawParamFaceLine', [FFLDrawParam]),
	_.uintptr('pTextureFaceMake'),
	_.struct('drawParamFaceMake', [FFLDrawParam]),
	_.uintptr('pTextureFaceBeard'),
	_.struct('drawParamFaceBeard', [FFLDrawParam]),
	_.uintptr('pRenderTextureCompressorParam', 2) // stub
]);

const FFLiRawMaskDrawParam = _.struct([
	_.struct('drawParamRawMaskPartsEye', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsEyebrow', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsMouth', [FFLDrawParam]),
	_.struct('drawParamRawMaskPartsMustache', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsMole', [FFLDrawParam]),
	_.struct('drawParamRawMaskPartsFill', [FFLDrawParam])
]);

const FFLiMaskTexturesTempObject = _.struct([
	_.uint8('partsTextures', 0x154),
	_.uintptr('pRawMaskDrawParam', FFLExpression.MAX),
	_.byte('_remaining', 0x388 - 620)
]);

const FFLiTextureTempObject = _.struct([
	_.struct('maskTextures', [FFLiMaskTexturesTempObject]),
	_.struct('facelineTexture', [FFLiFacelineTextureTempObject])
]);

const FFLiMaskTextures = _.struct([
	_.uintptr('pRenderTextures', FFLExpression.MAX)
]);

const FFL_RESOLUTION_MASK = 0x3fffffff;
const FFLCharModelDesc = _.struct([
	_.uint32le('resolution'),
	_.uint32le('allExpressionFlag', 3),
	_.uint32le('modelFlag'),
	_.uint32le('resourceType')
]);

const FFLiCharModel = _.struct([
	_.struct('charInfo', [FFLiCharInfo]),
	_.struct('charModelDesc', [FFLCharModelDesc]),
	_.uint32le('expression'),
	_.uintptr('pTextureTempObject'),
	_.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX),
	_.uintptr('pShapeData', FFLiShapeType.MAX),
	_.struct('facelineRenderTexture', [FFLiRenderTexture]),
	_.uintptr('pCapGlassNoselineTextures', 3),
	_.struct('maskTextures', [FFLiMaskTextures]),
	_.byte('_remaining', 0x848 - 172)
]);

const FFLDataSource = {
	OFFICIAL: 0,
	DEFAULT: 1,
	MIDDLE_DB: 2,
	STORE_DATA_OFFICIAL: 3,
	STORE_DATA: 4,
	BUFFER: 5,
	DIRECT_POINTER: 6
};

const FFLCharModelSource = _.struct([
	_.uint32le('dataSource'),
	_.uintptr('pBuffer'),
	_.uint16le('index')
]);

const FFLResourceType = {
	MIDDLE: 0,
	HIGH: 1,
	MAX: 2
};

const FFLResourceDesc = _.struct([
	_.uintptr('pData', FFLResourceType.MAX),
	_.uint32le('size', FFLResourceType.MAX)
]);

// ------------------------- TEXTURE CALLBACK STRUCTS -------------------------
const FFLTextureFormat = {
	R8_UNORM: 0,
	R8_G8_UNORM: 1,
	R8_G8_B8_A8_UNORM: 2,
	MAX: 3
};

const FFLTextureInfo = _.struct([
	_.uint16le('width'),
	_.uint16le('height'),
	_.uint8('mipCount'),
	_.uint8('format'),
	_.uint8('isGX2Tiled'),
	_.byte('_padding', 1),
	_.uint32le('imageSize'),
	_.uintptr('imagePtr'),
	_.uint32le('mipSize'),
	_.uintptr('mipPtr'),
	_.uint32le('mipLevelOffset', 13)
]);

const FFLTextureCallback = _.struct([
	_.uintptr('pObj'),
	_.uint8('useOriginalTileMode'),
	_.byte('_padding', 3),
	_.uintptr('pCreateFunc'),
	_.uintptr('pDeleteFunc')
]);

// ------------------------ CLASS: TextureManager -----------------------------
/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 */
class TextureManager {
	/**
	 * @param {Object} [module=window.Module] - The Emscripten module.
	 */
	constructor(module = window.Module) {
		this.module = module;
		this.textures = new Map(); // Internal map of texture id -> THREE.Texture.
		this.textureCallbackPtr = null;
		this._setupTextureCallbacks();
	}

	// Sets up texture creation and deletion callbacks with WASM.
	_setupTextureCallbacks() {
		const mod = this.module;
		// Bind the callbacks to this instance.
		this.createCallback = mod.addFunction(this._textureCreateFunc.bind(this), 'viii');
		this.deleteCallback = mod.addFunction(this._textureDeleteFunc.bind(this), 'vii');
		const textureCallback = {
			pObj: 0,
			useOriginalTileMode: false,
			_padding: [0, 0, 0],
			pCreateFunc: this.createCallback,
			pDeleteFunc: this.deleteCallback
		};
		const packed = FFLTextureCallback.pack(textureCallback);
		this.textureCallbackPtr = mod._malloc(FFLTextureCallback.size);
		mod.HEAPU8.set(new Uint8Array(packed), this.textureCallbackPtr);
		mod._FFLSetTextureCallback(this.textureCallbackPtr);
	}

	/**
	 * @param {number} format - Enum value for FFLTextureFormat.
	 * @returns {number|null} - Three.js texture format constant.
	 */
	_getTextureFormat(format) {
		// Map FFLTextureFormat to Three.js texture formats.
		const textureFormatToThreeFormat = {
			// [FFLTextureFormat.R8_UNORM]: THREE.LuminanceFormat,
			[FFLTextureFormat.R8_UNORM]: THREE.RedFormat,
			// [FFLTextureFormat.R8_G8_UNORM]: THREE.LuminanceAlphaFormat,
			[FFLTextureFormat.R8_G8_UNORM]: THREE.RGFormat,
			[FFLTextureFormat.R8_G8_B8_A8_UNORM]: THREE.RGBAFormat
		};
		// TODO: Only LuminanceFormat/LuminanceAlphaFormat are supported
		// on WebGL 1.0, but Three.js >r162 doesn't support WebGL 1.0.

		// Determine the data format from the table.
		const dataFormat = textureFormatToThreeFormat[format];
		if (dataFormat === undefined) {
			throw new Error(`_textureCreateFunc: Unexpected FFLTextureFormat value: ${format}`);
		}
		return dataFormat;
	}

	/**
	 * @param {number} _ - Originally pObj.
	 * @param {number} textureInfoPtr
	 * @param {number} texturePtrPtr
	 * @returns {THREE.Texture}
	 */
	_textureCreateFunc(_, textureInfoPtr, texturePtrPtr) {
		const u8 = this.module.HEAPU8.subarray(textureInfoPtr, textureInfoPtr + FFLTextureInfo.size);
		const textureInfo = FFLTextureInfo.unpack(u8);

		const type = THREE.UnsignedByteType;
		const dataFormat = this._getTextureFormat(textureInfo.format);

		// Copy image data from HEAPU8 via slice. This is base level/mip level 0.
		const imageData = this.module.HEAPU8.slice(textureInfo.imagePtr, textureInfo.imagePtr + textureInfo.imageSize);

		const texture = new THREE.DataTexture(imageData, textureInfo.width, textureInfo.height, dataFormat, type);
		texture.magFilter = THREE.LinearFilter;
		texture.minFilter = THREE.LinearFilter;
		texture.generateMipmaps = false; // We are manually assigning mipmaps.
		// Upload mipmaps if they exist.
		if (textureInfo.mipPtr !== 0 && textureInfo.mipCount > 1) {
			//this._addMipmaps(texture, textureInfo); // TODO: NOT WORKING
		}
		// Use default wrapping options. If the device is WebGL 1.0
		// it may not support NPOT textures with mips and mirrored
		// texture.wrapS = THREE.MirroredRepeatWrapping;
		// texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.needsUpdate = true;
		this.set(texture.id, texture);
		this.module.HEAP32[texturePtrPtr / 4] = texture.id;
		return texture;
	}

	/**
	 * @param {THREE.Texture} texture - Texture to upload mipmaps into.
	 * @param {Object} textureInfo - FFLTextureInfo object representing this texture.
	 */
	_addMipmaps(texture, textureInfo) {
		if (textureInfo.mipPtr === 0 || textureInfo.mipCount < 2) {
			console.warn(`_addMipmaps: No mipmaps available for texture.`);
			return;
		}

		texture.mipmaps = []; // Store mipmaps manually.
		// Iterate through mip levels (starting from level 1)
		for (let mipLevel = 1; mipLevel < textureInfo.mipCount; mipLevel++) {
			const mipOffset = textureInfo.mipLevelOffset[mipLevel - 1];

			const mipWidth = Math.max(1, textureInfo.width >> mipLevel);
			const mipHeight = Math.max(1, textureInfo.height >> mipLevel);

			const mipData = this.module.HEAPU8.slice(textureInfo.mipPtr + mipOffset, textureInfo.mipPtr + mipOffset + (mipWidth * mipHeight * 4)); // 4 bytes per pixel

			console.debug(`- Mip ${mipLevel}: ${mipWidth}x${mipHeight}, offset=${mipOffset}`);

			// Push mipmap level into the texture.
			texture.mipmaps.push({
				data: mipData,
				width: mipWidth,
				height: mipHeight
			});
		}
	}

	/**
	 * @param {number} _ - Originally pObj.
	 * @param {number} texturePtr
	 */
	_textureDeleteFunc(_, texturePtr) {
		const texId = this.module.HEAP32[texturePtr / 4];
		this.delete(texId);
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @returns {THREE.Texture|null}
	 */
	get(id) {
		const texture = this.textures.get(id);
		if (!texture) {
			console.error('Unknown texture', id);
		}
		return texture;
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @param {THREE.Texture} texture - Texture to add.
	 */
	set(id, texture) {
		console.debug('Adding texture ', id);
		this.textures.set(id, texture);
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 */
	delete(id) {
		if (this.textures.has(id)) {
			const texture = this.textures.get(id);
			texture.dispose();
			console.debug('Deleted texture', id);
			this.textures.delete(id);
		}
	}
}

// -------------------------- handleFFLResult(name, result) ---------------------
/**
 * Checks the FFLResult returned from a function and throws an exception
 * if the result is not FFL_RESULT_OK.
 *
 * @param {string} name - The name of the function whose result to check.
 * @param {number} result - The returned FFLResult enum value.
 */
function handleFFLResult(name, result) {
	let error; // Error string to alert() and construct new Error from.
	if (typeof result !== 'number') {
		error = `Unexpected type for FFLResult from ${name}: ${typeof result}`;
	} else if (result !== 0) { // FFL_RESULT_OK
		error = `${name} failed with FFLResult: ${result}`;
	}

	if (error) {
		// Alert and throw Error from string.
		// alert(error);
		throw new Error(error);
	}
	// Result equals 0 (FFL_RESULT_OK), meaning that function succeeded.
}

// --------------------- loadDataIntoHeap(resource, module) ---------------------
/**
 * Loads data from TypedArray or fetch response directly into Emscripten heap.
 * If passed a fetch response, it streams it directly into memory and avoids copying.
 *
 * @param {Uint8Array|Response} resource - The resource data.
 *    - Use a TypedArray if you have the raw bytes.
 *    - Use a fetch Response to stream it directly.
 * @param {Object} module - The Emscripten module instance.
 * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
 */
async function loadDataIntoHeap(resource, module) {
	// These need to be accessible by the catch statement:
	let heapSize;
	let heapPointer;
	try {
		// Copy resource into heap.
		if (resource instanceof Uint8Array) {
			heapSize = resource.length;
			heapPointer = module._malloc(heapSize);
			console.debug(`loadDataIntoHeap: Loading from Uint8Array. Size: ${heapSize}, pointer: ${heapPointer}`);
			// Allocate and set this area in the heap as the passed array.
			module.HEAPU8.set(resource, heapPointer);
		} else if (resource instanceof Response) {
			// Handle as fetch response.
			// Throw an error if it is not a streamable response.
			if (!resource.body) {
				throw new Error('Fetch response is not streamable.');
			}

			// Get the total size of the resource from the headers.
			const contentLength = resource.headers.get('Content-Length');
			if (!contentLength) {
				throw new Error('Fetch response missing Content-Length.');
			}

			heapSize = parseInt(contentLength, 10);
			heapPointer = module._malloc(heapSize); // Allocate to heap

			console.debug(`loadDataIntoHeap: Streaming ${heapSize} bytes from fetch response. URL: ${resource.url}, pointer: ${heapPointer}`);

			// Begin reading.
			const reader = resource.body.getReader();
			let offset = heapPointer;

			// Stream chunks into the heap.
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				} // Break out of the loop.
				// Copy value directly into HEAPU8 with offset.
				module.HEAPU8.set(value, offset);
				offset += value.length;
			}
		} else {
			throw new Error('loadDataIntoHeap: type is not Uint8Array or Response');
		}

		return { pointer: heapPointer, size: heapSize };
	} catch (error) {
		// Free memory upon exception.
		if (heapPointer) {
			module._free(heapPointer);
		} // Free memory if allocated.
		throw error;
	}
}

// ----------------------- initializeFFL(resource, module) ----------------------
/**
 * Initializes FFL by copying a resource (TypedArray or fetch response) into
 * heap and calling FFLInitRes. It will first wait for the module to be ready.
 *
 * @param {Uint8Array|Response} resource - The FFL resource data.
 *    Use a TypedArray if you have the raw bytes, or a fetch response containing
 *    the FFL resource file.
 * @param {Object} [module=window.Module] - The Emscripten module instance.
 * @returns {Promise<void>} Resolves when FFL is fully initialized.
 */
async function initializeFFL(resource, module = window.Module) {
	console.debug('initializeFFL: Called with resource =', resource, ', waiting for module to be ready');

	// Continue when Emscripten module is initialized.
	return new Promise((resolve) => {
		// If onRuntimeInitialized is not defined on module, add it.
		if (!module.onRuntimeInitialized && !module.calledRun) {
			module.onRuntimeInitialized = () => {
				console.debug('initializeFFL: Emscripten runtime initialized, resolving.');
				resolve();
			};
		} else {
			console.debug('initializeFFL: Assuming module is ready.');
			resolve();
		}
	})
		.then(() => {
			return loadDataIntoHeap(resource, module);
		})
		.then(({ pointer: heapPointer, size: heapSize }) => {
			console.debug(`initializeFFL: Resource loaded into heap. Pointer: ${heapPointer}, Size: ${heapSize}`);

			// Pack the resource description into a struct.
			const resourceDesc = { pData: [0, 0], size: [0, 0] };
			// We use resource slot 1.
			resourceDesc.pData[1] = heapPointer;
			resourceDesc.size[1] = heapSize;
			const packed = FFLResourceDesc.pack(resourceDesc);
			const resourceDescPtr = module._malloc(FFLResourceDesc.size);
			module.HEAPU8.set(packed, resourceDescPtr);

			// Call FFL initialization.
			const result = module._FFLInitRes(0, resourceDescPtr);
			handleFFLResult('FFLInitRes', result); // Check result.

			module._FFLInitResGPUStep(); // CanInitCharModel will fail if not called.

			module._FFLSetNormalIsSnorm8_8_8_8(1); // Set normal format to FFLiSnorm8_8_8_8.
			module._free(resourceDescPtr); // Free FFLResourceDesc, unused after init
		})
		.catch((error) => {
			console.error('initializeFFL failed:', error);
			throw error;
		});
/*
		// Wait for Emscripten runtime initialization if necessary.
		if (module.onRuntimeInitialized) {
			module.onRuntimeInitialized = () => {
				console.debug('initializeFFL: Callback from onRuntimeInitialized, resolving');
				resolve();
			};
		} else {
			console.debug('module.onRuntimeInitialized not defined, assuming module is ready.');
			resolve();
		}
*/
}

// --------------------------- CLASS: CharModel -------------------------------
/**
 * Represents a character model created via FFL.
 * Encapsulates a pointer to the underlying FFLiCharModel and provides helper methods.
 */
class CharModel {
	/**
	 * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
	 * @param {Object} [module=window.Module] - The Emscripten module.
	 * @param {Function} materialClass - The material constructor (e.g., FFLShaderMaterial).
	 */
	constructor(ptr, module = window.Module, materialClass = window.FFLShaderMaterial) {
		this._module = module;
		this._materialClass = materialClass; // Store the material class.
		this.ptr = ptr;
		// Unpack the FFLiCharModel structure from heap.
		this._model = FFLiCharModel.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiCharModel.size));
		/** @type {Array<THREE.Mesh>} */
		this.meshes = []; // THREE.Mesh objects representing each shape.
		// Retrieve additional character info (e.g., skin color).
		this.additionalInfo = this._getAdditionalInfo();
		this.maskTextures = new Array(FFLExpression.MAX).fill(null);
		this.expression = this._model.expression;
	}

	// Get pointer to the texture temp object.
	_getTextureTempObjectPtr() {
		// console.debug(`_getTextureTempObjectPtr: pTextureTempObject = ${this._model.pTextureTempObject}, pCharModel = ${this.ptr}`);
		return this._model.pTextureTempObject;
	}

	// Unpack and return the texture temp object.
	_getTextureTempObject() {
		const ptr = this._getTextureTempObjectPtr();
		return FFLiTextureTempObject.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiTextureTempObject.size));
	}

	// Retrieve additional info (e.g. skin color) from FFL.
	_getAdditionalInfo() {
		const mod = this._module;
		const addInfoPtr = mod._malloc(FFLAdditionalInfo.size);
		const result = mod._FFLGetAdditionalInfo(addInfoPtr, FFLDataSource.BUFFER, this.ptr, 0, false);
		handleFFLResult('FFLGetAdditionalInfo', result);
		const info = FFLAdditionalInfo.unpack(mod.HEAPU8.subarray(addInfoPtr, addInfoPtr + FFLAdditionalInfo.size));
		mod._free(addInfoPtr);
		return info;
	}

	// Get pointer to the parts textures (for mask invalidation).
	_getPartsTexturesPtr() {
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset +
			FFLiMaskTexturesTempObject.fields.partsTextures.offset;
	}

	// Get pointer to the faceline temp object.
	_getFacelineTempObjectPtr() {
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.facelineTexture.offset;
	}

	// Get pointer to the mask temp object.
	_getMaskTempObjectPtr() {
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset;
	}

	// Get the resolution from the model descriptor.
	_getResolution() {
		return this._model.charModelDesc.resolution & FFL_RESOLUTION_MASK;
	}

	/**
	 * Finalizes the CharModel.
	 * Frees and deletes the CharModel right after generating textures.
	 * This is **not** the same as `dispose()` which cleans up the scene.
	 */
	_finalizeCharModel() {
		if (!this.ptr) {
			return;
		}
		this._module._FFLDeleteCharModel(this.ptr);
		this._module._free(this.ptr);
		this.ptr = null;
	}

	/**
	 * Disposes the CharModel and removes all associated resources.
	 * - Disposes materials and geometries.
	 * - Deletes faceline texture if it exists.
	 * - Deletes all mask textures.
	 * - Removes all meshes from the scene.
	 */
	dispose() {
		this._finalizeCharModel(); // Should've be called already
		// Dispose meshes (materials, geometries)
		this.meshes.forEach((mesh) => {
			if (!mesh) {
				return;
			}
			if (mesh.material) {
				mesh.material.dispose();
			}
			if (mesh.geometry) {
				mesh.geometry.dispose();
			}
		});
		// Delete faceline texture if it exists
		if (this.facelineTexture) {
			window.FFLTextures.delete(this.facelineTexture);
			/** @type {THREE.Texture|null} */
			this.facelineTexture = null;
		}
		// Delete all mask textures
		for (let i = 0; i < this.maskTextures.length; i++) {
			if (this.maskTextures[i]) {
				window.FFLTextures.delete(this.maskTextures[i]);
				this.maskTextures[i] = null;
			}
		}
	}

	/**
	 * Sets the expression for this CharModel and updates the corresponding mask texture.
	 * @param {number} expression - The new expression index.
	 */
	setExpression(expression) {
		this.expression = expression;
		const texId = this.maskTextures[expression];
		const texture = window.FFLTextures.get(texId);
		if (this.meshes[FFLiShapeType.XLU_MASK]) {
			this.meshes[FFLiShapeType.XLU_MASK].material.map = texture;
			this.meshes[FFLiShapeType.XLU_MASK].material.needsUpdate = true;
		}
	}

	/**
	 * Gets the favorite color for this CharModel.
	 * @returns {THREE.Vector4} The favorite color as Vector4.
	 */
	getFavoriteColor() {
		const mod = this._module;
		const favoriteColor = this._model.charInfo.personal.favoriteColor;
		const colorPtr = mod._malloc(FFLColor.size); // Allocate return pointer.
		mod._FFLGetFavoriteColor(colorPtr, favoriteColor); // Get favoriteColor from CharInfo.
		const color = getVector4FromFFLColorPtr(colorPtr, mod);
		mod._free(colorPtr);
		return color;
	}
}

// --------------------- setFaceline FUNCTION (public API) ---------------------
/**
 * Sets the faceline texture of the given CharModel.
 * @param {number} facelineID - ID of the faceline texture.
 * @param {CharModel} charModel - The CharModel instance.
 */
function setFaceline(facelineID, charModel) {
	const texture = window.FFLTextures.get(facelineID);
	if (charModel.meshes[FFLiShapeType.OPA_FACELINE]) {
		charModel.meshes[FFLiShapeType.OPA_FACELINE].material.map = texture;
		charModel.meshes[FFLiShapeType.OPA_FACELINE].material.needsUpdate = true;
	}
}

// --------------------- makeExpressionFlag(expressions) ----------------------
/**
 * Computes a flag by OR-ing (1 << expression) for each expression in the array.
 * @param {number[]} expressions - Array of expression numbers.
 * @returns {number} The combined expression flag.
 */
function makeExpressionFlag(expressions) {
	return expressions.reduce((flag, expr) => flag | (1 << expr), 0);
}

// ---------------- createCharModel(data, desc, materialClass, module) ------------
/**
 * Creates a CharModel from data and FFLCharModelDesc.
 *
 * @param {Uint8Array} data - Raw charInfo data (length must be ≤ FFLiCharInfo.size).
 * @param {Object} modelDesc - The model description.
 * @param {Function} materialClass - Constructor for the material (e.g. FFLShaderMaterial).
 * @param {Object} [module=window.Module] - The Emscripten module.
 * @returns {CharModel} The new CharModel instance.
 */
function createCharModel(data, modelDesc, materialClass, module = window.Module) {
	// Allocate memory for model source, description, char model, and char info.
	const modelSourcePtr = module._malloc(FFLCharModelSource.size);
	const modelDescPtr = module._malloc(FFLCharModelDesc.size);
	const charModelPtr = module._malloc(FFLiCharModel.size);
	const charInfoPtr = module._malloc(FFLiCharInfo.size);

	module.HEAPU8.set(data, charInfoPtr); // Copy data into heap.
	// Create modelSource; if data length is less than FFLiCharInfo.size, use STORE_DATA.
	const modelSource = {
		dataSource: (data.length === FFLiCharInfo.size ? FFLDataSource.BUFFER : FFLDataSource.STORE_DATA),
		pBuffer: charInfoPtr,
		index: 0
	};
	const modelSourceBuffer = FFLCharModelSource.pack(modelSource);
	module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);

	// HACK: Patch CharInfo fields to pass verification.
	if (modelSource.dataSource === FFLDataSource.BUFFER) {
		module.HEAPU8[charInfoPtr + FFLiCharInfo.fields.createID.offset + 0] = 0x70;
		// Fill in first byte of CreateID, 0x70 = 0b01110000 / Wii U Temporary ^^^^
		const nameOffset = charInfoPtr + FFLiCharInfo.fields.personal.offset +
			FFLiCharInfo.fields.personal.fields.name.offset + 0;
		if (module.HEAPU16[nameOffset / 2] === 0) {
			module.HEAPU16[nameOffset / 2] = '!'.charCodeAt(0);
			// Fill in first char in nickname ^
		}
	}
	if (data.length === FFLiCharInfo.size) {
		const charInfoUnpacked = FFLiCharInfo.unpack(data);
		console.debug('createCharModel: Passed in CharInfo:', charInfoUnpacked);
	}
	const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
	module.HEAPU8.set(modelDescBuffer, modelDescPtr);
	try {
		// Call FFLInitCharModelCPUStep and check the result.
		const result = module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		handleFFLResult('FFLInitCharModelCPUStep', result);
	} catch (error) {
		// Free all resources upon exception.
		module._free(modelSourcePtr);
		module._free(modelDescPtr);
		module._free(charInfoPtr);
		module._free(charModelPtr);
		throw error;
	}
	// Free temporary allocations.
	module._free(modelSourcePtr);
	module._free(modelDescPtr);
	module._free(charInfoPtr);

	// Create the CharModel instance.
	const charModel = new CharModel(charModelPtr, module, materialClass);
	// For each shape type, convert its drawParam into a THREE.Mesh.
	for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
		const drawParam = charModel._model.drawParam[shapeType];
		if (drawParam.primitiveParam.indexCount !== 0) {
			const mesh = drawParamToMesh(drawParam, charModel._materialClass, module);
			if (mesh) {
				mesh.renderOrder = drawParam.modulateParam.type;
				charModel.meshes.push(mesh);
			} else {
				charModel.meshes.push(null);
			}
		} else {
			charModel.meshes.push(null);
		}
	}
	console.debug(`createCharModel: Initialized with ptr ${charModel.ptr} for "${charModel._model.charInfo.personal.name}"`, charModel);
	return charModel;
}

// ----------------- drawParamToMesh(drawParam, materialClass, module) -----------
/**
 * Converts FFLDrawParam into a THREE.Mesh.
 * Binds geometry, texture, and material parameters.
 *
 * @param {Object} drawParam - The DrawParam representing the mesh.
 * @param {Function} materialClass - Material constructor.
 * @param {Object} module - The Emscripten module.
 * @returns {THREE.Mesh|null}
 */
function drawParamToMesh(drawParam, materialClass, module) {
	if (!drawParam || drawParam.primitiveParam.indexCount === 0) {
		return null;
	}
	// Bind geometry data.
	const geometry = _bindDrawParamGeometry(drawParam, module);
	// Determine cull mode by mapping FFLCullMode to THREE.Side.
	const cullModeToThreeSide = {
		[FFLCullMode.NONE]: THREE.DoubleSide,
		[FFLCullMode.BACK]: THREE.FrontSide,
		[FFLCullMode.FRONT]: THREE.BackSide,
		// Used by faceline/mask 2D planes for some reason:
		[FFLCullMode.MAX]: THREE.DoubleSide
	};
	const side = cullModeToThreeSide[drawParam.cullMode];
	if (side === undefined) {
		throw new Error(`drawParamToMesh: Unexpected value for FFLCullMode: ${drawParam.cullMode}`);
	}
	// Create object for material parameters.
	const materialParam = {
		side: side,
		// Apply modulateParam, including binding the texture.
		..._applyModulateParam(drawParam.modulateParam, module)
	};
	// Create material using the provided materialClass.
	const material = new materialClass(materialParam);
	// Create mesh and set userData.modulateType.
	const mesh = new THREE.Mesh(geometry, material);
	// TODO: Only putting it in geometry because FFL-Testing does the same.
	mesh.geometry.userData.modulateType = drawParam.modulateParam.type;
	return mesh;
}

// --------------- _bindDrawParamGeometry(drawParam, module) ------------------
/**
 * Binds geometry attributes from drawParam into a THREE.BufferGeometry.
 * @param {Object} drawParam - The DrawParam representing the mesh.
 * @param {Object} module - The Emscripten module from which to read the heap.
 * @returns {THREE.BufferGeometry} The geometry.
 */
function _bindDrawParamGeometry(drawParam, module) {
	const attributes = drawParam.attributeBufferParam.attributeBuffers;
	const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
	if (positionBuffer.size === 0) {
		console.error('Missing position data in drawParam');
		return null;
	}
	const posPtr = positionBuffer.ptr / 4;
	const vertexCount = positionBuffer.size / positionBuffer.stride;
	const positions = module.HEAPF32.subarray(posPtr, posPtr + (vertexCount * 4));
	const geometry = new THREE.BufferGeometry();
	const interleavedBuffer = new THREE.InterleavedBuffer(positions, 4);
	geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0));
	// Bind index data.
	const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
	const indexCount = drawParam.primitiveParam.indexCount;
	const indices = module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
	geometry.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1));
	// Process additional attributes.
	Object.entries(attributes).forEach(([typeStr, buffer]) => {
		const type = parseInt(typeStr);
		if (buffer.size === 0 && type !== FFLAttributeBufferType.POSITION) {
			return;
		}
		switch (type) {
			case FFLAttributeBufferType.NORMAL:
			case FFLAttributeBufferType.TANGENT: {
				const data = module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute(
					type === FFLAttributeBufferType.NORMAL ? 'normal' : 'tangent',
					new THREE.Int8BufferAttribute(data, buffer.stride, true)
				);
				break;
			}
			case FFLAttributeBufferType.TEXCOORD: {
				const texcoords = module.HEAPF32.subarray(buffer.ptr / 4, buffer.ptr / 4 + vertexCount * 2);
				geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texcoords, buffer.stride / 4));
				break;
			}
			case FFLAttributeBufferType.COLOR: {
				if (buffer.stride === 0) {
					break;
				}
				// Use "_color" because TODO this is what the FFL-Testing exports do
				const colorData = new Uint8Array(module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size));
				geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(colorData, buffer.stride, true));
				break;
			}
		}
	});
	return geometry;
}

// -------------------- _getTextureFromModulateParam(modulateParam) ----------------------
/**
 * Retrieves a texture from ModulateParam.
 * Does not assign texture for faceline or mask types.
 *
 * @param {Object} modulateParam - drawParam.modulateParam.
 * @returns {THREE.Texture|null} The texture if found.
 */
function _getTextureFromModulateParam(modulateParam) {
	let texture = null;
	// Only assign texture if pTexture2D is not null.
	if (!modulateParam.pTexture2D ||
		// Ignore faceline and mask.
		modulateParam.type === FFLModulateType.SHAPE_FACELINE ||
		modulateParam.type === FFLModulateType.SHAPE_MASK) {
		return null; // No texture to bind.
	}
	const texturePtr = modulateParam.pTexture2D;
	texture = window.FFLTextures.get(texturePtr) || null;
	if (!texture) {
		console.error('_getTextureFromModulateParam: Texture not found for:', texturePtr);
	}
	// Selective apply mirrored repeat.
	const applyMirrorTypes = [FFLModulateType.SHAPE_FACELINE, FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_GLASS];
	// ^^ Faceline, cap, and glass. NOTE that faceline texture won't go through here
	if (applyMirrorTypes.includes(modulateParam.type)) {
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.needsUpdate = true; // TODO: UNTESTED
	}
	return texture;
}

// -------------- _applyModulateParam(modulateParam, module) --------
/**
 * Returns an object of material parameters based on ModulateParam.
 *
 * @param {Object} modulateParam - drawParam.modulateParam
 * @param {Object} module - The Emscripten module for accessing color pointers via heap.
 * @returns {Object} Parameters for material creation.
 */
function _applyModulateParam(modulateParam, module) {
	// Default modulate color is a Vector4; if provided, extract it.
	let modulateColor = new THREE.Vector4(0, 0, 0, 0);
	if (modulateParam.pColorR !== 0) {
		const colorPtr = modulateParam.pColorR / 4;
		const colorData = module.HEAPF32.subarray(colorPtr, colorPtr + 4);
		modulateColor = new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
	}
	// If both pColorG and pColorB are provided, combine them into an array.
	if (modulateParam.pColorG !== 0 && modulateParam.pColorB !== 0) {
		modulateColor = [
			getVector4FromFFLColorPtr(modulateParam.pColorR, module),
			getVector4FromFFLColorPtr(modulateParam.pColorG, module),
			getVector4FromFFLColorPtr(modulateParam.pColorB, module)
		];
	}
	// Determine whether to enable lighting.
	const lightEnable = !(modulateParam.mode !== FFLModulateMode.CONSTANT &&
		modulateParam.type >= FFLModulateType.SHAPE_MAX);
	// Get texture.
	const texture = _getTextureFromModulateParam(modulateParam);
	return {
		modulateMode: modulateParam.mode,
		modulateType: modulateParam.type,
		modulateColor: modulateColor,
		lightEnable: lightEnable,
		map: texture
	};
}

// ------------------- getVector4FromFFLColorPtr --------------------------------
/**
 * Converts a pointer to FFLColor into a THREE.Vector4.
 *
 * @param {number} colorPtr - The pointer to the color.
 * @param {Object} module - The Emscripten module.
 * @returns {THREE.Vector4}
 */
function getVector4FromFFLColorPtr(colorPtr, module) {
	if (!colorPtr) {
		console.error('getVector4FromFFLColorPtr: Received null pointer');
		return new THREE.Vector4(0, 0, 0, 0);
	}
	const colorData = module.HEAPF32.subarray(colorPtr / 4, colorPtr / 4 + 4);
	return new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
}

// ------------- initCharModelTextures(charModel, renderer, textureManager) -----------
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 *
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @param {TextureManager} textureManager - The TextureManager instance.
 */
function initCharModelTextures(charModel, renderer, textureManager) {
	const module = charModel._module;
	const textureTempObject = charModel._getTextureTempObject();
	// Draw faceline texture if applicable.
	_drawFacelineTexture(charModel, textureTempObject, renderer, textureManager, module);
	// Draw mask textures for all expressions.
	_drawMaskTextures(charModel, textureTempObject, renderer, textureManager, module);
	// Finalize CharModel, deleting and freeing it.
	charModel._finalizeCharModel();
	// Update the expression to refresh the mask texture.
	charModel.setExpression(charModel.expression);
}

/**
 * Draws and applies the faceline texture for the CharModel.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {Object} textureTempObject - The temporary texture object.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {TextureManager} textureManager - The texture manager.
 * @param {Object} module - The Emscripten module.
 */
function _drawFacelineTexture(charModel, textureTempObject, renderer, textureManager, module) {
	// Invalidate faceline texture before drawing (ensures correctness)
	const facelineTempObjectPtr = charModel._getFacelineTempObjectPtr();
	module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
	// Gather the drawParams that make up the faceline texture.
	const drawParams = [
		textureTempObject.facelineTexture.drawParamFaceLine,
		textureTempObject.facelineTexture.drawParamFaceBeard,
		textureTempObject.facelineTexture.drawParamFaceMake
	].filter(dp => dp && dp.primitiveParam.indexCount !== 0);
	if (drawParams.length === 0) {
		console.debug('Skipping faceline texture, DrawParams are empty.');
		return;
	}
	// 2025-02-12: Assertion to help catch some bug from not doing memset on this
	/*
	const charInfo = charModel._model.charInfo;
	if (charInfo.faceline.texture === 0 &&
		charInfo.faceline.make === 0 &&
		// FFL_BEARD_SHAPE_MAX = 4
		charInfo.beard.type < 4) {
		throw new Error('textureTempObject contains faceline textures but CharInfo indicates there is no faceline texture to draw. does textureTempObject ptr not match the actual CharModel?');
	}
	*/
	// Get the faceline color from additionalInfo.
	const facelineColor = charModel.additionalInfo.skinColor;
	const bgColor = new THREE.Color(facelineColor.r, facelineColor.g, facelineColor.b, facelineColor.a);
	// Create an offscreen scene.
	const { scene: offscreenScene } = createOffscreenScene(drawParams, bgColor, module, renderer);
	// Render scene to texture.
	const width = charModel._getResolution() / 2;
	const height = charModel._getResolution();
	// Use mirrored repeat wrapping.
	const options = {
		wrapS: THREE.MirroredRepeatWrapping,
		wrapT: THREE.MirroredRepeatWrapping
	};
	const facelineTexture = render2DSceneToTexture(offscreenScene, width, height, renderer, options);
	if (!facelineTexture) {
		console.error('Failed to generate faceline texture.');
		return;
	}
	// Store texture reference.
	textureManager.set(facelineTexture.id, facelineTexture);
	// For debugging, you can use render2DSceneToImage to view the texture.
	if (document.getElementById('texture-display')) {
		appendImageFromDataUrl(render2DSceneToImage(offscreenScene, width, height, renderer));
	}
	// Apply texture to CharModel.
	setFaceline(facelineTexture.id, charModel);
	// Delete temp faceline object to free resources.
	module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModel.ptr, charModel._model.charModelDesc.resourceType);
	disposeSceneMeshes(offscreenScene); // Dispose meshes in scene.
}

// --------------- _drawMaskTextures(charModel, textureTempObject, ...) -------------
/**
 * Iterates through mask textures and draws each mask texture.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {Object} textureTempObject - The temporary texture object.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {TextureManager} textureManager - The texture manager.
 * @param {Object} module - The Emscripten module.
 */
function _drawMaskTextures(charModel, textureTempObject, renderer, textureManager, module) {
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel.ptr + FFLiCharModel.fields.charModelDesc.offset +
		FFLCharModelDesc.fields.allExpressionFlag.offset;
	// Iterate through pRenderTextures to find out which masks are needed.
	for (let i = 0; i < charModel._model.maskTextures.pRenderTextures.length; i++) {
		const textureId = charModel._model.maskTextures.pRenderTextures[i];
		if (textureId === 0) {
			continue;
		}
		const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
		const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(module.HEAPU8.subarray(rawMaskDrawParamPtr, rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
		module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);
		const id = _drawMaskTexture(charModel, rawMaskDrawParam, renderer, textureManager, module);
		if (typeof id !== 'number') {
			throw new Error('Failed to create mask texture');
		}
		charModel.maskTextures[i] = id;
	}
	module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, charModel._model.charModelDesc.resourceType);
	module._FFLiDeleteTextureTempObject(charModel.ptr);
}

// ---------------- _drawMaskTexture(charModel, rawMaskParam, ...) --------------
/**
 * Draws a single mask texture based on a raw mask draw parameter.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {Object} rawMaskParam - The raw mask draw parameter.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {TextureManager} textureManager - The texture manager.
 * @param {Object} module - The Emscripten module.
 * @returns {number|null} The generated mask texture ID.
 */
function _drawMaskTexture(charModel, rawMaskParam, renderer, textureManager, module) {
	const drawParams = [
		rawMaskParam.drawParamRawMaskPartsMustache[0],
		rawMaskParam.drawParamRawMaskPartsMustache[1],
		rawMaskParam.drawParamRawMaskPartsMouth,
		rawMaskParam.drawParamRawMaskPartsEyebrow[0],
		rawMaskParam.drawParamRawMaskPartsEyebrow[1],
		rawMaskParam.drawParamRawMaskPartsEye[0],
		rawMaskParam.drawParamRawMaskPartsEye[1],
		rawMaskParam.drawParamRawMaskPartsMole
	].filter(dp => dp && dp.primitiveParam.indexCount !== 0);
	if (drawParams.length === 0) {
		console.error('No mask drawParams found');
		return null;
	}
	// Create an offscreen scene with no background (for 2D mask rendering).
	const { scene: offscreenScene } = createOffscreenScene(drawParams, null, module, renderer);
	const width = charModel._getResolution();
	const texture = render2DSceneToTexture(offscreenScene, width, width, renderer);
	if (!texture) {
		console.error('Failed to generate mask texture');
		return null;
	}
	textureManager.set(texture.id, texture);
	// For debugging, you can use render2DSceneToImage to view the texture.
	if (document.getElementById('texture-display')) {
		appendImageFromDataUrl(render2DSceneToImage(offscreenScene, width, width, renderer));
	}
	disposeSceneMeshes(offscreenScene); // Dispose meshes in scene.
	return texture.id;
}

// ------------- createOffscreenScene(drawParams, bgColor, module) --------------
/**
 * Creates an offscreen THREE.Scene from an array of drawParams.
 * This scene is intended for 2D rendering (e.g. for faceline or mask textures).
 *
 * @param {Array} drawParams - Array of draw parameters.
 * @param {THREE.Color|null} bgColor - Optional background color.
 * @param {Object} module - The Emscripten module.
 * @returns {{scene: THREE.Scene, meshes: Array<THREE.Mesh>}}
 */
function createOffscreenScene(drawParams, bgColor, module) {
	const scene = new THREE.Scene();
	// For 2D plane rendering, set the background if provided.
	scene.background = bgColor || null;
	const meshes = [];
	drawParams.forEach((dp) => {
		const mesh = drawParamToMesh(dp, window.FFLShaderMaterial, module);
		if (mesh) {
			scene.add(mesh);
			meshes.push(mesh);
		}
	});
	return { scene, meshes };
}

// -------------- render2DSceneToTexture(scene, width, height, renderer) --------------
/**
 * Renders a THREE.Scene to a texture using an orthographic camera.
 * This function is intended for 2D plane rendering.
 *
 * @param {THREE.Scene} scene - The scene to render.
 * @param {number} width - The texture width.
 * @param {number} height - The texture height.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @param {Object} [targetOptions={}] - Optional parameters for the render target.
 * @returns {THREE.Texture} The generated texture.
 */
function render2DSceneToTexture(scene, width, height, renderer, targetOptions = {}) {
	// Create an orthographic camera with bounds [-1, 1] in x and y.
	const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	tempCamera.position.z = 1;
	const renderTarget = new THREE.WebGLRenderTarget(width, height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		depthBuffer: false,
		stencilBuffer: false,
		...targetOptions // Merge options from arguments.
	});
	const prevTarget = renderer.getRenderTarget();
	renderer.setRenderTarget(renderTarget);
	renderer.render(scene, tempCamera);
	renderer.setRenderTarget(prevTarget);
	return renderTarget.texture;
}

// --------------- disposeSceneMeshes(scene) --------------
/**
 * Disposes all meshes in a scene, freeing memory.
 *
 * @param {THREE.Scene} scene - The scene whose meshes should be disposed.
 */
function disposeSceneMeshes(scene) {
	scene.children.forEach((obj) => {
		if (obj instanceof THREE.Mesh) {
			// Dispose material
			if (obj.material) {
				obj.material.dispose();
			}
			// Dispose geometry
			if (obj.geometry) {
				obj.geometry.dispose();
			}
			// Remove from scene
			scene.remove(obj);
		}
	});
}

// --------------- render2DSceneToImage(scene, width, height) ----------------
/**
 * Renders a 2D scene to an image (data URL). For debugging purposes.
 *
 * @param {THREE.Scene} scene - The scene to render.
 * @param {number} width - The width of the output.
 * @param {number} height - The height of the output.
 * @returns {string} A data URL representing the rendered image.
 */
function render2DSceneToImage(scene, width, height) { // , renderer) {
	// Note: This camera is upside down relative to typical 2D coordinate systems.
	const tempCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, 0.1, 10);
	tempCamera.position.z = 1;
	const tempRenderer = new THREE.WebGLRenderer({ alpha: true });
	tempRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	// should outputColorSpace be set on the main renderer as well?
	tempRenderer.setSize(width, height);
	tempRenderer.render(scene, tempCamera);
	const dataURL = tempRenderer.domElement.toDataURL('image/png');
	tempRenderer.dispose();
	tempRenderer.forceContextLoss();
	return dataURL;
}

/**
 * Appends an image (from a data URL) to a DOM element.
 *
 * @param {string} dataURL - The image data URL.
 * @param {HTMLElement} [container=document.getElementById("texture-display")] - The container element.
 */
function appendImageFromDataUrl(dataURL, container) {
	container = container || document.getElementById('texture-display') || document.body;
	const img = new Image();
	img.src = dataURL;
	img.style.margin = '10px';
	container.appendChild(img);
}

// ------------- updateCharModel(charModel, data, descOrExpFlag, renderer) --------------
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 *
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array} newData - The new raw charInfo data.
 * @param {Object|number[]} descOrExpFlag - Either a new FFLCharModelDesc object or an array of expressions.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @returns {CharModel} The updated CharModel instance.
 */
function updateCharModel(charModel, newData, descOrExpFlag, renderer) {
	let newModelDesc;
	if (Array.isArray(descOrExpFlag)) {
		// If an array is passed, treat it as a new expression flag.
		const newFlag = makeExpressionFlag(descOrExpFlag);
		// Inherit the CharModelDesc from the current model.
		newModelDesc = charModel._model.charModelDesc;
		newModelDesc.allExpressionFlag = [newFlag, 0, 0];
	} else {
		newModelDesc = descOrExpFlag;
	}
	const materialClass = charModel._materialClass;
	const module = charModel._module;
	// Dispose of the old CharModel.
	charModel.dispose();
	// Create a new CharModel with the new data and ModelDesc.
	const newCharModel = createCharModel(newData, newModelDesc, materialClass, module);
	// Initialize its textures.
	initCharModelTextures(newCharModel, renderer, window.FFLTextures);
	return newCharModel;
}

// // ---------------------------------------------------------------------
// //                        Conversion Utilities
// // ---------------------------------------------------------------------

// Structure representing data from the
// studio.mii.nintendo.com site and API.
const StudioCharInfo = _.struct([
	// Fields are named according to nn::mii::CharInfo.
	_.uint8('beardColor'),
	_.uint8('beardType'),
	_.uint8('build'),
	_.uint8('eyeAspect'),
	_.uint8('eyeColor'),
	_.uint8('eyeRotate'),
	_.uint8('eyeScale'),
	_.uint8('eyeType'),
	_.uint8('eyeX'),
	_.uint8('eyeY'),
	_.uint8('eyebrowAspect'),
	_.uint8('eyebrowColor'),
	_.uint8('eyebrowRotate'),
	_.uint8('eyebrowScale'),
	_.uint8('eyebrowType'),
	_.uint8('eyebrowX'),
	_.uint8('eyebrowY'),
	_.uint8('facelineColor'),
	_.uint8('facelineMake'),
	_.uint8('facelineType'),
	_.uint8('facelineWrinkle'),
	_.uint8('favoriteColor'),
	_.uint8('gender'),
	_.uint8('glassColor'),
	_.uint8('glassScale'),
	_.uint8('glassType'),
	_.uint8('glassY'),
	_.uint8('hairColor'),
	_.uint8('hairFlip'),
	_.uint8('hairType'),
	_.uint8('height'),
	_.uint8('moleScale'),
	_.uint8('moleType'),
	_.uint8('moleX'),
	_.uint8('moleY'),
	_.uint8('mouthAspect'),
	_.uint8('mouthColor'),
	_.uint8('mouthScale'),
	_.uint8('mouthType'),
	_.uint8('mouthY'),
	_.uint8('mustacheScale'),
	_.uint8('mustacheType'),
	_.uint8('mustacheY'),
	_.uint8('noseScale'),
	_.uint8('noseType'),
	_.uint8('noseY')
]);

/**
 * Applies (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to indicate to FFL which color table it should use.
 * @param {number} color - The color index to flag.
 * @returns {number} The flagged color index to use in FFLiCharinfo.
 */
const commonColorMask = color => color | (1 << 31);

/**
 * Creates an FFLiCharInfo object from StudioCharInfo.
 *
 * @param {Object} src - The StudioCharInfo instance.
 * @returns {Object} The FFLiCharInfo output.
 */
function convertCharInfoStudioToFFLiCharInfo(src) {
	return {
		miiVersion: 0,
		faceline: {
			type: src.facelineType,
			color: src.facelineColor,
			texture: src.facelineWrinkle,
			make: src.facelineMake
		},
		hair: {
			type: src.hairType,
			color: commonColorMask(src.hairColor),
			flip: src.hairFlip
		},
		eye: {
			type: src.eyeType,
			color: commonColorMask(src.eyeColor),
			scale: src.eyeScale,
			aspect: src.eyeAspect,
			rotate: src.eyeRotate,
			x: src.eyeX,
			y: src.eyeY
		},
		eyebrow: {
			type: src.eyebrowType,
			color: commonColorMask(src.eyebrowColor),
			scale: src.eyebrowScale,
			aspect: src.eyebrowAspect,
			rotate: src.eyebrowRotate,
			x: src.eyebrowX,
			y: src.eyebrowY
		},
		nose: {
			type: src.noseType,
			scale: src.noseScale,
			y: src.noseY
		},
		mouth: {
			type: src.mouthType,
			color: commonColorMask(src.mouthColor),
			scale: src.mouthScale,
			aspect: src.mouthAspect,
			y: src.mouthY
		},
		beard: {
			mustache: src.mustacheType,
			type: src.beardType,
			color: commonColorMask(src.beardColor),
			scale: src.mustacheScale,
			y: src.mustacheY
		},
		glass: {
			type: src.glassType,
			color: commonColorMask(src.glassColor),
			scale: src.glassScale,
			y: src.glassY
		},
		mole: {
			type: src.moleType,
			scale: src.moleScale,
			x: src.moleX,
			y: src.moleY
		},
		body: {
			height: src.height,
			build: src.build
		},
		personal: {
			name: '',
			creator: '',
			gender: src.gender,
			birthMonth: 0,
			birthDay: 0,
			favoriteColor: src.favoriteColor,
			favorite: 0,
			copyable: 0,
			ngWord: 0,
			localonly: 0,
			regionMove: 0,
			fontRegion: 0,
			roomIndex: 0,
			positionInRoom: 0,
			birthPlatform: 0
		},
		createID: {
			data: new Array(10).fill(0)
		},
		padding_0: 0,
		authorType: 0,
		authorID: new Array(8).fill(0)
	};
}

// Utility functions for decoding.

/**
 * Removes all spaces from a string.
 * @param {string} str - The input string.
 * @returns {string} The string without spaces.
 */
const stripSpaces = str => str.replace(/\s+/g, '');

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param {string} hex - The hexadecimal string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
const hexToUint8Array = hex => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

/**
 * Converts a Base64 or Base64-URL encoded string to a Uint8Array.
 * @param {string} base64 - The Base64-encoded string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function base64ToUint8Array(base64) {
  // Replace URL-safe Base64 characters
  const normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if necessary
  const paddedBase64 = normalizedBase64.padEnd(
    normalizedBase64.length + (4 - (normalizedBase64.length % 4)) % 4, '='
  );
  return Uint8Array.from(atob(paddedBase64), c => c.charCodeAt(0));
}

/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Uint8Array} data - The Uint8Array to convert.
 * @returns {string} The Base64-encoded string.
 */
const uint8ArrayToBase64 = data => btoa(String.fromCharCode.apply(null, data));

/**
 * Parses a string containing either a hexadecimal or Base64-encoded representation
 * into a Uint8Array.
 * @param {string} text - The input string, which can be either hex or Base64.
 * @returns {Uint8Array} The parsed Uint8Array.
 */
function parseHexOrB64ToUint8Array(text) {
  let inputData;
  // Decode it to a Uint8Array whether it's hex or Base64
  const textData = stripSpaces(text);
  // Check if it's base 16 exclusively, otherwise assume Base64
  if (/^[0-9a-fA-F]+$/.test(textData)) {
    inputData = hexToUint8Array(textData);
  } else {
    inputData = base64ToUint8Array(textData);
  }
  return inputData;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function studioURLObfuscationDecode(data) {
  const decodedData = new Uint8Array(data);
  const random = decodedData[0];
  let previous = random;

  for (let i = 1; i < 48; i++) {
    const encodedByte = decodedData[i];
    const original = (encodedByte - 7 + 256) % 256;
    decodedData[i - 1] = original ^ previous;
    previous = encodedByte;
  }

  return decodedData.slice(0, StudioCharInfo.size); // Resize to normal studio data
}




// --------------- Main Entry-Point Methods (Scene & Animation) -----------------

// Query selector string for element with "content" attribute for path to the resource.
const querySelectorResourcePath = 'meta[itemprop=ffl-resource-fetch-path]';

// When the DOM is ready, initialize FFL and TextureManager.
async function initializeFFLWithResource() {
	try {
		// Load FFL resource file from meta tag in HTML.
		const resourceFetchElement = document.querySelector(querySelectorResourcePath);
		if (!resourceFetchElement || !resourceFetchElement.getAttribute('content')) {
			throw new Error(`Element not found or does not have "content" attribute with path to FFL resource: ${querySelectorResourcePath}`);
		}
		// URL to resource for FFL.
		const resourcePath = resourceFetchElement.getAttribute('content');
		const response = await fetch(resourcePath); // Fetch resource.
		// Initialize FFL using the resource from fetch response.
		await initializeFFL(response, window.Module);
		// TextureManager must be initialized after FFL.
		window.FFLTextures = new TextureManager(window.Module);
		console.debug('initializeFFLWithResource: FFLiManager and TextureManager initialized, exiting');
	} catch (error) {
		alert(`Error initializing FFL with resource: ${error}`);
		console.error(error);
	}
}

// Variables to track scene, renderer, camera, and the current CharModel
let scene = null;
let renderer = null;
let camera = null;

let isInitialized = false;

function initializeScene() {
	// Create scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xE6E6FA);

	// Create renderer
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio.
	// Set renderer size (example: full window height minus a fixed header).
	renderer.setSize(window.innerWidth, window.innerHeight - 250);
	document.body.appendChild(renderer.domElement);

	// Set up a camera (example perspective camera).
	camera = new THREE.PerspectiveCamera(15, window.innerWidth / (window.innerHeight - 250), 10, 1000);
	camera.position.set(0, 40, 450);

	isInitialized = true;
	console.debug('initializeScene: scene, renderer, camera created.');
}

document.addEventListener('DOMContentLoaded', async function () {
	// Initialize FFL.
	await initializeFFLWithResource();

	let currentCharModel = null;
	let isAnimating = false; // Ensures animation starts only once.

	// --------------------------------------------------------------
	// Animation Loop Variables and Function
	// --------------------------------------------------------------
	const blinkInterval = 1000; // milliseconds
	const blinkDuration = 80; // milliseconds

	let rotationAngle = 0.0; // Store rotation Y angle as float.

	// Set options for expressions.
	const expressionNormal = FFLExpression.NORMAL;
	const expressionBlink = 5; // FFL_EXPRESSION_BLINK
	const expressionRareChance = 0.25; // Chance that this is used vv
	const expressionRare = 14; // FFL_EXPRESSION_WINK_LEFT_OPEN_MOUTH

	// Starts the animation loop. This should only be called once.
	function startAnimationLoop() {
		if (isAnimating) {
			return;
		} // Prevents multiple animation loops

		isAnimating = true;
		let lastBlinkTime = Date.now();
		let isBlinking = false;

		// Animation loop for rotating the model and simulating blinking.
		function animate() {
			requestAnimationFrame(animate);

			// Blink logic: randomly switch expressions.
			const now = Date.now();
			if (!isBlinking && now - lastBlinkTime >= blinkInterval) {
				const expr = (Math.random() < expressionRareChance)
					? expressionRare
					: expressionBlink;
				// Blink for (blinkInterval) ms.
				currentCharModel.setExpression(expr);
				isBlinking = true;
				lastBlinkTime = now;
			}
			if (isBlinking && now - lastBlinkTime >= blinkDuration) {
				// Blink is over, use normal expression.
				currentCharModel.setExpression(expressionNormal);
				isBlinking = false;
				lastBlinkTime = now;
			}

			rotationAngle += 0.01;
			// Update rotation for all meshes.
			currentCharModel.meshes.forEach((mesh) => {
				if (mesh) {
					mesh.rotation.y = rotationAngle;
				}
			});
			renderer.render(scene, camera);
		}

		animate();
	}

	// Assume a form with id "charform" exists in the HTML.
	// The form should include an input for CharInfo data in Base64.
	const form = document.getElementById('charform');
	form.addEventListener('submit', async function (e) {
		e.preventDefault();

		// Read the charInfo data from the form input
		const charInfoBase64 = document.getElementById('charinfo').value.trim();
		const charInfoData = Uint8Array.from(atob(charInfoBase64), c => c.charCodeAt(0));

		if (charInfoData.length > FFLiCharInfo.size) {
			alert(`CharInfo data must be at most ${FFLiCharInfo.size} bytes in length.`);
			return;
		}

		// Create expression flag to specify which expressions to use.
		const expressionFlag0 = makeExpressionFlag([expressionNormal,
			expressionBlink,
			expressionRare]);
		// Define CharModelDesc.
		const modelDesc = {
			resolution: 192,
			allExpressionFlag: [expressionFlag0, 0, 0],
			modelFlag: FFLModelFlag.NORMAL,
			resourceType: FFLResourceType.HIGH // Default resource type used
		};

		try {
			// First-time setup
			if (!isInitialized) {
				initializeScene();
			}

			// If there is an existing CharModel, dispose it and remove its meshes.
			if (currentCharModel) {
				currentCharModel.dispose();
				currentCharModel.meshes.forEach((mesh) => {
					if (mesh) {
						scene.remove(mesh);
					} // Remove it from our scene.
				});
			}

			// Create a new CharModel. Use window.FFLShaderMaterial as material.
			currentCharModel = createCharModel(charInfoData, modelDesc, window.FFLShaderMaterial, window.Module);
			currentCharModel.meshes.forEach((mesh) => {
				if (mesh) {
					scene.add(mesh);
				}
			});

			// Initialize textures for the CharModel.
			initCharModelTextures(currentCharModel, renderer, window.FFLTextures);

			if (!isAnimating) {
				startAnimationLoop();
			}
		} catch (err) {
			alert(`Error creating/updating CharModel: ${err}`);
			console.error('Error creating/updating CharModel:', err);
			throw err;
		}
	});
});
