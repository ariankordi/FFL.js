/*!
 * Bindings for FFL, a Mii renderer, in JavaScript.
 * Uses the FFL decompilation by aboood40091.
 * https://github.com/ariankordi/FFL.js
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check

import * as THREE from 'three';

// eslint-disable-next-line jsdoc/valid-types -- TODO: fix "syntax error in type"
/** @typedef {import('three/src/renderers/common/Renderer.js', {with:{'resolution-mode':'import'}}).default} Renderer */

// // ---------------------------------------------------------------------
// //  Emscripten Types
// // ---------------------------------------------------------------------
// TODO PATH: src/ModuleType.js

/**
 * Emscripten "Module" type.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
 * @typedef {Object} Module
 * @property {function(): void} onRuntimeInitialized
 * @property {function(object): void} destroy
 * @property {boolean|null} calledRun
 * // USE_TYPED_ARRAYS == 2
 * @property {Int8Array} HEAP8
 * @property {Uint8Array} HEAPU8
 * @property {Uint16Array} HEAPU16
 * @property {Uint32Array} HEAPU32
 * @property {Float32Array} HEAPF32
 * Runtime methods:
 * @property {function(number): number} _malloc
 * @property {function(number): void} _free
 * @property {function((...args: *[]) => *, string=): number} addFunction
 * @property {function(number): void} removeFunction
 *
 * ------------------------------- FFL Bindings -------------------------------
 * Only used functions are defined here.
 * @property {function(number, number, number, number): *} _FFLInitCharModelCPUStepWithCallback
 * @property {function(number): *} _FFLDeleteCharModel
 * @property {function(number, number, number, number): *} _FFLiGetRandomCharInfo
 * @property {function(number, number): *} _FFLpGetStoreDataFromCharInfo
 * @property {function(number, number): *} _FFLpGetCharInfoFromStoreData
 * @property {function(number, number): *} _FFLpGetCharInfoFromMiiDataOfficialRFL
 * @property {function(number, number, number, number, boolean): *} _FFLGetAdditionalInfo
 * @property {function(number, number): *} _FFLInitRes
 * @property {function(): *} _FFLInitResGPUStep
 * @property {function(): *} _FFLExit
 * @property {function(number, number): *} _FFLGetFavoriteColor
 * @property {function(number): *} _FFLSetLinearGammaMode
 * @property {function(boolean): *} _FFLSetTextureFlipY
 * @property {function(boolean): *} _FFLSetNormalIsSnorm8_8_8_8
 * @property {function(boolean): *} _FFLSetFrontCullForFlipX
 * @property {function(number): *} _FFLSetTextureCallback
 * @property {function(number): *} _FFLiDeleteTextureTempObject
 * @property {function(number, number, number): *} _FFLiDeleteTempObjectMaskTextures
 * @property {function(number, number, number): *} _FFLiDeleteTempObjectFacelineTexture
 * @property {function(number): *} _FFLiiGetEyeRotateOffset
 * @property {function(number): *} _FFLiiGetEyebrowRotateOffset
 * @property {function(number): *} _FFLiInvalidateTempObjectFacelineTexture
 * @property {function(number): *} _FFLiInvalidateRawMask
 * @property {function(number, boolean): *} _FFLiVerifyCharInfoWithReason
 * @property {function(): void} _exit
 */

// // ---------------------------------------------------------------------
// //  Enum Definitions
// // ---------------------------------------------------------------------
// TODO PATH: src/Enums.js

/**
 * Result type for Face Library functions (not the real FFL enum).
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 * @enum {number}
 * @package
 */
const FFLResult = {
	OK: 0,
	ERROR: 1,
	HDB_EMPTY: 2,
	FILE_INVALID: 3,
	MANAGER_NOT_CONSTRUCT: 4,
	FILE_LOAD_ERROR: 5,
	// : 6,
	FILE_SAVE_ERROR: 7,
	// : 8,
	RES_FS_ERROR: 9,
	ODB_EMPTY: 10,
	// :  11,
	OUT_OF_MEMORY: 12,
	// :  13,
	// :  14,
	// :  15,
	// :  16,
	UNKNOWN_17: 17,
	FS_ERROR: 18,
	FS_NOT_FOUND: 19,
	MAX: 20
};

/**
 * Used to index {@link FFLiCharModel.drawParam}.
 * @enum {number}
 * @package
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
 * @package
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
 * @package
 */
const FFLCullMode = {
	NONE: 0,
	BACK: 1,
	FRONT: 2,
	MAX: 3
};

/**
 * Indicates how the shape should be colored by the fragment shader.
 * @enum {number}
 * @public
 */
const FFLModulateMode = {
	/** No Texture, Has Color (R) */
	CONSTANT: 0,
	/** Has Texture, No Color */
	TEXTURE_DIRECT: 1,
	/** Has Texture, Has Color (R + G + B) */
	RGB_LAYERED: 2,
	/** Has Texture, Has Color (R) */
	ALPHA: 3,
	/** Has Texture, Has Color (R) */
	LUMINANCE_ALPHA: 4,
	/** Has Texture, Has Color (R) */
	ALPHA_OPA: 5
};

/**
 * This is the type of shape to be rendered.
 * It's separated into: opaque, translucent,
 * and past SHAPE_MAX is for faceline/mask.
 * @enum {number}
 * @public
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
 * FFL supports loading middle and high resources
 * in separate slots, but we only use the high type.
 * @enum {number}
 * @package
 */
const FFLResourceType = {
	MIDDLE: 0,
	HIGH: 1,
	MAX: 2
};

/**
 * IDs corresponding to expressions.
 * Reference: https://github.com/ariankordi/ffl/blob/nsmbu-win-port-linux64/include/nn/ffl/FFLExpression.h
 * @enum {number}
 * @public
 */
const FFLExpression = {
	NORMAL: 0,
	SMILE: 1,
	ANGER: 2,
	/** Primary name for expression 3. */
	SORROW: 3,
	PUZZLED: 3,
	/** Primary name for expression 4. */
	SURPRISE: 4,
	SURPRISED: 4,
	BLINK: 5,
	OPEN_MOUTH: 6,
	/** Primary name for expression 7. */
	SMILE_OPEN_MOUTH: 7,
	HAPPY: 7,
	ANGER_OPEN_MOUTH: 8,
	SORROW_OPEN_MOUTH: 9,
	SURPRISE_OPEN_MOUTH: 10,
	BLINK_OPEN_MOUTH: 11,
	WINK_LEFT: 12,
	WINK_RIGHT: 13,
	WINK_LEFT_OPEN_MOUTH: 14,
	WINK_RIGHT_OPEN_MOUTH: 15,
	/** Primary name for expression 16. */
	LIKE_WINK_LEFT: 16,
	LIKE: 16,
	LIKE_WINK_RIGHT: 17,
	FRUSTRATED: 18,

	// Additional expressions from AFL.
	// Enum names are completely made up.
	BORED: 19,
	BORED_OPEN_MOUTH: 20,
	SIGH_MOUTH_STRAIGHT: 21,
	SIGH: 22,
	DISGUSTED_MOUTH_STRAIGHT: 23,
	DISGUSTED: 24,
	LOVE: 25,
	LOVE_OPEN_MOUTH: 26,
	DETERMINED_MOUTH_STRAIGHT: 27,
	DETERMINED: 28,
	CRY_MOUTH_STRAIGHT: 29,
	CRY: 30,
	BIG_SMILE_MOUTH_STRAIGHT: 31,
	BIG_SMILE: 32,
	CHEEKY: 33,
	CHEEKY_DUPLICATE: 34,
	JOJO_EYES_FUNNY_MOUTH: 35,
	JOJO_EYES_FUNNY_MOUTH_OPEN: 36,
	SMUG: 37,
	SMUG_OPEN_MOUTH: 38,
	RESOLVE: 39,
	RESOLVE_OPEN_MOUTH: 40,
	UNBELIEVABLE: 41,
	UNBELIEVABLE_DUPLICATE: 42,
	CUNNING: 43,
	CUNNING_DUPLICATE: 44,
	RASPBERRY: 45,
	RASPBERRY_DUPLICATE: 46,
	INNOCENT: 47,
	INNOCENT_DUPLICATE: 48,
	CAT: 49,
	CAT_DUPLICATE: 50,
	DOG: 51,
	DOG_DUPLICATE: 52,
	TASTY: 53,
	TASTY_DUPLICATE: 54,
	MONEY_MOUTH_STRAIGHT: 55,
	MONEY: 56,
	SPIRAL_MOUTH_STRAIGHT: 57,
	CONFUSED: 58,
	CHEERFUL_MOUTH_STRAIGHT: 59,
	CHEERFUL: 60,
	BLANK_61: 61,
	BLANK_62: 62,
	GRUMBLE_MOUTH_STRAIGHT: 63,
	GRUMBLE: 64,
	MOVED_MOUTH_STRAIGHT: 65,
	MOVED: 66,
	SINGING_MOUTH_SMALL: 67,
	SINGING: 68,
	STUNNED: 69,

	MAX: 70
};

/**
 * Flags that modify how the head model is created.
 * These go in {@link FFLCharModelDesc.modelFlag}.
 * @enum {number}
 * @public
 */
const FFLModelFlag = {
	/** Default model setting. */
	NORMAL: 1 << 0,
	/** Uses a variant of hair designed for hats. */
	HAT: 1 << 1,
	/** Discards hair from the model, used for helmets and similar headwear. */
	FACE_ONLY: 1 << 2,
	/** Limits Z depth on the nose, useful for helmets and similar headwear. */
	FLATTEN_NOSE: 1 << 3,
	/** Enables the model's expression flag to use expressions beyond 32. */
	NEW_EXPRESSIONS: 1 << 4,
	/**
	 * This flag only generates new textures when initializing a CharModel
	 * but does not initialize shapes.
	 * **Note:** This means you cannot use DrawOpa/Xlu when this is set.
	 */
	NEW_MASK_ONLY: 1 << 5
};

// // ---------------------------------------------------------------------
// //  Struct Definitions
// // ---------------------------------------------------------------------
// TODO PATH: src/Structs.js
// Mostly leading up to FFLDrawParam.

/** @package */
const FFLColor_size = 16;
/**
 * Converts an FFLColor pointer to a THREE.Color.
 * @param {Float32Array} f32 - HEAPF32 buffer view within {@link Module}.
 * @param {number} colorPtr - The pointer to the color.
 * @returns {THREE.Color} The RGB color.
 */
const _getFFLColor = (f32, colorPtr) =>
	new THREE.Color().fromArray(f32, colorPtr / 4);

/** @package */
const FFLDrawParam_size = 104;
/**
 * @param {Uint8Array} u8 - module.HEAPU8
 * @param {number} ptr - Pointer to the type.
 * @returns {FFLDrawParam} Object form of FFLDrawParam.
 * @package
 */
function _unpackFFLDrawParam(u8, ptr) {
	const view = new DataView(u8.buffer, ptr);

	const FFLAttributeBuffer_size = 12;
	const attributeBuffers = new Array(FFLAttributeBufferType.MAX);
	for (let i = 0; i < FFLAttributeBufferType.MAX; i++) {
		attributeBuffers[i] = {
			size: view.getUint32((i * FFLAttributeBuffer_size) + 0, true),
			stride: view.getUint32((i * FFLAttributeBuffer_size) + 4, true),
			ptr: view.getUint32((i * FFLAttributeBuffer_size) + 8, true)
		};
	}

	const modulateParam = {
		mode: view.getUint32(60, true),
		type: view.getUint32(60 + 4, true),
		pColorR: view.getUint32(60 + 8, true),
		pColorG: view.getUint32(60 + 12, true),
		pColorB: view.getUint32(60 + 16, true),
		pTexture2D: view.getUint32(60 + 20, true)
	};

	const primitiveParam = {
		primitiveType: view.getUint32(88, true),
		indexCount: view.getUint32(88 + 4, true),
		pAdjustMatrix: view.getUint32(88 + 8, true),
		pIndexBuffer: view.getUint32(88 + 12, true)
	};

	return {
		attributeBuffers,
		modulateParam,
		cullMode: view.getUint32(84, true),
		primitiveParam
	};
}

// ---------------------- Begin FFLiCharInfo Definition ----------------------
// TODO PATH: src/StructFFLiCharModel.js

/**
 * @typedef {Object} FFLiCharInfo
 * @property {number} miiVersion
 * @property {number} faceType
 * @property {number} faceColor
 * @property {number} faceTex
 * @property {number} faceMake
 * @property {number} hairType
 * @property {number} hairColor
 * @property {number} hairFlip
 * @property {number} eyeType
 * @property {number} eyeColor
 * @property {number} eyeScale
 * @property {number} eyeAspect
 * @property {number} eyeRotate
 * @property {number} eyeX
 * @property {number} eyeY
 * @property {number} eyebrowType
 * @property {number} eyebrowColor
 * @property {number} eyebrowScale
 * @property {number} eyebrowAspect
 * @property {number} eyebrowRotate
 * @property {number} eyebrowX
 * @property {number} eyebrowY
 * @property {number} noseType
 * @property {number} noseScale
 * @property {number} noseY
 * @property {number} mouthType
 * @property {number} mouthColor
 * @property {number} mouthScale
 * @property {number} mouthAspect
 * @property {number} mouthY
 * @property {number} beardMustache
 * @property {number} beardType
 * @property {number} beardColor
 * @property {number} beardScale
 * @property {number} beardY
 * @property {number} glassType
 * @property {number} glassColor
 * @property {number} glassScale
 * @property {number} glassY
 * @property {number} moleType
 * @property {number} moleScale
 * @property {number} moleX
 * @property {number} moleY
 * @property {number} height
 * @property {number} build
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
 * @property {Uint8Array} createID
 * @property {number} padding_0
 * @property {number} authorType
 * @property {Uint8Array} authorID
 */
const FFLiCharInfo_size = 288;
/**
 * @param {Uint8Array} u8 - module.HEAPU8
 * @param {number} ptr - Pointer to the type.
 * @returns {FFLiCharInfo} Object form of FFLiCharInfo.
 * @package
 */
function _unpackFFLiCharInfo(u8, ptr) {
	const view = new DataView(u8.buffer, ptr);
	const name = new TextDecoder('utf-16le').decode(new Uint16Array(u8.buffer, ptr + 180, 11));
	const creator = new TextDecoder('utf-16le').decode(new Uint16Array(u8.buffer, ptr + 202, 11));
	const createID = new Uint8Array(u8.buffer, 264, 10);
	const authorID = new Uint8Array(u8.buffer, 280, 8);
	return {
		miiVersion: view.getInt32(0, true),
		faceType: view.getInt32(4, true),
		faceColor: view.getInt32(8, true),
		faceTex: view.getInt32(12, true),
		faceMake: view.getInt32(16, true),
		hairType: view.getInt32(20, true),
		hairColor: view.getInt32(24, true),
		hairFlip: view.getInt32(28, true),
		eyeType: view.getInt32(32, true),
		eyeColor: view.getInt32(36, true),
		eyeScale: view.getInt32(40, true),
		eyeAspect: view.getInt32(44, true),
		eyeRotate: view.getInt32(48, true),
		eyeX: view.getInt32(52, true),
		eyeY: view.getInt32(56, true),
		eyebrowType: view.getInt32(60, true),
		eyebrowColor: view.getInt32(64, true),
		eyebrowScale: view.getInt32(68, true),
		eyebrowAspect: view.getInt32(72, true),
		eyebrowRotate: view.getInt32(76, true),
		eyebrowX: view.getInt32(80, true),
		eyebrowY: view.getInt32(84, true),
		noseType: view.getInt32(88, true),
		noseScale: view.getInt32(92, true),
		noseY: view.getInt32(96, true),
		mouthType: view.getInt32(100, true),
		mouthColor: view.getInt32(104, true),
		mouthScale: view.getInt32(108, true),
		mouthAspect: view.getInt32(112, true),
		mouthY: view.getInt32(116, true),
		beardMustache: view.getInt32(120, true),
		beardType: view.getInt32(124, true),
		beardColor: view.getInt32(128, true),
		beardScale: view.getInt32(132, true),
		beardY: view.getInt32(136, true),
		glassType: view.getInt32(140, true),
		glassColor: view.getInt32(144, true),
		glassScale: view.getInt32(148, true),
		glassY: view.getInt32(152, true),
		moleType: view.getInt32(156, true),
		moleScale: view.getInt32(160, true),
		moleX: view.getInt32(164, true),
		moleY: view.getInt32(168, true),
		height: view.getInt32(172, true),
		build: view.getInt32(176, true),
		name,
		creator,
		gender: view.getInt32(224, true),
		birthMonth: view.getInt32(228, true),
		birthDay: view.getInt32(232, true),
		favoriteColor: view.getInt32(236, true),
		favorite: view.getUint8(240),
		copyable: view.getUint8(241),
		ngWord: view.getUint8(242),
		localonly: view.getUint8(243),
		regionMove: view.getInt32(244, true),
		fontRegion: view.getInt32(248, true),
		roomIndex: view.getInt32(252, true),
		positionInRoom: view.getInt32(256, true),
		birthPlatform: view.getInt32(260, true),
		createID,
		padding_0: view.getUint16(274, true),
		authorType: view.getInt32(276, true),
		authorID
	};
}

/**
 * Size of FFLStoreData, the 3DS/Wii U Mii data format. (Not included)
 * @public
 */
/** sizeof(FFLStoreData) */
const FFLStoreData_size = 96;

// ---------------------- Common Color Mask Definitions ----------------------

/** @package */
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
// const commonColorUnmask = color => (color & ~commonColorEnableMask) === 0
// Only unmask color if the mask is enabled.
// 	? color
// 	: color & ~commonColorEnableMask;

// --------------------- Begin FFLiCharModel Definitions ---------------------

/** @package */
const FFL_RESOLUTION_MASK = 0x3fffffff;

/** @enum {number} */
const FacelinePartType = {
	/** Wrinkle */
	LINE: 0,
	MAKE: 1,
	BEARD: 2,
	MAX: 3
};

/**
 * @param {Uint8Array} u8 - module.HEAPU8
 * @param {number} ptr - Pointer to the type.
 * @returns {Array<FFLDrawParam>} Array of DrawParams. Note that this is not the draw order.
 * @package
 */
function _unpackFFLiFacelineTextureTempObject(u8, ptr) {
	const params = new Array(FacelinePartType.MAX);
	for (let type = 0; type < FacelinePartType.MAX; type++) {
		// Each DrawParam is prefixed by a pointer, so let's take an offset of 4
		const p = ptr + 4 + ((4 + FFLDrawParam_size) * type);
		params[type] = _unpackFFLDrawParam(u8, p);
	}
	return params;
}

