// @ts-check
'use strict';
/*!
 * Bindings for FFL, a Mii renderer, in JavaScript.
 * https://github.com/ariankordi/FFL.js
 * @author Arian Kordi <https://github.com/ariankordi>
 */

// ------------------ ESM imports, uncomment if you use ESM ------------------
// Also see the bottom of the script for corresponding exports.
/*
import * as THREE from 'three';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.0/+esm';
import * as _ from '../struct-fu/lib';
*/
// // ---------------------------------------------------------------------
// //  Emscripten Types, JSDoc Helpers
// // ---------------------------------------------------------------------

/**
 * Emscripten "Module" type.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
 * @typedef {Object} Module
 *
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
 * @property {function(number, number, number, number): *} _FFLInitCharModelCPUStepWithCallback
 * @property {function(number, number, number): *} _FFLInitCharModelCPUStep
 * @property {function(number): *} _FFLDeleteCharModel
 * @property {function(number): *} _FFLGetDrawParamOpaFaceline
 * @property {function(number): *} _FFLGetDrawParamOpaBeard
 * @property {function(number): *} _FFLGetDrawParamOpaNose
 * @property {function(number): *} _FFLGetDrawParamOpaForehead
 * @property {function(number): *} _FFLGetDrawParamOpaHair
 * @property {function(number): *} _FFLGetDrawParamOpaCap
 * @property {function(number): *} _FFLGetDrawParamXluMask
 * @property {function(number): *} _FFLGetDrawParamXluNoseLine
 * @property {function(number): *} _FFLGetDrawParamXluGlass
 * @property {function(number, number): *} _FFLSetExpression
 * @property {function(number): *} _FFLGetExpression
 * @property {function(number, number): *} _FFLSetViewModelType
 * @property {function(number, number): *} _FFLGetBoundingBox
 * @property {function(number, number): *} _FFLIsAvailableExpression
 * @property {function(number, number): *} _FFLSetCoordinate
 * @property {function(number): *} _FFLSetScale
 * @property {function(number, number, number, number): *} _FFLiGetRandomCharInfo
 * @property {function(number, number): *} _FFLpGetStoreDataFromCharInfo
 * @property {function(number, number): *} _FFLpGetCharInfoFromStoreData
 * @property {function(number, number, number, number, boolean): *} _FFLGetAdditionalInfo
 * @property {function(number, number): *} _FFLInitRes
 * @property {function(): *} _FFLInitResGPUStep
 * @property {function(): *} _FFLExit
 * @property {function(): *} _FFLIsAvailable
 * @property {function(number, number): *} _FFLGetFavoriteColor
 * @property {function(number): *} _FFLSetLinearGammaMode
 * @property {function(number, number): *} _FFLGetFacelineColor
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
 * @property {function(number): *} _FFLiInvalidatePartsTextures
 * @property {function(number): *} _FFLiInvalidateRawMask
 * @property {function(number, boolean): *} _FFLiVerifyCharInfoWithReason
 * @property {function(): void} _exit
 */

/**
 * Generate JSDoc typedef from an object, supporting nested types up to depth 5.
 * Ignores keys starting with "_".
 * @param {Object.<string, *>} obj - The object to analyze.
 * @param {string} typeName - The name of the type.
 * @param {number} depth - Current recursion depth (default: 0).
 * @param {Set<string>} definedTypes - Tracks already defined types to avoid duplicates.
 * @returns {string} JSDoc typedef output.
 */
function generateJSDoc(obj, typeName = 'GeneratedType', depth = 0, definedTypes = new Set()) {
	// Stop at max depth 5.
	if (depth > 5) {
		return '';
	}

	let text = `/**\n * @typedef {Object} ${typeName}\n`;
	let nestedDefinitions = '';

	Object.keys(obj).forEach((key) => {
		// Ignore private keys beginning with underscore.
		if (key.startsWith('_')) {
			// Ignore private keys beginning with underscore.
			return;
		}

		const value = obj[key];
		const valueType = typeof value;
		let propType;

		if (value === null) {
			propType = 'null';
		} else if (Array.isArray(value)) {
			let arrayType = '*'; // Assume first element type.
			if (value.length > 0) {
				const firstElem = value[0];
				if (typeof firstElem === 'object' && firstElem !== null) {
					const subType = `${typeName}_${key}_Item`;
					if (!definedTypes.has(subType)) {
						nestedDefinitions += generateJSDoc(firstElem, subType, depth + 1, definedTypes) + '\n';
						definedTypes.add(subType);
					}
					arrayType = subType;
				} else {
					arrayType = typeof firstElem;
				}
			}
			propType = `Array<${arrayType}>`;
		} else if (valueType === 'object') {
			const subType = `${typeName}_${key}`;
			if (!definedTypes.has(subType)) {
				nestedDefinitions += generateJSDoc(value, subType, depth + 1, definedTypes) + '\n';
				definedTypes.add(subType);
			}
			propType = subType;
		} else {
			propType = valueType;
		}

		text += ` * @property {${propType}} ${key}\n`;
	});

	text += ' */';
	return nestedDefinitions + text;
}

/**
 * Generates JSDoc, calling {@link generateJSDoc}, from the name
 * of a type defined as a struct-fu struct.
 * The result will be logged to console.
 * @param {string} typeName - Name of the type.
 * @throws {Error} typeName must be a string.
 */
function generateJSDocStructFu(typeName) {
	if (typeof typeName !== 'string') {
		throw new Error();
	}
	eval(`
		const empty = new Uint8Array(${typeName}.size);
		const ret = generateJSDoc(${typeName}.unpack(empty), typeName);
		console.log(ret);
	`);
}

/**
 * @typedef {Object} WindowCustom
 * @property {Module} Module
 * @property {Object} THREE
 * @property {TextureManager} FFLTextures
 * List shader materials:
 * @property {Object} FFLShaderMaterial
 * @property {Object} LUTShaderMaterial
 */

/** @type {WindowCustom} */
window;

// // ---------------------------------------------------------------------
// //  Enum Definitions
// // ---------------------------------------------------------------------

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

// // ---------------------------------------------------------------------
// //  Struct Definitions (struct-fu)
// // ---------------------------------------------------------------------
// Mostly leading up to FFLDrawParam.

// Define _uintptr as a mirror for _.uint32le.
const _uintptr = _.uint32le;

/**
 * @typedef {Object} FFLAttributeBuffer
 * @property {number} size
 * @property {number} stride
 * @property {number} ptr
 */
/** @type {_.StructInstance<FFLAttributeBuffer>} */
const FFLAttributeBuffer = _.struct([
	_.uint32le('size'),
	_.uint32le('stride'),
	_uintptr('ptr')
]);

/**
 * @typedef {Object} FFLAttributeBufferParam
 * @property {Array<FFLAttributeBuffer>} attributeBuffers
 */
/** @type {_.StructInstance<FFLAttributeBufferParam>} */
const FFLAttributeBufferParam = _.struct([
	_.struct('attributeBuffers', [FFLAttributeBuffer], 5)
]);

/**
 * @typedef {Object} FFLPrimitiveParam
 * @property {number} primitiveType
 * @property {number} indexCount
 * @property {number} pAdjustMatrix
 * @property {number} pIndexBuffer
 */
/** @type {_.StructInstance<FFLPrimitiveParam>} */
const FFLPrimitiveParam = _.struct([
	_.uint32le('primitiveType'),
	_.uint32le('indexCount'),
	_uintptr('pAdjustMatrix'), // TODO: Not uintptr in 64-bit.
	_uintptr('pIndexBuffer')
]);

/**
 * @typedef {Object} FFLColor
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */
/** @type {_.StructInstance<FFLColor>} */
const FFLColor = _.struct([
	_.float32le('r'),
	_.float32le('g'),
	_.float32le('b'),
	_.float32le('a')
]);

/**
 * @typedef {Object} FFLVec3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
/** @type {_.StructInstance<FFLVec3>} */
const FFLVec3 = _.struct([
	_.float32le('x'),
	_.float32le('y'),
	_.float32le('z')
]);

/**
 * @typedef {Object} FFLModulateParam
 * @property {FFLModulateMode} mode
 * @property {FFLModulateType} type
 * @property {number} pColorR - Pointer to FFLColor
 * @property {number} pColorG - Pointer to FFLColor
 * @property {number} pColorB - Pointer to FFLColor
 * @property {number} pTexture2D
 */
/** @type {_.StructInstance<FFLModulateParam>} */
const FFLModulateParam = _.struct([
	_.uint32le('mode'), // enum FFLModulateMode
	_.uint32le('type'), // enum FFLModulateType
	_uintptr('pColorR'),
	_uintptr('pColorG'),
	_uintptr('pColorB'),
	_uintptr('pTexture2D')
]);

/**
 * @typedef {Object} FFLDrawParam
 * @property {FFLAttributeBufferParam} attributeBufferParam
 * @property {FFLModulateParam} modulateParam
 * @property {FFLCullMode} cullMode
 * @property {FFLPrimitiveParam} primitiveParam
 */
/** @type {_.StructInstance<FFLDrawParam>} */
const FFLDrawParam = _.struct([
	_.struct('attributeBufferParam', [FFLAttributeBufferParam]),
	_.struct('modulateParam', [FFLModulateParam]),
	_.uint32le('cullMode'),
	_.struct('primitiveParam', [FFLPrimitiveParam])
]);

// ---------------------- Begin FFLiCharInfo Definition ----------------------

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
/** @type {_.StructInstance<FFLiCharInfo>} */
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
	_.uint8('authorID', 8) // stub
]);

/**
 * @public
 * Size of FFLStoreData, a structure not included currently.
 */
const FFLStoreData_size = 96; // sizeof(FFLStoreData)

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
const commonColorUnmask = color => (color & ~commonColorEnableMask) === 0
// Only unmask color if the mask is enabled.
	? color
	: color & ~commonColorEnableMask;

// --------------------- Begin FFLiCharModel Definitions ---------------------

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
	_uintptr('pTexture2DRenderBufferColorTargetDepthTarget', 4)
]);

/**
 * @typedef {Object} FFLiFacelineTextureTempObject
 * @property {number} pTextureFaceLine
 * @property {FFLDrawParam} drawParamFaceLine
 * @property {number} pTextureFaceMake
 * @property {FFLDrawParam} drawParamFaceMake
 * @property {number} pTextureFaceBeard
 * @property {FFLDrawParam} drawParamFaceBeard
 * @property {Array<number>} pRenderTextureCompressorParam
 */
