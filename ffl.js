// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.0/+esm';

// // ---------------------------------------------------------------------
// //                            JSDoc Types
// // ---------------------------------------------------------------------

/**
 * @typedef {Object} Module
 * @property {Int8Array} HEAP8
 * @property {Uint8Array} HEAPU8
 * @property {Uint16Array} HEAPU16
 * @property {Uint32Array} HEAPU32
 * @property {Float32Array} HEAPF32
 * Runtime methods:
 * @property {(byteLength: number) => number} _malloc
 * @property {(ptr: number) => number} _free
 * @property {() => void} onRuntimeInitialized
 * @property boolean calledRun
 * addFunction
 *
 */

/**
 * @typedef {import('./struct-fu-mini.js')} StructFu
 */

function generateJSDoc(obj, typeName = 'GeneratedType', depth = 0) {
	// Stop at max depth 5.
	if (depth > 5) {
		return '';
	}

	const indent = '  '.repeat(depth);
	let text = `${indent}/**\n${indent} * @typedef {Object} ${typeName}\n`;

	Object.keys(obj).forEach((key) => {
		// Ignore private keys beginning with underscore.
		if (key.startsWith('_')) {
			return;
		}

		const value = obj[key];
		const valueType = typeof value;
		let propType;

		if (value === null) {
			propType = 'null';
		} else if (Array.isArray(value)) {
			let arrayType = value.length > 0 ? typeof value[0] : 'any'; // Assume first element type
			if (typeof value[0] === 'object' && value[0] !== null) {
				arrayType = generateJSDoc(value[0], `${typeName}_${key}_Item`, depth + 1);
			}
			propType = `Array<${arrayType}>`;
		} else if (valueType === 'object') {
			const nestedType = generateJSDoc(value, `${typeName}_${key}`, depth + 1);
			propType = nestedType || 'Object';
		} else {
			propType = valueType;
		}

		text += `${indent} * @property {${propType}} ${key}\n`;
	});

	text += `${indent} */\n`;
	console.log(text);
}
function generateJSDocStructFu(typeName) {
	if (!typeName) {
		throw new Error();
	}
	eval(`
		const empty = new Uint8Array(${typeName}.size);
		generateJSDoc(${typeName}.unpack(empty), typeName);
	`);
}

/**
 * Template for the return type of _.struct().
 *
 * @template T
 * @typedef {Object} StructInstance
 * @property {function(Uint8Array): T} unpack - Deserializes a Uint8Array into the structured object.
 * @property {function(T): Uint8Array} pack - Serializes the structured object into a Uint8Array.
 * @property {Object} fields - List of fields in the struct, including offsets.
 * @property {number} size - The size of the packed structure.
 */

/**
 * @typedef {Object} WindowCustom
 * @property {Module} Module
 * @property {TextureManager} FFLTextures
 * List shader materials:
 * @property {object} FFLShaderMaterial
 * @property {object} LUTShaderMaterial
 */

/** @type {WindowCustom} */
window;

if (_ === undefined) {
	// NOTE only here to satisfy eslint
	/** @type {StructFu} */
	const _ = window._;
}
_;

// // ---------------------------------------------------------------------
// //                          FFL LIBRARY SECTION
// // ---------------------------------------------------------------------

// ---------------------- FFL STRUCT & CONSTANTS DEFINITIONS ------------------

/**
 * @enum {number}
 */
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

/**
 * @enum {number}
 */
const FFLAttributeBufferType = {
	POSITION: 0,
	TEXCOORD: 1,
	NORMAL: 2,
	TANGENT: 3,
	COLOR: 4,
	MAX: 5
};

/**
 * @enum {number}
 */
const FFLCullMode = {
	NONE: 0,
	BACK: 1,
	FRONT: 2,
	MAX: 3
};

/**
 * @enum {number}
 */
const FFLModulateMode = {
	CONSTANT: 0, // No Texture,  Has Color (R)
	TEXTURE_DIRECT: 1, // Has Texture, No Color
	RGB_LAYERED: 2, // Has Texture, Has Color (R + G + B)
	ALPHA: 3, // Has Texture, Has Color (R)
	LUMINANCE_ALPHA: 4, // Has Texture, Has Color (R)
	ALPHA_OPA: 5 // Has Texture, Has Color (R)
};

/**
 * @enum {number}
 */
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

/**
 * @enum {number}
 */
const FFLResourceType = {
	MIDDLE: 0,
	HIGH: 1,
	MAX: 2
};

/**
 * @enum {number}
 */
const FFLExpression = {
	NORMAL: 0,
	MAX: 70
};

/**
 * @enum {number}
 */
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

/**
 * @typedef {Object} FFLAttributeBuffer
 * @property {number} size
 * @property {number} stride
 * @property {number} ptr
 */
const FFLAttributeBuffer = _.struct([
	_.uint32le('size'),
	_.uint32le('stride'),
	_.uintptr('ptr')
]);

/**
 * @typedef {Object} FFLAttributeBufferParam
 * @property {Array<FFLAttributeBuffer>} attributeBuffers
 */
const FFLAttributeBufferParam = _.struct([
	_.struct('attributeBuffers', [FFLAttributeBuffer], 5)
]);

/**
 * @typedef {Object} FFLPrimitiveParam
 * @property {number} primitiveType
 * @property {number} indexCount
 * @property {number} pIndexBuffer
 */
const FFLPrimitiveParam = _.struct([
	_.uint32le('primitiveType'),
	_.uint32le('indexCount'),
	_.uint32le('_8'),
	_.uintptr('pIndexBuffer')
]);

/**
 * @typedef {Object} FFLColor
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */
const FFLColor = _.struct([
	_.float32le('r'),
	_.float32le('g'),
	_.float32le('b'),
	_.float32le('a')
]);

const FFLVec3 = _.struct([
	_.float32le('x'),
	_.float32le('y'),
	_.float32le('z')
]);

/**
 * @typedef {Object} FFLModulateParam
 * @property {FFLModulateMode} mode
 * @property {FFLModulateType} type
 * @property {FFLColor} pColorR
 * @property {FFLColor} pColorG
 * @property {FFLColor} pColorB
 * @property {number} pTexture2D
 */
const FFLModulateParam = _.struct([
	_.uint32le('mode'),
	_.uint32le('type'),
	_.uintptr('pColorR'),
	_.uintptr('pColorG'),
	_.uintptr('pColorB'),
	_.uintptr('pTexture2D')
]);

/**
 * @typedef {Object} FFLDrawParam
 * @property {FFLAttributeBufferParam} attributeBufferParam
 * @property {FFLModulateParam} modulateParam
 * @property {FFLCullMode} cullMode
 * @property {FFLPrimitiveParam} primitiveParam
 */
const FFLDrawParam = _.struct([
	_.struct('attributeBufferParam', [FFLAttributeBufferParam]),
	_.struct('modulateParam', [FFLModulateParam]),
	_.uint32le('cullMode'),
	_.struct('primitiveParam', [FFLPrimitiveParam])
]);

const FFLCreateID = _.struct([
	_.uint8('data', 10)
]);

/**
 * @typedef {Object} FFLiCharInfo_faceline
 * @property {number} type
 * @property {number} color
 * @property {number} texture
 * @property {number} make
 */
/**
 * @typedef {Object} FFLiCharInfo_hair
 * @property {number} type
 * @property {number} color
 * @property {number} flip
 */
/**
 * @typedef {Object} FFLiCharInfo_eye
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} rotate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_eyebrow
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} rotate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_nose
 * @property {number} type
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_mouth
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_beard
 * @property {number} mustache
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_glass
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_mole
 * @property {number} type
 * @property {number} scale
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_body
 * @property {number} height
 * @property {number} build
 */
