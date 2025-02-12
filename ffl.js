// // ---------------------------------------------------------------------
// //                          FFL LIBRARY SECTION
// // ---------------------------------------------------------------------

// -------------------------- FFL STRUCT & CONSTANTS --------------------------
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
	CONSTANT: 0, // No Texture, Has Color (R)
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

const FFLAttributeBuffer = _.struct([
	_.uint32le('size'),
	_.uint32le('stride'),
	_.uintptr('ptr')
]);

const FFLAttributeBufferParam = _.struct([
	_.struct('attributeBuffers', [FFLAttributeBuffer], 5),
	_.byte('padding', 0x3C - (FFLAttributeBufferType.MAX * 12))
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
	_.byte('data', 10)
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
	_.byte('authorID', 8)
]);

const FFLAdditionalInfo = _.struct([
	_.char16le('name', 22),
	_.char16le('creator', 22),
	_.struct('createID', [FFLCreateID]),
	_.padTo(0x38),
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
	// there may be another field here for alignment but its never written to
	_.padTo(0x50)
]);

const FFLiRenderTexture = _.struct([
	_.uintptr('pTexture2DRenderBufferColorTargetDepthTarget', 4)
]);

const FFLiFacelineTextureTempObject = _.struct([
	_.uintptr('pTextureFaceLine'),
	_.struct('drawParamFaceLine', [FFLDrawParam]),
	_.uintptr('pTextureFaceMake'),
	_.struct('drawParamFaceMake', [FFLDrawParam]),
	_.uintptr('pTextureFaceBeard'),
	_.struct('drawParamFaceBeard', [FFLDrawParam]),
	_.uint32le('_144_148', 2)
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
	_.byte('partsTextures', 0x154),
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
	_.byte('_remaining', 0x0848 - 172)
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

// ------------------------ HELPER: handleFFLResult ---------------------------
/**
 * Throws an error if the FFL result is not OK (assumed 0).
 * @param {number} result - The FFL result code.
 */
function handleFFLResult(result) {
	if (result !== 0) {
		throw new Error('FFL operation failed with result: ' + result);
	}
}

// ---------------------- HELPER: initializeFFL(resource, module) ----------------
/**
 * Initializes FFL using a resource (TypedArray or fetch reader) and module.
 * @param {Uint8Array|ReadableStreamDefaultReader} resource - The resource data.
 * @param {Object} [module=window.Module] - The emscripten module.
 */
async function initializeFFL(resource, module) {
	module = module || window.Module;
	let heapPointer;
	let heapSize;
	if (resource instanceof Uint8Array) {
		heapSize = resource.length;
		heapPointer = module._malloc(heapSize);
		module.HEAPU8.set(resource, heapPointer);
	} else if (resource && typeof resource.read === 'function') {
		const reader = resource;
		const chunks = [];
		let totalSize = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			totalSize += value.length;
		}
		const combined = new Uint8Array(totalSize);
		let offset = 0;
		for (const chunk of chunks) {
			combined.set(chunk, offset);
			offset += chunk.length;
		}
		heapSize = combined.length;
		heapPointer = module._malloc(heapSize);
		module.HEAPU8.set(combined, heapPointer);
	} else {
		throw new Error('Invalid resource provided to initializeFFL');
	}
	const resourceDesc = { pData: [0, 0], size: [0, 0] };
	resourceDesc.pData[1] = heapPointer;
	resourceDesc.size[1] = heapSize;
	const packed = FFLResourceDesc.pack(resourceDesc);
	const resourceDescPtr = module._malloc(FFLResourceDesc.size);
	module.HEAPU8.set(packed, resourceDescPtr);
	const result = module._FFLInitRes(0, resourceDescPtr);
	handleFFLResult(result);
	module._FFLInitResGPUStep();
	module._FFLSetNormalIsSnorm8_8_8_8(1);
	module._free(resourceDescPtr);
}

// ------------------------ CLASS: TextureManager -----------------------------
/**
 * Manages THREE.Texture objects created via FFL.
 */
class TextureManager {
	/**
     * @param {Object} [module=window.Module] - The emscripten module.
     */
	constructor(module) {
		this.module = module || window.Module;
		this.textures = new Map();
		this.textureCallbackPtr = null;
		this._setupTextureCallbacks();
	}

	_textureCreateFunc(pObjPtr, textureInfoPtr, texturePtrPtr) {
		const u8 = this.module.HEAPU8.subarray(textureInfoPtr, textureInfoPtr + FFLTextureInfo.size);
		const textureInfo = FFLTextureInfo.unpack(u8);
		let dataFormat;
		const type = THREE.UnsignedByteType;
		switch (textureInfo.format) {
			case FFLTextureFormat.R8_UNORM:
				dataFormat = THREE.LuminanceFormat;
				break;
			case FFLTextureFormat.R8_G8_UNORM:
				dataFormat = THREE.LuminanceAlphaFormat;
				break;
			case FFLTextureFormat.R8_G8_B8_A8_UNORM:
				dataFormat = THREE.RGBAFormat;
				break;
			default:
				console.error('Unsupported texture format', textureInfo.format);
				return null;
		}
		const imageData = this.module.HEAPU8.slice(textureInfo.imagePtr, textureInfo.imagePtr + textureInfo.imageSize);
		const texture = new THREE.DataTexture(imageData, textureInfo.width, textureInfo.height, dataFormat, type);
		texture.magFilter = THREE.LinearFilter;
		texture.minFilter = THREE.LinearFilter;
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.needsUpdate = true;
		this.textures.set(texture.id, texture);
		this.module.HEAP32[texturePtrPtr / 4] = texture.id;
		return texture;
	}

	_textureDeleteFunc(pObjPtr, texturePtr) {
		const texId = this.module.HEAP32[texturePtr / 4];
		if (this.textures.has(texId)) {
			const texture = this.textures.get(texId);
			texture.dispose();
			this.textures.delete(texId);
			console.log('Deleted texture', texId);
		}
	}

	_setupTextureCallbacks() {
		const mod = this.module;
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

	get(id) {
		return this.textures.get(id);
	}

	set(id, texture) {
		this.textures.set(id, texture);
	}

	delete(id) {
		this.textures.delete(id);
	}
}

// --------------------------- CLASS: CharModel -------------------------------
/**
 * Represents a character model created via FFL.
 */
class CharModel {
	/**
     * @param {number} ptr - Pointer to the FFLiCharModel structure.
     * @param {Object} module - The emscripten module.
     */
	constructor(ptr, module) {
		this._module = module || window.Module;
		this.ptr = ptr;
		this._model = FFLiCharModel.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiCharModel.size));
		this.meshes = []; // Array of THREE.Mesh objects.
		this.additionalInfo = this._getAdditionalInfo();
		this.maskTextures = new Array(FFLExpression.MAX).fill(null);
		this.expression = this._model.expression;
	}

	_getTextureTempObjectPtr() {
		return this._model.pTextureTempObject;
	}

	_getTextureTempObject() {
		const ptr = this._getTextureTempObjectPtr();
		return FFLiTextureTempObject.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiTextureTempObject.size));
	}

	_getAdditionalInfo() {
		const mod = this._module;
		const addInfoPtr = mod._malloc(FFLAdditionalInfo.size);
		mod._FFLGetAdditionalInfo(addInfoPtr, FFLDataSource.BUFFER, this.ptr, 0, false);
		const info = FFLAdditionalInfo.unpack(mod.HEAPU8.subarray(addInfoPtr, addInfoPtr + FFLAdditionalInfo.size));
		mod._free(addInfoPtr);
		return info;
	}

	_getPartsTexturesPtr() {
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset +
			FFLiMaskTexturesTempObject.fields.partsTextures.offset;
	}

	_getFacelineTempObjectPtr() {
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.facelineTexture.offset;
	}

	_getMaskTempObjectPtr() {
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset;
	}

	_getResolution() {
		return this._model.charModelDesc.resolution & FFL_RESOLUTION_MASK;
	}

	/**
     * Disposes this CharModel, deleting it from WASM and freeing memory.
     */
	dispose() {
		if (!this.ptr) {
			return;
		}
		this._module._FFLDeleteCharModel(this.ptr);
		this._module._free(this.ptr);
		this.ptr = null;
	}

	/**
     * Sets the expression for this CharModel and updates the mask texture.
     * @param {number} expression - The new expression index.
     */
	setExpression(expression) {
		this.expression = expression;
		this._model.expression = expression;
		const texId = this._model.maskTextures.pRenderTextures[expression];
		const texture = window.FFLTextures.get(texId);
		if (this.meshes[FFLiShapeType.XLU_MASK]) {
			this.meshes[FFLiShapeType.XLU_MASK].material.map = texture;
			this.meshes[FFLiShapeType.XLU_MASK].material.needsUpdate = true;
		}
	}
}

