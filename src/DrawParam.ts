import * as THREE from 'three';
import { FFLAttributeBufferType, FFLCullMode, FFLModulateMode, FFLModulateType } from './enums';
import { MaterialConstructor } from './CharModel';
import Module from './Module';
import TextureManager from './TextureManager';
import { FFLDrawParam, FFLColor, FFLModulateParam } from './structs';
import FFLShaderMaterialParameters from './materials/FFLShaderMaterialParameters';

/**
 * @param {Function} material - Class constructor for the material to test.
 * @returns {boolean} Whether or not the material class supports FFL swizzled (modulateMode) textures.
 */
export function matSupportsFFL(material: Function): boolean {
	return ('modulateMode' in material.prototype);
}

// ------ drawParamToMesh(drawParam, materialClass, module, texManager) ------
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
export function drawParamToMesh(drawParam: ReturnType<typeof FFLDrawParam.unpack>, materialClass: MaterialConstructor, module: Module, texManager: TextureManager): THREE.Mesh {
	console.assert(drawParam, 'drawParamToMesh: drawParam may be null.');
	console.assert(texManager, 'drawParamToMesh: Passed in TextureManager is null or undefined, is it constructed?');
	console.assert(typeof materialClass === 'function', 'drawParamToMesh: materialClass is unexpectedly not a function.');

	// Skip if the index count is 0, indicating no shape data.
	console.assert(drawParam.primitiveParam.indexCount, 'drawParamToMesh: Index count is 0, indicating shape is empty. Check that before it gets passed into this function.');

	// Bind geometry data.
	const geometry = _bindDrawParamGeometry(drawParam, module);

	// HACK: Allow the material class to modify the geometry if it needs to.
	if ('modifyBufferGeometry' in materialClass && // Static function
		typeof materialClass.modifyBufferGeometry === 'function') {
		materialClass.modifyBufferGeometry(drawParam, geometry);
	}

	// Determine cull mode by mapping FFLCullMode to THREE.Side.
	const cullModeToThreeSide: Partial<Record<FFLCullMode, THREE.Side>> = {
		[FFLCullMode.NONE]: THREE.DoubleSide,
		[FFLCullMode.BACK]: THREE.FrontSide,
		[FFLCullMode.FRONT]: THREE.BackSide,
		// Used by faceline/mask 2D planes for some reason:
		[FFLCullMode.MAX]: THREE.DoubleSide
	};
	const side = cullModeToThreeSide[drawParam.cullMode as FFLCullMode];
	console.assert(side !== undefined, `drawParamToMesh: Unexpected value for FFLCullMode: ${drawParam.cullMode}`);
	// Get texture.
	const texture = _getTextureFromModulateParam(drawParam.modulateParam, texManager);

	// Apply modulateParam material parameters.
	const isFFLMaterial = matSupportsFFL(materialClass);
	const params = _applyModulateParam(drawParam.modulateParam, module, isFFLMaterial);
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
		(materialParam as FFLShaderMaterialParameters).useSpecularModeBlinn = true;
	}

	// Create material using the provided materialClass.
	const material = new materialClass(materialParam);
	// Create mesh and set userData.modulateType.
	const mesh = new THREE.Mesh(geometry, material);

	// Apply pAdjustMatrix transformations if it is not null.
	if (drawParam.primitiveParam.pAdjustMatrix !== 0) {
		_applyAdjustMatrixToMesh(drawParam.primitiveParam.pAdjustMatrix, mesh, module.HEAPF32);
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
 * @package
 * @todo Does not yet handle color stride = 0
 */
export function _bindDrawParamGeometry(drawParam: ReturnType<typeof FFLDrawParam.unpack>, module: Module): THREE.BufferGeometry {
	/**
	 * @param {string} typeStr - The type of the attribute.
	 * @param {number} stride - The stride to display.
	 * @returns {void}
	 */
	const unexpectedStride = (typeStr: string, stride: number): void =>
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
 * @package
 */
export function _getTextureFromModulateParam(modulateParam: ReturnType<typeof FFLModulateParam.unpack>, textureManager: TextureManager): THREE.Texture | null {
	// Only assign texture if pTexture2D is not null.
	if (!modulateParam.pTexture2D ||
		// The pointer will be set to just "1" for
		// faceline and mask textures that are supposed
		// to be targets (FFL_TEXTURE_PLACEHOLDER, FFLI_RENDER_TEXTURE_PLACEHOLDER)
		modulateParam.pTexture2D === 1) {
		return null; // No texture to bind.
	}
	const texturePtr = modulateParam.pTexture2D;
	const texture: THREE.Texture | null | undefined = textureManager.get(texturePtr);
	console.assert(texture, `_getTextureFromModulateParam: Texture not found for ${texturePtr}.`);
	// Selective apply mirrored repeat (not supported on NPOT/mipmap textures for WebGL 1.0)
	const applyMirrorTypes = [
		FFLModulateType.SHAPE_FACELINE, FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_GLASS];
	// ^^ Faceline, cap, and glass. NOTE that faceline texture won't go through here
	if (applyMirrorTypes.indexOf(modulateParam.type) !== -1) {
		texture!.wrapS = THREE.MirroredRepeatWrapping;
		texture!.wrapT = THREE.MirroredRepeatWrapping;
		texture!.needsUpdate = true;
	}
	return texture!;
}

/**
 * Retrieves blending parameters based on the FFLModulateType.
 * Will only actually return anything for mask and faceline shapes.
 * @param {FFLModulateType} modulateType - The modulate type.
 * @param {FFLModulateMode} [modulateMode] - The modulate mode, used to
 * differentiate body/pants modulate types from mask modulate types.
 * @returns {Object} An object containing blending parameters for the Three.js material constructor, or an empty object.
 * @throws {Error} Unknown modulate type
 * @package
 */
export function _getBlendOptionsFromModulateType(modulateType: FFLModulateType, modulateMode: FFLModulateMode):
	| {}
	| { blending: number; blendSrc: number; blendSrcAlpha: number; blendDst: number; }
	| { blending: number; blendSrc: number; blendSrcAlpha: number; blendDst: number; blendDstAlpha: number; }
{
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

/* eslint-disable jsdoc/require-returns-type -- Allow TS to predict return type. */
/**
 * Returns an object of parameters for a Three.js material constructor, based on {@link FFLModulateParam}.
 * @param {FFLModulateParam} modulateParam - Property `modulateParam` of {@link FFLDrawParam}.
 * @param {Module} module - The Emscripten module for accessing color pointers in heap.
 * @param {boolean} [forFFLMaterial] - Whether or not to include modulateMode/Type parameters for material parameters.
 * @returns Parameters for creating a Three.js material.
 * @package
 */
export function _applyModulateParam(modulateParam: ReturnType<typeof FFLModulateParam.unpack>, module: Module, forFFLMaterial = true): Record<string, any> {
	/* eslint-enable jsdoc/require-returns-type -- Allow TS to predict return type. */
	// Apply constant colors.
	/** @type {import('three').Color|Array<import('three').Color>|null} */
	let color = null;

	/**
	 * Single constant color.
	 * @type {FFLColor|null}
	 */
	let color4 = null;
	const f32 = module.HEAPF32;
	// If both pColorG and pColorB are provided, combine them into an array.
	if (modulateParam.pColorG !== 0 && modulateParam.pColorB !== 0) {
		color = [
			_getFFLColor3(_getFFLColor(modulateParam.pColorR, f32)),
			_getFFLColor3(_getFFLColor(modulateParam.pColorG, f32)),
			_getFFLColor3(_getFFLColor(modulateParam.pColorB, f32))
		];
	} else if (modulateParam.pColorR !== 0) {
		// Otherwise, set it as a single color.
		color4 = _getFFLColor(modulateParam.pColorR, f32);
		color = _getFFLColor3(color4);
	}

	// Use opacity from single pColorR (it's only 0 for "fill" 2D plane)
	const opacity = color4 ? color4.a : 1.0;
	// Otherwise use 1.0, which is the opacity used pretty much everywhere.

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
		..._getBlendOptionsFromModulateType(modulateParam.type, modulateParam.mode)
	});

	// only for mask/faceline which should not be drawn in non-ffl materials:
	if (!lightEnable) {
		// Only set lightEnable if it is not default.
		(param as Record<string, any>).lightEnable = lightEnable;
	}
	return param;
}

/**
 * Dereferences a pointer to FFLColor.
 * @param {number} colorPtr - The pointer to the color.
 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
 * @returns {FFLColor} The converted Vector4.
 */
export function _getFFLColor(colorPtr: number, heapf32: Float32Array): { r: number; g: number; b: number; a: number; } {
	console.assert(colorPtr, '_getFFLColor: Received null pointer');
	// Assign directly from HEAPF32.
	const colorData = heapf32.subarray(colorPtr / 4, colorPtr / 4 + 4);
	return { r: colorData[0], g: colorData[1], b: colorData[2], a: colorData[3] };
}

/**
 * Creates a THREE.Color from {@link FFLColor}.
 * @param {FFLColor} color - The {@link FFLColor} object..
 * @returns {import('three').Color} The converted color.
 */
export function _getFFLColor3(color: ReturnType<typeof FFLColor.unpack>): THREE.Color {
	return new THREE.Color(color.r, color.g, color.b);
}

/**
 * Applies transformations in pAdjustMatrix within a {@link FFLDrawParam} to a mesh.
 * @param {number} pMtx - Pointer to rio::Matrix34f.
 * @param {import('three').Object3D} mesh - The mesh to apply transformations to.
 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
 * @package
 */
export function _applyAdjustMatrixToMesh(pMtx: number, mesh: THREE.Object3D, heapf32: Float32Array): void {
	// Assumes pMtx !== 0.
	const ptr = pMtx / 4;
	/** sizeof(rio::BaseMtx34f<float>) */
	const m = heapf32.slice(ptr, ptr + (0x30 / 4));
	// console.debug('drawParamToMesh: shape has pAdjustMatrix: ', m);
	/**
	 * Creates a THREE.Matrix4 from a 3x4 row-major matrix array.
	 * @param {Array<number>|Float32Array} m - The array that makes up the 3x4 matrix, expected to have 12 elements.
	 * @returns {import('three').Matrix4} The converted matrix.
	 */
	function matrixFromRowMajor3x4(m: number[] | Float32Array) {
		const matrix = new THREE.Matrix4();
		// Convert from rio::BaseMtx34f/row-major to column-major.
		matrix.set(
			m[0], m[4], m[8], m[3],
			m[1], m[5], m[9], m[7],
			m[2], m[6], m[10], m[11],
			0, 0, 0, 1
		);
		return matrix;
	}
	// Create a matrix from the array.
	const matrix = matrixFromRowMajor3x4(m);

	// Set position and scale. FFLiAdjustShape does not set rotation.
	mesh.scale.setFromMatrixScale(matrix);
	mesh.position.setFromMatrixPosition(matrix);
	// Account for flipped X scale (setFromMatrixScale doesn't?)
	if (matrix.elements[0] === -1) {
		mesh.scale.x = -1;
	}
}