/** @enum {number} */
const MaskPartType = {
	EYE_R: 0,
	EYE_L: 1,
	EYEBROW_R: 2,
	EYEBROW_L: 3,
	MOUTH: 4,
	MUSTACHE_R: 5,
	MUSTACHE_L: 6,
	MOLE: 7,
	/** Alpha clear. Can be skipped. */
	FILL: 8,
	MAX: 8
};

/**
 * @param {Uint8Array} u8 - module.HEAPU8
 * @param {number} ptr - Pointer to the type.
 * @returns {Array<FFLDrawParam>} Array of DrawParams. Note that this is not the draw order.
 * @package
 */
function _unpackFFLiRawMaskDrawParam(u8, ptr) {
	const params = new Array(MaskPartType.MAX);
	for (let type = 0; type < MaskPartType.MAX; type++) {
		const p = ptr + (FFLDrawParam_size * type);
		params[type] = _unpackFFLDrawParam(u8, p);
	}
	return params;
}

/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @readonly
 * @public
 */
const FFLCharModelDescDefault = {
	/** Typical default. */
	resolution: 512,
	/** Normal expression. */
	allExpressionFlag: new Uint32Array([1, 0, 0]),
	modelFlag: FFLModelFlag.NORMAL,
	/** Default resource type. */
	resourceType: FFLResourceType.HIGH
};

/** @typedef {FFLCharModelDesc|Array<FFLExpression>|FFLExpression|Uint32Array|null} CharModelDescOrExpressionFlag */

/**
 * PartsTransform with THREE.Vector3 type.
 * @typedef {Object<string, import('three').Vector3>} PartsTransform
 * @property {import('three').Vector3} hatTranslate
 * @property {import('three').Vector3} headFrontRotate
 * @property {import('three').Vector3} headFrontTranslate
 * @property {import('three').Vector3} headSideRotate
 * @property {import('three').Vector3} headSideTranslate
 * @property {import('three').Vector3} headTopRotate
 * @property {import('three').Vector3} headTopTranslate
 */

const FFLiCharModel_size = 2156;
/**
 * Internal representation within FFL for the created CharModel.
 * @typedef {Object} FFLiCharModel
 * @property {FFLiCharInfo} charInfo
 * @property {FFLCharModelDesc} charModelDesc
 * @property {FFLExpression} expression
 * @property {number} pTextureTempObject
 * @property {Array<FFLDrawParam>} drawParam
 * @property {Uint32Array} pMaskRenderTextures
 * @property {Float32Array} partsTransform
 */

const FFLCharModelSource_size = 10;
/**
 * @typedef {Object} FFLCharModelSource
 * @property {number} dataSource - Originally FFLDataSource enum.
 * @property {number} pBuffer
 * @property {number} index - Only for default, official, MiddleDB; unneeded for raw data
 */

/**
 * @param {FFLCharModelSource} obj - Object form of FFLCharModelSource.
 * @returns {Uint8Array} Byte form of FFLCharModelSource.
 * @private
 */
function _packFFLCharModelSource(obj) {
	const u8 = new Uint8Array(FFLCharModelSource_size);
	const view = new DataView(u8.buffer);
	view.setUint32(0, obj.dataSource >>> 0, true);
	view.setUint32(4, obj.pBuffer, true);
	// view.setUint16(8, obj.index, true);
	return u8;
}

/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution - Texture resolution for faceline/mask. It's recommended to only use powers of two.
 * @property {Uint32Array} allExpressionFlag - Expression flag, created by {@link makeExpressionFlag}
 * @property {FFLModelFlag} modelFlag
 * @property {FFLResourceType} resourceType
 */
/** @package */
const FFLCharModelDesc_size = 24;
/**
 * @param {FFLCharModelDesc} obj - Object form of FFLCharModelDesc.
 * @returns {Uint8Array} Byte form of FFLCharModelDesc.
 * @package
 */
function _packFFLCharModelDesc(obj) {
	const u8 = new Uint8Array(FFLCharModelDesc_size);
	const view = new DataView(u8.buffer);
	view.setUint32(0, obj.resolution, true);
	const flag = obj.allExpressionFlag;
	view.setUint32(4, flag[0], true);
	view.setUint32(8, flag[1], true);
	view.setUint32(12, flag[2], true);
	view.setUint32(16, obj.modelFlag, true);
	view.setUint32(20, obj.resourceType, true);
	return u8;
}

// The enums below are only for FFLiGetRandomCharInfo.
// Hence, why each one has a value called ALL.

/** @enum {number} */
const FFLGender = {
	MALE: 0,
	FEMALE: 1,
	ALL: 2
};

/** @enum {number} */
const FFLAge = {
	CHILD: 0,
	ADULT: 1,
	ELDER: 2,
	ALL: 3
};

/** @enum {number} */
const FFLRace = {
	BLACK: 0,
	WHITE: 1,
	ASIAN: 2,
	ALL: 3
};

/**
 * @typedef {Object} FFLResourceDesc
 * @property {Array<number>} pData
 * @property {Array<number>} size
 */
const FFLResourceDesc_size = 16;
/**
 * @param {FFLResourceDesc} obj - Object form of FFLResourceDesc.
 * @returns {Uint8Array} Byte form of FFLResourceDesc.
 * @private
 */
function _packFFLResourceDesc(obj) {
	const u8 = new Uint8Array(FFLResourceDesc_size);
	const view = new DataView(u8.buffer);
	view.setUint32(0, obj.pData[0], true);
	view.setUint32(4, obj.pData[1], true);
	view.setUint32(8, obj.size[0], true);
	view.setUint32(12, obj.size[1], true);
	return u8;
}

// // ---------------------------------------------------------------------
// //  Texture Management
// // ---------------------------------------------------------------------

// ------------------------- Texture Related Structs -------------------------
/** @enum {number} */
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
 * @property {number} imageSize
 * @property {number} imagePtr
 * @property {number} mipSize
 * @property {number} mipPtr
 * @property {Uint32Array} mipLevelOffset
 */

/**
 * @param {Uint8Array} u8 - module.HEAPU8
 * @param {number} ptr - Pointer to the type.
 * @returns {FFLTextureInfo} Object form of FFLTextureInfo.
 * @package
 */
function _unpackFFLTextureInfo(u8, ptr) {
	const view = new DataView(u8.buffer, ptr);
	return {
		width: view.getUint16(0, true),
		height: view.getUint16(2, true),
		mipCount: view.getUint8(4),
		format: view.getUint8(5),
		// isGX2Tiled, _padding
		imageSize: view.getUint32(8, true),
		imagePtr: view.getUint32(12, true),
		mipSize: view.getUint32(16, true),
		mipPtr: view.getUint32(20, true),
		mipLevelOffset: new Uint32Array(u8.buffer, ptr + 24, 13)
	};
}

// ------------------------ Class: TextureManager -----------------------------
// TODO PATH: src/TextureManager.js
/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 * @package
 */
class TextureManager {
	/**
	 * Global that controls if texture creation should be changed
	 * to account for WebGL 1.0. (Shapes should be fine)
	 * @public
	 */
	static isWebGL1 = false;

	/**
	 * Constructs the TextureManager. This MUST be created after initializing FFL.
	 * @param {Module} module - The Emscripten module.
	 * @param {boolean} [setToFFLGlobal] - Whether or not to call FFLSetTextureCallback on the constructed callback.
	 */
	constructor(module, setToFFLGlobal = false) {
		/**
		 * @type {Module}
		 * @private
		 */
		this._module = module;
		/**
		 * @type {Map<number, import('three').Texture>}
		 * @private
		 */
		this._textures = new Map(); // Internal map of texture id -> THREE.Texture.
		/** @package */
		this._textureCallbackPtr = 0;

		// Create and set texture callback instance.
		this._setTextureCallback();
		if (setToFFLGlobal) {
			// Set texture callback globally within FFL if chosen.
			module._FFLSetTextureCallback(this._textureCallbackPtr);
		}
	}

	/**
	 * Creates and allocates an FFLTextureCallback instance from callback function pointers.
	 * @param {Module} module - The Emscripten module.
	 * @param {number} createCallback - Function pointer for the create callback.
	 * @param {number} deleteCallback - Function pointer for the delete callback.
	 * @returns {number} Pointer to the FFLTextureCallback.
	 * Note that you MUST free this after using it (done in {@link TextureManager.disposeCallback}).
	 * @private
	 */
	static _allocateTextureCallback(module, createCallback, deleteCallback) {
		const FFLTextureCallback_size = 16;
		const u8 = new Uint8Array(FFLTextureCallback_size);
		const view = new DataView(u8.buffer);
		view.setUint32(8, createCallback, true); // pCreateFunc
		view.setUint32(12, deleteCallback, true); // pDeleteFunc
		const ptr = module._malloc(FFLTextureCallback_size);
		module.HEAPU8.set(u8, ptr);
		return ptr;
	}

	/**
	 * Creates the create/delete functions in Emscripten and allocates and sets
	 * the FFLTextureCallback object as {@link TextureManager._textureCallbackPtr}.
	 * @param {boolean} addDeleteCallback - Whether or not to bind the delete function to the texture callback.
	 */
	_setTextureCallback(addDeleteCallback = false) {
		const mod = this._module;
		// Bind the callbacks to this instance.
		/** @private */
		this._createCallback = mod.addFunction(this._textureCreateFunc.bind(this), 'vppp');
		if (addDeleteCallback) {
			/** @private */
			this._deleteCallback = mod.addFunction(this._textureDeleteFunc.bind(this), 'vpp');
		}
		/** @private */
		this._textureCallbackPtr = TextureManager._allocateTextureCallback(mod,
			this._createCallback, this._deleteCallback ? this._deleteCallback : 0);
	}

	/**
	 * @param {number} format - Enum value for FFLTextureFormat.
	 * @returns {import('three').PixelFormat} Three.js texture format constant.
	 * Note that this function won't work on WebGL1Renderer in Three.js r137-r162
	 * since R and RG textures need to use Luminance(Alpha)Format
	 * (you'd somehow need to detect which renderer is used)
	 * @private
	 */
	_getTextureFormat(format) {
		// Map FFLTextureFormat to Three.js texture formats.

		// THREE.RGFormat did not work for me on Three.js r136/older.
		const useGLES2Formats = Number(THREE.REVISION) <= 136 || TextureManager.isWebGL1;
		const r8 = useGLES2Formats
			// eslint-disable-next-line import/namespace -- deprecated, maybe deleted
			? THREE.LuminanceFormat
			: THREE.RedFormat;
		const r8g8 = useGLES2Formats
		// NOTE: Using THREE.LuminanceAlphaFormat before it
		// was removed on WebGL 1.0/2.0 causes the texture
		// to be converted to RGBA resulting in two issues.
		//     - There is a black outline around glasses
		//     - For glasses that have an inner color, the color is wrongly applied to the frames as well.
			// eslint-disable-next-line import/namespace -- deprecated, maybe deleted
			? THREE.LuminanceAlphaFormat
			: THREE.RGFormat;

		const textureFormatToThreeFormat = {
			[FFLTextureFormat.R8_UNORM]: r8,
			[FFLTextureFormat.R8_G8_UNORM]: r8g8,
			[FFLTextureFormat.R8_G8_B8_A8_UNORM]: THREE.RGBAFormat
		};

		// Determine the data format from the table.
		const dataFormat = textureFormatToThreeFormat[format];
		console.assert(dataFormat !== undefined, `_textureCreateFunc: Unexpected FFLTextureFormat value: ${format}`);
		return dataFormat;
	}

	/**
	 * @param {number} _ - Originally pObj, unused here.
	 * @param {number} textureInfoPtr - Pointer to {@link FFLTextureInfo}.
	 * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
	 * @private
	 */
	_textureCreateFunc(_, textureInfoPtr, texturePtrPtr) {
		const textureInfo = _unpackFFLTextureInfo(this._module.HEAPU8, textureInfoPtr);
		// console.debug(`_textureCreateFunc: width=${textureInfo.width}, height=${textureInfo.height}, format=${textureInfo.format}, imageSize=${textureInfo.imageSize}, mipCount=${textureInfo.mipCount}`);

		/** Resolve THREE.PixelFormat. */
		const format = this._getTextureFormat(textureInfo.format);
		// Copy image data from HEAPU8 via slice. This is base level/mip level 0.
		const imageData = this._module.HEAPU8.slice(textureInfo.imagePtr,
			textureInfo.imagePtr + textureInfo.imageSize);

		/**
		 * Determine whether mipmaps can be used at all.
		 * Implemented in Three.js r137 and only works properly on r138.
		 *
		 * This is also disabled for WebGL 1.0, since there are some NPOT textures.
		 * Those aren't supposed to have mipmaps e.g., glass, but I found that
		 * while in GLES2, some textures that didn't wrap could have mips with
		 * NPOT, this didn't work in WebGL 1.0.
		 */
		const canUseMipmaps = Number(THREE.REVISION) >= 138 && !TextureManager.isWebGL1;
		// Actually use mipmaps if the mip count is over 1.
		const useMipmaps = textureInfo.mipCount > 1 && canUseMipmaps;

		// Create new THREE.Texture with the specified format.
		const texture = new THREE.DataTexture(useMipmaps ? null : imageData,
			textureInfo.width, textureInfo.height, format, THREE.UnsignedByteType);

		texture.magFilter = THREE.LinearFilter;
		// texture.generateMipmaps = true; // not necessary at higher resolutions
		texture.minFilter = THREE.LinearFilter;

		if (useMipmaps) {
			// Add base texture.
			texture.mipmaps = [{
				data: imageData,
				width: textureInfo.width,
				height: textureInfo.height
			}];
			// Enable filtering option for mipmap and add levels.
			texture.minFilter = THREE.LinearMipmapLinearFilter;
			texture.generateMipmaps = false;
			this._addMipmaps(texture, textureInfo);
		}

		texture.needsUpdate = true;
		this.set(texture.id, texture);
		this._module.HEAPU32[texturePtrPtr / 4] = texture.id;
	}

	/**
	 * @param {import('three').Texture} texture - Texture to upload mipmaps into.
	 * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
	 * @private
	 */
	_addMipmaps(texture, textureInfo) {
		// Make sure mipPtr is not null.
		console.assert(textureInfo.mipPtr, '_addMipmaps: mipPtr is null, so the caller incorrectly assumed this texture has mipmaps');

		// Iterate through mip levels starting from 1 (base level is mip level 0).
		for (let mipLevel = 1; mipLevel < textureInfo.mipCount; mipLevel++) {
			// Calculate the offset for the current mip level.
			const mipOffset = textureInfo.mipLevelOffset[mipLevel - 1];

			// Calculate dimensions of the current mip level.
			const mipWidth = Math.max(1, textureInfo.width >> mipLevel);
			const mipHeight = Math.max(1, textureInfo.height >> mipLevel);

			// Get the offset of the next mipmap and calculate end offset.
			const nextMipOffset = textureInfo.mipLevelOffset[mipLevel] || textureInfo.mipSize;
			const end = textureInfo.mipPtr + nextMipOffset;

			// Copy the data from the heap.
			const start = textureInfo.mipPtr + mipOffset;
			const mipData = this._module.HEAPU8.slice(start, end);

			// console.debug(`  - Mip ${mipLevel}: ${mipWidth}x${mipHeight}, `
			// + `offset=${mipOffset}, range=${start}-${end}`);
			// console.debug(uint8ArrayToBase64(mipData)); // will leak the data

			// Push this mip level data into the texture's mipmaps array.
			// @ts-ignore - data = "CompressedTextureMipmap & CubeTexture & HTMLCanvasElement"
			texture.mipmaps.push({
				data: mipData, // Should still accept Uint8Array.
				width: mipWidth,
				height: mipHeight
			});
		}
	}

	/** @private */
	_textureDeleteFunc() { }
	/*
	_textureDeleteFunc(_, texturePtrPtr) {
		const texId = this._module.HEAPU32[texturePtrPtr / 4];
		// this.delete(texId);
		// NOTE: This is effectively no longer used as when
		// we delete a CharModel instance it deletes
		// cap/noseline/glass textures before we are
		// finished with the model itself. It is now only logging
		const tex = this._textures.get(texId);
		if (tex && this.logging) {
			console.debug('Delete texture    ', tex.id);
		}
	}
	*/

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @returns {import('three').Texture|null|undefined} Returns the texture if it is found.
	 * @public
	 */
	get(id) {
		return this._textures.get(id);
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @param {import('three').Texture} texture - Texture to add.
	 * @public
	 */
	set(id, texture) {
		// Set texture with an override for dispose.
		const disposeReal = texture.dispose.bind(texture);
		texture.dispose = () => {
			// Remove this texture from the map after disposing.
			disposeReal();
			this.delete(id); // this = TextureManager
		};

		this._textures.set(id, texture);
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @public
	 */
	delete(id) {
		// Get texture from array instead of with get()
		// because it's okay if it was already deleted.
		const texture = this._textures.get(id);
		if (texture) {
			// This is assuming the texture has already been disposed.
			/** @type {Object<string, *>} */ (texture).source = null;
			/** @type {Object<string, *>} */ (texture).mipmaps = null;
			this._textures.delete(id);
		}
	}

	/**
	 * Disposes/frees the FFLTextureCallback along with
	 * removing the created Emscripten functions.
	 * @public
	 */
	disposeCallback() {
		// if (!this._module) {
		// 	return;
		// }
		if (this._textureCallbackPtr) {
			this._module._free(this._textureCallbackPtr);
			this._textureCallbackPtr = 0;
		}
		if (this._deleteCallback) {
			this._module.removeFunction(this._deleteCallback);
			this._deleteCallback = 0;
		}
		// should always exist?:
		if (this._createCallback) {
			this._module.removeFunction(this._createCallback);
			this._createCallback = 0;
		}
		// this._module = null;
	}

	/**
	 * Disposes of all textures and frees the FFLTextureCallback.
	 * @public
	 */
	dispose() {
		// Dispose of all stored textures.
		this._textures.forEach((tex) => {
			tex.dispose();
		});

		// Clear texture map.
		this._textures.clear();
		// Free texture callback.
		this.disposeCallback();
	}
}

/**
 * Sets the state for whether WebGL 1.0 or WebGPU is being used.
 * Otherwise, textures will appear wrong when not using WebGL 2.0.
 * @param {Renderer} renderer - The WebGLRenderer or WebGPURenderer.
 * @param {Module} module - The module. Must be initialized along with the renderer.
 */
function setRendererState(renderer, module) {
	console.assert(renderer && module, `setRendererState: The renderer and module must both be valid.`);
	if ('capabilities' in renderer &&
		!(/** @type {import('three').WebGLCapabilities} */ (renderer.capabilities).isWebGL2)) {
		TextureManager.isWebGL1 = true;
	} else if (_isWebGPU(renderer)) {
		module._FFLSetTextureFlipY(false);
	}
}

// // ---------------------------------------------------------------------
// //  Classes for FFL Exceptions
// // ---------------------------------------------------------------------
// TODO PATH: src/Exceptions.js

/**
 * Base exception type for all exceptions based on FFLResult.
 * https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs
 * https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 */
class FFLResultException extends Error {
	/**
	 * @param {number|FFLResult} result - The returned {@link FFLResult}.
	 * @param {string} [funcName] - The name of the function that was called.
	 * @param {string} [message] - An optional message for the exception.
	 */
	constructor(result, funcName, message) {
		if (!message) {
			if (funcName) {
				message = `${funcName} failed with FFLResult: ${result}`;
			} else {
				message = `From FFLResult: ${result}`;
			}
		}
		super(message);
		/** The stored {@link FFLResult} code. */
		this.result = result;
	}

	/**
	 * Throws an exception if the {@link FFLResult} is not OK.
	 * @param {number} result - The {@link FFLResult} from an FFL function.
	 * @param {string} [funcName] - The name of the function that was called.
	 * @throws {FFLResultException|FFLResultWrongParam|FFLResultBroken|FFLResultNotAvailable|FFLResultFatal}
	 */
	static handleResult(result, funcName) {
		switch (result) {
			case FFLResult.ERROR: // FFL_RESULT_WRONG_PARAM
				throw new FFLResultWrongParam(funcName);
			case FFLResult.FILE_INVALID: // FFL_RESULT_BROKEN
				throw new FFLResultBroken(funcName);
			case FFLResult.MANAGER_NOT_CONSTRUCT: // FFL_RESULT_NOT_AVAILABLE
				throw new FFLResultNotAvailable(funcName);
			case FFLResult.FILE_LOAD_ERROR: // FFL_RESULT_FATAL
				throw new FFLResultFatal(funcName);
			case FFLResult.OK: // FFL_RESULT_OK
				return; // All is OK.
			default:
				throw new FFLResultException(result, funcName);
		}
	}
}

/**
 * Exception reflecting FFL_RESULT_WRONG_PARAM / FFL_RESULT_ERROR.
 * This is the most common error thrown in FFL. It usually
 * means that input parameters are invalid.
 * So many cases this is thrown: parts index is out of bounds,
 * CharModelCreateParam is malformed, FFLDataSource is invalid, FFLInitResEx
 * parameters are null or invalid... Many different causes, very much an annoying error.
 */
class FFLResultWrongParam extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName) {
		super(FFLResult.ERROR, funcName, `${funcName} returned FFL_RESULT_WRONG_PARAM. This usually means parameters going into that function were invalid.`);
	}
}