/** @type {_.StructInstance<FFLiFacelineTextureTempObject>} */
const FFLiFacelineTextureTempObject = _.struct([
	_uintptr('pTextureFaceLine'),
	_.struct('drawParamFaceLine', [FFLDrawParam]),
	_uintptr('pTextureFaceMake'),
	_.struct('drawParamFaceMake', [FFLDrawParam]),
	_uintptr('pTextureFaceBeard'),
	_.struct('drawParamFaceBeard', [FFLDrawParam]),
	_uintptr('pRenderTextureCompressorParam', 2) // stub
]);

/**
 * @typedef {Object} FFLiRawMaskDrawParam
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsEye - 2
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsEyebrow - 2
 * @property {FFLDrawParam} drawParamRawMaskPartsMouth
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsMustache - 2
 * @property {FFLDrawParam} drawParamRawMaskPartsMole
 * @property {FFLDrawParam} drawParamRawMaskPartsFill
 */
/** @type {_.StructInstance<FFLiRawMaskDrawParam>} */
const FFLiRawMaskDrawParam = _.struct([
	_.struct('drawParamRawMaskPartsEye', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsEyebrow', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsMouth', [FFLDrawParam]),
	_.struct('drawParamRawMaskPartsMustache', [FFLDrawParam], 2),
	_.struct('drawParamRawMaskPartsMole', [FFLDrawParam]),
	_.struct('drawParamRawMaskPartsFill', [FFLDrawParam])
]);

/**
 * @typedef {Object} FFLiMaskTexturesTempObject
 * @property {Array<number>} partsTextures
 * @property {Array<number>} pRawMaskDrawParam
 * @property {Uint8Array} _remaining
 */
/** @type {_.StructInstance<FFLiMaskTexturesTempObject>} */
const FFLiMaskTexturesTempObject = _.struct([
	_.uint8('partsTextures', 0x154),
	_uintptr('pRawMaskDrawParam', FFLExpression.MAX),
	_.byte('_remaining', 0x388 - 620) // stub
]);

/**
 * @typedef {Object} FFLiTextureTempObject
 * @property {FFLiMaskTexturesTempObject} maskTextures
 * @property {FFLiFacelineTextureTempObject} facelineTexture
 */
/** @type {_.StructInstance<FFLiTextureTempObject>} */
const FFLiTextureTempObject = _.struct([
	_.struct('maskTextures', [FFLiMaskTexturesTempObject]),
	_.struct('facelineTexture', [FFLiFacelineTextureTempObject])
]);

/**
 * @typedef {Object} FFLiMaskTextures
 * @property {Array<number>} pRenderTextures
 */
/** @type {_.StructInstance<FFLiMaskTextures>} */
const FFLiMaskTextures = _.struct([
	_uintptr('pRenderTextures', FFLExpression.MAX)
]);

/** @package */
const FFL_RESOLUTION_MASK = 0x3fffffff;

/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution
 * @property {Uint32Array} allExpressionFlag
 * @property {number} modelFlag
 * @property {number} resourceType
 */
/** @type {_.StructInstance<FFLCharModelDesc>} */
const FFLCharModelDesc = _.struct([
	_.uint32le('resolution'),
	_.uint32le('allExpressionFlag', 3),
	_.uint32le('modelFlag'),
	_.uint32le('resourceType')
]);
/**
 * @public
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 */
const FFLCharModelDescDefault = {
	resolution: 512, // Typical default.
	// Choose normal expression.
	allExpressionFlag: new Uint32Array([1, 0, 0]), // Normal expression.
	modelFlag: FFLModelFlag.NORMAL,
	resourceType: FFLResourceType.HIGH // Default resource type.
};

/**
 * @typedef {Object.<string, FFLVec3>} FFLBoundingBox
 * @property {FFLVec3} min
 * @property {FFLVec3} max
 */
/** @type {_.StructInstance<FFLBoundingBox>} */
const FFLBoundingBox = _.struct([
	_.struct('min', [FFLVec3]),
	_.struct('max', [FFLVec3])
]);

/**
 * @typedef {Object.<string, FFLVec3>} FFLPartsTransform
 * @property {FFLVec3} hatTranslate
 * @property {FFLVec3} headFrontRotate
 * @property {FFLVec3} headFrontTranslate
 * @property {FFLVec3} headSideRotate
 * @property {FFLVec3} headSideTranslate
 * @property {FFLVec3} headTopRotate
 * @property {FFLVec3} headTopTranslate
 */
/** @type {_.StructInstance<FFLPartsTransform>} */
const FFLPartsTransform = _.struct([
	_.struct('hatTranslate', [FFLVec3]),
	_.struct('headFrontRotate', [FFLVec3]),
	_.struct('headFrontTranslate', [FFLVec3]),
	_.struct('headSideRotate', [FFLVec3]),
	_.struct('headSideTranslate', [FFLVec3]),
	_.struct('headTopRotate', [FFLVec3]),
	_.struct('headTopTranslate', [FFLVec3])
]);

/**
 * @typedef {Object} FFLiCharModel
 * @property {FFLiCharInfo} charInfo
 * @property {FFLCharModelDesc} charModelDesc
 * @property {FFLExpression} expression
 * @property {number} pTextureTempObject
 * @property {Array<FFLDrawParam>} drawParam
 * @property {Array<number>} pShapeData
 * @property {Array<Object>} facelineRenderTexture
 * @property {Array<number>} pCapGlassNoselineTextures
 * @property {FFLiMaskTextures} maskTextures
 * @property {Array<FFLVec3>} beardHairFaceCenterPos
 * @property {FFLPartsTransform} partsTransform
 * @property {number} modelType
 * @property {Array<FFLBoundingBox>} boundingBox
 */