// ------------------------- setFaceline FUNCTION -----------------------------
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

// ---------------------- makeExpressionFlag(expressions) ---------------------
/**
 * Returns a flag computed by OR-ing (1 << expression) for each value.
 * @param {number[]} expressions - Array of expression numbers.
 * @returns {number}
 */
function makeExpressionFlag(expressions) {
	return expressions.reduce((flag, expr) => flag | (1 << expr), 0);
}

// ------------------- createCharModel(data, desc, materialClass) --------------
/**
 * Creates a CharModel instance from charInfo data and model description.
 * @param {Uint8Array} charInfoData - The raw charInfo data.
 * @param {Object} modelDesc - The char model description.
 * @param {Function} materialClass - Constructor for the material.
 * @param {Object} [module=window.Module] - The emscripten module.
 * @returns {CharModel}
 */
function createCharModel(charInfoData, modelDesc, materialClass, module) {
	module = module || window.Module;
	const modelSourcePtr = module._malloc(FFLCharModelSource.size);
	const modelDescPtr = module._malloc(FFLCharModelDesc.size);
	const charModelPtr = module._malloc(FFLiCharModel.size);
	const charInfoPtr = module._malloc(FFLiCharInfo.size);
	try {
		module.HEAPU8.set(charInfoData, charInfoPtr);
		const modelSource = {
			dataSource: (charInfoData.length === 96 ? FFLDataSource.STORE_DATA : FFLDataSource.BUFFER),
			pBuffer: charInfoPtr,
			index: 0
		};
		if (modelSource.dataSource === FFLDataSource.BUFFER) {
			// Fill in byte 1 of the CreateID so verification passes.
			module.HEAPU8[charInfoPtr + FFLiCharInfo.fields.createID.offset + 0] =
				0x70; // 0b01110000 / Temporary, Wii U
			module.HEAPU8[charInfoPtr +
				FFLiCharInfo.fields.personal.offset +
				FFLiCharInfo.fields.personal.fields.name.offset + 0] = 0x21; // "!" // UTF-16LE: 0x0021
		}
		const modelSourceBuffer = FFLCharModelSource.pack(modelSource);
		module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);
		const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
		module.HEAPU8.set(modelDescBuffer, modelDescPtr);
		const result = module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		handleFFLResult(result);
	} catch (e) {
		module._free(modelSourcePtr);
		module._free(modelDescPtr);
		module._free(charInfoPtr);
		module._free(charModelPtr);
		throw e;
	}
	module._free(modelSourcePtr);
	module._free(modelDescPtr);
	module._free(charInfoPtr);
	const charModel = new CharModel(charModelPtr, module);
	for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
		const drawParam = charModel._model.drawParam[shapeType];
		if (drawParam.primitiveParam.indexCount > 0) {
			const mesh = drawParamToMesh(drawParam, materialClass, module);
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
	return charModel;
}