/**
 * @typedef {Object} FFLiCharInfo_personal
 * @property {string} name
 * @property {string} creator
 * @property {number} gender
 * @property {number} birthMonth
 * @property {number} birthDay
 * @property {number} favoriteColor
 * @property {number} favorite
 * @property {number} copyable
 * @property {number} ngWord
 * @property {number} localonly
 * @property {number} regionMove
 * @property {number} fontRegion
 * @property {number} roomIndex
 * @property {number} positionInRoom
 * @property {number} birthPlatform
 */
/**
 * @typedef {Object} FFLiCharInfo_createID
 * @property {Array<number>} data
 */
/**
 * @typedef {Object} FFLiCharInfo
 * @property {number} miiVersion
 * @property {FFLiCharInfo_faceline} faceline
 * @property {FFLiCharInfo_hair} hair
 * @property {FFLiCharInfo_eye} eye
 * @property {FFLiCharInfo_eyebrow} eyebrow
 * @property {FFLiCharInfo_nose} nose
 * @property {FFLiCharInfo_mouth} mouth
 * @property {FFLiCharInfo_beard} beard
 * @property {FFLiCharInfo_glass} glass
 * @property {FFLiCharInfo_mole} mole
 * @property {FFLiCharInfo_body} body
 * @property {FFLiCharInfo_personal} personal
 * @property {FFLiCharInfo_createID} createID
 * @property {number} padding_0
 * @property {number} authorType
 * @property {Array<number>} authorID
 */
/**
 * @type {StructInstance<FFLiCharInfo>}
 */
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

const commonColorEnableMask = (1 << 31);

/**
 * Applies (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to indicate to FFL which color table it should use.
 * @param {number} color - The color index to flag.
 * @returns {number} The flagged color index to use in FFLiCharinfo.
 */
const commonColorMask = color => color | commonColorEnableMask;

/**
 * Removes (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to reveal the original common color index.
 * @param {number} color - The flagged color index.
 * @returns {number} The original color index before flagging.
 */
const commonColorUnmask = color => color & commonColorEnableMask === 0
// Only unmask color if the mask is enabled.
	? color
	: color & commonColorEnableMask;

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
	_.byte('_remaining', 0x388 - 620) // stub
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
// Define a static default FFLCharModelDesc.
FFLCharModelDesc.default = {
	resolution: 512, // Typical default.
	// Choose normal expression.
	allExpressionFlag: new Uint32Array([1, 0, 0]), // Normal expression.
	modelFlag: FFLModelFlag.NORMAL,
	resourceType: FFLResourceType.HIGH // Default resource type.
};

const FFLPartsTransform = _.struct([
	_.struct('hatTranslate', [FFLVec3]),
	_.struct('headFrontRotate', [FFLVec3]),
	_.struct('headFrontTranslate', [FFLVec3]),
	_.struct('headSideRotate', [FFLVec3]),
	_.struct('headSideTranslate', [FFLVec3]),
	_.struct('headTopRotate', [FFLVec3]),
	_.struct('headTopTranslate', [FFLVec3])
]);

const FFLiCharModel = _.struct([
	_.struct('charInfo', [FFLiCharInfo]),
	_.struct('charModelDesc', [FFLCharModelDesc]),
	_.uint32le('expression'), // enum FFLExpression
	_.uintptr('pTextureTempObject'), // stub
	_.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX),
	_.uintptr('pShapeData', FFLiShapeType.MAX),
	_.struct('facelineRenderTexture', [FFLiRenderTexture]),
	_.uintptr('pCapGlassNoselineTextures', 3),
	_.struct('maskTextures', [FFLiMaskTextures]),
	_.struct('beardHairFaceCenterPos', [FFLVec3], 3),
	_.struct('partsTransform', [FFLPartsTransform]),
	_.uint32le('modelType'), // enum FFLModelType
	_.byte('boundingBox', 0x18 * 3) // FFLBoundingBox[3]
]);

/**
 * @enum {number}
 */
const FFLDataSource = {
	OFFICIAL: 0,
	DEFAULT: 1,
	MIDDLE_DB: 2,
	STORE_DATA_OFFICIAL: 3,
	STORE_DATA: 4,
	BUFFER: 5,
	DIRECT_POINTER: 6
};

/**
 * @typedef {Object} FFLCharModelSource
 * @property {number} dataSource
 * @property {number} pBuffer
 * @property {number} index
 */
/**
 * @type {StructInstance<FFLCharModelSource>}
 */
const FFLCharModelSource = _.struct([
	_.uint32le('dataSource'),
	_.uintptr('pBuffer'),
	_.uint16le('index')
]);

// The enums below are only for FFLiGetRandomCharInfo.
// Hence, why each one has a value called ALL.

/**
 * @enum {number}
 */
const FFLGender = {
	MALE: 0,
	FEMALE: 1,
	ALL: 2
};

/**
 * @enum {number}
 */
const FFLAge = {
	CHILD: 0,
	ADULT: 1,
	ELDER: 2,
	ALL: 3
};

/**
 * @enum {number}
 */
const FFLRace = {
	BLACK: 0,
	WHITE: 1,
	ASIAN: 2,
	ALL: 3
};

const FFLResourceDesc = _.struct([
	_.uintptr('pData', FFLResourceType.MAX),
	_.uint32le('size', FFLResourceType.MAX)
]);

// ------------------------- TEXTURE CALLBACK STRUCTS -------------------------
/**
 * @enum {number}
 */
const FFLTextureFormat = {
	R8_UNORM: 0,
	R8_G8_UNORM: 1,
	R8_G8_B8_A8_UNORM: 2,
	MAX: 3
};