/** Exception reflecting FFL_RESULT_BROKEN / FFL_RESULT_FILE_INVALID. */
class FFLResultBroken extends FFLResultException {
	/**
	 * @param {string} [funcName] - Name of the function where the result originated.
	 * @param {string} [message] - An optional message for the exception.
	 */
	constructor(funcName, message) {
		super(FFLResult.FILE_INVALID, funcName, message ? message : `${funcName} returned FFL_RESULT_BROKEN. This usually indicates invalid underlying data.`);
	}
}

/** Exception when resource header verification fails. */
class BrokenInitRes extends FFLResultBroken {
	constructor() {
		super('FFLInitRes', 'The header for the FFL resource is probably invalid. Check the version and magic, should be "FFRA" or "ARFF".');
	}
}

/**
 * Exception reflecting FFL_RESULT_NOT_AVAILABLE / FFL_RESULT_MANAGER_NOT_CONSTRUCT.
 * This is seen when FFLiManager is not constructed, which it is not when FFLInitResEx fails
 * or was never called to begin with.
 */
class FFLResultNotAvailable extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName) {
		super(FFLResult.MANAGER_NOT_CONSTRUCT, funcName, `Tried to call FFL function ${funcName} when FFLManager is not constructed (FFL is not initialized properly).`);
	}
}

/**
 * Exception reflecting FFL_RESULT_FATAL / FFL_RESULT_FILE_LOAD_ERROR.
 * This error indicates database file load errors or failures from FFLiResourceLoader (decompression? misalignment?)
 */
class FFLResultFatal extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName) {
		super(FFLResult.FILE_LOAD_ERROR, funcName, `Failed to uncompress or load a specific asset from the FFL resource file during call to ${funcName}`);
	}
}

/**
 * Exception thrown by the result of FFLiVerifyCharInfoWithReason.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
 */
class FFLiVerifyReasonException extends Error {
	/** @param {number} result - The FFLiVerifyReason code from FFLiVerifyCharInfoWithReason. */
	constructor(result) {
		super(`FFLiVerifyCharInfoWithReason (CharInfo verification) failed with result: ${result}`);
		/** The stored FFLiVerifyReason code. */
		this.result = result;
	}
}

/**
 * Exception thrown when the mask is set to an expression that
 * the {@link CharModel} was never initialized to, which can't happen
 * because that mask texture does not exist on the {@link CharModel}.
 * @augments {Error}
 */
class ExpressionNotSet extends Error {
	/** @param {FFLExpression} expression - The attempted expression. */
	constructor(expression) {
		super(`Attempted to set expression ${expression}, but the mask for that expression does not exist. You must reinitialize the CharModel with this expression in the expression flags before using it.`);
		this.expression = expression;
	}
}

// // ---------------------------------------------------------------------
// //  FFL Initialization
// // ---------------------------------------------------------------------
// TODO PATH: src/Init.js

/**
 * Loads data from TypedArray or fetch response directly into Emscripten heap.
 * If passed a fetch response, it streams it directly into memory and avoids copying.
 * @param {ArrayBuffer|Uint8Array|Response} resource - The resource data.
 * Use a Fetch response to stream directly, or a Uint8Array if you only have the raw bytes.
 * @param {Module} module - The Emscripten module instance.
 * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
 * @throws {Error} resource must be a Uint8Array or fetch that is streamable and has Content-Length.
 * @private
 */