// ------------------- drawParamToMesh(drawParam, materialClass) ----------------
/**
 * Converts a draw parameter into a THREE.Mesh.
 * @param {Object} drawParam - The draw parameter.
 * @param {Function} materialClass - Constructor for the material.
 * @param {Object} module - The emscripten module.
 * @returns {THREE.Mesh|null}
 */
function drawParamToMesh(drawParam, materialClass, module) {
	if (!drawParam || drawParam.primitiveParam.indexCount === 0) {
		return null;
	}
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
	const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
	const indexCount = drawParam.primitiveParam.indexCount;
	const indices = module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
	geometry.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1));
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
				const colorData = new Uint8Array(module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size));
				geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(colorData, buffer.stride, true));
				break;
			}
		}
	});
	let side = THREE.FrontSide;
	switch (drawParam.cullMode) {
		case FFLCullMode.NONE:
			side = THREE.DoubleSide;
			break;
		case FFLCullMode.BACK:
			side = THREE.FrontSide;
			break;
		case FFLCullMode.FRONT:
			side = THREE.BackSide;
			break;
		case FFLCullMode.MAX: // Used by faceline/mask
			side = THREE.DoubleSide;
			break;
		default:
			console.error(`Unknown value for FFLCullMode: ${drawParam.cullMode}`);
			side = THREE.DoubleSide;
	}
	let modulateColor = new THREE.Vector4(0, 0, 0, 0);
	if (drawParam.modulateParam.pColorR !== 0) {
		const colorPtr = drawParam.modulateParam.pColorR / 4;
		const colorData = module.HEAPF32.subarray(colorPtr, colorPtr + 4);
		modulateColor = new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
	}
	if (drawParam.modulateParam.pColorG !== 0 && drawParam.modulateParam.pColorB !== 0) {
		modulateColor = [
			getVector4FromFFLColorPtr(drawParam.modulateParam.pColorR, module),
			getVector4FromFFLColorPtr(drawParam.modulateParam.pColorG, module),
			getVector4FromFFLColorPtr(drawParam.modulateParam.pColorB, module)
		];
	}
	let texture = null;
	if (drawParam.modulateParam.pTexture2D &&
	// NOTE: do not assign texture for faceline or mask, assign later
		drawParam.modulateParam.type !== FFLModulateType.SHAPE_FACELINE &&
		drawParam.modulateParam.type !== FFLModulateType.SHAPE_MASK) {
		const texturePtr = drawParam.modulateParam.pTexture2D;
		texture = window.FFLTextures.get(texturePtr) || null;

		if (!texture) {
			console.warn(`Texture not found for ptr: ${texturePtr}`);
		}
	}

	// disable lighting when drawing faceline/mask, which would
	// be NOT modulate type greater than shapes and modulate mode constant (opaque)
	const lightEnable = !(drawParam.modulateParam.mode !== FFLModulateMode.CONSTANT &&
		drawParam.modulateParam.type > FFLModulateType.SHAPE_MAX);
	const material = new materialClass({
		modulateMode: drawParam.modulateParam.mode,
		modulateType: drawParam.modulateParam.type,
		modulateColor: modulateColor,
		side: side,
		lightEnable: lightEnable,
		map: texture
	});
	const mesh = new THREE.Mesh(geometry, material);
	mesh.userData.modulateType = drawParam.modulateParam.type;
	return mesh;
}