/**
 * @typedef {Object} FFLTextureInfo
 * @property {number} width
 * @property {number} height
 * @property {number} mipCount
 * @property {FFLTextureFormat} format
 * @property {number} isGX2Tiled
 * @property {number} imageSize
 * @property {number} imagePtr
 * @property {number} mipSize
 * @property {number} mipPtr
 * @property {Array<number>} mipLevelOffset
 */

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
	 * @param {Module} [module=window.Module] - The Emscripten module.
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
			[FFLTextureFormat.R8_G8_UNORM]: THREE.RGFormat,
			// [FFLTextureFormat.R8_G8_UNORM]: THREE.RGFormat,
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
		console.debug(`_textureCreateFunc: width=${textureInfo.width}, height=${textureInfo.height}, format=${textureInfo.format}, imageSize=${textureInfo.imageSize}, mipCount=${textureInfo.mipCount}`);

		const type = THREE.UnsignedByteType;
		const dataFormat = this._getTextureFormat(textureInfo.format);

		// Copy image data from HEAPU8 via slice. This is base level/mip level 0.
		const imageData = this.module.HEAPU8.slice(textureInfo.imagePtr, textureInfo.imagePtr + textureInfo.imageSize);

		const texture = new THREE.DataTexture(imageData, textureInfo.width, textureInfo.height, dataFormat, type);

		texture.magFilter = THREE.LinearFilter;
		// texture.generateMipmaps = true; // not necessary at higher resolutions
		texture.minFilter = THREE.LinearFilter;

		// NOTE: Depending on your version of Three.js, textures
		// with mipmaps using this implementation will either
		// show up completely black or have this effect on 0.137.5
		// where every mip level is merged to level 0 which
		// is now the size of level 1 and all other levels are empty

		// texture.minFilter = THREE.LinearMipmapLinearFilter;
		// texture.generateMipmaps = false; // We are manually assigning mipmaps.
		// Upload mipmaps if they exist.
		// texture.mipmaps = []; // Initialize as empty array.
		// texture.mipmaps = [{data: imageData, width: textureInfo.width, height: textureInfo.height}];
		// this._addMipmaps(texture, textureInfo);

		texture.needsUpdate = true;
		this.set(texture.id, texture);
		this.module.HEAPU32[texturePtrPtr / 4] = texture.id;
		return texture;
	}

	/**
	 * @param {THREE.Texture} texture - Texture to upload mipmaps into.
	 * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
	 */
	_addMipmaps(texture, textureInfo) {
		// Skip if there are no mipmaps.
		if (textureInfo.mipPtr === 0 || textureInfo.mipCount < 2) {
			return;
		}

		// Calculate bytes per pixel.
		// Mapping: FFLTextureFormat.R8_UNORM -> 1, R8_G8_UNORM -> 2, R8_G8_B8_A8_UNORM -> 4.
		const bytesPerPixel = [1, 2, 4][textureInfo.format];
		if (!bytesPerPixel) {
			throw new Error(`_addMipmaps: unknown FFLTextureFormat: ${textureInfo.format}`);
		}

		// Iterate through mip levels starting from 1 (base level is mip level 0).
		for (let mipLevel = 1; mipLevel < textureInfo.mipCount; mipLevel++) {
			// Calculate the offset for the current mip level.
			const mipOffset = textureInfo.mipLevelOffset[mipLevel - 1];

			// Calculate dimensions of the current mip level.
			const mipWidth = Math.max(1, textureInfo.width >> mipLevel);
			const mipHeight = Math.max(1, textureInfo.height >> mipLevel);

			// Calculate the size in bytes of the current mip level.
			const mipSize = mipWidth * mipHeight * bytesPerPixel;

			// Copy the data from the heap.
			const start = textureInfo.mipPtr + mipOffset;
			const mipData = this.module.HEAPU8.slice(start, start + mipSize);

			console.debug(`- Mip ${mipLevel}: ${mipWidth}x${mipHeight}, offset=${mipOffset}`);
			// console.debug(uint8ArrayToBase64(mipData));

			// Push this mip level data into the texture's mipmaps array.
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
		const texId = this.module.HEAPU32[texturePtr / 4];
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
 * @param {Module} module - The Emscripten module instance.
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
				}
				// Copy value directly into HEAPU8 with offset.
				module.HEAPU8.set(value, offset);
				offset += value.length;
			}
		} else {
			throw new Error('loadDataIntoHeap: type is not Uint8Array or Response');
		}

		return { pointer: heapPointer, size: heapSize };
	} catch (error) {
		// Free memory upon exception, if allocated.
		if (heapPointer) {
			module._free(heapPointer);
		}
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
 * @param {Module} [module=window.Module] - The Emscripten module instance.
 * @returns {Promise<void>} Resolves when FFL is fully initialized.
 */
async function initializeFFL(resource, module = window.Module) {
	console.debug('initializeFFL: Called with resource =', resource, ', waiting for module to be ready');

	// Continue when Emscripten module is initialized.
	return new Promise((resolve) => {
		// try {
		// If onRuntimeInitialized is not defined on module, add it.
		if (!module.calledRun && !module.onRuntimeInitialized) {
			module.onRuntimeInitialized = () => {
				console.debug('initializeFFL: Emscripten runtime initialized, resolving.');
				resolve();
			};
		} else {
			console.debug('initializeFFL: Assuming module is ready.');
			resolve();
		}
		// } catch(e) {
		// 	debugger; throw e;
		// }
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
			const result = module._FFLInitRes(0, resourceDescPtr); // FFL_FONT_REGION_JP_US_EU = 0
			handleFFLResult('FFLInitRes', result); // Check result.

			module._FFLInitResGPUStep(); // CanInitCharModel will fail if not called.

			module._FFLSetNormalIsSnorm8_8_8_8(1); // Set normal format to FFLiSnorm8_8_8_8.
			module._FFLSetTextureFlipY(1); // Set textures to be flipped for WebGL.
			module._free(resourceDescPtr); // Free FFLResourceDesc, unused after init
		})
		.catch((error) => {
			console.error('initializeFFL failed:', error);
			throw error;
		});
}

// --------------------------- CLASS: CharModel -------------------------------
/**
 * Represents a character model created via FFL.
 * Encapsulates a pointer to the underlying FFLiCharModel and provides helper methods.
 */
class CharModel {
	/**
	 * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
	 * @param {Module} [module=window.Module] - The Emscripten module.
	 * @param {Function} materialClass - The material constructor (e.g., FFLShaderMaterial).
	 */
	constructor(ptr, module = window.Module, materialClass = window.FFLShaderMaterial) {
		this._module = module;
		this._materialClass = materialClass; // Store the material class.
		this.ptr = ptr;
		// Unpack the FFLiCharModel structure from heap.
		this._model = FFLiCharModel.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiCharModel.size));
		// NOTE: The only property SET in _model is expression.
		// Everything else is read.

		// this.additionalInfo = this._getAdditionalInfo();

		// Add RenderTargets for faceline and mask.
		/** @type {THREE.RenderTarget} */
		this._facelineTarget = null;
		/** @type {Array<THREE.RenderTarget|null>} */
		this._maskTargets = new Array(FFLExpression.MAX).fill(null);

		/** @type {Array<THREE.Mesh>} */
		this.meshes = []; // THREE.Mesh objects representing each shape.
	}

	_getTextureTempObjectPtr() {
		// console.debug(`_getTextureTempObjectPtr: pTextureTempObject = ${this._model.pTextureTempObject}, pCharModel = ${this.ptr}`);
		return this._model.pTextureTempObject;
	}

	_getTextureTempObject() {
		const ptr = this._getTextureTempObjectPtr();
		return FFLiTextureTempObject.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiTextureTempObject.size));
	}

	// Get the result of FFLGetAdditionalInfo.
	_getAdditionalInfo() {
		const mod = this._module;
		const addInfoPtr = mod._malloc(FFLAdditionalInfo.size);
		const result = mod._FFLGetAdditionalInfo(addInfoPtr, FFLDataSource.BUFFER, this.ptr, 0, false);
		handleFFLResult('FFLGetAdditionalInfo', result);
		const info = FFLAdditionalInfo.unpack(mod.HEAPU8.subarray(addInfoPtr, addInfoPtr + FFLAdditionalInfo.size));
		mod._free(addInfoPtr);
		return info;
	}

	// Accesses partsTransform in FFLiCharModel
	// converting every FFLVec3 to THREE.Vector3.
	_getPartsTransform() {
		const obj = this._model.partsTransform;
		for (const key in obj) {
			// sanity check make sure there is "x"
			if (obj[key].x !== undefined) {
				throw new Error();
			}
			// convert to THREE.Vector3
			obj[key] = new THREE.Vector3(obj[key].x, obj[key].y, obj[key].z);
		}
		return obj;
	}

	_getFacelineColor() {
		// const color = this.additionalInfo.skinColor;
		// return new THREE.Color(color.r, color.g, color.b);
		const mod = this._module;
		const facelineColor = this._model.charInfo.faceline.color;
		const colorPtr = mod._malloc(FFLColor.size); // Allocate return pointer.
		mod._FFLGetFacelineColor(colorPtr, facelineColor);
		const color = getVector4FromFFLColorPtr(colorPtr, mod);
		mod._free(colorPtr);
		return new THREE.Color(color.x, color.y, color.z); // No alpha component.
	}

	_getFavoriteColor() {
		const mod = this._module;
		const favoriteColor = this._model.charInfo.personal.favoriteColor;
		const colorPtr = mod._malloc(FFLColor.size); // Allocate return pointer.
		mod._FFLGetFavoriteColor(colorPtr, favoriteColor); // Get favoriteColor from CharInfo.
		const color = getVector4FromFFLColorPtr(colorPtr, mod);
		mod._free(colorPtr);
		return color;
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

	// Get the texture resolution.
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
	 * Disposes RenderTargets for textures created by the CharModel.
	 */
	_disposeTextures() {
		// Dispose RenderTargets.
		if (this._facelineTarget) {
			console.debug(`Disposing target ${this._facelineTarget.texture.id} for faceline`);
			this._facelineTarget.dispose();
			this._facelineTarget = null;
		}
		this._maskTargets.forEach((target, i) => {
			if (!target) {
				// No mask for this expression.
				return;
			}
			console.debug(`Disposing target ${target.texture.id} for mask ${i}`);
			target.dispose();
			this._maskTargets[i] = null;
		});
	}

	// Public methods:

	/**
	 * Disposes the CharModel and removes all associated resources.
	 * - Disposes materials and geometries.
	 * - Deletes faceline texture if it exists.
	 * - Deletes all mask textures.
	 * - Removes all meshes from the scene.
	 */
	dispose() {
		console.debug('CharModel.dispose:', this);
		this._finalizeCharModel(); // Should've been called already
		// Dispose meshes (materials, geometries)
		this.meshes.forEach((mesh) => {
			if (!mesh) {
				return;
			}
			if (mesh.material.map) {
				mesh.material.map.dispose();
			}
			if (mesh.material) {
				mesh.material.dispose();
			}
			if (mesh.geometry) {
				mesh.geometry.dispose();
			}
		});
		this._disposeTextures();
	}

	/**
	 * Sets the expression for this CharModel and updates the corresponding mask texture.
	 * @param {number} expression - The new expression index.
	 */
	setExpression(expression) {
		this._model.expression = expression;
		const target = this._maskTargets[expression];
		if (!target || !target.texture) {
			throw new Error(`setExpression: this._maskTargets[${expression}].texture is not a valid texture`);
		}
		const mesh = this.meshes[FFLiShapeType.XLU_MASK];
		if (!mesh) {
			throw new Error('setExpression: this.meshes[FFLiShapeType.XLU_MASK] does not exist, cannot set expression on the mask');
		}

		// Update texture and material.
		mesh.material.map = target.texture;
		mesh.material.needsUpdate = true;
	}

	/**
	 * The current expression for this CharModel.
	 * Use setExpression to set the expression.
	 * @returns {FFLExpression} The current expression.
	 */
	get expression() {
		return this._model.expression; // mirror
	}

	set expression(_) {
		throw new Error('nope you cannot do this, try setExpression instead');
	}

	/**
	 * The faceline color for this CharModel.
	 * @returns {THREE.Color} The faceline color.
	 */
	get facelineColor() {
		if (!this._facelineColor) {
			this._facelineColor = this._getFacelineColor();
		}
		return this._facelineColor;
	}

	/**
	 * The favorite color for this CharModel.
	 * @returns {THREE.Vector4} The favorite color as Vector4.
	 */
	get favoriteColor() {
		if (!this._favoriteColor) {
			this._favoriteColor = this._getFavoriteColor();
		}
		return this._favoriteColor;
	}

	/**
	 * The parameters in which to transform hats and other accessories.
	 * @returns {Object} The PartsTransform object containing THREE.Vector3.
	 */
	get partsTransform() {
		if (!this._partsTransform) {
			// Set partsTransform property as THREE.Vector3.
			this._partsTransform = this._getPartsTransform();
		}
		return this._partsTransform;
	}

	/**
	 * @enum {number}
	 */
	static BodyScaleMode = {
		Apply: 0, // Applies scale like all apps.
		Limit: 1 // Limits scale so that the pants are not visible.
	};

	/**
	 * Gets a vector in which to scale the body model for this CharModel.
	 * @param {CharModel.BodyScaleMode} [scaleMode=CharModel.BodyScaleMode.Apply] scaleMode
	 * @returns {THREE.Vector3} Scale vector for the body model.
	 */
	getBodyScale(scaleMode = CharModel.BodyScaleMode.Apply) {
		const build = this._model.charInfo.body.build;
		const height = this._model.charInfo.body.height;

		const bodyScale = new THREE.Vector3();
		switch (scaleMode) {
			case CharModel.BodyScaleMode.Apply: {
				// calculated in this function: void __cdecl nn::mii::detail::`anonymous namespace'::GetBodyScale(struct nn::util::Float3 *, int, int)
				// in libnn_mii/draw/src/detail/mii_VariableIconBodyImpl.cpp
				// also in ffl_app.rpx: FUN_020ec380 (FFLUtility), FUN_020737b8 (mii maker US)
				// ScaleApply
				// 0.47 / 128.0 = 0.003671875
				bodyScale.x = (build * (height * 0.003671875 + 0.4)) / 128.0 +
				// 0.23 / 128.0 = 0.001796875
					height * 0.001796875 + 0.4;
				// 0.77 / 128.0 = 0.006015625
				bodyScale.y = (height * 0.006015625) + 0.5;
				break;
			}
			case CharModel.BodyScaleMode.Limit: {
				// ScaleLimit
				const heightFactor = height / 128.0;
				bodyScale.y = heightFactor * 0.55 + 0.6;
				bodyScale.x = heightFactor * 0.3 + 0.6;
				bodyScale.x = ((heightFactor * 0.6 + 0.8) - bodyScale.x) *
					(build / 128.0) + bodyScale.x;
				break;
			}
			default:
				throw new Error(`getBodyScale: Unexpected value for scaleMode: ${scaleMode}`);
		}

		// z is always set to x for either set
		bodyScale.z = bodyScale.x;

		return bodyScale;
	}
}