async function _loadDataIntoHeap(resource, module) {
	// These need to be accessible by the catch statement:
	let heapSize;
	let heapPtr;
	try {
		// Copy resource into heap.
		if (resource instanceof ArrayBuffer) {
			resource = new Uint8Array(resource);
		}
		if (resource instanceof Uint8Array) {
			// Comes in as Uint8Array, allocate and set it.
			heapSize = resource.length;
			heapPtr = module._malloc(heapSize);
			// console.debug(`_loadDataIntoHeap: Loading from buffer. Size: ${heapSize}, Pointer: ${heapPtr}`);
			// Allocate and set this area in the heap as the passed buffer.
			module.HEAPU8.set(resource, heapPtr);
		} else if (resource instanceof Response) {
			// Handle as fetch response.
			if (!resource.ok) {
				throw new Error(`_loadDataIntoHeap: Failed to fetch resource at URL = ${resource.url}, response code = ${resource.status}`);
			}
			// Throw an error if it is not a streamable response.
			if (!resource.body) {
				throw new Error(`_loadDataIntoHeap: Fetch response body is null (resource.body = ${resource.body})`);
			}
			// Get the total size of the resource from the headers.
			const contentLength = resource.headers.get('Content-Length');
			if (!contentLength) {
				// Cannot stream the response. Read as ArrayBuffer and reinvoke function.
				console.debug('_loadDataIntoHeap: Fetch response is missing Content-Length, falling back to reading as ArrayBuffer.');
				return _loadDataIntoHeap(await resource.arrayBuffer(), module);
			}

			// Allocate into heap using the Content-Length.
			heapSize = parseInt(contentLength, 10);
			heapPtr = module._malloc(heapSize);

			// console.debug(`loadDataIntoHeap: Streaming from fetch response. ` +
			// 	`Size: ${heapSize}, pointer: ${heapPtr}, URL: ${resource.url}`);

			// Begin reading and streaming chunks into the heap.
			const reader = resource.body.getReader();
			let offset = heapPtr;
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

		return { pointer: heapPtr, size: heapSize };
	} catch (error) {
		// Free memory upon exception, if allocated.
		if (heapPtr) {
			module._free(heapPtr);
		}
		throw error;
	}
}

/**
 * Initializes FFL by copying the resource into heap and calling FFLInitRes.
 * It will first wait for the Emscripten module to be ready.
 * @param {Uint8Array|Response} resource - The FFL resource data. Use a Uint8Array
 * if you have the raw bytes, or a fetch response containing the FFL resource file.
 * @param {Module|Promise<Module>|function(): Promise<Module>} moduleOrPromise - The Emscripten module
 * by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1),
 * or as a function returning a promise (window.Module when MODULARIZE=1).
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when FFL is fully initialized,
 * returning the final Emscripten {@link Module} instance and the FFLResourceDesc buffer
 * that can later be passed into {@link exitFFL}.
 */
async function initializeFFL(resource, moduleOrPromise) {
	// console.debug('initializeFFL: Entrypoint, waiting for module to be ready.');

	/**
	 * Pointer to the FFLResourceDesc structure to free when FFLInitRes call is done.
	 * @type {number}
	 */
	let resourceDescPtr;
	/** Frees the FFLResourceDesc - not the resources it POINTS to unlike _freeResourceDesc. */
	function freeResDesc() {
		if (resourceDescPtr) {
			// Free FFLResourceDesc, unused after init.
			module._free(resourceDescPtr);
		}
	}
	/** Resource type to load single resource into. */
	const resourceType = FFLResourceType.HIGH;

	/**
	 * The Emscripten Module instance to set and return at the end.
	 * @type {Module}
	 */
	let module;
	// Resolve moduleOrPromise to the Module instance.
	if (typeof moduleOrPromise === 'function') {
		// Assume this function gets the promise of the module.
		moduleOrPromise = moduleOrPromise();
	}
	if (moduleOrPromise instanceof Promise) {
		// Await if this is now a promise.
		module = await moduleOrPromise;
	} else {
		// Otherwise, assume it is already the module.
		module = moduleOrPromise;
	}

	// Wait for the Emscripten runtime to be ready if it isn't already.
	if (!module.calledRun && !module.onRuntimeInitialized) {
		// calledRun is not defined. Set onRuntimeInitialized and wait for it in a new promise.
		await new Promise((resolve) => {
			/** If onRuntimeInitialized is not defined on module, add it. */
			module.onRuntimeInitialized = () => {
				// console.debug('initializeFFL: Emscripten runtime initialized, resolving.');
				resolve(null);
			};
			// console.debug(`initializeFFL: module.calledRun: ${module.calledRun}, ` +
			// 	`module.onRuntimeInitialized:\n${module.onRuntimeInitialized}\n // ^^ assigned and waiting.`);
			// If you are stuck here, the object passed in may not actually be an Emscripten module?
		});
	} else {
		// console.debug('initializeFFL: Assuming module is ready.');
	}

	// Module should be ready after this point, begin loading the resource.
	/** @type {FFLResourceDesc|null} */
	let desc = null;
	try {
		// If resource is itself a promise (fetch() result), wait for it to finish.
		if (resource instanceof Promise) {
			resource = await resource;
		}

		// Load the resource (Uint8Array/fetch Response) into heap.
		const { pointer: heapPtr, size: heapSize } = await _loadDataIntoHeap(resource, module);
		// console.debug(`initializeFFL: Resource loaded into heap. Pointer: ${heapPtr}, Size: ${heapSize}`);

		// Initialize and pack FFLResourceDesc.
		desc = { pData: [0, 0], size: [0, 0] };
		desc.pData[resourceType] = heapPtr;
		desc.size[resourceType] = heapSize;

		const resourceDescData = _packFFLResourceDesc(desc);
		resourceDescPtr = module._malloc(FFLResourceDesc_size); // Freed by freeResDesc.
		module.HEAPU8.set(resourceDescData, resourceDescPtr);

		// Call FFL initialization using: FFL_FONT_REGION_JP_US_EU = 0
		const result = module._FFLInitRes(0, resourceDescPtr);

		// Handle failed result.
		if (result === FFLResult.FILE_INVALID) { // FFL_RESULT_BROKEN
			throw new BrokenInitRes();
		}
		FFLResultException.handleResult(result, 'FFLInitRes');

		// Set required globals in FFL.
		module._FFLInitResGPUStep(); // CanInitCharModel will fail if not called.
		module._FFLSetNormalIsSnorm8_8_8_8(true); // Set normal format to FFLiSnorm8_8_8_8.
		module._FFLSetTextureFlipY(true); // Set textures to be flipped for OpenGL.

		// Requires refactoring:
		// module._FFLSetScale(0.1); // Sets model scale back to 1.0.
		// module._FFLSetLinearGammaMode(1); // Use linear gamma.
		// I don't think ^^ will work because the shaders need sRGB
	} catch (error) {
		// Cleanup on error.
		_freeResourceDesc(desc, module);
		freeResDesc();
		console.error('initializeFFL failed:', error);
		throw error;
	} finally {
		// Always free the FFLResourceDesc struct itself.
		freeResDesc();
	}

	// Return final Emscripten module and FFLResourceDesc object.
	return {
		module: module,
		resourceDesc: desc
	};
}

/**
 * Frees all pData pointers within FFLResourceDesc.
 * @param {FFLResourceDesc|null} desc - Resource description containing pointers.
 * @param {Module} module - Emscripten module to call _free on.
 * @package
 */
function _freeResourceDesc(desc, module) {
	if (!desc) {
		return;
	}

	// Access pData, the first pointer array.
	for (let i = 0; i < FFLResourceType.MAX; i++) {
		const p = desc.pData[i];
		if (p) {
			module._free(p); // Free pData and set to 0.
			desc.pData[i] = 0;
		}
	}
}

/**
 * @param {Module} module - Emscripten module.
 * @param {FFLResourceDesc} resourceDesc - The FFLResourceDesc received from {@link initializeFFL}.
 * @public
 */
function exitFFL(module, resourceDesc) {
	// console.debug('exitFFL called, resourceDesc:', resourceDesc);

	// All CharModels must be deleted before this point.
	const result = module._FFLExit();
	FFLResultException.handleResult(result, 'FFLExit');

	// Free resources in heap after FFLExit().
	_freeResourceDesc(resourceDesc, module);

	// Exit the module...? Is this even necessary?
	if (module._exit) {
		module._exit();
	} else {
		// console.debug('exitFFL: not calling module._exit = ', module._exit);
	}
}

// // ---------------------------------------------------------------------
// //  CharModel Handling
// // ---------------------------------------------------------------------
// TODO PATH: src/CharModel.js

/** @typedef {function(new: import('three').Material, ...*): import('three').Material} MaterialConstructor */

// --------------------------- Class: CharModel -------------------------------
/**
 * Represents an FFLCharModel, which is the head model.
 * Encapsulates a pointer to the underlying instance and provides helper methods.
 *
 * NOTE: This is a wrapper around CharModel. In order to create one,
 * either call createCharModel or pass the pointer of a manually created
 * CharModel in here. So *DO NOT* call this constructor directly!
 * @public
 */
class CharModel {
	/**
	 * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
	 * @param {Module} module - The Emscripten module.
	 * @param {MaterialConstructor} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
	 * @param {TextureManager} texManager - The {@link TextureManager} instance for this CharModel.
	 * @param {FFLCharModelDesc} desc - Copied to {@link FFLiCharModel.charModelDesc}.
	 */
	constructor(ptr, module, materialClass, texManager, desc) {
		/** @package */
		this._module = module;
		/**
		 * The data used to construct the CharModel, set in {@link createCharModel}.
		 * @type {*}
		 * @package
		 */
		this._data = null;
		/**
		 * @type {MaterialConstructor}
		 * @public
		 */
		this._materialClass = materialClass; // Store the material class.
		/**
		 * Material class used to initialize textures specifically.
		 * @type {MaterialConstructor}
		 * @public
		 */
		this._materialTextureClass = materialClass;

		/** @package */
		this._textureManager = texManager;
		/**
		 * Pointer to the FFLiCharModel in memory, set to null when deleted.
		 * @package
		 */
		this._ptr = ptr;
		/** @private */
		this.__ptr = ptr; // Permanent reference.
		/**
		 * The unpacked representation of the underlying
		 * FFLCharModel instance. Note that this is not
		 * meant to be updated at all and changes to
		 * this instance will not apply in FFL whatsoever.
		 * @readonly
		 */
		this._model = CharModel._unpackFFLiCharModel(module.HEAPU8, ptr, desc);
		// NOTE: The only property SET in _model is expression.
		// Everything else is read.

		// Add RenderTargets for faceline and mask.
		/**
		 * @type {import('three').RenderTarget|null}
		 * @package
		 */
		this._facelineTarget = null;
		/**
		 * @type {Array<import('three').RenderTarget|null>}
		 * @package
		 */
		this._maskTargets = new Array(FFLExpression.MAX).fill(null);

		/**
		 * List of enabled expressions that can be set with {@link CharModel.setExpression}.
		 * @type {Uint32Array}
		 */
		this.expressions = new Uint32Array();

		/**
		 * Group of THREE.Mesh objects representing the CharModel.
		 * @type {import('three').Group}
		 * @public
		 */
		this.meshes = new THREE.Group();
		// Set boundingBox getter ("this" = CharModel), dummy geometry needed
		// this.meshes.geometry = { }; // NOTE: is this a good idea?
		// Object.defineProperty(this.meshes.geometry, 'boundingBox',
		// { get: () => this.boundingBox }); // NOTE: box is too large using this

		this._addCharModelMeshes(module); // Populate this.meshes.
	}

	/**
	 * @param {Uint8Array} u8 - module.HEAPU8
	 * @param {number} ptr - Pointer to the type.
	 * @param {FFLCharModelDesc} charModelDesc - Copied to {@link FFLiCharModel.charModelDesc}.
	 * @returns {FFLiCharModel} Object form of FFLiCharModel.
	 * @private
	 */
	static _unpackFFLiCharModel(u8, ptr, charModelDesc) {
		const view = new DataView(u8.buffer, ptr);
		// const charInfoBuffer = new Uint8Array(view.buffer, ptr + 0);
		// const charModelDescBuffer = new Uint8Array(view.buffer, ptr + 288);
		// pShapeData, facelineRenderTexture, 3 texture pointers
		const pMaskRenderTextures = new Uint32Array(view.buffer, ptr + 1644, FFLExpression.MAX);
		// FFLVec3 * 3
		const partsTransform = new Float32Array(view.buffer, ptr + 1996);
		// modelType, boundingBox

		const drawParam = new Array(FFLiShapeType.MAX);
		for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
			const p = ptr + 320 /* drawParam */ + (FFLDrawParam_size * shapeType);
			drawParam[shapeType] = _unpackFFLDrawParam(u8, p);
		}
		return {
			charInfo: _unpackFFLiCharInfo(u8, ptr + 0),
			charModelDesc,
			// charModelDesc: FFLCharModelDesc.unpack(charModelDescBuffer),
			expression: view.getUint32(312, true),
			pTextureTempObject: view.getUint32(316, true),
			drawParam,
			pMaskRenderTextures,
			partsTransform
		};
	}

	/**
	 * This is the method that populates meshes
	 * from the internal FFLiCharModel instance.
	 * @param {Module} module - Module to pass to DrawParam.toMesh to access mesh data.
	 * @private
	 */
	_addCharModelMeshes(module) {
		console.assert(this.meshes, '_addCharModelMeshes: this.meshes is null or undefined, was this CharModel disposed?');

		/** @type {import('./materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo|null} */
		let colorInfo = null;
		// Prepare colorInfo from CharModel if it is needed on the mesh's material.
		if ('colorInfo' in this._materialClass.prototype) {
			colorInfo = this.getColorInfo();
		}

		// Add all meshes in the CharModel to the class instance.
		for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
			// Iterate through all DrawParams and convert to THREE.Mesh.
			const drawParam = this._model.drawParam[shapeType];

			// Skip shape if it's not empty.
			if (!drawParam.primitiveParam.indexCount) {
				continue;
			}
			const mesh = DrawParam.toMesh(drawParam, this._materialClass,
				module, this._textureManager);
			// Use FFLModulateType to indicate render order.
			mesh.renderOrder = drawParam.modulateParam.type + 1;
			// renderOrder = 0 is sometimes unexpected, so let's make this one-indexed.

			// Assign colorInfo from the CharModel.
			if ('colorInfo' in mesh.material) {
				mesh.material.colorInfo = colorInfo;
			}

			// Set faceline and mask meshes to use later.
			switch (shapeType) {
				case FFLiShapeType.OPA_FACELINE:
				/** @package */
					this._facelineMesh = mesh;
					break;
				case FFLiShapeType.XLU_MASK:
				/** @package */
					this._maskMesh = mesh;
					break;
			}
			// mesh.name = Object.keys(FFLiShapeType)[shapeType];

			this.meshes.add(mesh); // Add the mesh or null.
		}
	}

	// --------------------------- Private Get Methods ---------------------------

	/**
	 * Accesses partsTransform in FFLiCharModel,
	 * converting every FFLVec3 to THREE.Vector3.
	 * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
	 * @private
	 */
	_getPartsTransform() {
		const getVec3 = (/** @type {number} */ offset) =>
			new THREE.Vector3().fromArray(this._model.partsTransform, offset);
		return {
			hatTranslate: getVec3(0),
			headFrontRotate: getVec3(3),
			headFrontTranslate: getVec3(6),
			headSideRotate: getVec3(9),
			headSideTranslate: getVec3(12),
			headTopRotate: getVec3(15),
			headTopTranslate: getVec3(18)
		};
	}

	/**
	 * @returns {import('three').Color} The faceline color as THREE.Color.
	 * @private
	 */
	_getFacelineColor() {
		// const color = this.additionalInfo.skinColor;
		// return new THREE.Color(color.r, color.g, color.b);
		const mod = this._module;
		// Use the nose, which is always present, to get the faceline color from.
		const nose = this._model.drawParam[FFLiShapeType.OPA_NOSE];
		const color = _getFFLColor(mod.HEAPF32, nose.modulateParam.pColorR);
		return color;
		// Assume this is in working color space because it is used for clear color.
	}

	/**
	 * @returns {import('three').Color} The favorite color as THREE.Color.
	 * @private
	 */
	_getFavoriteColor() {
		const mod = this._module;
		const favoriteColor = this._model.charInfo.favoriteColor;
		/** Allocate return pointer. */
		const colorPtr = mod._malloc(FFLColor_size);
		mod._FFLGetFavoriteColor(colorPtr, favoriteColor); // Get favoriteColor from CharInfo.
		const color = _getFFLColor(mod.HEAPF32, colorPtr);
		mod._free(colorPtr);
		return color;
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->facelineTexture.
	 * @package
	 */
	_getFacelineTempObjectPtr() {
		return this._model.pTextureTempObject + 0x388/* facelineTexture */;
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->maskTextures.
	 * @package
	 */
	_getMaskTempObjectPtr() {
		return this._model.pTextureTempObject; // offset of maskTextures is 0
	}

	/**
	 * @returns {Uint32Array} Array of pointers to DrawParams for each mask expression.
	 * @package
	 */
	_getMaskDrawParamPtrs() {
		/** offset = maskTextures (0)->pRawMaskDrawParam */
		const ptr = this._model.pTextureTempObject + 340;
		// pRawMaskDrawParam = void*[FFL_EXPRESSION_MAX]
		return new Uint32Array(this._module.HEAPU8.buffer, ptr, FFLExpression.MAX);
	}

	/**
	 * @returns {number} Pointer to charModelDesc.allExpressionFlag.
	 * @package
	 */
	_getExpressionFlagPtr() {
		return this._ptr + 0x120 /* charModelDesc */ + 4; /* allExpressionFlag */
	}

	/**
	 * Calculates the bounding box from the meshes.
	 * @returns {import('three').Box3} The bounding box.
	 * @private
	 */
	_getBoundingBox() {
		// Note: FFL includes three different bounding boxes for each
		// FFLModelType. This only creates one box per CharModel.
		const excludeFromBox = [FFLModulateType.SHAPE_MASK, FFLModulateType.SHAPE_GLASS];
		// Create bounding box selectively excluding mask and glass.
		const box = new THREE.Box3();

		this.meshes.traverse((child) => {
			if (!(child instanceof THREE.Mesh) ||
				// Exclude meshes whose modulateType are in excludeFromBox.
				excludeFromBox.indexOf(child.geometry.userData.modulateType) !== -1) {
				return;
			}
			// Expand the box.
			box.expandByObject(child);
		});
		return box;
	}

	/**
	 * Get the texture resolution.
	 * @returns {number} The texture resolution.
	 * @package
	 */
	_getResolution() {
		return this._model.charModelDesc.resolution & FFL_RESOLUTION_MASK;
	}

	/**
	 * Returns the value for whether the CharModel was created without shapes.
	 * @returns {boolean} Whether the CharModel was created without shapes.
	 * @package
	 */
	_isTexOnly() {
		return (this._model.charModelDesc.modelFlag & FFLModelFlag.NEW_MASK_ONLY) !== 0;
	}

	// --------------------------------- Disposal ---------------------------------

	/**
	 * Finalizes the CharModel.
	 * Frees and deletes the CharModel right after generating textures.
	 * This is **not** the same as `dispose()` which cleans up the scene.
	 * @package
	 */
	_finalizeCharModel() {
		if (!this._ptr) {
			return;
		}
		this._module._FFLDeleteCharModel(this._ptr);
		this._module._free(this._ptr);
		this._ptr = 0;
	}

	/**
	 * Disposes RenderTargets for textures created by the CharModel.
	 * @public
	 */
	disposeTargets() {
		// Dispose RenderTargets.
		if (this._facelineTarget) {
			// console.debug(`Disposing target ${this._facelineTarget.texture.id} for faceline`);
			this._facelineTarget.dispose();
			this._facelineTarget = null;
		}
		// _maskTargets should always be defined.
		this._maskTargets.forEach((target, i) => {
			if (!target) {
				// No mask for this expression.
				return;
			}
			// console.debug(`Disposing target ${target.texture.id} for mask ${i}`);
			target.dispose();
			this._maskTargets[i] = null;
		});
	}

	// ---------------------- Public Methods - Cleanup, Data ----------------------

	/**
	 * Disposes the CharModel and removes all associated resources.
	 * - Disposes materials and geometries.
	 * - Deletes faceline texture if it exists.
	 * - Deletes all mask textures.
	 * - Removes all meshes from the scene.
	 * @param {boolean} disposeTargets - Whether or not to dispose of mask and faceline render targets.
	 * @public
	 */
	dispose(disposeTargets = true) {
		// Print the permanent __ptr rather than _ptr.
		// console.debug('CharModel.dispose: ptr =', this.__ptr);
		this._finalizeCharModel(); // Should've been called already
		// Dispose meshes: materials, geometries, textures.
		if (this.meshes) {
			// Break these references first (still in meshes)
			this._facelineMesh = null;
			this._maskMesh = null;
			_disposeMany(this.meshes);
			// @ts-expect-error - null not assignable. Always non-null except disposed.
			this.meshes = null;
		}
		// Dispose render textures.
		if (disposeTargets) {
			this.disposeTargets();
		}
		if (this._textureManager) {
			this._textureManager.dispose();
			// Null out reference to TextureManager, assuming
			// all textures within are already deleted by now.
			// @ts-expect-error - null not assignable. Always non-null except disposed.
			this._textureManager = null;
		}
	}

	/**
	 * Serializes the CharModel data to FFLStoreData.
	 * @returns {Uint8Array} The exported FFLStoreData.
	 * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo
	 * returns false, usually when CharInfo verification fails.
	 * @public
	 * @todo TODO: Can they edit the CharInfo to justify this method so they can get it out?
	 */
	/*
	getStoreData() {
		// Serialize the CharInfo.
		const charInfoData = FFLiCharInfo.pack(this._model.charInfo);

		const mod = this._module;
		// Allocate function arguments.
		const charInfoInPtr = mod._malloc(FFLiCharInfo_size);
		const storeDataOutPtr = mod._malloc(FFLStoreData_size);
		mod.HEAPU8.set(charInfoData, charInfoInPtr);

		// Call conversion function.
		const result = mod._FFLpGetStoreDataFromCharInfo(storeDataOutPtr, charInfoInPtr);
		// Free and return data.
		const storeData = mod.HEAPU8.slice(storeDataOutPtr, storeDataOutPtr + FFLStoreData_size);
		mod._free(charInfoInPtr);
		mod._free(storeDataOutPtr);

		if (!result) {
			// call to FFLpGetStoreDataFromCharInfo returned false, CharInfo verification probably failed
			throw new Error('getStoreData: Input data failed verification.');
		}

		return storeData;
	}
	*/

	// ------------------------ Mask and Faceline Textures ------------------------

	/**
	 * Sets the expression for this CharModel and updates the corresponding mask texture.
	 * @param {FFLExpression} expression - The new expression index.
	 * @throws {Error} CharModel must have been initialized with the
	 * expression enabled in the flag and have XLU_MASK in meshes.
	 * @public
	 */
	setExpression(expression) {
		this._model.expression = expression;

		/** or getMaskTexture()? */
		const targ = this._maskTargets[expression];
		if (!targ || !targ.texture) {
			throw new ExpressionNotSet(expression);
		}
		if (this._isTexOnly()) {
			return;
		}
		const mesh = this._maskMesh;
		if (!mesh || !(mesh instanceof THREE.Mesh)) {
			// So there is no mask mesh, which is not supposed to happen...
			// ... except for when the expression is 61 or 62, in which case just return.
			if (expression === FFLExpression.BLANK_61 || expression === FFLExpression.BLANK_62) {
				return; // Drop out without throwing or setting expression.
			}
			throw new Error('setExpression: mask mesh does not exist, cannot set expression on it');
		}
		// Update texture and material.
		/** @type {import('three').Texture&{_target:import('three').RenderTarget}} */
		(targ.texture)._target = targ;
		/** @type {import('three').MeshBasicMaterial} */ (mesh.material).map = targ.texture;
		/** @type {import('three').MeshBasicMaterial} */ (mesh.material).needsUpdate = true;
	}

	/**
	 * Gets the faceline texture, or the texture that wraps around
	 * the faceline shape (opaque, the one hair is placed atop).
	 * Not to be confused with the texture containing facial features
	 * such as eyes, mouth, etc. which is the mask.
	 * The faceline texture may not exist if it is not needed, in which
	 * case the faceline color is used directly, see property CharModel.facelineColor.
	 * @returns {import('three').RenderTarget|null} The faceline render target, or null if it does not exist,
	 * in which case CharModel.facelineColor should be used. Access .texture on this object to
	 * get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
	 */
	getFaceline() { // getFaceTexture / "FFLiGetFaceTextureFromCharModel"
		// Return the render target if it exists.
		if (this._facelineTarget) {
			return this._facelineTarget;
		}
		return null;
	}

	/**
	 * Gets the mask texture, or the texture containing facial
	 * features such as eyes, mouth, eyebrows, etc. This is wrapped
	 * around the mask shape, which is a transparent shape
	 * placed in front of the head model.
	 * @param {FFLExpression} expression - The desired expression, or the current expression.
	 * @returns {import('three').RenderTarget|null} The mask render target for the given expression,
	 * or null if the CharModel was not initialized with that expression.
	 * Access .texture on this object to get a {@link THREE.Texture} from it.
	 * It becomes invalid if the CharModel is disposed.
	 */
	getMask(expression = this.expression) { // getMaskTexture
		// Return the render target if it exists.
		if (this._maskTargets && this._maskTargets[expression]) {
			return this._maskTargets[expression];
		}
		return null;
	}

	// ------------------------------ Public Getters ------------------------------

	/**
	 * The current expression for this CharModel.
	 * Read-only. Use setExpression to set the expression.
	 * @returns {FFLExpression} The current expression.
	 * @public
	 */
	get expression() {
		return this._model.expression; // mirror
	}

	/**
	 * Contains the CharInfo of the model.
	 * Changes to this will not be reflected whatsoever.
	 * @returns {FFLiCharInfo} The CharInfo of the model.
	 * @public
	 */
	get charInfo() {
		return this._model.charInfo;
	}

	/**
	 * The faceline color for this CharModel.
	 * @returns {import('three').Color} The faceline color.
	 * @public
	 */
	get facelineColor() {
		if (!this._facelineColor) {
			/** @private */
			this._facelineColor = this._getFacelineColor();
		}
		return this._facelineColor;
	}

	/**
	 * The favorite color for this CharModel.
	 * @returns {import('three').Color} The favorite color.
	 * @public
	 */
	get favoriteColor() {
		if (!this._favoriteColor) {
			/** @private */
			this._favoriteColor = this._getFavoriteColor();
		}
		return this._favoriteColor;
	}

	/**
	 * @returns {number} Gender as 0 = male, 1 = female
	 * @public
	 */
	get gender() {
		return this._model.charInfo.gender;
	}

	/**
	 * The parameters in which to transform hats and other accessories.
	 * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
	 * @public
	 */
	get partsTransform() {
		if (!this._partsTransform) {
			// Set partsTransform property as THREE.Vector3.
			/** @private */
			this._partsTransform = this._getPartsTransform();
		}
		return this._partsTransform;
	}

	/**
	 * @returns {import('three').Box3} The bounding box.
	 * @public
	 */
	get boundingBox() {
		if (!this._boundingBox) {
			// Set boundingBox property as THREE.Box3.
			/** @private */
			this._boundingBox = this._getBoundingBox();
		}
		return this._boundingBox;
	}

	/**
	 * Gets the ColorInfo object needed for SampleShaderMaterial.
	 * @param {boolean} isSpecial - Determines the pants color, gold if special or gray otherwise.
	 * @returns {import('./materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo}
	 * The colorInfo object needed by SampleShaderMaterial.
	 * @public
	 */
	getColorInfo(isSpecial = false) {
		const info = this._model.charInfo;
		return {
			facelineColor: info.faceColor,
			favoriteColor: info.favoriteColor,
			hairColor: info.hairColor,
			beardColor: info.beardColor,
			pantsColor: isSpecial
				? PantsColor.GoldSpecial
				: PantsColor.GrayNormal
		};
	}

	// -------------------------------- Body Scale --------------------------------

	/**
	 * Gets a vector in which to scale the body model for this CharModel.
	 * @returns {import('three').Vector3Like} Scale vector for the body model.
	 * @public
	 */
	getBodyScale() {
		const build = this._model.charInfo.build;
		const height = this._model.charInfo.height;

		// calculated here in libnn_mii/draw/src/detail/mii_VariableIconBodyImpl.cpp:
		// void nn::mii::detail::`anonymous namespace'::GetBodyScale(struct nn::util::Float3 *, int, int)
		// also in Mii Maker USA (0x000500101004A100 v50 ffl_app.rpx): FUN_020737b8
		const m = 128.0;
		const x = (build * (height * (0.47 / m) + 0.4)) / m +
			height * (0.23 / m) + 0.4;
		const y = (height * (0.77 / m)) + 0.5;

		return { x, y, z: x }; // z is always set to x
	}
}

// TODO PATH: src/Body.js (move above function, enum into there?)

/** @enum {number} */
const PantsColor = {
	GrayNormal: 0,
	BluePresent: 1,
	RedRegular: 2,
	GoldSpecial: 3
};

/** @type {Object<PantsColor, import('three').Color>} */
const pantsColors = {
	[PantsColor.GrayNormal]: new THREE.Color(0x40474E),
	[PantsColor.BluePresent]: new THREE.Color(0x28407A),
	[PantsColor.RedRegular]: new THREE.Color(0x702015),
	[PantsColor.GoldSpecial]: new THREE.Color(0xC0A030)
};

// TODO PATH: src/CharInfo.js

/**
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 * @param {Parameters<createCharModel>[0]} data - Data input.
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} The CharModelSource with the data specified.
 * @throws {Error} data must be Uint8Array. Data must be a known type.
 * @package
 * @todo TODO: This used to support FFLiCharInfo as an object. Should it still do so?
 */
function _allocateModelSource(data, module) {
	/** Allocate maximum size. */
	const bufferPtr = module._malloc(FFLiCharInfo_size);

	// Create modelSource.
	const modelSource = {
		// FFLDataSource.BUFFER (5) = copies and verifies
		// FFLDataSource.DIRECT_POINTER (6) = use without verification.
		dataSource: 6, // DIRECT_POINTER - Takes FFLiCharInfo.
		pBuffer: bufferPtr,
		index: 0 // unneeded for raw data
	};

	// module._FFLiGetRandomCharInfo(bufferPtr, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE); return modelSource;

	// Check type of data.
	/*
	if (!(data instanceof Uint8Array)) {
		try {
			if (typeof data !== 'object') {
				throw new Error('_allocateModelSource: data passed in is not FFLiCharInfo object or Uint8Array');
			}
			// Assume that this is FFLiCharInfo as an object.
			// Deserialize to Uint8Array.
			data = FFLiCharInfo.pack(data);
		} catch (e) {
			module._free(bufferPtr);
			throw e;
		}
	}
	*/

	/** @param {Uint8Array} src - Source data in StudioCharInfo format. */
	function setStudioData(src) {
		// studio raw, decode it to charinfo
		const charInfoData = convertStudioCharInfoToFFLiCharInfo(src);
		module.HEAPU8.set(charInfoData, bufferPtr);
	}

	/**
	 * Gets CharInfo from calling a function.
	 * @param {Uint8Array} data - The input data.
	 * @param {number} size - The size to allocate.
	 * @param {string} funcName - The function on the module to call.
	 * @throws {Error} Throws if the function returned false.
	 * @private
	 */
	function callGetCharInfoFunc(data, size, funcName) {
		const dataPtr = module._malloc(size);
		module.HEAPU8.set(data, dataPtr);
		// @ts-ignore - Module cannot be indexed by string. NOTE: The function MUST exist.
		const result = module[funcName](bufferPtr, dataPtr);
		module._free(dataPtr);
		if (!result) {
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: call to ${funcName} returned false, CharInfo verification probably failed`);
		}
	}

	// data should be Uint8Array at this point.

	// Enumerate through supported data types.
	switch (data.length) {
		case FFLStoreData_size: { // sizeof(FFLStoreData)
			// modelSource.dataSource = FFLDataSource.STORE_DATA;
			// Convert FFLStoreData to FFLiCharInfo instead.
			callGetCharInfoFunc(data, FFLStoreData_size, '_FFLpGetCharInfoFromStoreData');
			break;
		}
		case 74: // sizeof(RFLCharData)
		case 76: { // sizeof(RFLStoreData)
			callGetCharInfoFunc(data, 74, '_FFLpGetCharInfoFromMiiDataOfficialRFL');
			break;
		}
		case FFLiCharInfo_size:
			// modelSource.dataSource = FFLDataSource.BUFFER; // Default option.
			module.HEAPU8.set(data, bufferPtr); // Copy data into heap.
			break;
		case 46 + 1: {
			// studio data obfuscated
			data = studioURLObfuscationDecode(data);
			setStudioData(data);
			break;
		}
		case 46: {
			// studio data raw
			setStudioData(data);
			break;
		}
		// Unsupported types.
		case 88:
			throw new Error('_allocateModelSource: NX CharInfo is not supported.');
		case 48:
		case 68:
			throw new Error('_allocateModelSource: NX CoreData/StoreData is not supported.');
		case 92:
		case 72:
			throw new Error('_allocateModelSource: Input needs to be padded to 96 bytes with checksum (FFLStoreData).');
		default: {
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: Unknown length for character data: ${data.length}`);
		}
	}

	return modelSource; // NOTE: pBuffer must be freed.
}

