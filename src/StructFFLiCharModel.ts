import { _uintptr, FFLDrawParam, FFLVec3 } from './structs';
import { FFLExpression, FFLModelFlag, FFLResourceType, FFLiShapeType } from './enums';

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
 * @property {Array<number>} createID
 * @property {number} padding_0
 * @property {number} authorType
 * @property {Array<number>} authorID
 */
/** @type {import('./struct-fu').StructInstance<FFLiCharInfo>} */
export const FFLiCharInfo = _.struct([
	_.int32le('miiVersion'),
	// faceline
	_.int32le('faceType'),
	_.int32le('faceColor'),
	_.int32le('faceTex'),
	_.int32le('faceMake'),
	// hair
	_.int32le('hairType'),
	_.int32le('hairColor'),
	_.int32le('hairFlip'),
	// eye
	_.int32le('eyeType'),
	_.int32le('eyeColor'),
	_.int32le('eyeScale'),
	_.int32le('eyeAspect'),
	_.int32le('eyeRotate'),
	_.int32le('eyeX'),
	_.int32le('eyeY'),
	// eyebrow
	_.int32le('eyebrowType'),
	_.int32le('eyebrowColor'),
	_.int32le('eyebrowScale'),
	_.int32le('eyebrowAspect'),
	_.int32le('eyebrowRotate'),
	_.int32le('eyebrowX'),
	_.int32le('eyebrowY'),
	// nose
	_.int32le('noseType'),
	_.int32le('noseScale'),
	_.int32le('noseY'),
	// mouth
	_.int32le('mouthType'),
	_.int32le('mouthColor'),
	_.int32le('mouthScale'),
	_.int32le('mouthAspect'),
	_.int32le('mouthY'),
	// beard
	_.int32le('beardMustache'),
	_.int32le('beardType'),
	_.int32le('beardColor'),
	_.int32le('beardScale'),
	_.int32le('beardY'),
	// glass
	_.int32le('glassType'),
	_.int32le('glassColor'),
	_.int32le('glassScale'),
	_.int32le('glassY'),
	// mole
	_.int32le('moleType'),
	_.int32le('moleScale'),
	_.int32le('moleX'),
	_.int32le('moleY'),
	// body
	_.int32le('height'),
	_.int32le('build'),
	// personal
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
	_.int32le('birthPlatform'),
	// other
	_.uint8('createID', 10),
	_.uint16le('padding_0'),
	_.int32le('authorType'),
	_.uint8('authorID', 8) // stub
]);

/**
 * Size of FFLStoreData, a structure not included currently.
 * @public
 */
/** sizeof(FFLStoreData) */
export const FFLStoreData_size = 96;

// ---------------------- Common Color Mask Definitions ----------------------

/** @package */
export const commonColorEnableMask = (1 << 31);

/**
 * Applies (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to indicate to FFL which color table it should use.
 * @param {number} color - The color index to flag.
 * @returns {number} The flagged color index to use in FFLiCharinfo.
 */
export const commonColorMask = (color: number): number => color | commonColorEnableMask;

/**
 * Removes (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to reveal the original common color index.
 * @param {number} color - The flagged color index.
 * @returns {number} The original color index before flagging.
 */
export const commonColorUnmask = (color: number): number => (color & ~commonColorEnableMask) === 0
// Only unmask color if the mask is enabled.
	? color
	: color & ~commonColorEnableMask;

// --------------------- Begin FFLiCharModel Definitions ---------------------

export enum facelinePartType {
	/** Wrinkle */
	Line = 0,
	Make = 1,
	Beard = 2,
	Count = 3
};

/** @type {import('./struct-fu').StructInstance<Array<FFLDrawParam>>} */
export const FFLiFacelineTextureTempObject = _.struct([
	_.struct([_uintptr(''), FFLDrawParam], facelinePartType.Count),
	_uintptr('_', 2) // stub
]);

export enum maskPartType {
	EyeR = 0,
	EyeL = 1,
	EyebrowR = 2,
	EyebrowL = 3,
	Mouth = 4,
	MustacheR = 5,
	MustacheL = 6,
	Mole = 7,
	/** Alpha clear. Can be skipped. */
	Fill = 8,
	End = 8
};

/** @type {import('./struct-fu').StructInstance<Array<FFLDrawParam>>} */
export const FFLiRawMaskDrawParam = _.struct([FFLDrawParam], maskPartType.End);

/**
 * @typedef {Object} FFLiMaskTexturesTempObject
 * @property {Array<number>} pRawMaskDrawParam
 */
/** @type {import('./struct-fu').StructInstance<FFLiMaskTexturesTempObject>} */
export const FFLiMaskTexturesTempObject = _.struct([
	_.byte(0x154),
	_uintptr('pRawMaskDrawParam', FFLExpression.MAX),
	_.byte(0x388 - 620) // stub
]);

/**
 * @typedef {Object} FFLiTextureTempObject
 * @property {FFLiMaskTexturesTempObject} maskTextures
 * @property {Array<FFLDrawParam>} facelineTexture
 */
/** @type {import('./struct-fu').StructInstance<FFLiTextureTempObject>} */
export const FFLiTextureTempObject = _.struct([
	_.struct('maskTextures', [FFLiMaskTexturesTempObject]),
	_.struct('facelineTexture', [FFLiFacelineTextureTempObject])
]);

/** @package */
export const FFL_RESOLUTION_MASK = 0x3fffffff;