// ------------------- setFaceline(charModel, target) ------------------
/**
 * Sets the faceline texture of the given CharModel from the RenderTarget.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.RenderTarget} target - RenderTarget for the faceline texture.
 */
function setFaceline(charModel, target) {
	if (!target || !target.texture) {
		throw new Error('setFaceline: passed in RenderTarget is invalid');
	}
	charModel._facelineTarget = target; // Store for later disposal.
	const mesh = charModel.meshes[FFLiShapeType.OPA_FACELINE];
	if (!mesh) {
		throw new Error('setFaceline: charModel.meshes[FFLiShapeType.OPA_FACELINE] does not exist');
	}

	// Update texture and material.
	mesh.material.map = target.texture;
	mesh.material.needsUpdate = true;
}

// ------------------ _allocateModelSource(data, module) -------------------
/**
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 *
 * @param {Uint8Array} data - Input: FFLStoreData, FFLiCharInfo, StudioCharInfo
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} - The CharModelSource with the data specified.
 */
function _allocateModelSource(data, module) {
	const bufferPtr = module._malloc(FFLiCharInfo.size); // Maximum size.

	// Create modelSource.
	const modelSource = {
		dataSource: FFLDataSource.BUFFER, // Assumes CharInfo by default.
		pBuffer: bufferPtr,
		index: 0 // Only for default, official, MiddleDB; unneeded for raw data
	};

	// module._FFLiGetRandomCharInfo(bufferPtr, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE); return modelSource;

	// Enumerate through supported data types.
	switch (data.length) {
		// @ts-expect-error
		case 96: // sizeof(FFLStoreData)
			modelSource.dataSource = FFLDataSource.STORE_DATA;
			// Fall-through by also copying to heap.
		case FFLiCharInfo.size:
			// modelSource.dataSource = FFLDataSource.BUFFER; // Default option.
			module.HEAPU8.set(data, bufferPtr); // Copy data into heap.
			break;
		case StudioCharInfo.size + 1: // studio obfuscated
			data = studioURLObfuscationDecode(data);
			// Fall-through by converting it the same way.
		case StudioCharInfo.size: { // studio raw, decode it to charinfo
			// Decode studio data in bytes
			const studio = StudioCharInfo.unpack(data);
			const charInfo = convertStudioCharInfoToFFLiCharInfo(studio);
			data = FFLiCharInfo.pack(charInfo);
			module.HEAPU8.set(data, bufferPtr);
			break;
		}
		default: {
			throw new Error(`_allocateModelSource: Unknown data length: ${data.length}`);
		}
	}

	return modelSource; // NOTE: pBuffer must be freed.
}