/**
 * Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
 * @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
 * @param {Module} module - Module to access the data and call FFL through.
 * @param {boolean} verifyName - Whether the name and creator name should be verified.
 * @returns {void} Returns nothing if verification passes.
 * @throws {FFLiVerifyReasonException} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
 * @public
 */
function verifyCharInfo(data, module, verifyName = false) {
	// Resolve charInfoPtr as pointer to CharInfo.
	let charInfoPtr = 0;
	let charInfoAllocated = false;
	// Assume that number means pointer.
	if (typeof data === 'number') {
		charInfoPtr = data;
		charInfoAllocated = false;
	} else {
		// Assume everything else means Uint8Array. TODO: untested
		charInfoAllocated = true;
		// Allocate and copy CharInfo.
		charInfoPtr = module._malloc(FFLiCharInfo_size);
		module.HEAPU8.set(data, charInfoPtr);
	}
	const result = module._FFLiVerifyCharInfoWithReason(charInfoPtr, verifyName);
	// Free CharInfo as soon as the function returns.
	if (charInfoAllocated) {
		module._free(charInfoPtr);
	}

	if (result !== 0) {
		// Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
		throw new FFLiVerifyReasonException(result);
	}
}

/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 * @param {Module} module - The Emscripten module.
 * @param {FFLGender} gender - Gender of the character.
 * @param {FFLAge} age - Age of the character.
 * @param {FFLRace} race - Race of the character.
 * @returns {Uint8Array} The random FFLiCharInfo.
 */
function getRandomCharInfo(module, gender = FFLGender.ALL, age = FFLAge.ALL, race = FFLRace.ALL) {
	const ptr = module._malloc(FFLiCharInfo_size);
	module._FFLiGetRandomCharInfo(ptr, gender, age, race);
	const result = module.HEAPU8.slice(ptr, ptr + FFLiCharInfo_size);
	module._free(ptr);
	return result;
}

/**
 * Checks if the expression index disables any shapes in the
 * CharModel, meant to be used when setting multiple indices.
 * @param {FFLExpression} i - Expression index to check.
 * @param {boolean} [warn] - Whether to log using {@link console.warn}.
 * @returns {boolean} Whether the expression changes shapes.
 */
function checkExpressionChangesShapes(i, warn = false) {
	/** Expressions disabling nose: dog/cat, blank */
	const expressionsDisablingNose = [49, 50, 51, 52, 61, 62];
	/** Expressions disabling mask: blank */
	const expressionsDisablingMask = [61, 62];

	const prefix = `checkExpressionChangesShapes: An expression was enabled (${i}) that is meant to disable nose or mask shape for the entire CharModel, so it is only recommended to set this as a single expression rather than as one of multiple.`;
	if (expressionsDisablingMask.indexOf(i) !== -1) {
		warn && console.warn(`${prefix} (in this case, MASK SHAPE so there is supposed to be NO FACE)`);
		return true;
	}
	if (expressionsDisablingNose.indexOf(i) !== -1) {
		warn && console.warn(`${prefix} (nose shape)`);
		return true;
	}

	return false;
}

/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * Use this whenever you need to describe which expression,
 * or expressions, you want to be able to use in the CharModel.
 * @param {Array<FFLExpression>|FFLExpression} expressions - Either a single expression
 * index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
function makeExpressionFlag(expressions) {
	/**
	 * @param {FFLExpression} i - Expression index to check.
	 * @throws {Error} input out of range
	 */
	function checkRange(i) {
		if (i >= FFLExpression.MAX) {
			throw new Error(`makeExpressionFlag: input out of range: got ${i}, max: ${FFLExpression.MAX}`);
		}
	}

	/** FFLAllExpressionFlag */
	const flags = new Uint32Array([0, 0, 0]);
	let checkForChangeShapes = true;

	// Set single expression.
	if (typeof expressions === 'number') {
		// Make expressions into an array.
		expressions = [expressions];
		checkForChangeShapes = false; // Single expression, do not check this
		// Fall-through.
	} else if (!Array.isArray(expressions)) {
		throw new Error('makeExpressionFlag: expected array or single number');
	}

	// Set multiple expressions in an array.
	for (const index of expressions) {
		checkRange(index);
		if (checkForChangeShapes) {
			checkExpressionChangesShapes(index, true); // Warn if the expression changes shapes.
		}
		/** Determine which 32-bit block. */
		const part = Math.floor(index / 32);
		/** Determine the bit within the block. */
		const bitIndex = index % 32;

		flags[part] |= (1 << bitIndex); // Set the bit.
	}
	return flags;
}

// // ---------------------------------------------------------------------
// //  CharModel Creation
// // ---------------------------------------------------------------------
// TODO PATH: src/CharModelCreation.js

/**
 * Creates a CharModel from data and FFLCharModelDesc.
 * You must call initCharModelTextures afterwards to finish the process.
 * Don't forget to call dispose() on the CharModel when you are done.
 * @param {Uint8Array} data - Character data. Accepted types:
 * FFLStoreData, RFLCharData, StudioCharInfo, FFLiCharInfo as Uint8Array
 * @param {CharModelDescOrExpressionFlag} descOrExpFlag - Either a new {@link FFLCharModelDesc},
 * an array of expressions, a single expression, or an
 * expression flag (Uint32Array). Default: {@link FFLCharModelDescDefault}
 * @param {MaterialConstructor} materialClass - Class for the material (constructor). It must be compatible
 * with FFL, so if your material isn't, try: {@link TextureShaderMaterial}, FFL/LUTShaderMaterial
 * @param {Module} module - The Emscripten module.
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The new CharModel instance.
 * @throws {FFLResultException|FFLiVerifyReasonException|Error} Throws if `module`, `modelDesc`,
 * or `data` is invalid, CharInfo verification fails, or CharModel creation fails otherwise.
 */
function createCharModel(data, descOrExpFlag, materialClass, module, verify = true) {
	// Verify arguments.
	if (!module || !module._malloc) {
		throw new Error('createCharModel: module is null or not initialized properly (cannot find ._malloc).');
	}
	if (!data) {
		throw new Error('createCharModel: data is null or undefined.');
	}

	// Allocate memory for model source, description, char model, and char info.
	const modelSourcePtr = module._malloc(FFLCharModelSource_size);
	const modelDescPtr = module._malloc(FFLCharModelDesc_size);
	const charModelPtr = module._malloc(FFLiCharModel_size);

	// data = getRandomCharInfo(module, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE);
	// console.debug('getRandomCharInfo result:', FFLiCharInfo.unpack(data));
	// Get FFLCharModelSource. This converts and allocates CharInfo.
	const modelSource = _allocateModelSource(data, module);
	/** Get pBuffer to free it later. */
	const charInfoPtr = modelSource.pBuffer;

	const modelSourceBuffer = _packFFLCharModelSource(modelSource);
	module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);

	const modelDesc = _descOrExpFlagToModelDesc(descOrExpFlag);
	// Set field to enable new expressions. This field
	// exists because some callers would leave the other
	// bits undefined but this does not so no reason to not enable
	modelDesc.modelFlag |= FFLModelFlag.NEW_EXPRESSIONS;

	const modelDescBuffer = _packFFLCharModelDesc(modelDesc);
	module.HEAPU8.set(modelDescBuffer, modelDescPtr);

	/** Local TextureManager instance. */
	let textureManager;
	try {
		// Verify CharInfo before creating.
		if (verify) {
			verifyCharInfo(charInfoPtr, module, false); // Don't verify name.
		}

		// Create TextureManager instance for this CharModel.
		textureManager = new TextureManager(module, false);

		// Call FFLInitCharModelCPUStep and check the result.
		// const result = module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		const result = module._FFLInitCharModelCPUStepWithCallback(charModelPtr,
			modelSourcePtr, modelDescPtr, textureManager._textureCallbackPtr);
		FFLResultException.handleResult(result, 'FFLInitCharModelCPUStep');
	} catch (error) {
		if (textureManager) {
			textureManager.dispose();
		}
		// Free CharModel prematurely.
		module._free(charModelPtr);
		throw error;
	} finally {
		// Free temporary allocations.
		module._free(modelSourcePtr);
		module._free(modelDescPtr);
		module._free(charInfoPtr);
		// Callback itself is longer read by FFL.
		if (textureManager) {
			textureManager.disposeCallback();
		}
	}

	// Create the CharModel instance.
	const charModel = new CharModel(charModelPtr, module,
		materialClass, textureManager, modelDesc);
	// The constructor will populate meshes from the FFLiCharModel instance.
	/** @private */
	charModel._data = data; // Store original data passed to function.

	// console.debug(`createCharModel: Initialized for "${charModel._model.charInfo.name}", ptr =`, charModelPtr);
	return charModel;
}

/**
 * Converts an expression flag, expression, array of expressions, or object to {@link FFLCharModelDesc}.
 * Uses the `defaultDesc` as a fallback to return if input is null or applies expression to it.
 * @param {CharModelDescOrExpressionFlag} [descOrExpFlag] - Either a new {@link FFLCharModelDesc},
 * an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {FFLCharModelDesc} [defaultDesc] - Fallback if descOrExpFlag is null or expression flag only.
 * @returns {FFLCharModelDesc} The CharModelDesc with the expression applied, or the default.
 * @throws {Error} Throws if `descOrExpFlag` is an unexpected type.
 * @package
 */
function _descOrExpFlagToModelDesc(descOrExpFlag, defaultDesc = FFLCharModelDescDefault) {
	if (!descOrExpFlag && typeof descOrExpFlag !== 'number') {
		return defaultDesc; // Use default if input is falsey.
	}

	// Convert descOrExpFlag to an expression flag if needed.
	if (typeof descOrExpFlag === 'number' || Array.isArray(descOrExpFlag)) {
		// Array of expressions or single expression was passed in.
		descOrExpFlag = makeExpressionFlag(descOrExpFlag);
	}

	/** Shallow clone of {@link defaultDesc}. */
	let newModelDesc = Object.assign({}, defaultDesc);

	// Process descOrExpFlag based on what it is.
	if (descOrExpFlag instanceof Uint32Array) {
		// If this is already an expression flag (Uint32Array),
		// or set to one previously, use it with existing CharModelDesc.
		newModelDesc.allExpressionFlag = descOrExpFlag;
	} else if (typeof descOrExpFlag === 'object') {
		// Assume that descOrExpFlag is a new FFLCharModelDesc.
		newModelDesc = /** @type {FFLCharModelDesc} */ (descOrExpFlag);
	} else {
		throw new Error('_descOrExpFlagToModelDesc: Unexpected type for descOrExpFlag');
	}

	return newModelDesc;
}

/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @param {Renderer} renderer - The Three.js renderer.
 * @param {CharModelDescOrExpressionFlag} [descOrExpFlag] - Either a new {@link FFLCharModelDesc},
 * an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {Object} [options] - Options for updating the model.
 * @param {boolean} [options.texOnly] - Whether to only update the mask and faceline textures in the CharModel.
 * @param {boolean} [options.verify] - Whether the CharInfo provided should be verified.
 * @param {MaterialConstructor|null} [options.materialTextureClass] - The new materialTextureClass to change to.
 * @returns {CharModel} The updated CharModel instance.
 * @throws {Error} Unexpected type for descOrExpFlag, newData is null
 * @todo  TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
 */
function updateCharModel(charModel, newData, renderer,
	descOrExpFlag = null, {
		texOnly = false, verify = true,
		materialTextureClass = null
	} = {}) {
	newData = newData || charModel._data;
	if (!newData) {
		throw new Error('updateCharModel: newData is null. It should be retrieved from charModel._data which is set by createCharModel.');
	}

	/** The new or updated CharModelDesc with the new expression specified. */
	const newModelDesc = _descOrExpFlagToModelDesc(descOrExpFlag, charModel._model.charModelDesc);

	if (!texOnly) {
		// Dispose of the old CharModel.
		charModel.dispose();
	} else {
		// Updating textures only. Set respective flag.
		console.debug(`updateCharModel: Updating ONLY textures for model "${charModel._model.charInfo.name}", ptr =`, charModel._ptr);
		// NOTE: This flag will only take effect if your FFL is built with -DFFL_ENABLE_NEW_MASK_ONLY_FLAG=ON.
		newModelDesc.modelFlag |= FFLModelFlag.NEW_MASK_ONLY;
	}

	// Create a new CharModel with the new data and ModelDesc.
	const newCharModel = createCharModel(newData, newModelDesc,
		charModel._materialClass, charModel._module, verify);

	// Initialize its textures unconditionally.
	initCharModelTextures(newCharModel, renderer,
		materialTextureClass ? materialTextureClass : charModel._materialTextureClass);

	// Handle textures only case, where new CharModel has textures and old one has shapes.
	if (texOnly) {
		charModel.disposeTargets(); // Dispose textures on destination model (will be replaced).

		// Transfer faceline and mask targets.
		charModel._facelineTarget = newCharModel._facelineTarget;
		charModel._maskTargets = newCharModel._maskTargets;
		// Set new CharModel and unset texture only flag.
		// @ts-expect-error -- _model is supposed to be read-only.
		charModel._model = newCharModel._model;
		charModel._model.charModelDesc.modelFlag &= ~FFLModelFlag.NEW_MASK_ONLY;
		charModel.expressions = newCharModel.expressions;
		// Apply new faceline and mask to old shapes.
		newCharModel._facelineTarget && _setFaceline(charModel, newCharModel._facelineTarget);
		charModel.setExpression(newCharModel.expression);

		return charModel; // Source CharModel has new CharModel's textures.
	}

	return newCharModel; // Return new or modified CharModel.
}

// // ---------------------------------------------------------------------
// //  DrawParam Reading
// // ---------------------------------------------------------------------
// TODO PATH: src/DrawParam.js

/**
 * @param {Function} material - Class constructor for the material to test.
 * @returns {boolean} Whether or not the material class supports FFL swizzled (modulateMode) textures.
 * @public
 */
const matSupportsFFL = material => 'modulateMode' in material.prototype;

/**
 * Interprets and converts {@link FFLDrawParam}, which
 * represents a mesh/draw call, for use with Three.js.
 * @package
 */
class DrawParam {
	// Define FFL type.
	/**
	 * @typedef {Object} FFLAttributeBuffer
	 * @property {number} size
	 * @property {number} stride
	 * @property {number} ptr
	 */
	/**
	 * @typedef {Object} FFLModulateParam
	 * @property {FFLModulateMode} mode
	 * @property {FFLModulateType} type
	 * @property {number} pColorR - Pointer to FFLColor
	 * @property {number} pColorG - Pointer to FFLColor
	 * @property {number} pColorB - Pointer to FFLColor
	 * @property {number} pTexture2D
	 */
	/**
	 * @typedef {Object} FFLPrimitiveParam
	 * @property {number} primitiveType
	 * @property {number} indexCount
	 * @property {number} pAdjustMatrix
	 * @property {number} pIndexBuffer
	 */
	/**
	 * @typedef {Object} FFLDrawParam
	 * @property {Array<FFLAttributeBuffer>} attributeBuffers
	 * @property {FFLModulateParam} modulateParam
	 * @property {FFLCullMode} cullMode
	 * @property {FFLPrimitiveParam} primitiveParam
	 */