// --------------------- getVector4FromFFLColorPtr -----------------------------
/**
 * Converts a pointer to an FFL color into a THREE.Vector4.
 * @param {number} colorPtr - The pointer to the color.
 * @param {Object} module - The emscripten module.
 * @returns {THREE.Vector4}
 */
function getVector4FromFFLColorPtr(colorPtr, module) {
	if (!colorPtr) {
		console.error('Null pointer in getVector4FromFFLColorPtr');
		return new THREE.Vector4(0, 0, 0, 0);
	}
	const colorData = module.HEAPF32.subarray(colorPtr / 4, colorPtr / 4 + 4);
	return new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
}

// ------------------- initCharModelTextures(charModel, renderer) --------------
/**
 * Initializes the textures (faceline and masks) for a CharModel.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @param {TextureManager} textureManager - The texture manager.
 */
function initCharModelTextures(charModel, renderer, textureManager) {
	const module = charModel._module;
	const textureTempObject = charModel._getTextureTempObject();
	const facelineTempObjectPtr = charModel._getFacelineTempObjectPtr();
	module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
	const facelineID = generateFacelineTexture(charModel, textureTempObject, renderer, textureManager, module);
	if (typeof facelineID !== 'number') {
		console.log('Could not make faceline texture:', facelineID);
	} else {
		setFaceline(facelineID, charModel);
		module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModel.ptr, charModel._model.charModelDesc.resourceType);
	}
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel.ptr + FFLiCharModel.fields.charModelDesc.offset +
		FFLCharModelDesc.fields.allExpressionFlag.offset;
	for (let i = 0; i < charModel._model.maskTextures.pRenderTextures.length; i++) {
		const textureId = charModel._model.maskTextures.pRenderTextures[i];
		if (textureId === 0) {
			continue;
		}
		const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
		const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(module.HEAPU8.subarray(rawMaskDrawParamPtr, rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
		module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);
		const id = generateMaskTexture(charModel, rawMaskDrawParam, renderer, textureManager, module);
		if (typeof id !== 'number') {
			throw new Error('Failed to create mask texture');
		}
		charModel._model.maskTextures.pRenderTextures[i] = id;
	}
	module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, charModel._model.charModelDesc.resourceType);
	module._FFLiDeleteTextureTempObject(charModel.ptr);
	charModel.setExpression(charModel.expression);
}