// --------------- getRandomCharInfo(module, gender, age, race) ---------------
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 *
 * @param {Module} module
 * @param {FFLGender} [gender=FFLGender.ALL] - Gender of the character.
 * @param {FFLAge} [age=FFLAge.ALL] - Age of the character.
 * @param {FFLRace} [race=FFLRace.ALL] - Race of the character.
 * @returns {Uint8Array} - The random FFLiCharInfo.
 */
function getRandomCharInfo(module, gender, age, race) {
	const ptr = module._malloc(FFLiCharInfo.size);
	module._FFLiGetRandomCharInfo(ptr, gender, age, race);
	const result = module.HEAPU8.subarray(ptr, ptr + FFLiCharInfo.size);
	module._free(ptr);
	return result;
}

// --------------------- makeExpressionFlag(expressions) ----------------------
/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * @param {number[]|number} expressions - Array of expression indices, or a single expression index.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 */
function makeExpressionFlag(expressions) {
	function checkRange(i) {
		if (i >= FFLExpression.MAX) {
			throw new Error(`makeExpressionFlag: input out of range: got ${i}, max: ${FFLExpression.MAX}`);
		}
	};

	const flags = new Uint32Array([0, 0, 0]); // FFLAllExpressionFlag

	// Set single expression.
	if (typeof expressions === 'number') {
		// Make expressions into an array.
		expressions = [expressions];
		// Fall-through.
	} else if (!Array.isArray(expressions)) {
		throw new Error('makeExpressionFlag: expected array or single number');
	}

	// Set multiple expressions in an array.
	for (const index of expressions) {
		checkRange(index);
		const part = Math.floor(index / 32); // Determine which 32-bit block
		const bitIndex = index % 32; // Determine the bit within the block

		flags[part] |= (1 << bitIndex); // Set the bit
	}
	return flags;
}

// ---------------- createCharModel(data, desc, materialClass, module) ------------
/**
 * Creates a CharModel from data and FFLCharModelDesc.
 *
 * @param {Uint8Array} data - Raw charInfo data (length must be ≤ FFLiCharInfo.size).
 * @param {Object} [modelDesc=FFLCharModelDesc.default] - The model description.
 * @param {Function} materialClass - Constructor for the material (e.g. FFLShaderMaterial).
 * @param {Module} [module=window.Module] - The Emscripten module.
 * @returns {CharModel} The new CharModel instance.
 */
function createCharModel(data, modelDesc, materialClass, module = window.Module) {
	modelDesc = modelDesc || FFLCharModelDesc.default;
	// Allocate memory for model source, description, char model, and char info.
	const modelSourcePtr = module._malloc(FFLCharModelSource.size);
	const modelDescPtr = module._malloc(FFLCharModelDesc.size);
	const charModelPtr = module._malloc(FFLiCharModel.size);

	// data = getRandomCharInfo(module, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE);
	// Get FFLCharModelSource. This converts and allocates CharInfo.
	const modelSource = _allocateModelSource(data, module);
	const charInfoPtr = modelSource.pBuffer; // Get pBuffer to free it later.

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

		// Unpack and print CharInfo.
		const charInfo = FFLiCharInfo.unpack(module.HEAPU8.subarray(charInfoPtr, charInfoPtr + FFLiCharInfo.size));
		console.debug('createCharModel: Passed in CharInfo:', charInfo);
	}
	// Set field to enable new expressions. This field
	// exists because some callers would leave the other
	// bits undefined but this does not so no reason to not enable
	modelDesc.modelFlag |= FFLModelFlag.NEW_EXPRESSIONS;

	const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
	module.HEAPU8.set(modelDescBuffer, modelDescPtr);
	try {
		// Call FFLInitCharModelCPUStep and check the result.
		const result = module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		handleFFLResult('FFLInitCharModelCPUStep', result);
	} catch (error) {
		// Free CharModel prematurely.
		module._free(charModelPtr);
		throw error;
	} finally {
		// Free temporary allocations.
		module._free(modelSourcePtr);
		module._free(modelDescPtr);
		module._free(charInfoPtr);
	}

	// Create the CharModel instance.
	const charModel = new CharModel(charModelPtr, module, materialClass);
	charModel._data = data; // Store original data passed to function.
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
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {Function} materialClass - Material constructor.
 * @param {Module} module - The Emscripten module.
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
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {Module} module - The Emscripten module from which to read the heap.
 * @returns {THREE.BufferGeometry} The geometry.
 */
function _bindDrawParamGeometry(drawParam, module) {
	// Access FFLAttributeBufferParam.
	const attributes = drawParam.attributeBufferParam.attributeBuffers;
	const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
	// There should always be positions.
	if (positionBuffer.size === 0) {
		throw new Error('_bindDrawParamGeometry: Position buffer has size 0.');
	}
	// Get vertex count from position buffer.
	const vertexCount = positionBuffer.size / positionBuffer.stride;
	const geometry = new THREE.BufferGeometry(); // Create BufferGeometry.
	// Bind index data.
	const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
	const indexCount = drawParam.primitiveParam.indexCount;
	const indices = module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
	geometry.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1));
	// Add attribute data.
	Object.entries(attributes).forEach(([typeStr, buffer]) => {
		const type = parseInt(typeStr);
		if (buffer.size === 0 && type !== FFLAttributeBufferType.POSITION) {
			return;
		}
		switch (type) {
			case FFLAttributeBufferType.POSITION: {
				// Float3, last 4 bytes unused (stride = 16)
				const ptr = buffer.ptr / 4;
				const data = module.HEAPF32.subarray(ptr, ptr + (vertexCount * 4));
				const interleavedBuffer = new THREE.InterleavedBuffer(data, 4);
				geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0));
				break;
			}
			case FFLAttributeBufferType.NORMAL: {
				// Either int8 or 10_10_10_2
				// const data = module.HEAP32.subarray(buffer.ptr / 4, buffer.ptr / 4 + vertexCount);
				// const buf = gl.createBuffer();
				// gl.bindBuffer(gl.ARRAY_BUFFER, buf);
				// gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
				// // Bind vertex type GL_INT_2_10_10_10_REV/ / 0x8D9F.
				// geometry.setAttribute('normal', new THREE.GLBufferAttribute(buf, 0x8D9F, 4, 4));
				const data = module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('normal', new THREE.Int8BufferAttribute(data, buffer.stride, true));
				break;
			}
			case FFLAttributeBufferType.TANGENT: {
				// Int8
				const data = module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('tangent', new THREE.Int8BufferAttribute(data, buffer.stride, true));
				break;
			}
			case FFLAttributeBufferType.TEXCOORD: {
				// Float2
				const ptr = buffer.ptr / 4;
				const data = module.HEAPF32.subarray(ptr, ptr + (vertexCount * 2));
				geometry.setAttribute('uv', new THREE.Float32BufferAttribute(data, buffer.stride / 4));
				break;
			}
			case FFLAttributeBufferType.COLOR: {
				// Uint8
				// Use default value if it does not exist. TODO: handle in shader?
				if (buffer.stride === 0) {
					break;
				}
				// Use "_color" because TODO this is what the FFL-Testing exports do
				const data = module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(data, buffer.stride, true));
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
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam.
 * @returns {THREE.Texture|null} The texture if found.
 */
function _getTextureFromModulateParam(modulateParam) {
	// Only assign texture if pTexture2D is not null.
	if (!modulateParam.pTexture2D ||
		// Ignore faceline and mask.
		modulateParam.type === FFLModulateType.SHAPE_FACELINE ||
		modulateParam.type === FFLModulateType.SHAPE_MASK) {
		return null; // No texture to bind.
	}
	const texturePtr = modulateParam.pTexture2D;
	const texture = window.FFLTextures.get(texturePtr);
	if (!texture) {
		throw new Error(`_getTextureFromModulateParam: Texture not found for ${texturePtr}.`);
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
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam
 * @param {Module} module - The Emscripten module for accessing color pointers via heap.
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
 * @param {Module} module - The Emscripten module.
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

// Flag that does NOT clean up CharModels at all for debugging ONLY.
let _noCharModelCleanupDebug;
_noCharModelCleanupDebug = false; // so that eslint doesn't make it const
let _displayRenderTexturesElement = null;
_displayRenderTexturesElement = document.getElementById('ffl-js-display-render-textures');
if (_displayRenderTexturesElement) {
	console.warn('displaying faceline and mask textures to texture-display element, remove it when you\'re done testing');
}

/**
 * @param {THREE.RenderTarget} renderTarget
 * @param {THREE.WebGLRenderer} renderer
 * @param {bool} [flipY=false]
 */
function _displayTextureDebug(target, renderer) {
	if (_displayRenderTexturesElement) {
		const dataURL = renderTargetToDataURL(target, renderer, true);
		appendImageFromDataUrl(dataURL, _displayRenderTexturesElement);
	}
}

// ---------- initCharModelTextures(charModel, renderer) -----------
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 *
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 */
function initCharModelTextures(charModel, renderer) {
	const module = charModel._module;
	const textureTempObject = charModel._getTextureTempObject();
	// Draw faceline texture if applicable.
	_drawFacelineTexture(charModel, textureTempObject, renderer, module);
	// Draw mask textures for all expressions.
	_drawMaskTextures(charModel, textureTempObject, renderer, module);
	// Finalize CharModel, deleting and freeing it.
	if (!_noCharModelCleanupDebug) {
		charModel._finalizeCharModel();
	}
	// Update the expression to refresh the mask texture.
	charModel.setExpression(charModel.expression);
}

/**
 * Draws and applies the faceline texture for the CharModel.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {Object} textureTempObject - The temporary texture object.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 */
function _drawFacelineTexture(charModel, textureTempObject, renderer, module) {
	// Invalidate faceline texture before drawing (ensures correctness)
	const facelineTempObjectPtr = charModel._getFacelineTempObjectPtr();
	module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
	// Gather the drawParams that make up the faceline texture.
	const drawParams = [
		textureTempObject.facelineTexture.drawParamFaceLine,
		textureTempObject.facelineTexture.drawParamFaceBeard,
		textureTempObject.facelineTexture.drawParamFaceMake
	].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);
	// Note that for faceline DrawParams to not be empty,
	// it must have a texture. For other DrawParams to not
	// be empty they simply need to have a non-zero index count.
	if (drawParams.length === 0) {
		console.debug('_drawFacelineTexture: Skipping faceline texture.');
		return;
	}

	// Get the faceline color from CharModel.
	const bgColor = charModel.facelineColor;
	// Create an offscreen scene.
	const { scene: offscreenScene } = createSceneFromDrawParams(drawParams, bgColor, charModel._materialClass, charModel._module, renderer);
	// Render scene to texture.
	const width = charModel._getResolution() / 2;
	const height = charModel._getResolution();
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false,
		// Use mirrored repeat wrapping.
		wrapS: THREE.MirroredRepeatWrapping,
		wrapT: THREE.MirroredRepeatWrapping
	};
	const target = createAndRenderToTarget(offscreenScene,
		getIdentCamera(), renderer, width, height, options);

	console.debug(`Creating target ${target.texture.id} for faceline`);

	// Optionally view the texture for debugging.
	_displayTextureDebug(target, renderer);

	// Apply texture to CharModel.
	setFaceline(charModel, target);
	// Delete temp faceline object to free resources.
	if (!_noCharModelCleanupDebug) {
		module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModel.ptr, charModel._model.charModelDesc.resourceType);
	}
	disposeSceneMeshes(offscreenScene); // Dispose meshes in scene.
}