	/**
	 * Converts FFLDrawParam into a THREE.Mesh.
	 * Binds geometry, texture, and material parameters.
	 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
	 * @param {MaterialConstructor} materialClass - Class for the material (constructor).
	 * @param {Module} module - The Emscripten module.
	 * @param {TextureManager} texManager - The {@link TextureManager} instance
	 * for which to look for textures referenced by the DrawParam.
	 * @returns {import('three').Mesh} The THREE.Mesh instance.
	 * @package
	 */
	static toMesh(drawParam, materialClass, module, texManager) {
		console.assert(drawParam, 'DrawParam.toMesh: drawParam may be null.');
		console.assert(texManager, 'DrawParam.toMesh: Passed in TextureManager is null or undefined, is it constructed?');
		console.assert(typeof materialClass === 'function', 'DrawParam.toMesh: materialClass is unexpectedly not a function.');

		// Skip if the index count is 0, indicating no shape data.
		console.assert(drawParam.primitiveParam.indexCount, 'DrawParam.toMesh: Index count is 0, indicating shape is empty. Check that before it gets passed into this function.');

		// Bind geometry data.
		const geometry = this._bindDrawParamGeometry(drawParam, module);

		// HACK: Allow the material class to modify the geometry if it needs to.
		if ('modifyBufferGeometry' in materialClass && // Static function
			typeof materialClass.modifyBufferGeometry === 'function') {
			materialClass.modifyBufferGeometry(drawParam, geometry);
		}

		// Determine cull mode by mapping FFLCullMode to THREE.Side.
		/** @type {Object<FFLCullMode, import('three').Side>} */
		const cullModeToThreeSide = {
			[FFLCullMode.NONE]: THREE.DoubleSide,
			[FFLCullMode.BACK]: THREE.FrontSide,
			[FFLCullMode.FRONT]: THREE.BackSide,
			// Used by faceline/mask 2D planes for some reason:
			[FFLCullMode.MAX]: THREE.DoubleSide
		};
		const side = cullModeToThreeSide[drawParam.cullMode];
		console.assert(side !== undefined, `DrawParam.toMesh: Unexpected value for FFLCullMode: ${drawParam.cullMode}`);
		// Get texture.
		const texture = this._getTextureFromModulateParam(drawParam.modulateParam, texManager);

		// Apply modulateParam material parameters.
		const isFFLMaterial = matSupportsFFL(materialClass);
		const params = this._applyModulateParam(drawParam.modulateParam, module, isFFLMaterial);
		// Create object for material parameters.
		const materialParam = {
			side: side,
			// Apply texture.
			map: texture,
			...params
		};

		// Special case for if tangent (NEEDED for aniso) is missing, and...
		if (geometry.attributes.tangent === undefined && // "_color" can be tested too.
			// ... material is FFLShaderMaterial. Which is the only one using that attribute.
			'useSpecularModeBlinn' in materialClass.prototype) {
			/** @type {import('./materials/FFLShaderMaterial.js').FFLShaderMaterialParameters} */
			(materialParam).useSpecularModeBlinn = true;
		}

		// Create material using the provided materialClass.
		const material = new materialClass(materialParam);
		// Create mesh and set userData.modulateType.
		const mesh = new THREE.Mesh(geometry, material);

		// Apply pAdjustMatrix transformations if it is not null.
		const pMtx = drawParam.primitiveParam.pAdjustMatrix;
		if (pMtx !== 0) {
			this._applyAdjustMatrixToMesh(pMtx, mesh, module.HEAPF32);
		}

		// Set properties that can be used to reconstruct the material in userData.
		// NOTE: These are only in geometry (primitive) because FFL-Testing does the same, see:
		// https://github.com/ariankordi/FFL-Testing/blob/2219f64473ac8312bab539cd05c00f88c14d2ffd/src/GLTFExportCallback.cpp#L828
		if (mesh.geometry.userData) {
			// Set modulateMode/modulateType (not modulateColor or cullMode).
			mesh.geometry.userData.modulateMode = drawParam.modulateParam.mode;
			mesh.geometry.userData.modulateType = drawParam.modulateParam.type;
			// Note that color is a part of THREE.Material and will most always be there
			mesh.geometry.userData.modulateColor = params.color instanceof THREE.Color
				? [params.color.r, params.color.g, params.color.b, 1.0]
				: [1.0, 1.0, 1.0, 1.0];
			mesh.geometry.userData.cullMode = drawParam.cullMode;
		}
		return mesh;
	}

	/**
	 * Binds geometry attributes from drawParam into a THREE.BufferGeometry.
	 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
	 * @param {Module} module - The Emscripten module from which to read the heap.
	 * @returns {import('three').BufferGeometry} The geometry.
	 * @private
	 * @todo Does not yet handle color stride = 0
	 */
	static _bindDrawParamGeometry(drawParam, module) {
		/**
		 * @param {string} typeStr - The type of the attribute.
		 * @param {number} stride - The stride to display.
		 * @returns {void}
		 */
		const unexpectedStride = (typeStr, stride) =>
			console.assert(false, `_bindDrawParamGeometry: Unexpected stride for attribute ${typeStr}: ${stride}`);

		// Access FFLAttributeBufferParam.
		const attributes = drawParam.attributeBuffers;
		const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
		// There should always be positions.
		console.assert(positionBuffer.size, '_bindDrawParamGeometry: Position buffer must not have size of 0');

		// Get vertex count from position buffer.
		const vertexCount = positionBuffer.size / positionBuffer.stride;
		/** Create BufferGeometry. */
		const geometry = new THREE.BufferGeometry();
		// Bind index data.
		const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
		const indexCount = drawParam.primitiveParam.indexCount;
		const indices = module.HEAPU16.slice(indexPtr, indexPtr + indexCount);
		geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1));
		// Add attribute data.
		for (const typeStr in attributes) {
			const buffer = attributes[typeStr];
			const type = parseInt(typeStr);
			// Skip disabled attributes that have size of 0.
			if (buffer.size === 0) {
				continue;
			}

			switch (type) {
				case FFLAttributeBufferType.POSITION: {
					if (buffer.stride === 16) {
						// 3 floats, last 4 bytes unused.
						/** float data type */
						const ptr = buffer.ptr / 4;
						const data = module.HEAPF32.slice(ptr, ptr + (vertexCount * 4));
						const interleavedBuffer = new THREE.InterleavedBuffer(data, 4);
						// Only works on Three.js r109 and above (previously used addAttribute which can be remapped)
						geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0));
						// ^^ Selectively use first three elements only.
					} else if (buffer.stride === 6) {
						/** half-float data type */
						const ptr = buffer.ptr / 2;
						const data = module.HEAPU16.slice(ptr, ptr + (vertexCount * 3));
						geometry.setAttribute('position', new THREE.Float16BufferAttribute(data, 3));
					} else {
						unexpectedStride(typeStr, buffer.stride);
					}
					break;
				}
				case FFLAttributeBufferType.NORMAL: {
					// Either int8 or 10_10_10_2
					// const data = module.HEAP32.slice(buffer.ptr / 4, buffer.ptr / 4 + vertexCount);
					// const buf = gl.createBuffer();
					// gl.bindBuffer(gl.ARRAY_BUFFER, buf);
					// gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
					// // Bind vertex type GL_INT_2_10_10_10_REV/ / 0x8D9F.
					// geometry.setAttribute('normal', new THREE.GLBufferAttribute(buf, 0x8D9F, 4, 4));
					const data = module.HEAP8.slice(buffer.ptr, buffer.ptr + buffer.size);
					geometry.setAttribute('normal', new THREE.Int8BufferAttribute(data, buffer.stride, true));
					break;
				}
				case FFLAttributeBufferType.TANGENT: {
					// Int8
					const data = module.HEAP8.slice(buffer.ptr, buffer.ptr + buffer.size);
					geometry.setAttribute('tangent', new THREE.Int8BufferAttribute(data, buffer.stride, true));
					break;
				}
				case FFLAttributeBufferType.TEXCOORD: {
					if (buffer.stride === 8) {
						/** float data type */
						const ptr = buffer.ptr / 4;
						const data = module.HEAPF32.slice(ptr, ptr + (vertexCount * 2));
						geometry.setAttribute('uv', new THREE.Float32BufferAttribute(data, 2));
					} else if (buffer.stride === 4) {
						/** half-float data type */
						const ptr = buffer.ptr / 2;
						const data = module.HEAPU16.slice(ptr, ptr + (vertexCount * 2));
						geometry.setAttribute('uv', new THREE.Float16BufferAttribute(data, 2));
					} else {
						unexpectedStride(typeStr, buffer.stride);
					}
					break;
				}
				case FFLAttributeBufferType.COLOR: {
					// Uint8

					// Use default value if it does not exist.
					// NOTE: Does not handle values for u_color other
					// than the default 0/0/0/1 (custom u_parameter_mode)
					if (buffer.stride === 0) {
						break;
					}
					// Use "_color" because NOTE this is what the FFL-Testing exports and existing shaders do
					const data = module.HEAPU8.slice(buffer.ptr, buffer.ptr + buffer.size);
					geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(data, buffer.stride, true));
					break;
				}
			}
		}
		return geometry;
	}

	/**
	 * Retrieves a texture from ModulateParam.
	 * Does not assign texture for faceline or mask types.
	 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam.
	 * @param {TextureManager} textureManager - The {@link TextureManager} instance
	 * for which to look for the texture referenced.
	 * @returns {import('three').Texture|null} The texture if found.
	 * @private
	 */
	static _getTextureFromModulateParam(modulateParam, textureManager) {
		// Only assign texture if pTexture2D is not null.
		if (!modulateParam.pTexture2D ||
			// The pointer will be set to just "1" for
			// faceline and mask textures that are supposed
			// to be targets (FFL_TEXTURE_PLACEHOLDER, FFLI_RENDER_TEXTURE_PLACEHOLDER)
			modulateParam.pTexture2D === 1) {
			return null; // No texture to bind.
		}
		const texturePtr = modulateParam.pTexture2D;
		const texture = /** @type {import('three').Texture} */ (textureManager.get(texturePtr));
		console.assert(texture, `_getTextureFromModulateParam: Texture not found for ${texturePtr}.`);
		// Selective apply mirrored repeat (not supported on NPOT/mipmap textures for WebGL 1.0)
		const applyMirrorTypes = [
			FFLModulateType.SHAPE_FACELINE, FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_GLASS];
		// ^^ Faceline, cap, and glass. NOTE that faceline texture won't go through here
		if (applyMirrorTypes.indexOf(modulateParam.type) !== -1) {
			texture.wrapS = THREE.MirroredRepeatWrapping;
			texture.wrapT = THREE.MirroredRepeatWrapping;
			texture.needsUpdate = true;
		}
		return texture;
	}

	/* eslint-disable jsdoc/require-returns-type -- Allow TS to predict return type. */
	/**
	 * Retrieves blending parameters based on the FFLModulateType.
	 * Will only actually return anything for mask and faceline shapes.
	 * @param {FFLModulateType} modulateType - The modulate type.
	 * @param {FFLModulateMode} [modulateMode] - The modulate mode, used to
	 * differentiate body/pants modulate types from mask modulate types.
	 * @returns An object containing blending parameters for
	 * the Three.js material constructor, or an empty object.
	 * @throws {Error} Unknown modulate type
	 * @private
	 */
	static _getBlendOptionsFromModulateType(modulateType, modulateMode) {
		/*
		if (modulateType >= FFLModulateType.SHAPE_FACELINE &&
			modulateType <= FFLModulateType.SHAPE_CAP) {
			// Opaque (DrawOpa)
			// glTF alphaMode: OPAQUE
			return {
				blending: THREE.CustomBlending,
				blendSrcAlpha: THREE.SrcAlphaFactor,
				blendDstAlpha: THREE.OneFactor
			};
		} else if (modulateType >= FFLModulateType.SHAPE_MASK &&
			modulateType <= FFLModulateType.SHAPE_GLASS) {
			// Translucent (DrawXlu)
			// glTF alphaMode: MASK (TEXTURE_DIRECT), or BLEND (LUMINANCE_ALPHA)?
			return {
				blending: THREE.CustomBlending,
				blendSrc: THREE.SrcAlphaFactor,
				blendDst: THREE.OneMinusSrcAlphaFactor,
				blendDstAlpha: THREE.OneFactor,
				// transparent: true
				depthWrite: false // kept on inside of LUTShaderMaterial
			};
		} else
		*/
		if (modulateMode !== 0 && modulateType >= FFLModulateType.SHAPE_MAX &&
			modulateType <= FFLModulateType.MOLE) {
			// Mask Textures
			return {
				blending: THREE.CustomBlending,
				blendSrc: THREE.OneMinusDstAlphaFactor,
				blendSrcAlpha: THREE.SrcAlphaFactor,
				blendDst: THREE.DstAlphaFactor
			};
		} else if (modulateMode !== 0 && modulateType >= FFLModulateType.FACE_MAKE &&
			modulateType <= FFLModulateType.FILL) {
			// Faceline Texture
			return {
				blending: THREE.CustomBlending,
				blendSrc: THREE.SrcAlphaFactor,
				blendDst: THREE.OneMinusSrcAlphaFactor,
				blendSrcAlpha: THREE.OneFactor,
				blendDstAlpha: THREE.OneFactor
			};
		}
		return {};
		// No blending options needed.
		// else {
		// 	throw new Error(`_getBlendOptionsFromModulateType: Unknown modulate type: ${modulateType}`);
		// }
	}

	/**
	 * Returns an object of parameters for a Three.js material constructor, based on {@link FFLModulateParam}.
	 * @param {FFLModulateParam} modulateParam - Property `modulateParam` of {@link FFLDrawParam}.
	 * @param {Module} module - The Emscripten module for accessing color pointers in heap.
	 * @param {boolean} [forFFLMaterial] - Whether or not to include
	 * modulateMode/Type parameters for material parameters.
	 * @returns Parameters for creating a Three.js material.
	 * @private
	 */
	static _applyModulateParam(modulateParam, module, forFFLMaterial = true) {
		/* eslint-enable jsdoc/require-returns-type -- Allow TS to predict return type. */
		// Apply constant colors.
		/** @type {import('three').Color|Array<import('three').Color>|null} */
		let color = null;

		const f32 = module.HEAPF32;
		// If both pColorG and pColorB are provided, combine them into an array.
		if (modulateParam.pColorG !== 0 && modulateParam.pColorB !== 0) {
			color = [
				_getFFLColor(f32, modulateParam.pColorR),
				_getFFLColor(f32, modulateParam.pColorG),
				_getFFLColor(f32, modulateParam.pColorB)
			];
		} else if (modulateParam.pColorR !== 0) {
			// Otherwise, set it as a single color.
			color = _getFFLColor(f32, modulateParam.pColorR);
		}

		// Only set opacity to 0 for "fill" 2D plane.
		const opacity = modulateParam.type === FFLModulateType.FILL ? 0 : 1;

		// Set transparent property for Xlu/mask and higher.
		const transparent = modulateParam.type >= FFLModulateType.SHAPE_MASK;

		// Disable lighting if this is a 2D plane (mask/faceline) and not opaque (body/pants).
		const lightEnable = !(modulateParam.type >= FFLModulateType.SHAPE_MAX &&
			modulateParam.mode !== FFLModulateMode.CONSTANT);

		/** Do not include the parameters if forFFLMaterial is false. */
		const modulateModeType = forFFLMaterial
			? {
				modulateMode: modulateParam.mode,
				modulateType: modulateParam.type // need this set before color.
			}
			: {};

		// Not applying map here, that happens in _getTextureFromModulateParam.
		const param = Object.assign(modulateModeType, {
			// Common Three.js material parameters.
			color: color,
			opacity: opacity,
			transparent: transparent,
			// Depth writing is disabled for DrawXlu stage however
			// it is kept enabled in LUTShaderMaterial because its
			// alpha testing chooses to not write depth. Since we are
			// disabling it anyway, that means shapes NEED to be in order
			depthWrite: !transparent,

			// Apply blending options (for mask/faceline) based on modulateType.
			...this._getBlendOptionsFromModulateType(modulateParam.type, modulateParam.mode)
		});

		// only for mask/faceline which should not be drawn in non-ffl materials:
		if (!lightEnable) {
			// Only set lightEnable if it is not default.
			/** @type {Object<string, *>} */ (param).lightEnable = lightEnable;
		}
		return param;
	}

	/**
	 * Applies transformations in pAdjustMatrix within a {@link FFLDrawParam} to a mesh.
	 * @param {number} pMtx - Pointer to rio::Matrix34f.
	 * @param {import('three').Object3D} mesh - The mesh to apply transformations to.
	 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
	 * @private
	 */
	static _applyAdjustMatrixToMesh(pMtx, mesh, heapf32) {
		// console.debug('DrawParam.toMesh: shape has pAdjustMatrix: ', m);
		// rio::Matrix34f = 12 floats
		const m = new Float32Array(heapf32.buffer, pMtx, 12);
		// Set position and scale from matrix. (FFLiAdjustShape does no rotation)
		// Effectively decomposes the 3x4 column-major elements.
		mesh.scale.set(m[0], m[5], m[10]);
		mesh.position.set(m[3], m[7], m[11]);
	}
}

// // ---------------------------------------------------------------------
// //  CharModel Render Textures
// // ---------------------------------------------------------------------
// TODO PATH: src/CharModelTextures.js

/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 * Note that this is a separate function due to needing renderer parameter.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {Renderer} renderer - The Three.js renderer.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 */
function initCharModelTextures(charModel, renderer, materialClass = charModel._materialClass) {
	// Check if the passed in renderer is valid by checking the "render" property.
	console.assert(renderer.render !== undefined,
		'initCharModelTextures: renderer is an unexpected type (cannot find .render).');
	const module = charModel._module;
	// Set material class for render textures.
	charModel._materialTextureClass = materialClass;

	const pRawMaskDrawParam = charModel._getMaskDrawParamPtrs();
	// Use the textureTempObject to set all available expressions on the CharModel.
	charModel.expressions = pRawMaskDrawParam
		// expressions is a list of expression indices, where each index is non-null here.
		.map((val, idx) =>
			// If the value is 0 (null), map it.
			val !== 0 ? idx : -1)
		.filter(i => i !== -1); // -1 = null, filter them out.

	// Draw faceline texture if applicable.
	_drawFacelineTexture(charModel, renderer, module, materialClass);

	// Warn if renderer.alpha is not set to true.
	const clearAlpha = renderer.getClearAlpha();
	(clearAlpha !== 0) && renderer.setClearAlpha(0); // Override clearAlpha to 0.

	// Draw mask textures for all expressions.
	_drawMaskTextures(charModel, pRawMaskDrawParam, renderer, module, materialClass);
	// Finalize CharModel, deleting and freeing it.
	charModel._finalizeCharModel();
	// Update the expression to refresh the mask texture.
	charModel.setExpression(charModel.expression);
	// Set clearAlpha back.
	(clearAlpha !== 0) && renderer.setClearAlpha(clearAlpha);

	// convert textures
	if (!matSupportsFFL(charModel._materialClass)) {
		if (!matSupportsFFL(charModel._materialTextureClass)) {
			console.warn('initCharModelTextures: charModel._materialClass does not support modulateMode (no getter), but the _materialTextureClass is either the same or also does not support modulateMode so textures will look wrong');
		} else {
			ModelTexturesConverter.convertModelTexturesToRGBA(charModel,
				renderer, charModel._materialTextureClass);
		}
	}
}

/**
 * Draws and applies the faceline texture for the CharModel.
 * @param {CharModel} charModel - The CharModel.
 * @param {Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @package
 */
function _drawFacelineTexture(charModel, renderer, module, materialClass) {
	// Invalidate faceline texture before drawing (ensures correctness)
	const facelineTempObjectPtr = charModel._getFacelineTempObjectPtr();
	module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);

	const params = _unpackFFLiFacelineTextureTempObject(module.HEAPU8, facelineTempObjectPtr);
	// Gather the drawParams that make up the faceline texture.
	const drawParams = [
		params[FacelinePartType.MAKE],
		params[FacelinePartType.LINE],
		params[FacelinePartType.BEARD]
	].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);
	// Note that for faceline DrawParams to not be empty,
	// it must have a texture. For other DrawParams to not
	// be empty they simply need to have a non-zero index count.
	if (drawParams.length === 0) {
		// console.debug('_drawFacelineTexture: Skipping faceline texture.');
		return;
	}

	// Get the faceline color from CharModel.
	const bgColor = charModel.facelineColor;

	// Create an offscreen scene.
	const offscreenScene = new THREE.Scene();
	offscreenScene.background = bgColor;

	drawParams.forEach(param => offscreenScene.add(
		DrawParam.toMesh(param, materialClass, charModel._module, charModel._textureManager)
	));

	// Determine if the alpha value needs to be 0.
	if ('needsFacelineAlpha' in materialClass && materialClass.needsFacelineAlpha) {
		// Three.js does not allow setting an RGB color with alpha value to 0.
		// Therefore, we need to use a plane with a color and opacity of 0.
		const mesh = _getBGClearMesh(bgColor);
		mesh.renderOrder = -1; // Render this before anything else.
		offscreenScene.add(mesh);
	}

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
		_getIdentCamera(), renderer, width, height, options);

	// console.debug(`Creating target ${target.texture.id} for faceline`);

	// Apply texture to CharModel.
	_setFaceline(charModel, target);
	// Delete temp faceline object to free resources.
	module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr,
		charModel._ptr, charModel._model.charModelDesc.resourceType);
	_disposeMany(offscreenScene); // Dispose meshes in scene.
}