// --------------------- generateFacelineTexture() ----------------------------
/**
 * Generates the faceline texture for a CharModel.
 * @returns {number|null} The faceline texture ID.
 */
function generateFacelineTexture(charModel, textureTempObject, renderer, textureManager, module) {
	const drawParams = [
		textureTempObject.facelineTexture.drawParamFaceLine,
		textureTempObject.facelineTexture.drawParamFaceBeard,
		textureTempObject.facelineTexture.drawParamFaceMake
	].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);
	if (drawParams.length === 0) {
		console.error('No faceline drawParams found');
		return null;
	}
	const facelineColor = charModel.additionalInfo.skinColor;
	const bgColor = new THREE.Color(facelineColor.r, facelineColor.g, facelineColor.b);
	const { scene: offscreenScene } = createOffscreenScene(drawParams, bgColor, module, renderer);
	const width = charModel._getResolution() / 2;
	const height = charModel._getResolution();
	const texture = renderSceneToTexture(offscreenScene, width, height, renderer);
	if (!texture) {
		console.error('Failed to generate faceline texture');
		return null;
	}
	textureManager.set(texture.id, texture);
	displayScene(offscreenScene, width, height, renderer);
	const param = charModel._model.drawParam[FFLiShapeType.OPA_FACELINE];
	param.modulateParam.pTexture2D = texture.id;
	return texture.id;
}

// --------------------- generateMaskTexture() --------------------------------
/**
 * Generates a mask texture for a CharModel.
 * @returns {number|null} The mask texture ID.
 */
function generateMaskTexture(charModel, rawMaskParam, renderer, textureManager, module) {
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
	const { scene: offscreenScene } = createOffscreenScene(drawParams, null, module, renderer);
	const width = charModel._getResolution();
	const texture = renderSceneToTexture(offscreenScene, width, width, renderer);
	if (!texture) {
		console.error('Failed to generate mask texture');
		return null;
	}
	textureManager.set(texture.id, texture);
	displayScene(offscreenScene, width, width, renderer);
	return texture.id;
}

// ----------------------- createOffscreenScene() -----------------------------
/**
 * Creates an offscreen scene from an array of drawParams.
 * @param {Array} drawParams - Array of draw parameters.
 * @param {THREE.Color|null} backgroundColor - Optional background color.
 * @param {Object} module - The emscripten module.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @returns {{scene: THREE.Scene, meshes: Array<THREE.Mesh>}}
 */
function createOffscreenScene(drawParams, backgroundColor, module, renderer) {
	const scene = new THREE.Scene();
	scene.background = backgroundColor || null;
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

// ----------------------- renderSceneToTexture() -----------------------------
/**
 * Renders a scene to a texture.
 * @param {THREE.Scene} scene - The scene to render.
 * @param {number} width - Texture width.
 * @param {number} height - Texture height.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @returns {THREE.Texture}
 */
function renderSceneToTexture(scene, width, height, renderer) {
	const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	tempCamera.position.z = 1;
	const renderTarget = new THREE.WebGLRenderTarget(width, height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		wrapS: THREE.MirroredRepeatWrapping,
		wrapT: THREE.MirroredRepeatWrapping,
		format: THREE.RGBAFormat,
		depthBuffer: false,
		stencilBuffer: false
	});
	const prevTarget = renderer.getRenderTarget();
	renderer.setRenderTarget(renderTarget);
	renderer.render(scene, tempCamera);
	renderer.setRenderTarget(prevTarget);
	return renderTarget.texture;
}

// ------------------------- displayScene() -----------------------------------
/**
 * Displays a rendered scene by appending an image element.
 * @param {THREE.Scene} scene - The scene.
 * @param {number} width - Width of the rendered scene.
 * @param {number} height - Height of the rendered scene.
 * @param {THREE.Renderer} renderer - The renderer used.
 */