// ------ _drawMaskTextures(charModel, textureTempObject, renderer, module) ------
/**
 * Iterates through mask textures and draws each mask texture.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {Object} textureTempObject - The temporary texture object.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 */
function _drawMaskTextures(charModel, textureTempObject, renderer, module) {
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel.ptr + FFLiCharModel.fields.charModelDesc.offset +
		FFLCharModelDesc.fields.allExpressionFlag.offset;
	// Iterate through pRenderTextures to find out which masks are needed.
	for (let i = 0; i < charModel._model.maskTextures.pRenderTextures.length; i++) {
		// pRenderTexture will be set to 1 if mask is meant to be drawn there.
		if (charModel._model.maskTextures.pRenderTextures[i] === 0) {
			continue;
		}
		const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
		const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(module.HEAPU8.subarray(rawMaskDrawParamPtr, rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
		module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);

		const target = _drawMaskTexture(charModel, rawMaskDrawParam, renderer, module);
		console.debug(`Creating target ${target.texture.id} for mask ${i}`);
		charModel._maskTargets[i] = target;
	}
	if (!_noCharModelCleanupDebug) {
		module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, charModel._model.charModelDesc.resourceType);
		module._FFLiDeleteTextureTempObject(charModel.ptr);
	}
}

// -------- _drawMaskTexture(charModel, rawMaskParam, renderer, module) -------
/**
 * Draws a single mask texture based on a RawMaskDrawParam.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {Object} rawMaskParam - The RawMaskDrawParam.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @returns {THREE.RenderTarget} The RenderTarget of this mask texture.
 */
function _drawMaskTexture(charModel, rawMaskParam, renderer, module) {
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
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false
	};
	// Create an offscreen scene with no background (for 2D mask rendering).
	const { scene: offscreenScene } = createSceneFromDrawParams(drawParams, null, charModel._materialClass, module);
	const width = charModel._getResolution();

	const target = createAndRenderToTarget(offscreenScene,
		getIdentCamera(), renderer, width, width, options);

	_displayTextureDebug(target, renderer);

	disposeSceneMeshes(offscreenScene); // Dispose meshes in scene.
	return target;
}

// ---- createSceneFromDrawParams(drawParams, bgColor, materialClass, module) ----
/**
 * Creates an THREE.Scene from an array of drawParams, converting each
 * to a new mesh. Used for one-time rendering of faceline/mask 2D planes.
 *
 * @param {Array<FFLDrawParam>} drawParams - Array of FFLDrawParam.
 * @param {THREE.Color|null} [bgColor=null] - Optional background color.
 * @param {Function} materialClass - The material constructor. This shader must be able to handle the texture swizzling (RGB_LAYERED, LUMINANCE_ALPHA, etc.) for textures that create mask and faceline.
 * @param {Module} module - The Emscripten module.
 * @returns {{scene: THREE.Scene, meshes: Array<THREE.Mesh>}}
 */
function createSceneFromDrawParams(drawParams, bgColor = null, materialClass, module) {
	const scene = new THREE.Scene();
	// For 2D plane rendering, set the background if provided.
	scene.background = bgColor || null;
	const meshes = [];
	drawParams.forEach((dp) => {
		const mesh = drawParamToMesh(dp, materialClass, module);
		if (mesh) {
			scene.add(mesh);
			meshes.push(mesh);
		}
	});
	return { scene, meshes };
}

// -------------------- getIdentCamera(flipY) ---------------------
/**
 * Returns an ortho camera that is effectively the same as
 * if you used identity MVP matrix, for rendering 2D planes.
 *
 * @param {bool} [flipY=false] - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {THREE.OrthographicCamera} The orthographic camera.
 */
function getIdentCamera(flipY = false) {
	// Create an orthographic camera with bounds [-1, 1] in x and y.
	const camera = new THREE.OrthographicCamera(-1, 1,
		// Use [1, -1] except when using flipY.
		(flipY ? -1 : 1), (flipY ? 1 : -1), 0.1, 10);
	camera.position.z = 1;
	return camera;
}

// - createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions) -
/**
 * Creates a Three.js RenderTarget, renders the scene with
 * the given camera, and returns the render target.
 *
 * @param {THREE.Scene} scene - The scene to render.
 * @param {THREE.Camera} camera - The camera to use.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {number} width - Desired width of the target.
 * @param {number} height - Desired height of the target.
 * @param {Object} [targetOptions={}] - Optional options for the render target.
 * @returns {THREE.RenderTarget} The render target (which contains .texture).
 */
function createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions = {}) {
	// Set default options for the RenderTarget.
	const options = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		...targetOptions
	};
	const renderTarget = new THREE.WebGLRenderTarget(width, height, options);
	// Get previous render target to switch back to.
	const prevTarget = renderer.getRenderTarget();
	renderer.setRenderTarget(renderTarget); // Set new target.
	renderer.render(scene, camera); // Render.
	renderer.setRenderTarget(prevTarget); // Set previous target.
	return renderTarget; // This needs to be disposed when done.
}

// --------------- disposeSceneMeshes(scene) --------------
/**
 * Disposes all meshes in a scene.
 *
 * @param {THREE.Scene} scene - The scene whose meshes should be disposed.
 */
function disposeSceneMeshes(scene) {
	scene.children.forEach((obj) => {
		if (obj instanceof THREE.Mesh) {
			// Dispose material, geometry, and remove all meshes.
			if (obj.material.map) {
				obj.material.map.dispose();
			}
			if (obj.material) {
				obj.material.dispose();
			}
			if (obj.geometry) {
				obj.geometry.dispose();
			}
			scene.remove(obj);
		}
	});
}

// ----------- renderTargetToDataURL(renderTarget, renderer, flipY) ---------------
/**
 * Gets a data URL for a render target's texture using the same renderer.
 *
 * @param {THREE.RenderTarget} renderTarget - The render target.
 * @param {THREE.WebGLRenderer} renderer - The renderer (MUST be the same renderer used for the target).
 * @param {bool} [flipY=false] - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {string} The data URL representing the RenderTarget's texture contents.
 */
function renderTargetToDataURL(renderTarget, renderer, flipY = false) {
	// Create a new scene using a full-screen quad.
	const scene = new THREE.Scene();
	scene.background = null;
	// Assign a transparent, textured, and double-sided material.
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		map: renderTarget.texture,
		transparent: true
	});
	const plane = new THREE.PlaneGeometry(2, 2); // Full-screen quad
	const mesh = new THREE.Mesh(plane, material);
	scene.add(mesh);

	// Use an orthographic camera that fits the full screen.
	const camera = getIdentCamera(flipY);
	// Get previous render target and size.
	const prevTarget = renderer.getRenderTarget();
	const size = new THREE.Vector2();
	renderer.getSize(size);

	// Render to the main canvas to extract pixels.
	renderer.setRenderTarget(null); // Switch render target.
	renderer.setSize(renderTarget.width, renderTarget.height, false);
	renderer.render(scene, camera);

	// Convert the renderer's canvas to an image.
	const dataURL = renderer.domElement.toDataURL('image/png');

	// Cleanup.
	material.dispose();
	plane.dispose();
	scene.remove(mesh);

	// Restore previous size and target.
	renderer.setSize(size.x, size.y, false);
	renderer.setRenderTarget(prevTarget);
	return dataURL;
}

/**
 * Appends an image (from a data URL) to a DOM element.
 *
 * @param {string} dataURL - The image data URL.
 * @param {HTMLElement} [container=document.body] - The container element.
 */
function appendImageFromDataUrl(dataURL, container) {
	if (!container) {
		console.warn('appendImageFromDataUrl: you did not specify "container" so we will use document.body, don\'t be surprised if your image ends up in brazil');
		container = document.body;
	}
	const img = new Image();
	img.src = dataURL;
	container.appendChild(img);
}

// ------------- updateCharModel(charModel, data, renderer, descOrExpFlag) --------------
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 *
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @param {Object|Array|Uint32Array|null} descOrExpFlag - Either a new FFLCharModelDesc object, an array of expressions, a single expression, or an expression flag.
 * @returns {CharModel} The updated CharModel instance.
 */
function updateCharModel(charModel, newData, renderer, descOrExpFlag = null) {
	let newModelDesc;
	newData = newData || charModel._data;

	// Initialize newFlag as the current model's expression flag.
	let newFlag = charModel._model.charModelDesc.allExpressionFlag;
	// Set newModelDesc depending on cases.
	switch (true) {
		// Array of expressions or single expression was passed in.
		case (Array.isArray(descOrExpFlag) || typeof descOrExpFlag === 'number'): {
			// Set descOrExpFlag as an expression flag.
			descOrExpFlag = makeExpressionFlag(descOrExpFlag);
			// Fall-through to set it as newFlag.
		}
		// descOrExpFlag is an expression flag:
		case (descOrExpFlag instanceof Uint32Array): {
			// If this is already an expression flag (Uint32Array), use it.
			// (Or if it was set by the last case)
			newFlag = descOrExpFlag;
			// Fall-through to inherit the rest of CharModelDesc.
		}
		// descOrExpFlag is null/falsey:
		case (!descOrExpFlag): {
			// Inherit the CharModelDesc from the current model.
			newModelDesc = charModel._model.charModelDesc;
			// Set newFlag as the current (if unmodified) or new flag.
			newModelDesc.allExpressionFlag = newFlag;
			break;
		}
		// Assume that descOrExpFlag is a new FFLCharModelDesc.
		case (typeof descOrExpFlag === 'object'): {
			newModelDesc = descOrExpFlag;
			break;
		}
		default:
			throw new Error('updateCharModel: unexpected type for descOrExpFlag');
	}
	/*
	if (Array.isArray(descOrExpFlag) || typeof descOrExpFlag === 'number') {
		let newFlag;
		// If this is already an expression flag (Uint32Array), use it.
		if (descOrExpFlag instanceof Uint32Array) {
			newFlag = descOrExpFlag;
		} else {
			// If an array is passed, treat it as a new expression flag.
			newFlag = makeExpressionFlag(descOrExpFlag);
		}
		// Inherit the CharModelDesc from the current model.
		newModelDesc = charModel._model.charModelDesc;
		newModelDesc.allExpressionFlag = newFlag;
	} else if (!descOrExpFlag) {
		// Reuse old modelDesc.
		newModelDesc = charModel._model.charModelDesc;
	} else {
		newModelDesc = descOrExpFlag;
	}
	*/
	// Dispose of the old CharModel.
	charModel.dispose();
	// Create a new CharModel with the new data and ModelDesc.
	const newCharModel = createCharModel(newData, newModelDesc, charModel._materialClass, charModel._module);
	// Initialize its textures.
	initCharModelTextures(newCharModel, renderer, charModel._module);
	return newCharModel;
}

/**
 * @enum {number}
 */
const ViewType = {
	Face: 0, // Typical icon body view.
	MakeIcon: 1, // FFLMakeIcon matrix
	IconFovy45: 2 // Custom
};

/**
 * @param {ViewType} viewType
 * @param {number} [width=1] - Width of the view.
 * @param {number} [height=1] - Height of the view.
 * @returns {THREE.PerspectiveCamera} The camera representing the view type specified.
 */
function getCameraForViewType(viewType, width = 1, height = 1) {
	const aspect = width / height;
	switch (viewType) {
		case ViewType.MakeIcon: {
			const fovy = 10; // Math.atan2(43.2 / aspect, 500) / 0.5;
			const camera = new THREE.PerspectiveCamera(fovy, aspect, 500, 1000);
			camera.position.set(0, 34.5, 600);
			camera.lookAt(0, 34.5, 0.0);
			return camera;
		}
		case ViewType.IconFovy45: {
			const camera = new THREE.PerspectiveCamera(45, aspect, 50, 1000);
			camera.position.set(0, 34, 110);
			camera.lookAt(0, 34, 0);
			return camera;
		}
		default:
			throw new Error('getCameraForViewType: not implemented');
	}
}