/**
 * Iterates through mask textures and draws each mask texture.
 * @param {CharModel} charModel - The CharModel.
 * @param {Uint32Array} maskParamPtrs - Pointers to DrawParams for each mask.
 * @param {Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @package
 */
function _drawMaskTextures(charModel, maskParamPtrs, renderer, module, materialClass) {
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel._getExpressionFlagPtr();

	// Collect all scenes and only dispose them at the end.
	/** @type {Array<import('three').Scene>} */
	const scenes = [];

	// Iterate through pMaskRenderTextures to find out which masks are needed.
	for (let i = 0; i < charModel._model.pMaskRenderTextures.length; i++) {
		// pRenderTexture will be set to 1 if mask is meant to be drawn there.
		if (charModel._model.pMaskRenderTextures[i] === 0) {
			continue;
		}
		const maskParamPtr = maskParamPtrs[i];
		const rawMaskDrawParam = _unpackFFLiRawMaskDrawParam(module.HEAPU8, maskParamPtr);
		module._FFLiInvalidateRawMask(maskParamPtr);

		const { target, scene } = _drawMaskTexture(charModel,
			rawMaskDrawParam, renderer, materialClass);
		// console.debug(`Creating target ${target.texture.id} for mask ${i}`);
		charModel._maskTargets[i] = target;

		scenes.push(scene);
	}

	// Some texures are shared which is why this
	// needs to be done given that disposeMeshes
	// unconditionally deletes textures.
	scenes.forEach(scene => _disposeMany(scene));

	module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr,
		expressionFlagPtr, charModel._model.charModelDesc.resourceType);
	module._FFLiDeleteTextureTempObject(charModel._ptr);
}

/**
 * Draws a single mask texture based on a RawMaskDrawParam.
 * Note that the caller needs to dispose meshes within the returned scene.
 * @param {CharModel} charModel - The CharModel.
 * @param {Array<FFLDrawParam>} rawMaskParam - The RawMaskDrawParam.
 * @param {Renderer} renderer - The renderer.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @returns {{target: import('three').RenderTarget, scene: import('three').Scene}}
 * The RenderTarget and scene of this mask texture.
 * @package
 */
function _drawMaskTexture(charModel, rawMaskParam, renderer, materialClass) {
	// const drawParams = MaskPartOrder.map(i => ({ ...rawMaskParam[i] }));
	const drawParams = [
		rawMaskParam[MaskPartType.MUSTACHE_R],
		rawMaskParam[MaskPartType.MUSTACHE_L],
		rawMaskParam[MaskPartType.MOUTH],
		rawMaskParam[MaskPartType.EYEBROW_R],
		rawMaskParam[MaskPartType.EYEBROW_L],
		rawMaskParam[MaskPartType.EYE_R],
		rawMaskParam[MaskPartType.EYE_L],
		rawMaskParam[MaskPartType.MOLE]
	].filter(dp => dp && dp.primitiveParam.indexCount !== 0);
	console.assert(drawParams.length, '_drawMaskTexture: All DrawParams are empty.');
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false
	};
	// Create an offscreen transparent scene for 2D mask rendering.
	const offscreenScene = new THREE.Scene();
	offscreenScene.background = null;
	drawParams.forEach(param => offscreenScene.add(
		DrawParam.toMesh(param, materialClass, charModel._module, charModel._textureManager)
	));
	const width = charModel._getResolution();

	const target = createAndRenderToTarget(offscreenScene,
		_getIdentCamera(), renderer, width, width, options);

	return { target, scene: offscreenScene };
	// Caller needs to dispose meshes in scene.
}

/**
 * Sets the faceline texture of the given CharModel from the RenderTarget.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').RenderTarget} target - RenderTarget for the faceline texture.
 * @throws {Error} CharModel must be initialized with OPA_FACELINE in meshes.
 * @package
 */
function _setFaceline(charModel, target) {
	console.assert(target && target.texture, 'setFaceline: passed in RenderTarget is invalid');
	charModel._facelineTarget = target; // Store for later disposal.
	if (charModel._isTexOnly()) {
		return;
	}
	const mesh = charModel._facelineMesh;
	if (!mesh || !(mesh instanceof THREE.Mesh)) {
		throw new Error('setFaceline: faceline shape does not exist');
	}
	// Update texture and material.
	/** @type {import('three').Texture&{_target: import('three').RenderTarget}} */ (target.texture)
		._target = target;
	/** @type {import('three').MeshBasicMaterial} */ (mesh.material).map = target.texture;
	/** @type {import('three').MeshBasicMaterial} */ (mesh.material).needsUpdate = true;
}

// // ---------------------------------------------------------------------
// //  CharModel Modulate Texture Converter
// // ---------------------------------------------------------------------
// TODO PATH: src/ModelTexturesConverter.js

/**
 * Gets a plane whose color and opacity can be set.
 * This can be used to simulate background clear, or specifically
 * to set the background's color to a value but alpha to 0.
 * @param {import('three').Color} color - The color of the plane.
 * @param {number} [opacity] - The opacity of the plane, default is transparent.
 * @returns {import('three').Mesh} The plane with the color and opacity specified.
 * @package
 */
const _getBGClearMesh = (color, opacity = 0.0) =>
	new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
		new THREE.MeshBasicMaterial({
			color, opacity,
			transparent: true,
			blending: THREE.NoBlending
		})
	);

/**
 * Utilities for converting textures within a CharModel.
 * {@link ModelTexturesConverter.convertModelTexturesToRGBA} adds colors to textures so
 * they can be used with any material, or a model export.
 * {@link ModelTexturesConverter.convModelTargetsToDataTex} adds texture data by converting
 * render targets to {@link THREE.DataTexture}, allowing exports.
 */
class ModelTexturesConverter {
	/**
	 * Takes the texture in `material` and draws it using `materialTextureClass`, using
	 * the modulateMode property in `userData`, using the `renderer` and sets it back
	 * in the `material`. So it converts a swizzled (using modulateMode) texture to RGBA.
	 * NOTE: Does NOT handle mipmaps. But these textures
	 * usually do not have mipmaps anyway so it's fine
	 * @param {Renderer} renderer - The renderer.
	 * @param {import('three').MeshBasicMaterial} material - The original material of the mesh.
	 * @param {Object<string, *>} userData - The original mesh.geometry.userData to get modulateMode/Type from.
	 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
	 * @returns {import('three').RenderTarget} The RenderTarget of the final RGBA texture.
	 * @private
	 */
	static _texDrawRGBATarget(renderer, material, userData, materialTextureClass) {
		const scene = new THREE.Scene();
		// Simulate clearing the background with this color, but opacity of 0.
		const bgClearRGBMesh = _getBGClearMesh(material.color);
		scene.add(bgClearRGBMesh); // Must be drawn first.

		console.assert(material.map, '_texDrawRGBATarget: material.map is null or undefined');
		/** Shortcut to the existing texture. */
		const tex = /** @type {import('three').Texture} */ (material.map);
		// This material is solely for the texture itself and not the shape.
		// It actually does not need color set on it, or modulate type (blending)
		const texMat = new materialTextureClass({
			map: tex,
			modulateMode: userData.modulateMode,
			color: material.color,
			side: THREE.DoubleSide,
			lightEnable: false
		});
		texMat.blending = THREE.NoBlending;
		texMat.transparent = true;

		const plane = new THREE.PlaneGeometry(2, 2);
		const textureMesh = new THREE.Mesh(plane, texMat);
		scene.add(textureMesh);

		const flipY = _isWebGPU(renderer);
		const target = createAndRenderToTarget(scene,
			_getIdentCamera(flipY), renderer,
			tex.image.width, tex.image.height, {
				wrapS: tex.wrapS, wrapT: tex.wrapT, // Preserve wrap.
				depthBuffer: false, stencilBuffer: false
			});

		/** @type {import('three').Texture&{_target: import('three').RenderTarget}} */
		(target.texture)._target = target;

		// Dispose previous texture and replace with this one.
		/** @type {import('three').Texture} */ (material.map).dispose();
		material.map = target.texture;
		// Set color to default and modulateMode to TEXTURE_DIRECT.
		material.color = new THREE.Color(1, 1, 1);
		userData.modulateMode = 1;

		return target; // Caller is responsible for disposing the RenderTarget.
	}

	/**
	 * Converts a CharModel's textures, including ones that may be using swizzled modulateMode
	 * textures that are R/RG format, to RGBA and also applying colors, so that
	 * the CharModel can be rendered without a material that supports modulateMode.
	 * @param {CharModel} charModel - The CharModel whose textures to convert.
	 * @param {Renderer} renderer - The renderer.
	 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
	 * @public
	 */
	static convertModelTexturesToRGBA(charModel, renderer, materialTextureClass) {
		const convertTextureForTypes = [
			FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_NOSELINE, FFLModulateType.SHAPE_GLASS];

		charModel.meshes.traverse((mesh) => {
			if (!(mesh instanceof THREE.Mesh) ||
				!mesh.geometry.userData.modulateType ||
				!mesh.material.map ||
				convertTextureForTypes.indexOf(mesh.geometry.userData.modulateType) === -1
			) {
				return;
			}
			const target = this._texDrawRGBATarget(renderer, mesh.material,
				mesh.geometry.userData, materialTextureClass);
				// HACK?: Push to _maskTargets so that it will be disposed.
			charModel._maskTargets.push(target);
		});
	}

	/**
	 * Converts all textures in the CharModel that are associated
	 * with RenderTargets into THREE.DataTextures, so that the
	 * CharModel can be exported using e.g., GLTFExporter.
	 * @param {CharModel} charModel - The CharModel whose textures to convert.
	 * @param {Renderer} renderer - The renderer.
	 * @public
	 */
	static async convModelTargetsToDataTex(charModel, renderer) {
		charModel.meshes.traverse(async (mesh) => {
			if (!(mesh instanceof THREE.Mesh) || !mesh.material.map) {
				return;
			}
			const tex = mesh.material.map;
			console.assert(tex.format === THREE.RGBAFormat,
				'convModelTargetsToDataTex: found a texture that is not of format THREE.RGBAFormat, but, this function is only meant to be used if all textures in CharModel meshes are RGBA (so render targets)...');
			/** RGBA */
			const data = new Uint8Array(tex.image.width * tex.image.height * 4);
			const target = /** @type {import('three').RenderTarget} */ tex._target;
			console.assert(target, 'convModelTargetsToDataTex: mesh.material.map (texture)._target is null or undefined.');
			await renderer.readRenderTargetPixelsAsync(target, 0, 0,
				tex.image.width, tex.image.height);
			// Construct new THREE.DataTexture from the read data.
			// So... draw the texture, download it out, and upload it again.
			const dataTex = new THREE.DataTexture(data, tex.image.width,
				tex.image.height, THREE.RGBAFormat, THREE.UnsignedByteType);
				// Copy wrap and filtering options.
			dataTex.wrapS = tex.wrapS;
			dataTex.wrapT = tex.wrapT;
			dataTex.minFilter = tex.minFilter;
			dataTex.magFilter = tex.magFilter;

			dataTex.needsUpdate = true;
			mesh.material.map = dataTex;
		});
		// The original render targets are no longer needed now, dispose them.
		charModel.disposeTargets();
		// Note that expressions cannot be set on the CharModel anymore.
	}
}

// // ---------------------------------------------------------------------
// //  TextureShaderMaterial Class
// // ---------------------------------------------------------------------
// TODO PATH: src/TextureShaderMaterial.js

/**
 * A material class that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 * @augments {THREE.ShaderMaterial}
 */
class TextureShaderMaterial extends THREE.ShaderMaterial {
	/**
	 * @typedef {Object} TextureShaderMaterialParameters
	 * @property {FFLModulateMode} [modulateMode] - Modulate mode.
	 * @property {FFLModulateType} [modulateType] - Modulate type.
	 * @property {import('three').Color|Array<import('three').Color>} [color] -
	 * Constant color assigned to u_const1/2/3 depending on single or array.
	 */

	/**
	 * The material constructor.
	 * @param {import('three').ShaderMaterialParameters & TextureShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		// Set default uniforms.
		/** @type {Object<string, import('three').IUniform>} */
		const uniforms = {
			opacity: { value: 1.0 }
		};
		const blankMatrix3 = { value: new THREE.Matrix3() };
		if (Number(THREE.REVISION) < 151) {
			uniforms.uvTransform = blankMatrix3;
		} else {
			uniforms.mapTransform = blankMatrix3;
		}

		// Construct the ShaderMaterial using the shader source.
		super({
			vertexShader: /* glsl */`
				#include <common>
				#include <uv_pars_vertex>

				void main() {
					#include <begin_vertex>
					#include <uv_vertex>
					#include <project_vertex>
				}`,
			fragmentShader: /* glsl */`
				#include <common>
				#include <uv_pars_fragment>
				#include <map_pars_fragment>
				uniform vec3 diffuse;
				uniform float opacity;
				uniform int modulateMode;
				uniform vec3 color1;
				uniform vec3 color2;

				void main() {
					vec4 diffuseColor = vec4( diffuse, opacity );

					#include <map_fragment>
					#include <alphamap_fragment>
				#ifdef USE_MAP
					if (modulateMode == 2) { // FFL_MODULATE_MODE_RGB_LAYERED
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r +
				      color1.rgb * sampledDiffuseColor.g +
				      color2.rgb * sampledDiffuseColor.b,
				      sampledDiffuseColor.a
				    );
				  } else if (modulateMode == 3) { // FFL_MODULATE_MODE_ALPHA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r,
				      sampledDiffuseColor.r
				    );
				  } else if (modulateMode == 4) { // FFL_MODULATE_MODE_LUMINANCE_ALPHA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.g,
				      sampledDiffuseColor.r
				    );
				  } else if (modulateMode == 5) { // FFL_MODULATE_MODE_ALPHA_OPA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r,
				      1.0
				    );
				  }
				#endif

				  // avoids little outline around mask elements
				  if (modulateMode != 0 && diffuseColor.a == 0.0) { // FFL_MODULATE_MODE_CONSTANT
				      discard;
				  }

					gl_FragColor = diffuseColor;
					//#include <colorspace_fragment>
				}`,
			uniforms: uniforms
		});
		// Set defaults so that they are valid parameters.
		this.lightEnable = false;
		this.modulateType = 0;

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
	}

	/**
	 * Gets the constant color (diffuse) uniform as THREE.Color.
	 * @returns {import('three').Color|null} The constant color, or null if it is not set.
	 */
	get color() {
		return this.uniforms.diffuse ? this.uniforms.diffuse.value : null;
	}

	/**
	 * Sets the constant color uniforms from THREE.Color.
	 * @param {import('three').Color|Array<import('three').Color>} value -
	 * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
	 */
	set color(value) {
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances.
			this.uniforms.diffuse = { value: value[0] };
			this.uniforms.color1 = { value: value[1] };
			this.uniforms.color2 = { value: value[2] };
			return;
		}
		// Set single color as THREE.Color, defaulting to white.
		const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
		/** @type {import('three').Color} */
		this._color3 = color3;
		this.uniforms.diffuse = { value: color3 };
	}

	/** @returns {FFLModulateMode|null}The modulateMode value, or null if it is unset. */
	get modulateMode() {
		return this.uniforms.modulateMode ? this.uniforms.modulateMode.value : null;
	}

	/** @param {FFLModulateMode} value - The new modulateMode value. */
	set modulateMode(value) {
		this.uniforms.modulateMode = { value: value };
	}

	/** @returns {import('three').Texture|null}The texture map, or null if it is unset. */
	get map() {
		return this.uniforms.map ? this.uniforms.map.value : null;
	}

	/** @param {import('three').Texture} value - The new texture map. */
	set map(value) {
		this.uniforms.map = { value: value };
	}
}

// // ---------------------------------------------------------------------
// //  Geometry Attribute Conversion Utilities
// // ---------------------------------------------------------------------
// TODO PATH: src/GeometryConversion.js

class GeometryConversion {
	/**
	 * Modifies a BufferGeometry in place to be compatible with glTF.
	 * It currently: deinterleaves attributes, converts half-float to float,
	 * and converts signed integer formats (not uint8 for color) to float.
	 * Attributes named "normal" are reduced to three components.
	 * @param {import('three').BufferGeometry} geometry - The BufferGeometry to modify in place.
	 * @throws {Error} Throws if an unsupported attribute format is encountered.
	 * @public
	 */
	static convGeometryToGLTFCompatible(geometry) {
		if (!(geometry instanceof THREE.BufferGeometry) || !geometry.attributes) {
			throw new Error('convGeometryToGLTFCompatible: geometry is not BufferGeometry with attributes.');
		}

		// Process each attribute in the geometry.
		for (const [key, attr] of Object.entries(geometry.attributes)) {
			// If the attribute is interleaved, deinterleave it.
			const bufferAttribute = attr instanceof THREE.InterleavedBufferAttribute
				? this._interleavedToBufferAttribute(attr)
				: attr;
			const array = bufferAttribute.array;
			const originalItemSize = bufferAttribute.itemSize;
			const count = bufferAttribute.count;

			/**
			 * Size of the target attribute. Force vec3 for "normal".
			 * @type {number}
			 */
			const targetItemSize = key.toLowerCase() === 'normal' ? 3 : originalItemSize;

			/** @type {Float32Array|Uint8Array} */ let newArray;
			/** Whether the value is normalized. False by default for float attributes. */
			let normalized = false;

			if (array instanceof Float32Array) {
				// If already float32, only adjust components if needed.
				newArray = targetItemSize === originalItemSize
					? array
					: this._copyFloat32Reduced(array, count, originalItemSize, targetItemSize);
			} else if (array instanceof Uint16Array) {
				// Assume half-float values. Three.js >=160 is required for them.
				const float32Full = this._halfArrayToFloat(array);
				newArray = targetItemSize === originalItemSize
					? float32Full
					: this._copyFloat32Reduced(float32Full,
						count, originalItemSize, targetItemSize);
			} else if (array instanceof Int8Array) {
				// Convert SNORM to float in the range [-1,1]. For normals, only use first 3 components.
				newArray = this._snormToFloat(array, count, originalItemSize, targetItemSize);
				// normalized = true; // Normals should be normalized?
			} else if (array instanceof Uint8Array) {
				// Likely color data in UNORM, leave as-is.
				newArray = array;
				normalized = true; // Not converted to float.
			} else {
				throw new Error(`convGeometryToGLTFCompatible: Unsupported attribute data type for ${key}: ${array.constructor.name}`);
			}

			// Also not sure if this will leak from the old attribute or not. (Don't think so)
			geometry.setAttribute(key,
				new THREE.BufferAttribute(newArray, targetItemSize, normalized));
		}
	}

