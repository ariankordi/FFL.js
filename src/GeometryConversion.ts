import * as THREE from 'three';

/**
 * Modifies a BufferGeometry in place to be compatible with glTF.
 * It currently: deinterleaves attributes, converts half-float to float,
 * and converts signed integer formats (not uint8 for color) to float.
 * Attributes named "normal" are reduced to three components.
 * @param {import('three').BufferGeometry} geometry - The BufferGeometry to modify in place.
 * @throws {Error} Throws if an unsupported attribute format is encountered.
 */
export function convGeometryToGLTFCompatible(geometry: THREE.BufferGeometry): void {
	if (!(geometry instanceof THREE.BufferGeometry) || !geometry.attributes) {
		throw new Error('convGeometryToGLTFCompatible: geometry is not BufferGeometry with attributes.');
	}

	// Process each attribute in the geometry.
	for (const [key, attr] of Object.entries(geometry.attributes)) {
		// If the attribute is interleaved, deinterleave it.
		const bufferAttribute = attr instanceof THREE.InterleavedBufferAttribute
			? interleavedBufferAttributeToBufferAttribute(attr)
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
				: copyFloat32WithReducedComponents(array, count, originalItemSize, targetItemSize);
		} else if (array instanceof Uint16Array) {
			// Assume half-float values. Three.js >=160 is required for them.
			const float32Full = convertHalfFloatArrayToFloat32(array);
			newArray = targetItemSize === originalItemSize
				? float32Full
				: copyFloat32WithReducedComponents(float32Full,
					count, originalItemSize, targetItemSize);
		} else if (array instanceof Int8Array) {
			// Convert SNORM to float in the range [-1,1]. For normals, only use first 3 components.
			newArray = convertSNORMToFloat32(array, count, originalItemSize, targetItemSize);
			// normalized = true; // Normals should be normalized?
		} else if (array instanceof Uint8Array) {
			// Likely color data in UNORM, leave as-is.
			newArray = array;
			normalized = true; // Not converted to float.
		} else {
			throw new Error(`convGeometryToGLTFCompatible: Unsupported attribute data type for ${key}: ${array.constructor.name}`);
		}

		// Also not sure if this will leak from the old attribute or not. (Don't think so)
		geometry.setAttribute(key, new THREE.BufferAttribute(newArray, targetItemSize, normalized));
	}
}

/**
 * Deinterleaves an InterleavedBufferAttribute into a standalone BufferAttribute.
 * @param {import('three').InterleavedBufferAttribute} attr - The interleaved attribute.
 * @returns {import('three').BufferAttribute} A new BufferAttribute containing deinterleaved data.
 */
export function interleavedBufferAttributeToBufferAttribute(attr: THREE.InterleavedBufferAttribute): THREE.BufferAttribute {
	const { itemSize, count } = attr;
	// eslint-disable-next-line jsdoc/valid-types -- TODO fix "syntax error in type"
	const dest = new (attr.array.constructor as new (length: number) => typeof attr.array)(count * itemSize);

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
 */
export function copyFloat32WithReducedComponents(src: Float32Array, count: number, srcItemSize: number, targetItemSize: number): Float32Array {
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
 */
export function halfToFloat(half: number): number {
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
 */
export function convertHalfFloatArrayToFloat32(halfArray: Uint16Array): Float32Array {
	const floatArray = new Float32Array(halfArray.length);
	for (let i = 0; i < halfArray.length; i++) {
		floatArray[i] = halfToFloat(halfArray[i]);
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
 */
export function convertSNORMToFloat32(src: Int8Array, count: number, srcItemSize: number, targetItemSize: number): Float32Array {
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