// ----- createCharModelIcon(charModel, renderer, viewType, width, height) -----
/**
 * Creates a small icon (data URL) representing the CharModel.
 * Renders an offscreen scene with a copy of each mesh scaled down.
 *
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {ViewType} [viewType=ViewType.IconFovy45] viewType
 * @param {number} [width=256] - Desired icon width.
 * @param {number} [height=256] - Desired icon height.
 * @returns {string} A data URL of the icon image.
 */
function createCharModelIcon(charModel, renderer, viewType = ViewType.MakeIcon, width = 256, height = 256) {
	// Create an offscreen scene for the icon.
	const iconScene = new THREE.Scene();
	iconScene.background = null; // Transparent background.
	// Add meshes from the CharModel.
	charModel.meshes.forEach((mesh) => {
		if (mesh) {
			// Clone and add mesh.
			iconScene.add(mesh.clone());
			// Adding the original meshes
			// causes them to disappear from
			// the original scene they were added to.
		}
	});

	// Get camera based on viewType parameter.
	const iconCamera = getCameraForViewType(viewType);

	const target = createAndRenderToTarget(iconScene,
		iconCamera, renderer, width, height);

	disposeSceneMeshes(iconScene); // Dispose cloned meshes in scene.
	const dataURL = renderTargetToDataURL(target, renderer);
	target.dispose(); // Dispose RenderTarget before returning.
	return dataURL;
}

// // ---------------------------------------------------------------------
// //                        Conversion Utilities
// // ---------------------------------------------------------------------

/**
 * @typedef {Object} StudioCharInfo
 * @property {number} beardColor
 * @property {number} beardType
 * @property {number} build
 * @property {number} eyeAspect
 * @property {number} eyeColor
 * @property {number} eyeRotate
 * @property {number} eyeScale
 * @property {number} eyeType
 * @property {number} eyeX
 * @property {number} eyeY
 * @property {number} eyebrowAspect
 * @property {number} eyebrowColor
 * @property {number} eyebrowRotate
 * @property {number} eyebrowScale
 * @property {number} eyebrowType
 * @property {number} eyebrowX
 * @property {number} eyebrowY
 * @property {number} facelineColor
 * @property {number} facelineMake
 * @property {number} facelineType
 * @property {number} facelineWrinkle
 * @property {number} favoriteColor
 * @property {number} gender
 * @property {number} glassColor
 * @property {number} glassScale
 * @property {number} glassType
 * @property {number} glassY
 * @property {number} hairColor
 * @property {number} hairFlip
 * @property {number} hairType
 * @property {number} height
 * @property {number} moleScale
 * @property {number} moleType
 * @property {number} moleX
 * @property {number} moleY
 * @property {number} mouthAspect
 * @property {number} mouthColor
 * @property {number} mouthScale
 * @property {number} mouthType
 * @property {number} mouthY
 * @property {number} mustacheScale
 * @property {number} mustacheType
 * @property {number} mustacheY
 * @property {number} noseScale
 * @property {number} noseType
 * @property {number} noseY
 */

/**
 * Structure representing data from the studio.mii.nintendo.com site and API.
 *
 * @type {StructInstance<StudioCharInfo>}
 */
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
 * Creates an FFLiCharInfo object from StudioCharInfo.
 *
 * @param {StudioCharInfo} src - The StudioCharInfo instance.
 * @returns {FFLiCharInfo} The FFLiCharInfo output.
 */
function convertStudioCharInfoToFFLiCharInfo(src) {
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
			birthPlatform: 3
		},
		createID: {
			data: new Array(10).fill(0)
		},
		padding_0: 0,
		authorType: 0,
		authorID: new Array(8).fill(0)
	};
}

/**
 * @param {Uint8Array} data - Obfuscated Studio URL data.
 * @returns {Uint8Array} - Decoded Uint8Array representing CharInfoStudio.
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

	return decodedData.slice(0, StudioCharInfo.size); // Clamp to StudioCharInfo.size
}

/**
 * Creates a StudioCharInfo object from FFLiCharInfo.
 *
 * @param {FFLiCharInfo} src - The FFLiCharInfo instance.
 * @returns {StudioCharInfo} The StudioCharInfo output.
 */
function convertFFLiCharInfoToStudioCharInfo(src) {
	return {
		beardColor: commonColorUnmask(src.beard.color),
		beardType: src.beard.type,
		build: src.body.build,
		eyeAspect: src.eye.aspect,
		eyeColor: commonColorUnmask(src.eye.color),
		eyeRotate: src.eye.rotate,
		eyeScale: src.eye.scale,
		eyeType: src.eye.type,
		eyeX: src.eye.x,
		eyeY: src.eye.y,
		eyebrowAspect: src.eyebrow.aspect,
		eyebrowColor: commonColorUnmask(src.eyebrow.color),
		eyebrowRotate: src.eyebrow.rotate,
		eyebrowScale: src.eyebrow.scale,
		eyebrowType: src.eyebrow.type,
		eyebrowX: src.eyebrow.x,
		eyebrowY: src.eyebrow.y,
		facelineColor: src.faceline.color,
		facelineMake: src.faceline.make,
		facelineType: src.faceline.type,
		facelineWrinkle: src.faceline.texture,
		favoriteColor: src.personal.favoriteColor,
		gender: src.personal.gender,
		glassColor: commonColorUnmask(src.glass.color),
		glassScale: src.glass.scale,
		glassType: src.glass.type,
		glassY: src.glass.y,
		hairColor: commonColorUnmask(src.hair.color),
		hairFlip: src.hair.flip,
		hairType: src.hair.type,
		height: src.body.height,
		moleScale: src.mole.scale,
		moleType: src.mole.type,
		moleX: src.mole.x,
		moleY: src.mole.y,
		mouthAspect: src.mouth.aspect,
		mouthColor: commonColorUnmask(src.mouth.color),
		mouthScale: src.mouth.scale,
		mouthType: src.mouth.type,
		mouthY: src.mouth.y,
		mustacheScale: src.beard.scale,
		mustacheType: src.beard.mustache,
		mustacheY: src.beard.y,
		noseScale: src.nose.scale,
		noseType: src.nose.type,
		noseY: src.nose.y
	};
}

// // ---------------------------------------------------------------------
// //                        Generic Utility
// // ---------------------------------------------------------------------

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

// --------------- Main Entry-Point Methods (Scene & Animation) -----------------

// Query selector string for element with "content" attribute for path to the resource.
const querySelectorResourcePath = 'meta[itemprop=ffl-js-resource-fetch-path]';

// When the DOM is ready, initialize FFL and TextureManager.
/**
 * Fetches the FFL resource from the specified path or the "content"
 * attribute of this HTML element: meta[itemprop=ffl-js-resource-fetch-path]
 * It then calls initializeFFL on the specified module.
 *
 * @param {string|null} [resourcePath=null] - The URL for the FFL resource.
 * @param {Module} [module=window.Module] - The Emscripten module instance.
 * @returns {void} Returns when the fetch and initializeFFL are finished.
 */
async function initializeFFLWithResource(resourcePath = null, module = window.Module) {
	if (!resourcePath) {
		// Load FFL resource file from meta tag in HTML.
		const resourceFetchElement = document.querySelector(querySelectorResourcePath);
		if (!resourceFetchElement || !resourceFetchElement.getAttribute('content')) {
			throw new Error(`Element not found or does not have "content" attribute with path to FFL resource: ${querySelectorResourcePath}`);
		}
		// URL to resource for FFL.
		resourcePath = resourceFetchElement.getAttribute('content');
	}
	try {
		const response = await fetch(resourcePath); // Fetch resource.
		// Initialize FFL using the resource from fetch response.
		await initializeFFL(response, module);
		// TextureManager must be initialized after FFL.
		window.FFLTextures = new TextureManager(module);
		console.debug('initializeFFLWithResource: FFLiManager and TextureManager initialized, exiting');
	} catch (error) {
		alert(`Error initializing FFL with resource: ${error}`);
		console.error(error);
	}
}
