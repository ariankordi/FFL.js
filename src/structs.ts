import * as _ from '../struct-fu.js';

/** Mirror for {@link _.uint32le} to indicate a pointer. */
export const _uintptr = _.uint32le;

/**
 * @typedef {Object} FFLAttributeBuffer
 * @property {number} size
 * @property {number} stride
 * @property {number} ptr
 */
/** @type {import('./struct-fu').StructInstance<FFLAttributeBuffer>} */
export const FFLAttributeBuffer = _.struct([
	_.uint32le('size'),
	_.uint32le('stride'),
	_uintptr('ptr')
]);

/**
 * @typedef {Object} FFLPrimitiveParam
 * @property {number} primitiveType
 * @property {number} indexCount
 * @property {number} pAdjustMatrix
 * @property {number} pIndexBuffer
 */
/** @type {import('./struct-fu').StructInstance<FFLPrimitiveParam>} */
export const FFLPrimitiveParam = _.struct([
	_.uint32le('primitiveType'),
	_.uint32le('indexCount'),
	_uintptr('pAdjustMatrix'),
	_uintptr('pIndexBuffer')
]);

/**
 * @typedef {Object} FFLColor
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */
/** @type {import('./struct-fu').StructInstance<FFLColor>} */
export const FFLColor = _.struct([
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
/** @type {import('./struct-fu').StructInstance<FFLVec3>} */
export const FFLVec3 = _.struct([
	_.float32le('x'),
	_.float32le('y'),
	_.float32le('z')
]);

/**
 * @typedef {Object} FFLModulateParam
 * @property {enums.FFLModulateMode} mode
 * @property {enums.FFLModulateType} type
 * @property {number} pColorR - Pointer to FFLColor
 * @property {number} pColorG - Pointer to FFLColor
 * @property {number} pColorB - Pointer to FFLColor
 * @property {number} pTexture2D
 */
/** @type {import('./struct-fu').StructInstance<FFLModulateParam>} */
export const FFLModulateParam = _.struct([
	_.uint32le('mode'), // enum FFLModulateMode
	_.uint32le('type'), // enum FFLModulateType
	_uintptr('pColorR'),
	_uintptr('pColorG'),
	_uintptr('pColorB'),
	_uintptr('pTexture2D')
]);

/**
 * @typedef {Object} FFLDrawParam
 * @property {Array<FFLAttributeBuffer>} attributeBuffers
 * @property {FFLModulateParam} modulateParam
 * @property {enums.FFLCullMode} cullMode
 * @property {FFLPrimitiveParam} primitiveParam
 */
/** @type {import('./struct-fu').StructInstance<FFLDrawParam>} */
export const FFLDrawParam = _.struct([
	_.struct('attributeBuffers', [FFLAttributeBuffer], 5),
	_.struct('modulateParam', [FFLModulateParam]),
	_.uint32le('cullMode'),
	_.struct('primitiveParam', [FFLPrimitiveParam])
]);