	/**
	 * Deinterleaves an InterleavedBufferAttribute into a standalone BufferAttribute.
	 * @param {import('three').InterleavedBufferAttribute} attr - The interleaved attribute.
	 * @returns {import('three').BufferAttribute} A new BufferAttribute containing deinterleaved data.
	 * @public
	 */
	static _interleavedToBufferAttribute(attr) {
		const { itemSize, count } = attr;
		// eslint-disable-next-line jsdoc/valid-types -- TODO: fix "syntax error in type"
		const dest = new /** @type {{ new(length: number): * }} */ (attr.array.constructor)
		(count * itemSize);

		for (let i = 0; i < count; i++) {
			for (let j = 0; j < itemSize; j++) {
				dest[i * itemSize + j] = attr.getComponent(i, j);
			}
		}
		return new THREE.BufferAttribute(dest, itemSize);
	}

	/**
	 * Creates a new Float32Array by copying only a subset of components per vertex.
	 * @param {Float32Array} src - The source Float32Array.
	 * @param {number} count - Number of vertices.
	 * @param {number} srcItemSize - Original components per vertex.
	 * @param {number} targetItemSize - Number of components to copy per vertex.
	 * @returns {Float32Array} A new Float32Array with reduced component count.
	 * @private
	 */
	static _copyFloat32Reduced(src, count, srcItemSize, targetItemSize) {
		const dst = new Float32Array(count * targetItemSize);
		for (let i = 0; i < count; i++) {
			for (let j = 0; j < targetItemSize; j++) {
				dst[i * targetItemSize + j] = src[i * srcItemSize + j];
			}
		}
		return dst;
	}

	/**
	 * Converts a 16-bit half-float value to a 32-bit float.
	 * @param {number} half - The half-float value.
	 * @returns {number} The corresponding 32-bit float value.
	 * @private
	 */
	static _halfToFloat(half) {
		const sign = (half & 0x8000) >> 15;
		const exponent = (half & 0x7C00) >> 10;
		const mantissa = half & 0x03FF;

		if (exponent === 0) {
			// Subnormal number.
			return (sign ? -1 : 1) * Math.pow(2, -14) * (mantissa / Math.pow(2, 10));
		} else if (exponent === 0x1F) {
			// NaN or Infinity.
			return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
		}
		// Normalized number.
		return (sign ? -1 : 1) *
			Math.pow(2, exponent - 15) *
			(1 + mantissa / 1024);
	}

	/**
	 * Converts a Uint16Array assumed to represent half-float values into a Float32Array.
	 * @param {Uint16Array} halfArray - The Uint16Array of half-float values.
	 * @returns {Float32Array} A Float32Array with converted float values.
	 * @private
	 */
	static _halfArrayToFloat(halfArray) {
		const floatArray = new Float32Array(halfArray.length);
		for (let i = 0; i < halfArray.length; i++) {
			floatArray[i] = this._halfToFloat(halfArray[i]);
		}
		return floatArray;
	}

	/**
	 * Converts an Int8Array of SNORM values to a Float32Array.
	 * If the targetItemSize is less than the original (e.g. for normals), only the first targetItemSize
	 * components of each vertex are copied.
	 * @param {Int8Array} src - The source Int8Array.
	 * @param {number} count - Number of vertices.
	 * @param {number} srcItemSize - Original number of components per vertex.
	 * @param {number} targetItemSize - Number of components per vertex for the output.
	 * @returns {Float32Array} A Float32Array with converted values.
	 * @private
	 */
	static _snormToFloat(src, count, srcItemSize, targetItemSize) {
		const dst = new Float32Array(count * targetItemSize);

		for (let i = 0; i < count; i++) {
			const baseIn = i * srcItemSize;
			const baseOut = i * targetItemSize;

			if (targetItemSize === 4 && srcItemSize === 4) {
				// Tangent case: normalize xyz, keep w
				const x = src[baseIn] / 127;
				const y = src[baseIn + 1] / 127;
				const z = src[baseIn + 2] / 127;
				const w = src[baseIn + 3] / 127;

				const mag = Math.sqrt(x * x + y * y + z * z) || 1;

				dst[baseOut] = x / mag;
				dst[baseOut + 1] = y / mag;
				dst[baseOut + 2] = z / mag;
				dst[baseOut + 3] = w;
			} else {
				// General case: convert up to targetItemSize components directly
				for (let j = 0; j < targetItemSize; j++) {
					const val = src[baseIn + j];
					dst[baseOut + j] = val < 0 ? val / 128 : val / 127;
				}
			}
		}

		return dst;
	}
}

// // ---------------------------------------------------------------------
// //  Scene/Render Target Handling
// // ---------------------------------------------------------------------
// TODO PATH: src/RenderTargetUtils.js

/**
 * @param {Renderer} renderer - The input renderer.
 * @returns {boolean} Whether the renderer is THREE.WebGPURenderer.
 * @package
 */
const _isWebGPU = renderer => 'isWebGPURenderer' in renderer;

/**
 * Returns an ortho camera that is effectively the same as
 * if you used identity MVP matrix, for rendering 2D planes.
 * @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {import('three').OrthographicCamera} The orthographic camera.
 * @package
 */
function _getIdentCamera(flipY = false) {
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
 * @param {import('three').Scene} scene - The scene to render.
 * @param {import('three').Camera} camera - The camera to use.
 * @param {Renderer} renderer - The renderer.
 * @param {number} width - Desired width of the target.
 * @param {number} height - Desired height of the target.
 * @param {Object} [targetOptions] - Optional options for the render target.
 * @returns {import('three').RenderTarget} The render target (which contains .texture).
 */
function createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions = {}) {
	// Set default options for the RenderTarget.
	const options = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		...targetOptions
	};

	const renderTarget = _isWebGPU(renderer)
		? new THREE.RenderTarget(width, height, options)
		: new THREE.WebGLRenderTarget(width, height, options);
	// Get previous render target to switch back to.
	const prevTarget = renderer.getRenderTarget();
	// Only works on Three.js r102 and above.
	renderer.setRenderTarget(
		/** @type {import('three').RenderTarget} */ (renderTarget)); // Set new target.
	renderer.render(scene, camera); // Render.
	renderer.setRenderTarget(prevTarget); // Set previous target.
	return renderTarget; // This needs to be disposed when done.
}

/**
 * Disposes meshes in a {@link THREE.Object3D} and removes them from the {@link THREE.Scene} specified.
 * @param {import('three').Scene|import('three').Object3D} group - The scene or group to dispose meshes from.
 * @param {import('three').Scene} [scene] - The scene to remove the meshes from, if provided.
 * @package
 */
function _disposeMany(group, scene) {
	// Taken from: https://github.com/igvteam/spacewalk/blob/21c0a9da27f121a54e0cf6c0d4a23a9cf80e6623/js/utils/utils.js#L135C10-L135C29

	/**
	 * Disposes a single material along with its texture map.
	 * @param {import('three').MeshBasicMaterial} material - The material with `map` property to dispose.
	 */
	function disposeMaterial(material) {
		// Dispose texture in material.
		if (material.map) {
			// console.debug('Disposing texture ', child.material.map.id);
			// If this was created by TextureManager
			// then it overrides dispose() to also
			// remove itself from the TextureManager map.
			material.map.dispose();
		}
		material.dispose(); // Dispose material itself.
	}

	// Traverse all children of the scene/group/THREE.Object3D.
	group.traverse((child) => {
		if (!(child instanceof THREE.Mesh)) {
			// Only dispose of meshes.
			return;
		}
		// Dispose geometry, material, and texture.
		if (child.geometry) {
			child.geometry.dispose();
		}

		if (child.material) {
			// Dispose depending on if it is an array or not.
			Array.isArray(child.material)
				// Assume that materials are compatible with THREE.MeshBasicMaterial for .map.
				? child.material.forEach((material) => {
					disposeMaterial(/** @type {import('three').MeshBasicMaterial} */ (material));
				})
				: disposeMaterial(/** @type {import('three').MeshBasicMaterial} */(child.material));
		}
	});

	// If this is a scene, remove this group/Object3D from it.
	if (scene && scene instanceof THREE.Scene) {
		scene.remove(group);
	}

	// Set group and its children to null to break references.
	group.children = [];
}

// // ---------------------------------------------------------------------
// //  Export Scene/Texture To Image
// // ---------------------------------------------------------------------
// TODO PATH: src/ExportTexture.js

/**
 * Saves the current renderer state and returns an object to restore it later.
 * @param {Renderer} renderer - The renderer to save state from.
 * @returns {{target: import('three').RenderTarget|null,
 * colorSpace: import('three').ColorSpace, size: import('three').Vector2}}
 * The saved state object.
 */
function _saveRendererState(renderer) {
	const size = new THREE.Vector2();
	renderer.getSize(size);

	return {
		target: renderer.getRenderTarget(),
		colorSpace: /** @type {import('three').ColorSpace} */ (renderer.outputColorSpace),
		size
	};
}

/**
 * Restores a renderer's state from a saved state object.
 * @param {Renderer} renderer - The renderer to restore state to.
 * @param {{target: import('three').RenderTarget|null,
 * colorSpace: import('three').ColorSpace, size: import('three').Vector2}} state -
 * The saved state object.
 */
function _restoreRendererState(renderer, state) {
	renderer.setRenderTarget(state.target);
	renderer.outputColorSpace = state.colorSpace;
	renderer.setSize(state.size.x, state.size.y, false);
}

/**
 * Copies the renderer's swapchain to a canvas.
 * @param {Renderer} renderer - The renderer.
 * @param {HTMLCanvasElement} [canvas] - Optional target canvas. If not provided, a new one is created.
 * @returns {HTMLCanvasElement} The canvas containing the rendered output.
 * @throws {Error} Throws if the canvas is defined but invalid.
 */
function _copyRendererToCanvas(renderer, canvas) {
	const sourceCanvas = renderer.domElement;
	// If the target canvas is not simply undefined, it's null, then error out.
	if (canvas !== undefined && !(canvas instanceof HTMLCanvasElement)) {
		throw new Error('copyRendererToCanvas: canvas is neither a valid canvas nor undefined.');
	}
	const targetCanvas = canvas || document.createElement('canvas');
	targetCanvas.width = sourceCanvas.width;
	targetCanvas.height = sourceCanvas.height;
	// NOTE: Line below guarantees the canvas to be valid.
	/** @type {CanvasRenderingContext2D} */ (targetCanvas.getContext('2d'))
		.drawImage(sourceCanvas, 0, 0);

	return targetCanvas;
}

/**
 * Renders a texture to a canvas. If no canvas is provided, a new one is created.
 * @param {import('three').Texture} texture - The texture to render.
 * @param {Renderer} renderer - The renderer.
 * @param {Object} [options] - Options for canvas output.
 * @param {boolean} [options.flipY] - Flip the Y axis. Default is oriented for OpenGL.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas to draw into.
 * Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the rendered texture.
 */
function textureToCanvas(texture, renderer, { flipY = true, canvas } = {}) {
	// Create a new scene using a full-screen quad.
	const scene = new THREE.Scene();
	scene.background = null; // Transparent background.
	// Assign a transparent, textured, and double-sided material.
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide, map: texture, transparent: true
	});
	/** Full-screen quad. */
	const plane = new THREE.PlaneGeometry(2, 2);
	const mesh = new THREE.Mesh(plane, material);
	scene.add(mesh);
	/** Ortho camera filling whole screen. */
	const camera = _getIdentCamera(flipY);

	// Get previous render target, color space, and size.
	const state = _saveRendererState(renderer);

	// Render to the main canvas to extract pixels.
	renderer.setRenderTarget(null); // Render to primary target.
	// Get width and set it on renderer.
	const { width, height } = texture.image;
	renderer.setSize(width, height, false);
	// Use working color space.
	renderer.outputColorSpace = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
	renderer.render(scene, camera);

	canvas = _copyRendererToCanvas(renderer, canvas); // Populate canvas.

	// Cleanup and restore renderer state.
	material.dispose();
	plane.dispose();
	scene.remove(mesh);
	_restoreRendererState(renderer, state);

	return canvas; // Either a new canvas or the same one.
}

// // ---------------------------------------------------------------------
// //  CharModel Icon Creation
// // ---------------------------------------------------------------------
// TODO PATH: src/ModelIcon.js

/** @returns {import('three').PerspectiveCamera} The camera for FFLMakeIcon. */
function getIconCamera() {
	/** rad2deg(Math.atan2(43.2 / aspect, 500) / 0.5); */
	const fovy = 9.8762;
	const camera = new THREE.PerspectiveCamera(fovy, 1 /* aspect = square */, 500, 1000);
	camera.position.set(0, 34.5, 600);
	return camera;
}

/**
 * Creates an icon of the CharModel with the specified view type.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {Renderer} renderer - The renderer.
 * @param {Object} [options] - Optional settings for rendering the icon.
 * @param {number} [options.width] - Desired icon width in pixels.
 * @param {number} [options.height] - Desired icon height in pixels.
 * @param {import('three').Scene} [options.scene] - Optional scene
 * if you want to provide your own (e.g., with background, or models).
 * @param {import('three').Camera} [options.camera] - Optional camera
 * to use instead of the default.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas
 * to draw into. Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the icon.
 */
function makeIconFromCharModel(charModel, renderer, options = {}) {
	// Set locals from options object.
	let {
		width = 256,
		height = 256,
		scene,
		camera,
		canvas
	} = options;

	// Create an offscreen scene for the icon if one is not provided.
	if (!scene) {
		scene = new THREE.Scene();
		scene.background = null; // Transparent background.
	}
	// Add meshes from the CharModel.
	scene.add(charModel.meshes.clone());
	// If the meshes aren't cloned then they disappear from the
	// primary scene, however geometry/material etc are same

	// Get camera based on viewType parameter.
	if (!camera) {
		camera = getIconCamera();
	}

	const state = _saveRendererState(renderer);

	renderer.setRenderTarget(null); // Switch to primary target.
	renderer.setSize(width, height, false);
	renderer.render(scene, camera); // Render scene.

	canvas = _copyRendererToCanvas(renderer, canvas); // Populate canvas.

	_restoreRendererState(renderer, state);
	return canvas;
	// Caller needs to dispose CharModel.
}

// // ---------------------------------------------------------------------
// //  StudioCharInfo Definition, Conversion
// // ---------------------------------------------------------------------
// TODO PATH: src/StudioCharInfo.js

/**
 * Converts StudioCharInfo to FFLiCharInfo type needed by FFL internally.
 * @param {Uint8Array} src - The raw, unobfuscated StudioCharInfo data.
 * @returns {Uint8Array} Byte form of FFLiCharInfo.
 */
function convertStudioCharInfoToFFLiCharInfo(src) {
	const dst = new Uint8Array(FFLiCharInfo_size);
	const view = new DataView(dst.buffer);
	view.setUint32(0x80, commonColorMask(src[0]), true); // beardColor
	dst[0x7c] = src[1];
	dst[0xb0] = src[2];
	dst[0x2c] = src[3];
	view.setUint32(0x24, commonColorMask(src[4]), true); // eyeColor
	dst[0x30] = src[5];
	dst[0x28] = src[6];
	dst[0x20] = src[7];
	dst[0x34] = src[8];
	dst[0x38] = src[9];
	dst[0x48] = src[10];
	view.setUint32(0x40, commonColorMask(src[0xb]), true); // eyebrowColor
	dst[0x4c] = src[0xc];
	dst[0x44] = src[0xd];
	dst[0x3c] = src[0xe];
	dst[0x50] = src[0xf];
	dst[0x54] = src[0x10];
	dst[8] = src[0x11];
	dst[0x10] = src[0x12];
	dst[4] = src[0x13];
	dst[0xc] = src[0x14];
	dst[0xec] = src[0x15];
	dst[0xe0] = src[0x16];
	view.setUint32(0x90, commonColorMask(src[0x17]), true); // glassColor
	dst[0x94] = src[0x18];
	dst[0x8c] = src[0x19];
	dst[0x98] = src[0x1a];
	view.setUint32(0x18, commonColorMask(src[0x1b]), true); // hairColor
	dst[0x1c] = src[0x1c];
	dst[0x14] = src[0x1d];
	dst[0xac] = src[0x1e];
	dst[0xa0] = src[0x1f];
	dst[0x9c] = src[0x20];
	dst[0xa4] = src[0x21];
	dst[0xa8] = src[0x22];
	dst[0x70] = src[0x23];
	view.setUint32(0x68, commonColorMask(src[0x24]), true); // mouthColor
	dst[0x6c] = src[0x25];
	dst[100] = src[0x26];
	dst[0x74] = src[0x27];
	dst[0x84] = src[0x28];
	dst[0x78] = src[0x29];
	dst[0x88] = src[0x2a];
	dst[0x5c] = src[0x2b];
	dst[0x58] = src[0x2c];
	dst[0x60] = src[0x2d];
	dst[0x104] = 3;
	return dst;
}

/**
 * @param {Uint8Array} data - Obfuscated Studio URL data.
 * @returns {Uint8Array} Decoded Uint8Array representing CharInfoStudio.
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

	return decodedData.slice(0, 46); // Clamp to StudioCharInfo.size
}

// ------------------ ESM exports, uncomment if you use ESM ------------------
export {
	// Generic enums
	FFLModulateMode,
	FFLModulateType,
	FFLExpression,
	FFLModelFlag,
	FFLResourceType,

	// Types for CharModel initialization
	FFLCharModelDescDefault,

	// Enums for getRandomCharInfo
	FFLGender,
	FFLAge,
	FFLRace,

	// Begin public methods
	initializeFFL,
	setRendererState,
	exitFFL,
	CharModel, // CharModel class
	verifyCharInfo,
	getRandomCharInfo,
	makeExpressionFlag,
	checkExpressionChangesShapes,

	// Pants colors
	PantsColor,
	pantsColors,

	// CharModel creation
	createCharModel,
	updateCharModel,
	createAndRenderToTarget,
	matSupportsFFL,
	initCharModelTextures,
	textureToCanvas,

	// CharModel helpers for exporting models
	TextureShaderMaterial,
	ModelTexturesConverter,
	GeometryConversion,

	// Icon rendering
	getIconCamera,
	makeIconFromCharModel
};