/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution - Texture resolution for faceline/mask. It's recommended to only use powers of two.
 * @property {Uint32Array} allExpressionFlag - Expression flag, created by {@link makeExpressionFlag}
 * @property {FFLModelFlag} modelFlag
 * @property {FFLResourceType} resourceType
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelDesc>} */
export const FFLCharModelDesc = _.struct([
	_.uint32le('resolution'),
	_.uint32le('allExpressionFlag', 3),
	_.uint32le('modelFlag'),
	_.uint32le('resourceType')
]);
/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @readonly
 * @public
 */
export const FFLCharModelDescDefault = {
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
 * @typedef {Object<string, FFLVec3>} FFLPartsTransform
 * @property {FFLVec3} hatTranslate
 * @property {FFLVec3} headFrontRotate
 * @property {FFLVec3} headFrontTranslate
 * @property {FFLVec3} headSideRotate
 * @property {FFLVec3} headSideTranslate
 * @property {FFLVec3} headTopRotate
 * @property {FFLVec3} headTopTranslate
 */
/** @type {import('./struct-fu').StructInstance<FFLPartsTransform>} */
export const FFLPartsTransform = _.struct([
	_.struct('hatTranslate', [FFLVec3]),
	_.struct('headFrontRotate', [FFLVec3]),
	_.struct('headFrontTranslate', [FFLVec3]),
	_.struct('headSideRotate', [FFLVec3]),
	_.struct('headSideTranslate', [FFLVec3]),
	_.struct('headTopRotate', [FFLVec3]),
	_.struct('headTopTranslate', [FFLVec3])
]);
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

/**
 * Internal representation within FFL for the created CharModel.
 * @typedef {Object} FFLiCharModel
 * @property {FFLiCharInfo} charInfo
 * @property {FFLCharModelDesc} charModelDesc
 * @property {FFLExpression} expression
 * @property {number} pTextureTempObject
 * @property {Array<FFLDrawParam>} drawParam
 * @property {Array<number>} pMaskRenderTextures
 * @property {FFLPartsTransform} partsTransform
 */
/** @type {import('./struct-fu').StructInstance<FFLiCharModel>} */
export const FFLiCharModel = _.struct([
	_.struct('charInfo', [FFLiCharInfo]),
	_.struct('charModelDesc', [FFLCharModelDesc]),
	_.uint32le('expression'), // enum FFLExpression
	_uintptr('pTextureTempObject'), // stub
	_.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX),
	_uintptr('pShapeData', FFLiShapeType.MAX),
	_uintptr('facelineRenderTexture', 4), // stub
	_uintptr('pCapGlassNoselineTextures', 3),
	_uintptr('pMaskRenderTextures', FFLExpression.MAX),
	_.byte('beardHairFaceCenterPos', 0x18 * 3), // [FFLVec3], 3
	_.struct('partsTransform', [FFLPartsTransform]),
	_.uint32le('modelType'), // enum FFLModelType
	_.byte(0x18 * 3) // FFLBoundingBox[FFL_MODEL_TYPE_MAX = 3]
]);

export enum FFLDataSource {
	OFFICIAL = 0,
	DEFAULT = 1,
	MIDDLE_DB = 2,
	STORE_DATA_OFFICIAL = 3,
	STORE_DATA = 4,
	BUFFER = 5,
	DIRECT_POINTER = 6
};

/**
 * @typedef {Object} FFLCharModelSource
 * @property {FFLDataSource} dataSource
 * @property {number} pBuffer
 * @property {number} index - Only for default, official, MiddleDB; unneeded for raw data
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelSource>} */
export const FFLCharModelSource = _.struct([
	_.uint32le('dataSource'),
	_uintptr('pBuffer'),
	_.uint16le('index')
]);

// The enums below are only for FFLiGetRandomCharInfo.
// Hence, why each one has a value called ALL.

export enum FFLGender {
	MALE = 0,
	FEMALE = 1,
	ALL = 2
};

export enum FFLAge {
	CHILD = 0,
	ADULT = 1,
	ELDER = 2,
	ALL = 3
};

export enum FFLRace {
	BLACK = 0,
	WHITE = 1,
	ASIAN = 2,
	ALL = 3
};

/**
 * @typedef {Object} FFLResourceDesc
 * @property {Array<number>} pData
 * @property {Array<number>} size
 */
/** @type {import('./struct-fu').StructInstance<FFLResourceDesc>} */
export const FFLResourceDesc = _.struct([
	_uintptr('pData', FFLResourceType.MAX),
	_.uint32le('size', FFLResourceType.MAX)
]);

// // ---------------------------------------------------------------------
// //  Texture Management
// // ---------------------------------------------------------------------

// ------------------------- Texture Related Structs -------------------------
export enum FFLTextureFormat {
	R8_UNORM = 0,
	R8_G8_UNORM = 1,
	R8_G8_B8_A8_UNORM = 2,
	MAX = 3
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
 * @property {Array<number>} mipLevelOffset
 */
/** @type {import('./struct-fu').StructInstance<FFLTextureInfo>} */
export const FFLTextureInfo = _.struct([
	_.uint16le('width'),
	_.uint16le('height'),
	_.uint8('mipCount'),
	_.uint8('format'),
	_.uint8('isGX2Tiled'),
	_.byte('_padding', 1),
	_.uint32le('imageSize'),
	_uintptr('imagePtr'),
	_.uint32le('mipSize'),
	_uintptr('mipPtr'),
	_.uint32le('mipLevelOffset', 13)
]);

export const FFLTextureCallback = _.struct([
	_uintptr('pObj'),
	_.uint8('useOriginalTileMode'),
	_.byte('_padding', 3), // alignment
	_uintptr('pCreateFunc'),
	_uintptr('pDeleteFunc')
]);