/** @type {_.StructInstance<FFLiCharModel>} */
const FFLiCharModel = _.struct([
	_.struct('charInfo', [FFLiCharInfo]),
	_.struct('charModelDesc', [FFLCharModelDesc]),
	_.uint32le('expression'), // enum FFLExpression
	_uintptr('pTextureTempObject'), // stub
	_.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX),
	_uintptr('pShapeData', FFLiShapeType.MAX),
	_.struct('facelineRenderTexture', [FFLiRenderTexture]),
	_uintptr('pCapGlassNoselineTextures', 3),
	_.struct('maskTextures', [FFLiMaskTextures]),
	_.struct('beardHairFaceCenterPos', [FFLVec3], 3),
	_.struct('partsTransform', [FFLPartsTransform]),
	_.uint32le('modelType'), // enum FFLModelType
	// FFLBoundingBox[FFL_MODEL_TYPE_MAX = 3]
	_.struct('boundingBox', [FFLBoundingBox], 3)
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
/** @type {_.StructInstance<FFLCharModelSource>} */
const FFLCharModelSource = _.struct([
	_.uint32le('dataSource'),
	_uintptr('pBuffer'),
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

/**
 * @typedef {Object} FFLResourceDesc
 * @property {Array<number>} pData
 * @property {Array<number>} size
 */
/**
 * @type {_.StructInstance<FFLResourceDesc>}
 */
const FFLResourceDesc = _.struct([
	_uintptr('pData', FFLResourceType.MAX),
	_.uint32le('size', FFLResourceType.MAX)
]);

// // ---------------------------------------------------------------------
// //  Texture Management
// // ---------------------------------------------------------------------

// ------------------------- Texture Related Structs -------------------------
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
/**
 * @type {_.StructInstance<FFLTextureInfo>}
 */
const FFLTextureInfo = _.struct([
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

const FFLTextureCallback = _.struct([
	_uintptr('pObj'),
	_.uint8('useOriginalTileMode'),
	_.byte('_padding', 3), // alignment
	_uintptr('pCreateFunc'),
	_uintptr('pDeleteFunc')
]);

// ------------------------ Class: TextureManager -----------------------------
/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 */
class TextureManager {
	/**
	 * @constructor
	 * Constructs the TextureManager. This MUST be created after initializing FFL.
	 * @param {Module} [module=window.Module] - The Emscripten module.
	 */
	constructor(module = window.Module) {
		/** @private */
		this._module = module;
		/** @private */
		this._textures = new Map(); // Internal map of texture id -> THREE.Texture.
		/** @private */
		this._textureCallbackPtr = 0;
		/**
		 * @public
		 * Controls whether or not the TextureManager
		 * will log creations and deletions of textures
		 * in order to better track memory allocations.
		 */
		this.logging = false;

		this._setupTextureCallbacks();
	}

	/**
	 * @private
	 * Sets up texture creation and deletion callbacks
	 * with the module. Called by the constructor.
	 */
	_setupTextureCallbacks() {
		const mod = this._module;
		// Bind the callbacks to this instance.
		/** @private */
		this._createCallback = mod.addFunction(this._textureCreateFunc.bind(this), 'vppp');
		/** @private */
		this._deleteCallback = mod.addFunction(this._textureDeleteFunc.bind(this), 'vpp');
		const textureCallback = {
			pObj: 0,
			useOriginalTileMode: false,
			_padding: [0, 0, 0],
			pCreateFunc: this._createCallback,
			pDeleteFunc: this._deleteCallback
		};
		const packed = FFLTextureCallback.pack(textureCallback);
		/** @private */
		this._textureCallbackPtr = mod._malloc(FFLTextureCallback.size);
		mod.HEAPU8.set(new Uint8Array(packed), this._textureCallbackPtr);
		mod._FFLSetTextureCallback(this._textureCallbackPtr);
		// TODO: module.removeFunction(this._createCallback);
	}

	/**
	 * @private
	 * @param {number} format - Enum value for FFLTextureFormat.
	 * @returns {THREE.PixelFormat} Three.js texture format constant.
	 * @throws {Error} Unexpected FFLTextureFormat value
	 *
	 * Note that this function won't work on WebGL1Renderer in Three.js r137-r162 since R and RG textures need to use Luminance(Alpha)Format
     *     - (you'd somehow need to detect which renderer is used)
	 */
	_getTextureFormat(format) {
		// Map FFLTextureFormat to Three.js texture formats.

		// THREE.RGFormat did not work for me on Three.js r136/older.
		const useGLES2Formats = Number(THREE.REVISION) < 137;
		const r8 = useGLES2Formats
			? THREE.LuminanceFormat
			: THREE.RedFormat;
		const r8g8 = useGLES2Formats
		// NOTE: Using THREE.LuminanceAlphaFormat before
		// it was removed, on WebGL 2.0, causes the texture
		// to be converted to RGBA resulting in two issues.
		//     - There is a black outline around glasses
		//     - For glasses that have an inner color, the color is wrongly applied to the frames as well.
			? THREE.LuminanceAlphaFormat
			: THREE.RGFormat;

		const textureFormatToThreeFormat = {
			[FFLTextureFormat.R8_UNORM]: r8,
			[FFLTextureFormat.R8_G8_UNORM]: r8g8,
			[FFLTextureFormat.R8_G8_B8_A8_UNORM]: THREE.RGBAFormat
		};

		// Determine the data format from the table.
		const dataFormat = textureFormatToThreeFormat[format];
		if (dataFormat === undefined) {
			throw new Error(`_textureCreateFunc: Unexpected FFLTextureFormat value: ${format}`);
		}
		return dataFormat;
	}

	/**
	 * @private
	 * @param {number} _ - Originally pObj.
	 * @param {number} textureInfoPtr
	 * @param {number} texturePtrPtr
	 */
	_textureCreateFunc(_, textureInfoPtr, texturePtrPtr) {
		const u8 = this._module.HEAPU8.subarray(textureInfoPtr, textureInfoPtr + FFLTextureInfo.size);
		const textureInfo = FFLTextureInfo.unpack(u8);
		if (this.logging) {
			console.debug(`_textureCreateFunc: width=${textureInfo.width}, height=${textureInfo.height}, format=${textureInfo.format}, imageSize=${textureInfo.imageSize}, mipCount=${textureInfo.mipCount}`);
		}

		const format = this._getTextureFormat(textureInfo.format); // Resolve THREE.PixelFormat.
		// Copy image data from HEAPU8 via slice. This is base level/mip level 0.
		const imageData = this._module.HEAPU8.slice(textureInfo.imagePtr, textureInfo.imagePtr + textureInfo.imageSize);

		// Mipmaps were not implemented before Three.js r136
		// and they only began functioning properly on r138
		const canUseMipmaps = Number(THREE.REVISION) >= 138;
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
	 * @private
	 * @param {THREE.Texture} texture - Texture to upload mipmaps into.
	 * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
	 * @throws {Error} Throws if mipPtr is null.
	 */
	_addMipmaps(texture, textureInfo) {
		// Make sure mipPtr is not null.
		if (textureInfo.mipPtr === 0) {
			throw new Error('_addMipmaps: mipPtr is null, so the caller incorrectly assumed this texture has mipmaps');
		}

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

			if (this.logging) {
				console.debug(`  - Mip ${mipLevel}: ${mipWidth}x${mipHeight}, offset=${mipOffset}, range=${start}-${end}`);
			}
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

	/**
	 * @private
	 * @param {number} _ - Originally pObj.
	 * @param {number} texturePtr
	 */
	_textureDeleteFunc(_, texturePtr) {
		const texId = this._module.HEAPU32[texturePtr / 4];
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

	/**
	 * @public
	 * @param {number} id - ID assigned to the texture.
	 * @returns {THREE.Texture|null}
	 */
	get(id) {
		const texture = this._textures.get(id);
		if (!texture && this.logging) {
			console.error('Unknown texture', id);
		}
		return texture;
	}

	/**
	 * @public
	 * @param {number} id - ID assigned to the texture.
	 * @param {THREE.Texture} texture - Texture to add.
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
		// Log is spaced to match delete/deleting/dispose messages.
		if (this.logging) {
			console.debug('Adding texture    ', texture.id);
		}
	}

	/**
	 * @public
	 * @param {number} id - ID assigned to the texture.
	 */
	delete(id) {
		// Get texture from array instead of with get()
		// because it's okay if it was already deleted.
		const texture = this._textures.get(id);
		if (texture) {
			// This is assuming the texture has already been disposed.
			texture.source = null;
			if (this.logging) {
				console.debug('Deleted texture   ', id);
			}
			this._textures.delete(id);
		}
	}
}

// // ---------------------------------------------------------------------
// //  FFL Initialization
// // ---------------------------------------------------------------------

// ---------------------- handleFFLResult(name, result) ----------------------
/**
 * Checks the FFLResult returned from a function and throws an exception
 * if the result is not FFL_RESULT_OK.
 *
 * @param {string} name - The name of the function whose result to check.
 * @param {number} result - The returned FFLResult enum value.
 * @throws {Error} Throws if the result is not 0 (FFL_RESULT_OK).
 * @returns {void} Returns nothing if the result is 0.
 * @todo TODO: Should preferably return a custom error class.
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

/**
 * @private
 * Loads data from TypedArray or fetch response directly into Emscripten heap.
 * If passed a fetch response, it streams it directly into memory and avoids copying.
 *
 * @param {Uint8Array|Response} resource - The resource data.
 *    - Use a TypedArray if you have the raw bytes.
 *    - Use a fetch Response to stream it directly.
 * @param {Module} module - The Emscripten module instance.
 * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
 * @throws {Error} resource must be a Uint8Array or fetch that is streamable and has Content-Length.
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
			// Recommend passing in fetch Response, read func description for why
			console.warn('initializeFFL -> _loadDataIntoHeap: resource was passed as Uint8Array/ArrayBuffer. Please pass in a fetch Response instance for improved efficiency.');

			heapSize = resource.length;
			heapPtr = module._malloc(heapSize);
			console.debug(`loadDataIntoHeap: Loading from Uint8Array. Size: ${heapSize}, pointer: ${heapPtr}`);
			// Allocate and set this area in the heap as the passed array.
			module.HEAPU8.set(resource, heapPtr);
		} else if (resource instanceof Response) {
			// Handle as fetch response.
			if (!resource.ok) {
				throw new Error(`HTTP error while fetching resource at URL = ${resource.url}, response code = ${resource.status}`);
			}
			// Throw an error if it is not a streamable response.
			if (!resource.body) {
				throw new Error(`Fetch response is not streamable (resource.body = ${resource.body})`);
			}
			// Get the total size of the resource from the headers.
			const contentLength = resource.headers.get('Content-Length');
			if (!contentLength) {
				throw new Error('Fetch response is missing Content-Length.');
			}

			// Allocate into heap using the Content-Length.
			heapSize = parseInt(contentLength, 10);
			heapPtr = module._malloc(heapSize);

			console.debug(`loadDataIntoHeap: Streaming ${heapSize} bytes from fetch response. URL: ${resource.url}, pointer: ${heapPtr}`);

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
 * @global
 * Global storing the FFLResourceDesc instance that points to
 * where the FFL resource is allocated in the heap.
 * @type FFLResourceDesc
 */
let _resourceDesc;

// --------------------- initializeFFL(resource, module) ---------------------
/**
 * Initializes FFL by copying a resource (TypedArray or fetch response) into
 * heap and calling FFLInitRes. It will first wait for the module to be ready.
 *
 * @param {Uint8Array|Response} resource - The FFL resource data.
 *    Use a TypedArray if you have the raw bytes, or a fetch response containing
 *    the FFL resource file.
 * @param {Module} [module=window.Module] - The Emscripten module instance.
 * @returns {Promise<void>} Resolves when FFL is fully initialized.
 * @todo TODO TODO: DOES NOT WORK PROPERLY when CACHE IS ENABLED ????
 */
async function initializeFFL(resource, module = window.Module) {
	console.debug('initializeFFL: Entrypoint, waiting for module to be ready.');

	/** Frees the FFLResourceDesc - not the resources it POINTS to unlike _freeResourceDesc. */
	function freeResDesc() {
		if (resourceDescPtr) {
			// Free FFLResourceDesc, unused after init.
			module._free(resourceDescPtr);
		}
	}

	/** @type {number} */
	let resourceDescPtr; // Store pointer to free later.
	// Continue when Emscripten module is initialized.
	return new Promise((resolve, _) => {
		// try {
		// If onRuntimeInitialized is not defined on module, add it.
		if (!module.calledRun && !module.onRuntimeInitialized) {
			module.onRuntimeInitialized = () => {
				console.debug('initializeFFL: Emscripten runtime initialized, resolving.');
				resolve(null);
			};
			console.debug(`initializeFFL: module.calledRun: ${module.calledRun}, module.onRuntimeInitialized:\n${module.onRuntimeInitialized}\n // ^^ assigned and waiting.`);
		} else {
			console.debug('initializeFFL: Assuming module is ready.');
			resolve(null);
		}
		// } catch(e) {
		// 	debugger; throw e;
		// }
	})
		// .then(() => {
		// 	return resource.arrayBuffer();
		// })
		.then(async () => {
			if (resource instanceof Promise) {
				resource = await resource;
			}
		})
		.then(() => {
			return _loadDataIntoHeap(resource, module);
		})
		.then(({ pointer: heapPtr, size: heapSize }) => {
			console.debug(`initializeFFL: Resource loaded into heap. Pointer: ${heapPtr}, Size: ${heapSize}`);

			// Initialize and pack FFLResourceDesc.
			const resourceDesc = { pData: [0, 0], size: [0, 0] };
			// Using high resource type as the default.
			resourceDesc.pData[FFLResourceType.HIGH] = heapPtr;
			resourceDesc.size[FFLResourceType.HIGH] = heapSize;

			_resourceDesc = resourceDesc; // Set as global to free later.
			const resourceDescData = FFLResourceDesc.pack(resourceDesc);
			resourceDescPtr = module._malloc(FFLResourceDesc.size);
			module.HEAPU8.set(resourceDescData, resourceDescPtr);

			// Call FFL initialization. FFL_FONT_REGION_JP_US_EU = 0
			const result = module._FFLInitRes(0, resourceDescPtr);
			handleFFLResult('FFLInitRes', result); // Potentially throw.

			// Set required globals in FFL.
			module._FFLInitResGPUStep(); // CanInitCharModel will fail if not called.
			module._FFLSetNormalIsSnorm8_8_8_8(true); // Set normal format to FFLiSnorm8_8_8_8.
			module._FFLSetTextureFlipY(true); // Set textures to be flipped for OpenGL.

			// Requires refactoring:
			// module._FFLSetScale(0.1); // Sets model scale back to 1.0.
			// module._FFLSetLinearGammaMode(1); // Use linear gamma.
			// I don't think ^^ will work because the shaders need sRGB
		})
		.catch((error) => {
			_freeResourceDesc(_resourceDesc, module);
			freeResDesc();
			console.error('initializeFFL failed:', error);
			throw error;
		})
		.then(freeResDesc);
}

// ------------- initializeFFLWithResource(resourcePath, module) -------------
/**
 * Fetches the FFL resource from the specified path or the "content"
 * attribute of this HTML element: meta[itemprop=ffl-js-resource-fetch-path]
 * It then calls initializeFFL on the specified module.
 *
 * @param {string|null} [resourcePath=null] - The URL for the FFL resource.
 * @param {Module} [module=window.Module] - The Emscripten module instance.
 * @returns {Promise<void>} Resolves when the fetch and initializeFFL are finished.
 * @throws {Error} resourcePath must be a URL string, or, an HTML element with FFL resource must exist and have content.
 */
async function initializeFFLWithResource(resourcePath = null, module = window.Module) {
	// Query selector string for element with "content" attribute for path to the resource.
	const querySelectorResourcePath = 'meta[itemprop=ffl-js-resource-fetch-path]';

	if (!resourcePath && typeof document !== 'undefined') {
		// Load FFL resource file from meta tag in HTML.
		const resourceFetchElement = document.querySelector(querySelectorResourcePath);
		if (!resourceFetchElement || !resourceFetchElement.getAttribute('content')) {
			throw new Error(`initializeFFLWithResource: Element not found or does not have "content" attribute with path to FFL resource: ${querySelectorResourcePath}`);
		}
		// URL to resource for FFL.
		resourcePath = resourceFetchElement.getAttribute('content');
	}
	// is it still null?
	if (!resourcePath) {
		throw new Error('initializeFFLWithResource: resourcePath must be a string');
	}
	try {
		const response = await fetch(resourcePath); // Fetch resource.
		// Initialize FFL using the resource from fetch response.
		await initializeFFL(response, module);
		// TextureManager must be initialized after FFL.
		/** @global */
		window.FFLTextures = new TextureManager(module);
		console.debug('initializeFFLWithResource: FFLiManager and TextureManager initialized, exiting');
	} catch (error) {
		if (typeof alert !== 'undefined') {
			alert(`Error initializing FFL with resource: ${error}`);
		}
		throw error;
	}
}

/**
 * @private
 * Frees all pData pointers within {@link FFLResourceDesc}.
 * @param {FFLResourceDesc} desc
 * @param {Module} module
 */
function _freeResourceDesc(desc, module) {
	if (!desc || !desc.pData) {
		return;
	}
	desc.pData.forEach((ptr, i) => {
		if (ptr) {
			module._free(ptr);
			desc.pData[i] = 0;
		}
	});
}

// -------------------------------- exitFFL() --------------------------------
/**
 * @public
 * @param {Module} module
 * @todo TODO: Untested, need to destroy Emscripten instance.
 */
function exitFFL(module) {
	if (!_resourceDesc) {
		console.warn('exitFFL was called when FFL is not initialized.');
		return;
	}

	console.debug('exitFFL called, _resourceDesc:', _resourceDesc);

	// All CharModels must be deleted before this point.
	module._FFLExit();

	// Free resources in heap after FFLExit().
	_freeResourceDesc(_resourceDesc, module);

	// Exit the module...? Is this even necessary?
	if (module._exit) {
		module._exit();
	} else {
		console.debug('exitFFL: not calling module._exit = ', module._exit);
	}
}

// // ---------------------------------------------------------------------
// //  CharModel Handling
// // ---------------------------------------------------------------------

// --------------------------- Class: CharModel -------------------------------
/**
 * @public
 * Represents an FFLCharModel, which is the head model.
 * Encapsulates a pointer to the underlying instance and provides helper methods.
 *
 * NOTE: This is a wrapper around CharModel. In order to create one,
 * either call createCharModel or pass the pointer of a manually created
 * CharModel in here. So *DO NOT* call this constructor directly!
 */
class CharModel {
	/**
	 * @constructor
	 * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
	 * @param {Module} module - The Emscripten module.
	 * @param {function(new: THREE.Material, ...*): THREE.Material} materialClass - The material class (e.g., FFLShaderMaterial).
	 */
	constructor(ptr, module, materialClass) {
		/** @package */
		this._module = module;
		/**
		 * @package
		 * @type {*}
		 */
		this._data = null;
		/**
		 * @public
		 * @type {function(new: THREE.Material, ...*): THREE.Material}
		 */
		this._materialClass = materialClass; // Store the material class.
		/**
		 * @package
		 * Pointer to the FFLiCharModel in memory, set to null when deleted.
		 */
		this._ptr = ptr;
		/** @private */
		this.__ptr = ptr; // Permanent reference.
		// Unpack the FFLiCharModel structure from heap.
		const charModelData = this._module.HEAPU8.subarray(ptr, ptr + FFLiCharModel.size);
		/**
		 * @readonly
		 * The unpacked representation of the underlying
		 * FFLCharModel instance. Note that this is not
		 * meant to be updated at all and changes to
		 * this instance will not apply in FFL whatsoever.
		 */
		this._model = FFLiCharModel.unpack(charModelData);
		// NOTE: The only property SET in _model is expression.
		// Everything else is read.

		// this.additionalInfo = this._getAdditionalInfo();

		// Add RenderTargets for faceline and mask.
		/**
		 * @package
		 * @type {THREE.RenderTarget|null}
		 */
		this._facelineTarget = null;
		/**
		 * @package
		 * @type {Array<THREE.RenderTarget|null>}
		 */
		this._maskTargets = new Array(FFLExpression.MAX).fill(null);

		/**
		 * @public
		 * Group of THREE.Mesh objects representing the CharModel.
		 * @type {THREE.Group|null}
		 */
		this.meshes = new THREE.Group();
		// Set boundingBox getter ("this" = CharModel), dummy geometry needed
		// this.meshes.geometry = { }; // NOTE: is this a good idea?
		// Object.defineProperty(this.meshes.geometry, 'boundingBox', { get: () => this.boundingBox }); // TODO: box is too large using this

		this._addCharModelMeshes(module); // Populate this.meshes.
	}

	// ----------------------- _addCharModelMeshes(module) -----------------------
	/**
	 * @private
	 * This is the method that populates meshes
	 * from the internal FFLiCharModel instance.
	 * @param {Module} module - Module to pass to drawParamToMesh to access mesh data.
	 * @throws {Error} Throws if this.meshes is null or undefined.
	 */
	_addCharModelMeshes(module) {
		if (!this.meshes) {
			throw new Error('_addCharModelMeshes: this.meshes is null or undefined, was this CharModel disposed?');
		}
		// Add all meshes in the CharModel to the class instance.
		for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
			// Iterate through all DrawParams and convert to THREE.Mesh.
			const drawParam = this._model.drawParam[shapeType];

			// This will be null if there is no shape data,
			// but it will be added anyway so that the indexes
			// of this group all match up with FFLiShapeType.
			const mesh = drawParamToMesh(drawParam, this._materialClass, module);
			// if (mesh) {
			if (!mesh) {
				continue;
			}
			// Use FFLModulateType to indicate render order.
			mesh.renderOrder = drawParam.modulateParam.type;
			// }
			// Set faceline and mask meshes to use later.
			switch (shapeType) {
				case FFLiShapeType.OPA_FACELINE: {
					/** @package */
					this._facelineMesh = mesh;
					break;
				}
				case FFLiShapeType.XLU_MASK: {
					/** @package */
					this._maskMesh = mesh;
					break;
				}
			}

			this.meshes.add(mesh); // Add the mesh or null.
		}
	}

	// --------------------------- Private Get Methods ---------------------------

	/** @private */
	_getTextureTempObjectPtr() {
		// console.debug(`_getTextureTempObjectPtr: pTextureTempObject = ${this._model.pTextureTempObject}, pCharModel = ${this._ptr}`);
		return this._model.pTextureTempObject;
	}

	/** @package */
	_getTextureTempObject() {
		const ptr = this._getTextureTempObjectPtr();
		return FFLiTextureTempObject.unpack(this._module.HEAPU8.subarray(ptr, ptr + FFLiTextureTempObject.size));
	}

	/**
	 * @private
	 * Get the unpacked result of FFLGetAdditionalInfo.
	 */
	_getAdditionalInfo() {
		const mod = this._module;
		const addInfoPtr = mod._malloc(FFLAdditionalInfo.size);
		const result = mod._FFLGetAdditionalInfo(addInfoPtr, FFLDataSource.BUFFER, this._ptr, 0, false);
		handleFFLResult('FFLGetAdditionalInfo', result);
		const info = FFLAdditionalInfo.unpack(mod.HEAPU8.subarray(addInfoPtr, addInfoPtr + FFLAdditionalInfo.size));
		mod._free(addInfoPtr);
		return info;
	}

	/**
	 * @private
	 * Accesses partsTransform in FFLiCharModel,
	 * converting every FFLVec3 to THREE.Vector3.
	 * @returns {Object.<string, THREE.Vector3>}
	 * @throws {Error} Throws if this._model.partsTransform has objects that do not have "x" property.
	 */
	_getPartsTransform() {
		const obj = /** @type {Object.<string, FFLVec3>} */ (this._model.partsTransform);
		/** @type {Object.<string, THREE.Vector3>} */
		const newPartsTransform = {};
		for (const key in obj) {
			const vec = obj[key];
			// sanity check make sure there is "x"
			if (vec.x === undefined) {
				throw new Error();
			}
			// convert to THREE.Vector3
			newPartsTransform[key] = new THREE.Vector3(vec.x, vec.y, vec.z);
		}
		return newPartsTransform;
	}

	/** @private */
	_getFacelineColor() {
		// const color = this.additionalInfo.skinColor;
		// return new THREE.Color(color.r, color.g, color.b);
		const mod = this._module;
		const facelineColor = this._model.charInfo.faceline.color;
		const colorPtr = mod._malloc(FFLColor.size); // Allocate return pointer.
		mod._FFLGetFacelineColor(colorPtr, facelineColor);
		const color = _getVector4FromFFLColorPtr(colorPtr, mod);
		mod._free(colorPtr);
		return new THREE.Color().setRGB(color.x, color.y, color.z);// , THREE.SRGBColorSpace); // No alpha component.
		// Assume this is in working color space because it is used for clear color.
	}

	/** @private */
	_getFavoriteColor() {
		const mod = this._module;
		const favoriteColor = this._model.charInfo.personal.favoriteColor;
		const colorPtr = mod._malloc(FFLColor.size); // Allocate return pointer.
		mod._FFLGetFavoriteColor(colorPtr, favoriteColor); // Get favoriteColor from CharInfo.
		const color = _getVector4FromFFLColorPtr(colorPtr, mod);
		mod._free(colorPtr);
		return new THREE.Color().setRGB(color.x, color.y, color.z, THREE.SRGBColorSpace);
	}

	/** @private */
	_getCharInfoUint8Array() {
		return FFLiCharInfo.pack(this._model.charInfo);
	}

	/** @package */
	_getPartsTexturesPtr() {
		return this._model.pTextureTempObject + /** @type {number} */ (FFLiTextureTempObject.fields.maskTextures.offset) + /** @type {number} */ (FFLiMaskTexturesTempObject.fields.partsTextures.offset);
	}

	/** @package */
	_getFacelineTempObjectPtr() {
		return this._model.pTextureTempObject + /** @type {number} */ (FFLiTextureTempObject.fields.facelineTexture.offset);
	}

	/** @package */
	_getMaskTempObjectPtr() {
		return this._model.pTextureTempObject + /** @type {number} */ (FFLiTextureTempObject.fields.maskTextures.offset);
	}

	/** @package */
	_getExpressionFlagPtr() {
		return this._ptr + /** @type {number} */ (FFLiCharModel.fields.charModelDesc.offset) + /** @type {number} */ (FFLCharModelDesc.fields.allExpressionFlag.offset);
	}

	/**
	 * @private
	 * @returns {THREE.Box3}
	 */
	_getBoundingBox() {
		const box = this._model.boundingBox[this._model.modelType];
		const min = new THREE.Vector3(box.min.x, box.min.y, box.min.z);
		const max = new THREE.Vector3(box.max.x, box.max.y, box.max.z);
		return new THREE.Box3(min, max);
	}

	/**
	 * @package
	 * Get the texture resolution.
	 */
	_getResolution() {
		return this._model.charModelDesc.resolution & FFL_RESOLUTION_MASK;
	}

	// --------------------------------- Disposal ---------------------------------

	/**
	 * @package
	 * Finalizes the CharModel.
	 * Frees and deletes the CharModel right after generating textures.
	 * This is **not** the same as `dispose()` which cleans up the scene.
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
	 * @public
	 * Disposes RenderTargets for textures created by the CharModel.
	 */
	_disposeTextures() {
		// Dispose RenderTargets.
		if (this._facelineTarget) {
			console.debug(`Disposing target ${this._facelineTarget.texture.id} for faceline`);
			this._facelineTarget.dispose();
			this._facelineTarget = null;
		}
		// _maskTargets should always be defined.
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

	// ---------------------- Public Methods - Cleanup, Data ----------------------

	/**
	 * @public
	 * Disposes the CharModel and removes all associated resources.
	 * - Disposes materials and geometries.
	 * - Deletes faceline texture if it exists.
	 * - Deletes all mask textures.
	 * - Removes all meshes from the scene.
	 * @param {boolean} [disposeTextures=true] - Whether or not to dispose of mask and faceline render targets.
	 */
	dispose(disposeTextures = true) {
		// Print the permanent __ptr rather than _ptr.
		console.debug('CharModel.dispose: ptr =', this.__ptr);
		this._finalizeCharModel(); // Should've been called already
		// Dispose meshes: materials, geometries, textures.
		if (this.meshes) {
			disposeMeshes(this.meshes);
			this.meshes = null;
			this._facelineMesh = null;
			this._maskMesh = null;
		}
		// Dispose render textures.
		if (disposeTextures) {
			this._disposeTextures();
		}
	}

	/**
	 * @public
	 * Serializes the CharModel data to FFLStoreData.
	 * @returns {Uint8Array} The exported FFLStoreData.
	 * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo returns false, usually when CharInfo verification fails.
	 */
	getStoreData() {
		// Serialize the CharInfo.
		const charInfoData = this._getCharInfoUint8Array();

		const mod = this._module;
		// Allocate function arguments.
		const charInfoPtr = mod._malloc(FFLiCharInfo.size); // Input
		const storeDataPtr = mod._malloc(FFLStoreData_size); // Output
		mod.HEAPU8.set(charInfoData, charInfoPtr);

		// Call conversion function.
		const result = mod._FFLpGetStoreDataFromCharInfo(storeDataPtr, charInfoPtr);
		// Free and return data.
		const storeData = mod.HEAPU8.slice(storeDataPtr, storeDataPtr + FFLStoreData_size);
		mod._free(charInfoPtr);
		mod._free(storeDataPtr);

		if (!result) {
			throw new Error('getStoreData: call to FFLpGetStoreDataFromCharInfo returned false, CharInfo verification probably failed');
		}

		return storeData;
	}

	// TODO: getStudioCharInfo

	// ------------------------ Mask and Faceline Textures ------------------------

	/**
	 * @public
	 * Sets the expression for this CharModel and updates the corresponding mask texture.
	 * @param {number} expression - The new expression index.
	 * @throws {Error} CharModel must have been initialized with the expression enabled in the flag and have XLU_MASK in meshes.
	 */
	setExpression(expression) {
		this._model.expression = expression;

		const target = this._maskTargets[expression]; // or getMaskTexture()?
		if (!target || !target.texture) {
			throw new ExpressionNotSet(expression);
		}
		const mesh = this._maskMesh;
		if (!mesh || !(mesh instanceof THREE.Mesh)) {
			throw new Error('setExpression: mask mesh does not exist, cannot set expression on it');
		}
		// Update texture and material.
		/** @type {THREE.MeshBasicMaterial} */ (mesh.material).map = target.texture;
		/** @type {THREE.MeshBasicMaterial} */ (mesh.material).needsUpdate = true;
	}

	/**
	 * Gets the faceline texture, or the texture that wraps around
	 * the faceline shape (opaque, the one hair is placed atop).
	 * Not to be confused with the texture containing facial features
	 * such as eyes, mouth, etc. which is the mask.
	 * The faceline texture may not exist if it is not needed, in which
	 * case the faceline color is used directly, see property {@link facelineColor}.
	 //* @not-returns {THREE.Texture|null} The faceline texture, or null if it does not exist, in which case {@link facelineColor} should be used. It becomes invalid if the CharModel is disposed.
	 * @returns {THREE.RenderTarget|null} The faceline render target, or null if it does not exist, in which case {@link facelineColor} should be used. Access .texture on this object to get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
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
	 * @param {FFLExpression} [expression=this.expression] expression - The desired expression, or the current expression.
	 //* @not-returns {THREE.Texture|null} The mask texture for the given expression, or null if the CharModel was not initialized with that expression. It becomes invalid if the CharModel is disposed.
	 * @returns {THREE.RenderTarget|null} The mask render target for the given expression, or null if the CharModel was not initialized with that expression. Access .texture on this object to get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
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
	 * @public
	 * The current expression for this CharModel.
	 * Use setExpression to set the expression.
	 * @returns {FFLExpression} The current expression.
	 */
	get expression() {
		return this._model.expression; // mirror
	}

	/**
	 * @throws {Error} This method cannot be called, you have to use setExpression.
	 */
	set expression(_) {
		throw new Error('nope you cannot do this, try setExpression instead');
	}

	/**
	 * @public
	 * Contains the CharInfo of the model.
	 * Changes to this will not be reflected whatsoever.
	 * @returns {FFLiCharInfo} The CharInfo of the model.
	 */
	get charInfo() {
		return this._model.charInfo;
	}

	/**
	 * @public
	 * The faceline color for this CharModel.
	 * @returns {THREE.Color} The faceline color.
	 */
	get facelineColor() {
		if (!this._facelineColor) {
			/** @private */
			this._facelineColor = this._getFacelineColor();
		}
		return this._facelineColor;
	}

	/**
	 * @public
	 * The favorite color for this CharModel.
	 * @returns {THREE.Color} The favorite color.
	 */
	get favoriteColor() {
		if (!this._favoriteColor) {
			/** @private */
			this._favoriteColor = this._getFavoriteColor();
		}
		return this._favoriteColor;
	}

	/**
	 * @public
	 * @returns {number} Gender as 0 = male, 1 = female
	 */
	get gender() {
		return this._model.charInfo.personal.gender;
	}

	/**
	 * @public
	 * The parameters in which to transform hats and other accessories.
	 * @returns {Object} The PartsTransform object containing THREE.Vector3.
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
	 * @public
	 * @returns {THREE.Box3}
	 */
	get boundingBox() {
		if (!this._boundingBox) {
			// Set boundingBox property as THREE.Box3.
			/** @private */
			this._boundingBox = this._getBoundingBox();
		}
		return this._boundingBox;
	}

	// -------------------------------- Body Scale --------------------------------

	/**
	 * @enum {number}
	 */
	static BodyScaleMode = {
		Apply: 0, // Applies scale like all apps.
		Limit: 1 // Limits scale so that the pants are not visible.
	};

	/**
	 * @public
	 * Gets a vector in which to scale the body model for this CharModel.
	 * @param {BodyScaleMode} [scaleMode=CharModel.BodyScaleMode.Apply] scaleMode
	 * @returns {THREE.Vector3} Scale vector for the body model.
	 * @throws {Error} Unexpected value for scaleMode
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

/**
 * @enum {number}
 */
const PantsColor = {
	GrayNormal: 0,
	BluePresent: 1,
	RedRegular: 2,
	GoldSpecial: 3
};

/**
 * @type {Object.<PantsColor, THREE.Color>}
 */
const pantsColors = {
	[PantsColor.GrayNormal]: new THREE.Color(0x40474E),
	[PantsColor.BluePresent]: new THREE.Color(0x28407A),
	[PantsColor.RedRegular]: new THREE.Color(0x702015),
	[PantsColor.GoldSpecial]: new THREE.Color(0xC0A030)
};

/**
 * @private
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 *
 * @param {Uint8Array|FFLiCharInfo} data - Input: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} The CharModelSource with the data specified.
 * @throws {Error} data must be Uint8Array or FFLiCharInfo object. Data must be a known type.
 */
function _allocateModelSource(data, module) {
	const bufferPtr = module._malloc(FFLiCharInfo.size); // Maximum size.

	// Create modelSource.
	const modelSource = {
		// FFLDataSource.BUFFER = copies and verifies
		// FFLDataSource.DIRECT_POINTER = use without verification.
		dataSource: FFLDataSource.DIRECT_POINTER, // Assumes CharInfo by default.
		pBuffer: bufferPtr,
		index: 0 // Only for default, official, MiddleDB; unneeded for raw data
	};

	// module._FFLiGetRandomCharInfo(bufferPtr, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE); return modelSource;

	// Check type of data.
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

	// data should be Uint8Array at this point.

	// Enumerate through supported data types.
	switch (data.length) {
		case FFLStoreData_size: { // sizeof(FFLStoreData)
			// modelSource.dataSource = FFLDataSource.STORE_DATA;
			// Convert FFLStoreData to FFLiCharInfo instead.
			const storeDataPtr = module._malloc(FFLStoreData_size);
			module.HEAPU8.set(data, storeDataPtr);
			const result = module._FFLpGetCharInfoFromStoreData(bufferPtr, storeDataPtr);
			module._free(storeDataPtr);
			if (!result) {
				module._free(bufferPtr);
				throw new Error('_allocateModelSource: call to FFLpGetCharInfoFromStoreData returned false, CharInfo verification probably failed');
			}
			break;
		}
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
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: Unknown data length: ${data.length}`);
		}
	}

	return modelSource; // NOTE: pBuffer must be freed.
}

// ----------------- verifyCharInfo(data, module, verifyName) -----------------
/**
 * @public
 * Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
 *
 * @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
 * @param {Module} module - Module to access the data and call FFL through.
 * @param {boolean} verifyName - Whether the name and creator name should be verified.
 * @returns {void} Returns nothing if verification passes.
 * @throws {Error} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
 * @todo TODO: Should preferably return a custom error class.
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
		charInfoPtr = module._malloc(FFLiCharInfo.size);
		module.HEAPU8.set(data, charInfoPtr);
	}
	const result = module._FFLiVerifyCharInfoWithReason(charInfoPtr, verifyName);
	// Free CharInfo as soon as the function returns.
	if (charInfoAllocated) {
		module._free(charInfoPtr);
	}

	if (result !== 0) {
		// Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
		throw new Error(`FFLiVerifyCharInfoWithReason failed with result: ${result}`);
	}
}

// --------------- getRandomCharInfo(module, gender, age, race) ---------------
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 *
 * @param {Module} module
 * @param {FFLGender} [gender=FFLGender.ALL] - Gender of the character.
 * @param {FFLAge} [age=FFLAge.ALL] - Age of the character.
 * @param {FFLRace} [race=FFLRace.ALL] - Race of the character.
 * @todo TODO: Should this return FFLiCharInfo object?
 * @returns {Uint8Array} The random FFLiCharInfo.
 */
function getRandomCharInfo(module, gender = FFLGender.ALL, age = FFLAge.ALL, race = FFLRace.ALL) {
	const ptr = module._malloc(FFLiCharInfo.size);
	module._FFLiGetRandomCharInfo(ptr, gender, age, race);
	const result = module.HEAPU8.slice(ptr, ptr + FFLiCharInfo.size);
	module._free(ptr);
	return result;
}

// --------------------- makeExpressionFlag(expressions) ----------------------
/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * Use this whenever you need to describe which expression, or expressions, you want to be able to use in the CharModel.
 * @param {Array<number>|number} expressions - Either a single expression index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
function makeExpressionFlag(expressions) {
	/** @param {number} i */
	function checkRange(i) {
		if (i >= FFLExpression.MAX) {
			throw new Error(`makeExpressionFlag: input out of range: got ${i}, max: ${FFLExpression.MAX}`);
		}
	}

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

// // ---------------------------------------------------------------------
// //  CharModel Creation
// // ---------------------------------------------------------------------

// --------- createCharModel(data, modelDesc, materialClass, module) ---------
/**
 * Creates a CharModel from data and FFLCharModelDesc.
 * You must call initCharModelTextures afterwards to finish the process.
 * Don't forget to call dispose() on the CharModel when you are done.
 *
 * @param {Uint8Array|FFLiCharInfo} data - Character data. Accepted types: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {FFLCharModelDesc|null} modelDesc - The model description. Default: {@link FFLCharModelDescDefault}
 * @param {function(new: THREE.Material, ...*): THREE.Material} [materialClass=window.FFLShaderMaterial] - Class for the material (constructor), e.g.: FFLShaderMaterial
 * @param {Module} [module=window.Module] - The Emscripten module.
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The new CharModel instance.
 */
function createCharModel(data, modelDesc, materialClass = window.FFLShaderMaterial, module = window.Module, verify = true) {
	modelDesc = modelDesc || FFLCharModelDescDefault;
	// Allocate memory for model source, description, char model, and char info.
	const modelSourcePtr = module._malloc(FFLCharModelSource.size);
	const modelDescPtr = module._malloc(FFLCharModelDesc.size);
	const charModelPtr = module._malloc(FFLiCharModel.size);

	// data = getRandomCharInfo(module, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE); console.debug('getRandomCharInfo result:', FFLiCharInfo.unpack(data));
	// Get FFLCharModelSource. This converts and allocates CharInfo.
	const modelSource = _allocateModelSource(data, module);
	const charInfoPtr = modelSource.pBuffer; // Get pBuffer to free it later.

	const modelSourceBuffer = FFLCharModelSource.pack(modelSource);
	module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);

	// Set field to enable new expressions. This field
	// exists because some callers would leave the other
	// bits undefined but this does not so no reason to not enable
	modelDesc.modelFlag |= FFLModelFlag.NEW_EXPRESSIONS;

	const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
	module.HEAPU8.set(modelDescBuffer, modelDescPtr);
	try {
		// Verify CharInfo before creating.
		if (verify) {
			verifyCharInfo(charInfoPtr, module, false); // Don't verify name.
		}

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
	// The constructor will populate meshes from the FFLiCharModel instance.
	/** @private */
	charModel._data = data; // Store original data passed to function.

	console.debug(`createCharModel: Initialized for "${charModel._model.charInfo.personal.name}", ptr =`, charModelPtr);
	return charModel;
}

// ------- updateCharModel(charModel, newData, renderer, descOrExpFlag) -------
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 *
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @todo  TODO: Should this ^^^^^^^ just pass the charInfo object instance instead of "_data"?
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer.
 * @param {FFLCharModelDesc|Array<number>|Uint32Array|null} descOrExpFlag - Either a new {@link FFLCharModelDesc}, an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The updated CharModel instance.
 * @throws {Error} Unexpected type for descOrExpFlag, newData is null
 */
function updateCharModel(charModel, newData, renderer, descOrExpFlag = null, verify = true) {
	/** @type {FFLCharModelDesc} */
	let newModelDesc;
	newData = newData || charModel._data;
	if (!newData) {
		throw new Error('updateCharModel: newData is null. It should be retrieved from charModel._data which is set by createCharModel.');
	}

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
			throw new Error('updateCharModel: Unexpected type for descOrExpFlag');
	}

	// Dispose of the old CharModel.
	charModel.dispose();
	// Create a new CharModel with the new data and ModelDesc.
	const newCharModel = createCharModel(newData, newModelDesc, charModel._materialClass, charModel._module, verify);
	// Initialize its textures.
	initCharModelTextures(newCharModel, renderer);
	return newCharModel;
}

// // ---------------------------------------------------------------------
// //  DrawParam Reading
// // ---------------------------------------------------------------------

// TODO: private?
// ------------ drawParamToMesh(drawParam, materialClass, module) ------------
/**
 * Converts FFLDrawParam into a THREE.Mesh.
 * Binds geometry, texture, and material parameters.
 *
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {function(new: THREE.Material, ...*): THREE.Material} materialClass - Class for the material (constructor).
 * @param {Module} module - The Emscripten module.
 * @returns {THREE.Mesh|null} The THREE.Mesh instance, or null if the index count is 0 indicating no shape data.
 * @throws {Error} drawParam may be null, Unexpected value for FFLCullMode
 */
function drawParamToMesh(drawParam, materialClass, module) {
	if (!drawParam) {
		throw new Error('drawParamToMesh: drawParam may be null.');
	}
	// Skip if the index count is 0, indicating no shape data.
	if (drawParam.primitiveParam.indexCount === 0) {
		return null;
	}
	// Bind geometry data.
	const geometry = _bindDrawParamGeometry(drawParam, module);
	// Determine cull mode by mapping FFLCullMode to THREE.Side.
	/** @type {Object.<FFLCullMode, THREE.Side>} */
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
	// Get texture.
	const texture = _getTextureFromModulateParam(drawParam.modulateParam);

	// Create object for material parameters.
	const materialParam = {
		side: side,
		// Apply texture.
		map: texture,
		// Apply modulateParam material parameters.
		..._applyModulateParam(drawParam.modulateParam, module)
	};
	// Create material using the provided materialClass.
	const material = new materialClass(materialParam);
	// Create mesh and set userData.modulateType.
	const mesh = new THREE.Mesh(geometry, material);

	// Apply pAdjustMatrix transformations if it is not null.
	if (drawParam.primitiveParam.pAdjustMatrix !== 0) {
		_applyAdjustMatrixToMesh(drawParam.primitiveParam.pAdjustMatrix, mesh, module.HEAPF32);
	}

	// NOTE: Only putting it in geometry because FFL-Testing does the same.
	if (mesh.geometry.userData) {
		// Set modulateMode/modulateType (not modulateColor or cullMode).
		mesh.geometry.userData.modulateMode = drawParam.modulateParam.mode;
		mesh.geometry.userData.modulateType = drawParam.modulateParam.type;
	}
	return mesh;
}

/**
 * @private
 * Binds geometry attributes from drawParam into a THREE.BufferGeometry.
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {Module} module - The Emscripten module from which to read the heap.
 * @returns {THREE.BufferGeometry} The geometry.
 * @throws {Error} Position buffer must not have size of 0
 * @todo Does not yet handle color stride = 0
 */
function _bindDrawParamGeometry(drawParam, module) {
	// Access FFLAttributeBufferParam.
	const attributes = drawParam.attributeBufferParam.attributeBuffers;
	const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
	// There should always be positions.
	if (positionBuffer.size === 0) {
		throw new Error('_bindDrawParamGeometry: Position buffer must not have size of 0');
	}
	// Get vertex count from position buffer.
	const vertexCount = positionBuffer.size / positionBuffer.stride;
	const geometry = new THREE.BufferGeometry(); // Create BufferGeometry.
	// Bind index data.
	const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
	const indexCount = drawParam.primitiveParam.indexCount;
	const indices = module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
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
				// Float3, last 4 bytes unused (stride = 16)
				const ptr = buffer.ptr / 4;
				const data = module.HEAPF32.subarray(ptr, ptr + (vertexCount * 4));
				const interleavedBuffer = new THREE.InterleavedBuffer(data, 4);
				// Only works on Three.js r109 and above (previously used addAttribute which can be remapped)
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

				// Use default value if it does not exist.
				// NOTE: Does not handle values for u_color other
				// than the default 0/0/0/1 (custom u_parameter_mode)
				if (buffer.stride === 0) {
					break;
				}
				// Use "_color" because NOTE this is what the FFL-Testing exports and existing shaders do
				const data = module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size);
				geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(data, buffer.stride, true));
				break;
			}
		}
	}
	return geometry;
}

/**
 * @private
 * Retrieves a texture from ModulateParam.
 * Does not assign texture for faceline or mask types.
 *
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam.
 * @param {TextureManager} [textureManager=window.FFLTextures] - The TextureManager instance for which to look for the texture referenced.
 * @returns {THREE.Texture|null} The texture if found.
 * @throws {Error} Throws if pTexture2D refers to a texture that was not found in the TextureManager.
 */
function _getTextureFromModulateParam(modulateParam, textureManager = window.FFLTextures) {
	// Only assign texture if pTexture2D is not null.
	if (!modulateParam.pTexture2D ||
		// Ignore faceline and mask.
		modulateParam.type === FFLModulateType.SHAPE_FACELINE ||
		modulateParam.type === FFLModulateType.SHAPE_MASK) {
		return null; // No texture to bind.
	}
	const texturePtr = modulateParam.pTexture2D;
	const texture = textureManager.get(texturePtr);
	if (!texture) {
		throw new Error(`_getTextureFromModulateParam: Texture not found for ${texturePtr}.`);
	}
	// Selective apply mirrored repeat.
	const applyMirrorTypes = [FFLModulateType.SHAPE_FACELINE, FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_GLASS];
	// ^^ Faceline, cap, and glass. NOTE that faceline texture won't go through here
	if (applyMirrorTypes.indexOf(modulateParam.type) !== -1) {
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.needsUpdate = true;
	}
	return texture;
}

/**
 * @private
 * Returns an object of material parameters based on ModulateParam.
 *
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam
 * @param {Module} module - The Emscripten module for accessing color pointers via heap.
 * @returns {Object} Parameters for material creation.
 */
function _applyModulateParam(modulateParam, module) {
	// Default modulate color is a Vector4; if provided, extract it.
	/** @type {THREE.Vector4 | Array<THREE.Vector4>} */
	let modulateColor = new THREE.Vector4(0, 0, 0, 0);
	if (modulateParam.pColorR !== 0) {
		const colorPtr = modulateParam.pColorR / 4;
		const colorData = module.HEAPF32.subarray(colorPtr, colorPtr + 4);
		modulateColor = new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
	}
	// If both pColorG and pColorB are provided, combine them into an array.
	if (modulateParam.pColorG !== 0 && modulateParam.pColorB !== 0) {
		modulateColor = [
			_getVector4FromFFLColorPtr(modulateParam.pColorR, module),
			_getVector4FromFFLColorPtr(modulateParam.pColorG, module),
			_getVector4FromFFLColorPtr(modulateParam.pColorB, module)
		];
	}
	// Determine whether to enable lighting.
	const lightEnable = !(modulateParam.mode !== FFLModulateMode.CONSTANT &&
		modulateParam.type >= FFLModulateType.SHAPE_MAX);

	// Not applying map here.
	return {
		modulateMode: modulateParam.mode,
		modulateType: modulateParam.type,
		modulateColor: modulateColor,
		lightEnable: lightEnable
	};
}

/**
 * Converts a pointer to FFLColor into a THREE.Vector4.
 *
 * @param {number} colorPtr - The pointer to the color.
 * @param {Module} module - The Emscripten module.
 * @returns {THREE.Vector4}
 */
function _getVector4FromFFLColorPtr(colorPtr, module) {
	if (!colorPtr) {
		console.error('getVector4FromFFLColorPtr: Received null pointer');
		return new THREE.Vector4(0, 0, 0, 0);
	}
	const colorData = module.HEAPF32.subarray(colorPtr / 4, colorPtr / 4 + 4);
	return new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
}

/**
 * @private
 * Applies transformations in pAdjustMatrix within a {@link FFLDrawParam} to a mesh.
 * @param {number} pMtx - Pointer to rio::Matrix34f.
 * @param {THREE.Object3D} mesh - The mesh to apply transformations to.
 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
 */
function _applyAdjustMatrixToMesh(pMtx, mesh, heapf32) {
	// Assumes pMtx !== 0.
	const ptr = pMtx / 4;
	const m = heapf32.slice(ptr, ptr + (0x30 / 4)); // sizeof(rio::BaseMtx34f<float>)
	// console.debug('drawParamToMesh: shape has pAdjustMatrix: ', m);
	/**
	* Creates a THREE.Matrix4 from a 3x4 row-major matrix array.
	* @param {Array<number>|Float32Array} m - The array that makes up the 3x4 matrix, expected to have 12 elements.
	* @returns {THREE.Matrix4}
	*/
	function matrixFromRowMajor3x4(m) {
		const matrix = new THREE.Matrix4();
		// Convert from rio::BaseMtx34f/row-major to column-major.
		matrix.set(
			m[0], m[4], m[8],  m[3],
			m[1], m[5], m[9],  m[7],
			m[2], m[6], m[10], m[11],
			0,    0,    0,     1
		);
		return matrix;
	}
	// Create a matrix from the array.
	const matrix = matrixFromRowMajor3x4(m);

	// Set position and scale. FFLiAdjustShape does not set rotation.
	mesh.scale.setFromMatrixScale(matrix);
	mesh.position.setFromMatrixPosition(matrix);
}

// // ---------------------------------------------------------------------
// //  Debug Globals
// // ---------------------------------------------------------------------

/**
 * @global
 * Flag that does NOT clean up CharModels at all for debugging ONLY.
 * @todo: TODO: eslint keeps making this const
 */
let _noCharModelCleanupDebug = false;
/** @global */
let _displayRenderTexturesElement = document.getElementById('ffl-js-display-render-textures');
if (_displayRenderTexturesElement) {
	console.warn('displaying faceline and mask textures to texture-display element, remove it when you\'re done testing');
}

// // ---------------------------------------------------------------------
// //  CharModel Render Textures
// // ---------------------------------------------------------------------

// ---------------- initCharModelTextures(charModel, renderer) ----------------
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 *
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer.
 * @todo Should this just be called in createCharModel() or something? But it's the only function requiring renderer. Maybe if you pass in renderer to that?
 */
function initCharModelTextures(charModel, renderer) {
	const module = charModel._module;
	const textureTempObject = charModel._getTextureTempObject();
	// Draw faceline texture if applicable.
	_drawFacelineTexture(charModel, textureTempObject, renderer, module);

	// Warn if renderer.alpha is not set to true.
	const clearAlpha = renderer.getClearAlpha();
	if (clearAlpha !== 0) {
		// console.warn('initCharModelTextures: renderer was not initialized with alpha: true, so mask textures will probably all look blank right now.');
		renderer.setClearAlpha(0); // Override clearAlpha to 0.
	}

	// Draw mask textures for all expressions.
	_drawMaskTextures(charModel, textureTempObject, renderer, module);
	// Finalize CharModel, deleting and freeing it.
	if (!_noCharModelCleanupDebug) {
		charModel._finalizeCharModel();
	}
	// Update the expression to refresh the mask texture.
	charModel.setExpression(charModel.expression);
	// Set clearAlpha back.
	if (clearAlpha !== 0) {
		renderer.setClearAlpha(clearAlpha);
	}
}

/**
 * @private
 * @param {THREE.RenderTarget} target
 * @param {THREE.WebGLRenderer} renderer
 */
function _displayTextureDebug(target, renderer) {
	if (_displayRenderTexturesElement) {
		const dataURL = renderTargetToDataURL(target, renderer, true);
		appendImageFromDataURL(dataURL, _displayRenderTexturesElement);
	}
}

/**
 * @private
 * Draws and applies the faceline texture for the CharModel.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The FFLiTextureTempObject containing faceline DrawParams.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
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
	const { scene: offscreenScene } = createSceneFromDrawParams(drawParams, bgColor, charModel._materialClass, charModel._module);
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
	_setFaceline(charModel, target);
	// Delete temp faceline object to free resources.
	if (!_noCharModelCleanupDebug) {
		module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModel._ptr, charModel._model.charModelDesc.resourceType);
		disposeMeshes(offscreenScene); // Dispose meshes in scene.
	}
}

/**
 * @private
 * Iterates through mask textures and draws each mask texture.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The temporary texture object.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 */
function _drawMaskTextures(charModel, textureTempObject, renderer, module) {
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel._getExpressionFlagPtr();

	// Collect all scenes and only dispose them at the end.
	/** @type Array<THREE.Scene> */
	const scenes = [];

	// Iterate through pRenderTextures to find out which masks are needed.
	for (let i = 0; i < charModel._model.maskTextures.pRenderTextures.length; i++) {
		// pRenderTexture will be set to 1 if mask is meant to be drawn there.
		if (charModel._model.maskTextures.pRenderTextures[i] === 0) {
			continue;
		}
		const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
		const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(module.HEAPU8.subarray(rawMaskDrawParamPtr, rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
		module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);

		const { target, scene } = _drawMaskTexture(charModel, rawMaskDrawParam, renderer, module);
		console.debug(`Creating target ${target.texture.id} for mask ${i}`);
		charModel._maskTargets[i] = target;

		scenes.push(scene);
	}

	if (!_noCharModelCleanupDebug) {
		// Some texures are shared which is why this
		// needs to be done given that disposeMeshes
		// unconditionally deletes textures.
		scenes.forEach((scene) => {
			disposeMeshes(scene);
		});

		module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, charModel._model.charModelDesc.resourceType);
		module._FFLiDeleteTextureTempObject(charModel._ptr);
	}
}

/**
 * @private
 * Draws a single mask texture based on a RawMaskDrawParam.
 * Note that the caller needs to dispose meshes within the returned scene.
 *
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiRawMaskDrawParam} rawMaskParam - The RawMaskDrawParam.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @returns {{target: THREE.RenderTarget, scene: THREE.Scene}} The RenderTarget and scene of this mask texture.
 * @throws {Error} All DrawParams are empty.
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
		throw new Error('_drawMaskTexture: All DrawParams are empty.');
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

	return { target, scene: offscreenScene };
	// Caller needs to dispose meshes in scene.
}

/**
 * @private
 * Sets the faceline texture of the given CharModel from the RenderTarget.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.RenderTarget} target - RenderTarget for the faceline texture.
 * @throws {Error} target must be a valid THREE.RenderTarget with "texture" property and CharModel must be initialized with OPA_FACELINE in meshes.
 */
function _setFaceline(charModel, target) {
	if (!target || !target.texture) {
		throw new Error('setFaceline: passed in RenderTarget is invalid');
	}
	charModel._facelineTarget = target; // Store for later disposal.
	const mesh = charModel._facelineMesh;
	if (!mesh || !(mesh instanceof THREE.Mesh)) {
		throw new Error('setFaceline: faceline shape does not exist');
	}
	// Update texture and material.
	/** @type {THREE.MeshBasicMaterial} */ (mesh.material).map = target.texture;
	/** @type {THREE.MeshBasicMaterial} */ (mesh.material).needsUpdate = true;
}

// // ---------------------------------------------------------------------
// //  Scene/Render Target Handling
// // ---------------------------------------------------------------------

// TODO: private?
// -- createSceneFromDrawParams(drawParams, bgColor, materialClass, module) --
/**
 * Creates an THREE.Scene from an array of drawParams, converting each
 * to a new mesh. Used for one-time rendering of faceline/mask 2D planes.
 *
 * @param {Array<FFLDrawParam>} drawParams - Array of FFLDrawParam.
 * @param {THREE.Color|null} bgColor - Optional background color.
 * @param {function(new: THREE.Material, ...*): THREE.Material} materialClass - The material class (constructor). This shader must be able to handle the texture component selection (RGB_LAYERED, LUMINANCE_ALPHA, etc.) for textures that create mask and faceline.
 * @param {Module} module - The Emscripten module.
 * @returns {{scene: THREE.Scene, meshes: Array<THREE.Mesh|null>}}
 */
function createSceneFromDrawParams(drawParams, bgColor, materialClass, module) {
	const scene = new THREE.Scene();
	// For 2D plane rendering, set the background if provided.
	scene.background = bgColor || null;
	// TODO: use THREE.Group?
	/** @type {Array<THREE.Mesh|null>} */
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

// TODO: private?
// -------------------------- getIdentCamera(flipY) --------------------------
/**
 * Returns an ortho camera that is effectively the same as
 * if you used identity MVP matrix, for rendering 2D planes.
 *
 * @param {boolean} [flipY=false] - Flip the Y axis. Default is oriented for OpenGL.
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
 * @param {Object} [targetOptions] - Optional options for the render target.
 * @returns {THREE.RenderTarget} The render target (which contains .texture).
 */
function createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions = {}) {
	// Set default options for the RenderTarget.
	const options = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		...targetOptions
	};
	const renderTarget = new THREE.WebGLRenderTarget(width, height, options);
	// Get previous render target to switch back to.
	const prevTarget = renderer.getRenderTarget();
	// Only works on Three.js r102 and above.
	renderer.setRenderTarget(renderTarget); // Set new target.
	renderer.render(scene, camera); // Render.
	renderer.setRenderTarget(prevTarget); // Set previous target.
	return renderTarget; // This needs to be disposed when done.
}

// -------------------------- disposeMeshes(target) --------------------------
/**
 * Disposes meshes in a {@link THREE.Object3D} and removes them from the {@link THREE.Scene} specified.
 *
 * @param {THREE.Scene|THREE.Object3D} group - The scene or group to dispose meshes from.
 * @param {THREE.Scene} [scene] - The scene to remove the meshes from, if provided.
 * @todo TODO: Rename to disposeGroup/Scene or something
 */
function disposeMeshes(group, scene) {
	// Taken from: https://github.com/igvteam/spacewalk/blob/21c0a9da27f121a54e0cf6c0d4a23a9cf80e6623/js/utils/utils.js#L135C10-L135C29

	/**
	 * Disposes a single material.
	 * @param {THREE.MeshBasicMaterial} material
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
						disposeMaterial(/** @type {THREE.MeshBasicMaterial} */ (material));
					})
				: disposeMaterial(/** @type {THREE.MeshBasicMaterial} */(child.material));
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

// ----------- renderTargetToDataURL(renderTarget, renderer, flipY) -----------
/**
 * Gets a data URL for a render target's texture using the same renderer.
 *
 * @param {THREE.RenderTarget} renderTarget - The render target.
 * @param {THREE.WebGLRenderer} renderer - The renderer (MUST be the same renderer used for the target).
 * @param {boolean} [flipY=false] - Flip the Y axis. Default is oriented for OpenGL.
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
	// Get previous render target, color space, and size.
	const prevTarget = renderer.getRenderTarget();
	const prevColorSpace = renderer.outputColorSpace;
	const size = new THREE.Vector2();
	renderer.getSize(size);

	// Render to the main canvas to extract pixels.
	renderer.setRenderTarget(null); // Switch render target.
	// Use working color space.
	renderer.outputColorSpace = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
	renderer.setSize(renderTarget.width, renderTarget.height, false);
	renderer.render(scene, camera);

	/** Disposes working materials used and restores renderer options. */
	function cleanup() {
		// Dispose material, plane, remove it from scene.
		material.dispose();
		plane.dispose();
		scene.remove(mesh);
		// (Optionally set all above to null to destroy references)

		// Restore previous size, color space, and target.
		renderer.outputColorSpace = prevColorSpace;
		renderer.setSize(size.x, size.y, false);
		renderer.setRenderTarget(prevTarget);
	}

	// Convert the renderer's canvas to an image.
	const dataURL = renderer.domElement.toDataURL('image/png');

	cleanup();

	return dataURL;
}

// ---------------- appendImageFromDataURL(dataURL, container) ----------------
/**
 * Appends an image (from a data URL) to a DOM element.
 *
 * @param {string} dataURL - The image data URL.
 * @param {HTMLElement} [container=document.body] - The container element.
 */
function appendImageFromDataURL(dataURL, container) {
	if (!container) {
		console.warn('appendImageFromDataUrl: you did not specify "container" so we will use document.body, don\'t be surprised if your image ends up in brazil');
		container = document.body;
	}
	const img = new Image();
	img.src = dataURL;
	container.appendChild(img);
}

// // ---------------------------------------------------------------------
// //  CharModel Icon Creation
// // ---------------------------------------------------------------------

/**
 * @enum {number}
 */
const ViewType = {
	Face: 0, // Typical icon body view.
	MakeIcon: 1, // FFLMakeIcon matrix
	IconFovy45: 2 // Custom
};

// TODO: private?
// -------------- getCameraForViewType(viewType, width, height) --------------
/**
 * @param {ViewType} viewType
 * @param {number} [width=1] - Width of the view.
 * @param {number} [height=1] - Height of the view.
 * @returns {THREE.PerspectiveCamera} The camera representing the view type specified.
 * @throws {Error}
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

// ---- createCharModelIcon(charModel, renderer, viewType, width, height) ----
/**
 * Creates an icon representing the CharModel's head,
 * using a render target and reading its pixels into a data URL.
 *
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {ViewType} [viewType=ViewType.IconFovy45] viewType
 * @param {number} [width=256] - Desired icon width.
 * @param {number} [height=256] - Desired icon height.
 * @returns {string} A data URL of the icon image.
 * @throws {Error} CharModel.meshes is null or undefined, it may have been disposed.
 */
function createCharModelIcon(charModel, renderer, viewType = ViewType.MakeIcon, width = 256, height = 256) {
	if (!charModel.meshes) {
		throw new Error('CharModel.meshes is null or undefined, it may have been disposed.');
	}
	// Create an offscreen scene for the icon.
	const iconScene = new THREE.Scene();
	iconScene.background = null; // Transparent background.
	// Add meshes from the CharModel.
	iconScene.add(charModel.meshes.clone());
	// If the meshes aren't cloned then they disappear from the
	// primary scene, however geometry/material etc are same

	// Get camera based on viewType parameter.
	const iconCamera = getCameraForViewType(viewType);

	const target = createAndRenderToTarget(iconScene,
		iconCamera, renderer, width, height);

	const dataURL = renderTargetToDataURL(target, renderer);
	target.dispose(); // Dispose RenderTarget before returning.
	return dataURL;
	// Caller needs to dispose CharModel.
}

// // ---------------------------------------------------------------------
// //  StudioCharInfo Definition, Conversion
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
 * @type {_.StructInstance<StudioCharInfo>}
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

// ----------------- convertStudioCharInfoToFFLiCharInfo(src) -----------------
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

// --------------------- studioURLObfuscationDecode(data) ---------------------
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

// ----------------- convertFFLiCharInfoToStudioCharInfo(src) -----------------
/**
 * Creates a StudioCharInfo object from FFLiCharInfo.
 *
 * @param {FFLiCharInfo} src - The FFLiCharInfo instance.
 * @returns {StudioCharInfo} The StudioCharInfo output.
 * @todo TODO: Currently does NOT convert color indices
 * to CommonColor indices (ToVer3... etc)
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
// //  Generic Hex/Base64 Utilities
// // ---------------------------------------------------------------------

/**
 * Removes all spaces from a string.
 * @param {string} str - The input string.
 * @returns {string} The string without spaces.
 */
function stripSpaces(str) {
	return str.replace(/\s+/g, '');
}

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param {string} hex - The hexadecimal string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function hexToUint8Array(hex) {
	const match = hex.match(/.{1,2}/g);
	// If match returned null, use an empty array.
	const arr = (match ? match : []).map(function (byte) {
		return parseInt(byte, 16);
	});
	return new Uint8Array(arr);
}

/**
 * Converts a Base64 or Base64-URL encoded string to a Uint8Array.
 * @param {string} base64 - The Base64-encoded string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
function base64ToUint8Array(base64) {
	// Replace URL-safe Base64 characters
	const normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
	// Custom function to pad the string with '=' manually
	/** @param {string} str */ function padBase64(str) {
		while (str.length % 4 !== 0) {
			str += '=';
		}
		return str;
	}
	// Add padding if necessary.
	const paddedBase64 = padBase64(normalizedBase64);
	const binaryString = atob(paddedBase64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Array<number>} data - The Uint8Array to convert. TODO: check if Uint8Array truly can be used
 * @returns {string} The Base64-encoded string.
 */
function uint8ArrayToBase64(data) {
	return btoa(String.fromCharCode.apply(null, data));
}

/**
 * Parses a string contaning either hex or Base64 representation
 * of bytes into a Uint8Array, stripping spaces.
 *
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

// ------------------ ESM exports, uncomment if you use ESM ------------------
/*
export {
	// Generic enums
	FFLModulateMode,
	FFLModulateType,
	FFLExpression,
	FFLModelFlag,

	// Types for CharModel initialization
	FFLiCharInfo,
	FFLCharModelDesc,
	FFLCharModelDescDefault,
	FFLDataSource,
	FFLCharModelSource,

	// Enums for getRandomCharInfo
	FFLGender,
	FFLAge,
	FFLRace,

	// Begin public methods
	initializeFFLWithResource,
	exitFFL,
	CharModel, // CharModel class
	verifyCharInfo,
	getRandomCharInfo,
	makeExpressionFlag,

	// Pants colors
	PantsColor,
	pantsColors,

	// CharModel creation
	_allocateModelSource,
	createCharModel,
	updateCharModel,
	initCharModelTextures,
	renderTargetToDataURL,

	// Icon rendering
	ViewType,
	createCharModelIcon,
	StudioCharInfo,

	// Export utilities
	convertStudioCharInfoToFFLiCharInfo,
	uint8ArrayToBase64,
	parseHexOrB64ToUint8Array
};
*/