function displayScene(scene, width, height, renderer) {
	const tempRenderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true });
	tempRenderer.setSize(width, height);
	const tempCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, 0.1, 10);
	tempCamera.position.z = 1;
	tempRenderer.render(scene, tempCamera);
	const dataURL = tempRenderer.domElement.toDataURL('image/png');
	const img = new Image();
	img.src = dataURL;
	img.style.margin = '10px';
	const container = document.getElementById('texture-display') || document.body;
	container.appendChild(img);
	tempRenderer.dispose();
}

// --------------------- updateCharModelTexOnly() -----------------------------
/**
 * Updates the textures (mask only) for a CharModel.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {number} expressionFlag - The expression flag.
 */
function updateCharModelTexOnly(charModel, expressionFlag) {
	throw new Exception('not implemented, tbd this should use mask only model flag');
}

// // ---------------------------------------------------------------------
// //                        APPLICATION SECTION
// // ---------------------------------------------------------------------

// When the DOM is ready, initialize FFL and TextureManager.
async function initializeFFLWithResource() {
	try {
		// Load FFL resource file from meta tag in HTML
		const resourceFetchPath = document.querySelector('meta[itemprop=ffl-resource-fetch-path]').content;
		const response = await fetch(resourceFetchPath);
		const reader = response.body.getReader();

		// Initialize FFL first
		await initializeFFL(reader, window.Module);

		// NOW we can safely create the texture manager
		window.FFLTextures = new TextureManager(window.Module);

		console.log('FFL and TextureManager initialized successfully.');
	} catch (error) {
		console.error('Error during initialization:', error);
	}
}

// When the DOM is ready, also set up a form to input data.
document.addEventListener('DOMContentLoaded', async function () {
	// Initialize FFL
	await initializeFFLWithResource();

	// Create or use existing form in the page.
	const form = document.getElementById('charform');

	form.addEventListener('submit', async function (e) {
		e.preventDefault();
		const charInfoBase64 = document.getElementById('charinfo').value.trim();
		const charInfoData = Uint8Array.from(atob(charInfoBase64), c => c.charCodeAt(0));
		if (charInfoData.length > FFLiCharInfo.size) {
			alert(`CharInfo data must be no larger than ${FFLiCharInfo.size} bytes`);
			return;
		}
		// Define the CharModelDesc object.
		const modelDesc = {
			resolution: 192,
			allExpressionFlag: [
				makeExpressionFlag([FFLExpression.NORMAL, 15, 5]), 0, 0],
			modelFlag: 1 << 0,
			resourceType: 1
		};
		try {
			// Create a new CharModel instance.
			const charModel = createCharModel(charInfoData, modelDesc, window.FFLShaderMaterial, window.Module);
			// Create a new Three.js scene for this CharModel.
			const scene = new THREE.Scene();
			scene.background = new THREE.Color(0xE6E6FA);
			const renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight - 250);
			document.body.appendChild(renderer.domElement);
			// Initialize textures for the CharModel.
			initCharModelTextures(charModel, renderer, window.FFLTextures);
			// Add all meshes from the CharModel to the scene.
			charModel.meshes.forEach((mesh) => {
				if (mesh) {
					scene.add(mesh);
				}
			});
			// Animation variables.
			let lastBlinkTime = Date.now();
			let isBlinking = false;
			// Set up the animation loop.
			const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight - 250), 0.1, 1000);
			camera.position.set(0, 40, 100);
			function animate() {
				requestAnimationFrame(animate);
				const now = Date.now();
				if (!isBlinking && now - lastBlinkTime >= 1000) {
					const expr = (Math.random() < 0.25) ? 14 : 5;
					charModel.setExpression(expr);
					isBlinking = true;
					lastBlinkTime = now;
				}
				if (isBlinking && now - lastBlinkTime >= 80) {
					charModel.setExpression(0);
					isBlinking = false;
					lastBlinkTime = now;
				}
				charModel.meshes.forEach((mesh) => {
					if (mesh) {
						mesh.rotation.y += 0.01;
					}
				});
				renderer.render(scene, camera);
			}
			animate();
		} catch (err) {
			console.error('Error creating CharModel:', err);
		}
	});
});
