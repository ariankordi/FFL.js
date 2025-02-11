// //////////////////////////////////////////////////////////////////
// FFL Enum and Struct Definitions
// //////////////////////////////////////////////////////////////////

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

/*
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
*/

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
	_.byte('padding', 0x3C - (FFLAttributeBufferType.MAX * 12)) // Ensure correct size (0x3C)
]);

const FFLPrimitiveParam = _.struct([
	_.uint32le('primitiveType'), // FFLRIOPrimitiveMode (u32)
	_.uint32le('indexCount'),
	_.uint32le('_8'),
	_.uintptr('pIndexBuffer') // Pointer to index buffer
]);

const FFLColor = _.struct([
	_.float32le('r'),
	_.float32le('g'),
	_.float32le('b'),
	_.float32le('a')
]);

const FFLModulateParam = _.struct([
	_.uint32le('mode'), // FFLModulateMode
	_.uint32le('type'), // FFLModulateType
	_.uintptr('pColorR'), // FFLColor*
	_.uintptr('pColorG'), // FFLColor*
	_.uintptr('pColorB'), // FFLColor*
	_.uintptr('pTexture2D')
]);

const FFLDrawParam = _.struct([
	_.struct('attributeBufferParam', [FFLAttributeBufferParam]),
	_.struct('modulateParam', [FFLModulateParam]),
	_.uint32le('cullMode'), // FFLCullMode (u32)
	_.struct('primitiveParam', [FFLPrimitiveParam])
]);

const FFLiCharInfo = _.struct([
	_.int32le('miiVersion'),

	_.struct('faceline', [
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('texture'),
		_.int32le('make')
	]),
	_.struct('hair', [
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('flip')
	]),
	_.struct('eye', [
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('scale'),
		_.int32le('aspect'),
		_.int32le('rotate'),
		_.int32le('x'),
		_.int32le('y')
	]),
	_.struct('eyebrow', [
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('scale'),
		_.int32le('aspect'),
		_.int32le('rotate'),
		_.int32le('x'),
		_.int32le('y')
	]),
	_.struct('nose', [
		_.int32le('type'),
		_.int32le('scale'),
		_.int32le('y')
	]),
	_.struct('mouth', [
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('scale'),
		_.int32le('aspect'),
		_.int32le('y')
	]),
	_.struct('beard', [
		_.int32le('mustache'),
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('scale'),
		_.int32le('y')
	]),
	_.struct('glass', [
		_.int32le('type'),
		_.int32le('color'),
		_.int32le('scale'),
		_.int32le('y')
	]),
	_.struct('mole', [
		_.int32le('type'),
		_.int32le('scale'),
		_.int32le('x'),
		_.int32le('y')
	]),
	_.struct('body', [
		_.int32le('height'),
		_.int32le('build')
	]),
	_.struct('personal', [
		_.char16le('name', 22), // u16[11]
		_.char16le('creator', 22), // u16[11]
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

	_.byte('createID', 10), // FFLCreateID stub
	_.uint16le('padding_0'),
	_.int32le('authorType'),
	_.byte('authorID', 8) // FFLiAuthorID stub
]);

const FFLAdditionalInfo = _.struct([
	_.char16le('name', 22),
	_.char16le('creator', 22),
	_.byte('createID', 10), // FFLCreateID stub
	_.padTo(0x38),
	_.struct('skinColor', [FFLColor]),
	_.uint32le('flags'),
	/*
	_.ubitLE('hairFlip', 1),
	_.ubitLE('fontRegion', 2),
	_.ubitLE('ngWord', 1),
	_.ubitLE('build', 7),
	_.ubitLE('height', 7),
	_.ubitLE('favoriteColor', 4),
	_.ubitLE('birthDay', 5),
	_.ubitLE('birthMonth', 4),
	_.ubitLE('gender', 1),
	*/
	_.uint8('facelineType'),
	_.uint8('hairType'),
	// there may be another field here for alignment but its never written to
	_.padTo(0x50)
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
	_.byte('partsTextures', 0x154), // Stub for FFLiPartsTextures
	_.uintptr('pRawMaskDrawParam', FFLExpression.MAX), // Pointers to FFLDrawParams
	_.byte('_remaining', 0x388 - 620)
]);
const FFLiTextureTempObject = _.struct([
	_.struct('maskTextures', [FFLiMaskTexturesTempObject]),
	_.struct('facelineTexture', [FFLiFacelineTextureTempObject])
]);

const FFLiMaskTextures = _.struct([
	_.uintptr('pRenderTextures', FFLExpression.MAX)
]);

const FFL_RESOLUTION_MASK = 0x3fffffff; // first 2 bits cleared
const FFLCharModelDesc = _.struct([
	_.uint32le('resolution'),
	_.uint32le('allExpressionFlag', 3),
	_.uint32le('modelFlag'),
	_.uint32le('resourceType')
]);

const FFLiCharModel = _.struct([
	_.struct('charInfo', [FFLiCharInfo]),
	_.struct('charModelDesc', [FFLCharModelDesc]),
	_.uint32le('expression'), // FFLExpression (u32)
	_.uintptr('pTextureTempObject'), // FFLiTextureTempObject
	_.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX), // FFLDrawParam[12]
	_.uintptr('pShapeData', FFLiShapeType.MAX),
	_.struct('facelineRenderTexture', [FFLiRenderTexture]),
	_.uintptr('pCapGlassNoselineTextures', 3),
	_.struct('maskTextures', [FFLiMaskTextures]),
	// vvvv sizeof(FFLiCharModel) - size of this
	_.byte('_remaining', 0x0848 - 172) // Stub for rest of the fields.
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

// ------------------------------------------------------------------
// Texture/Texture Callback Related Structures
// ------------------------------------------------------------------
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

// //////////////////////////////////////////////////////////////////
// Helper Function: fetchIntoWasmHeap
// //////////////////////////////////////////////////////////////////


/**
 * Fetches a resource into the WASM heap.
 *
 * @param {string} url - The URL of the resource.
 * @param {Object} wasmModule - The WASM module instance.
 * @returns {Promise<{pointer: number, size: number}>} - The pointer and size of the allocated heap block.
 */
async function fetchIntoWasmHeap(url, wasmModule) {
	const response = await fetch(url);
	const contentLength = response.headers.get('Content-Length');

	if (!contentLength) {
		throw new Error('Content-Length header is missing. Cannot pre-allocate memory.');
	}

	const totalSize = parseInt(contentLength, 10);
	const wasmHeapPtr = wasmModule._malloc(totalSize);
	const heap = wasmModule.HEAPU8;
	const reader = response.body.getReader();
	let offset = wasmHeapPtr;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		heap.set(value, offset);
		offset += value.length;
	}

	return { pointer: wasmHeapPtr, size: offset - wasmHeapPtr };
}

// //////////////////////////////////////////////////////////////////
// Main FFL and Rendering Function
// //////////////////////////////////////////////////////////////////


/**
 * Main function that initializes FFL, creates a CharModel,
 * sets up Three.js rendering, and animates the scene.
 */
window.callFFL = async function () {
	"use strict";
	console.log("callFFL(): beginning FFL initialization");

	// Local texture registry to manage created textures
	const textureRegistry = new Map();

	// --------------------------------------------------------------
	// Initialize FFL Resources and Texture Callback
	// --------------------------------------------------------------
	/**
	 * Initializes FFL resources and sets up texture callbacks.
	 * @returns {Promise<void>}
	 */
	async function initializeFFL() {
		if (!Module) {
			console.error('FFL Module not initialized yet!');
			throw new Error('Module not ready');
		}

		// Set normal conversion mode.
		Module._FFLSetNormalIsSnorm8_8_8_8(1);

		// Fetch and initialize resource description.
		const resourceFetchPath = document.querySelector('meta[itemprop=ffl-resource-fetch-path]').content;
		const heapy = await fetchIntoWasmHeap(resourceFetchPath, Module);

		const resourceDesc = {
			pData: [0, 0],
			size: [0, 0]
		};
		resourceDesc.pData[FFLResourceType.HIGH] = heapy.pointer;
		resourceDesc.size[FFLResourceType.HIGH] = heapy.size;

		const resourceDescU8 = FFLResourceDesc.pack(resourceDesc);
		const resourceDescPtr = Module._malloc(FFLResourceDesc.size);
		Module.HEAPU8.set(resourceDescU8, resourceDescPtr);

		const initResult = Module._FFLInitRes(0, resourceDescPtr);
		if (initResult !== 0) {
			throw new Error(`FFLInitRes result: ${initResult}`);
		}
		Module._FFLInitResGPUStep();

		// Texture creation callback.
		function textureCreateFunc(pObjPtr, textureInfoPtr, texturePtrPtr) {
			const u8 = Module.HEAPU8.subarray(textureInfoPtr, textureInfoPtr + FFLTextureInfo.size);
			const pTextureInfo = FFLTextureInfo.unpack(u8);

			console.log(`Creating texture: ptr=${textureInfoPtr}, width=${pTextureInfo.width}, height=${pTextureInfo.height}, format=${pTextureInfo.format}, imageSize=${pTextureInfo.imageSize}`);

			let dataFormat;
			const type = THREE.UnsignedByteType;
			switch (pTextureInfo.format) {
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
					console.error('Unsupported texture format:', pTextureInfo.format);
					return null;
			}

			const imageData = Module.HEAPU8.slice(pTextureInfo.imagePtr, pTextureInfo.imagePtr + pTextureInfo.imageSize);
			const texture = new THREE.DataTexture(imageData, pTextureInfo.width, pTextureInfo.height, dataFormat, type);
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			texture.wrapS = THREE.MirroredRepeatWrapping;
			texture.wrapT = THREE.MirroredRepeatWrapping;
			texture.needsUpdate = true;

			textureRegistry.set(texture.id, texture);
			Module.HEAP32[texturePtrPtr / 4] = texture.id;
			return texture;
		}

		// Texture deletion callback.
		function textureDeleteFunc(pObjPtr, texturePtr) {
			const textureId = Module.HEAP32[texturePtr / 4];

			if (textureRegistry.has(textureId)) {
				const texture = textureRegistry.get(textureId);
				texture.dispose();
				textureRegistry.delete(textureId);
				console.log(`Deleted texture at ptr: ${textureId}`);
			} else {
				console.warn(`Attempted to delete non-existent texture at ptr: ${textureId}`);
			}
		}

		// Pack texture callback structure.
		const textureCallback = {
			pObj: 0,
			useOriginalTileMode: false,
			_padding: [0, 0, 0],
			pCreateFunc: Module.addFunction(textureCreateFunc, 'viii'),
			pDeleteFunc: Module.addFunction(textureDeleteFunc, 'vii')
		};
		const textureCallbackBuffer = FFLTextureCallback.pack(textureCallback);
		const textureCallbackPtr = Module._malloc(FFLTextureCallback.size);
		Module.HEAPU8.set(new Uint8Array(textureCallbackBuffer), textureCallbackPtr);

		console.log('FFLTextureCallback struct allocated at:', textureCallbackPtr);
		Module._FFLSetTextureCallback(textureCallbackPtr);
	}

	// --------------------------------------------------------------
	// Create and Initialize the CharModel
	// --------------------------------------------------------------
	/**
	 * Creates and initializes the FFL CharModel.
	 * @returns {{charModel: Object, charModelPtr: number, textureTempObject: Object}}
	 */
	function createCharModel() {
		const modelSourcePtr = Module._malloc(FFLCharModelSource.size);
		const modelDescPtr = Module._malloc(FFLCharModelDesc.size);
		const charModelPtr = Module._malloc(FFLiCharModel.size);
		const charInfoPtr = Module._malloc(FFLiCharInfo.size);

		// Convert base64 to Uint8Array for char info.
		const base64ToUint8Array = base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
		//const charInfoU8 = base64ToUint8Array('AwAAAAkAAAAAAAAAAAAAAAEAAAB7AAAAAQAAAAAAAAAhAAAAAAAAAAcAAAADAAAAAwAAAAIAAAAOAAAADQAAAAAAAAAEAAAABgAAAAcAAAAGAAAADAAAAAAAAAAAAAAABAAAAB4AAAAAAAAAAQAAAAQAAAANAAAAAAAAAAAAAAAGAAAABAAAABAAAAADAAAAAwAAAAcAAAALAAAAAAAAAAEAAAAMAAAAGwAAABwAAAA3AAAASgBhAHMAbQBpAG4AZQAAAAAAAAAAAAAAbwBzAGkAZwBvAG4AYQBsAAAAAAABAAAADAAAAAoAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAA27iHMb5gKyoqQgAAAAAAAKBBOMSghAAA');
		const charInfoU8 = base64ToUint8Array('AwAFMG0rAiKJRLe1nDWwN5i26X5uuAAAY0FjAGgAYQByAGwAaQBuAGUAAAAAAEwmApBlBttoRBggNEYUgRITYg0AACkAUkhQYwBoAGEAcgBsAGkAbgBlAAAAAAAAAHLb');
		Module.HEAPU8.set(charInfoU8, charInfoPtr);

		const modelSource = {
			//dataSource: FFLDataSource.BUFFER,
			dataSource: FFLDataSource.STORE_DATA,
			pBuffer: charInfoPtr,
			index: 0
		};
		const modelSourceBuffer = FFLCharModelSource.pack(modelSource);
		Module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);

		const modelDesc = {
			resolution: 192,
			allExpressionFlag: [ (1 << 0) | (1 << 14) | (1 << 5), 0, 0 ],
			modelFlag: 1 << 0,
			resourceType: 1
		};
		const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
		Module.HEAPU8.set(modelDescBuffer, modelDescPtr);

		const result = Module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		if (result !== 0) {
			throw new Error(`FFLInitCharModelCPUStep result: ${result}`);
		}

		Module._free(modelSourcePtr);
		Module._free(modelDescPtr);
		Module._free(charInfoPtr);

		const charModelU8 = Module.HEAPU8.subarray(charModelPtr, charModelPtr + FFLiCharModel.size);
		const charModel = FFLiCharModel.unpack(charModelU8);

		const textureTempObjectU8 = Module.HEAPU8.subarray(charModel.pTextureTempObject, charModel.pTextureTempObject + FFLiTextureTempObject.size);
		const textureTempObject = FFLiTextureTempObject.unpack(textureTempObjectU8);

		console.log('CharModel created:', charModel);
		console.log('TextureTempObject:', textureTempObject);

		return { charModel, charModelPtr, textureTempObject };
	}

	// --------------------------------------------------------------
	// Initialize Three.js Scene
	// --------------------------------------------------------------
	/**
	 * Initializes and returns a Three.js scene, camera, and renderer.
	 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}}
	 */
	function initThreeJSScene() {
		function getRemainingHeightAfterContent(contentSelector) {
			const viewportHeight = window.innerHeight;
			const contentElement = document.querySelector(contentSelector);
			if (!contentElement) {
				console.warn('Element not found:', contentSelector);
				return viewportHeight;
			}
			return viewportHeight - contentElement.offsetHeight;
		}
		const remainingHeight = getRemainingHeightAfterContent('#top-content');

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xE6E6FA);

		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / remainingHeight, 0.1, 1000);
		camera.position.set(0, 40, 100);

		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, remainingHeight);
		document.body.appendChild(renderer.domElement);

		// Add some lights.
		const ambientLight = new THREE.AmbientLight(new THREE.Color(0.73, 0.73, 0.73));
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(new THREE.Color(0.60, 0.60, 0.60), 1.0);
		directionalLight.position.set(-0.455, 0.348, 0.5).normalize();
		scene.add(directionalLight);
		const specularLight = new THREE.PointLight(new THREE.Color(0.70, 0.70, 0.70), 0.5);
		specularLight.position.set(10, 10, 10);
		scene.add(specularLight);

		return { scene, camera, renderer };
	}

	// --------------------------------------------------------------
	// Mesh and Texture Rendering Helpers
	// --------------------------------------------------------------
	/**
	 * Creates a Three.js mesh from a given draw parameter.
	 * @param {Object} drawParam - The draw parameter.
	 * @param {boolean} [disableLighting=false] - If true, use a material that ignores lights.
	 * @returns {THREE.Mesh|null} - The created mesh or null if creation fails.
	 */
	function createMeshFromDrawParam(drawParam, disableLighting = false) {
		if (!drawParam || drawParam.primitiveParam.indexCount === 0) {
			return null;
		}

		const attributes = drawParam.attributeBufferParam.attributeBuffers;
		const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
		if (positionBuffer.size === 0) {
			console.error('Missing position data for drawParam!');
			return null;
		}

		const posPtr = positionBuffer.ptr / 4;
		const vertexCount = positionBuffer.size / positionBuffer.stride;
		const positions = Module.HEAPF32.subarray(posPtr, posPtr + (vertexCount * 4));

		const geometry = new THREE.BufferGeometry();
		const interleavedBuffer = new THREE.InterleavedBuffer(positions, 4);
		geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0));

		const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
		const indexCount = drawParam.primitiveParam.indexCount;
		const indices = Module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
		geometry.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1));

		Object.entries(attributes).forEach(([typeStr, buffer]) => {
			const type = parseInt(typeStr);
			if (buffer.size === 0 && type !== FFLAttributeBufferType.POSITION) {
				return;
			}

			switch (type) {
				case FFLAttributeBufferType.NORMAL:
				case FFLAttributeBufferType.TANGENT: {
					const data = Module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
					geometry.setAttribute(
						type === FFLAttributeBufferType.NORMAL ? 'normal' : 'tangent',
						new THREE.Int8BufferAttribute(data, buffer.stride, true)
					);
					break;
				}
				case FFLAttributeBufferType.TEXCOORD: {
					const texcoords = Module.HEAPF32.subarray(buffer.ptr / 4, buffer.ptr / 4 + vertexCount * 2);
					geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texcoords, buffer.stride / 4));
					break;
				}
				case FFLAttributeBufferType.COLOR: {
					if (buffer.stride === 0) break;
					const colorData = new Uint8Array(Module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size));
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
			default:
				side = THREE.DoubleSide;
		}

		let modulateColor = new THREE.Vector4(0, 0, 0, 0);
		if (drawParam.modulateParam.pColorR !== 0) {
			const colorPtr = drawParam.modulateParam.pColorR / 4;
			const colorData = Module.HEAPF32.subarray(colorPtr, colorPtr + 4);
			modulateColor = new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
		}
		if (drawParam.modulateParam.pColorG !== 0 && drawParam.modulateParam.pColorB !== 0) {
			modulateColor = [
				getVector4FromFFLColorPtr(drawParam.modulateParam.pColorR),
				getVector4FromFFLColorPtr(drawParam.modulateParam.pColorG),
				getVector4FromFFLColorPtr(drawParam.modulateParam.pColorB)
			];
		}

		// Assumes FFLShaderMaterial is defined elsewhere.
		const material = new FFLShaderMaterial({
			modulateMode: drawParam.modulateParam.mode,
			modulateType: drawParam.modulateParam.type,
			modulateColor: modulateColor,
			side: side,
			lightEnable: !disableLighting,
			map: getTextureForDrawParam(drawParam)
		});

		return new THREE.Mesh(geometry, material);
	}

	/**
	 * Retrieves a texture for a given draw parameter.
	 * @param {Object} drawParam - The draw parameter.
	 * @returns {THREE.Texture|null} - The texture or null if not found.
	 */
	function getTextureForDrawParam(drawParam) {
		if (drawParam.modulateParam.pTexture2D) {
			const texturePtr = drawParam.modulateParam.pTexture2D;
			const texture = textureRegistry.get(texturePtr);
			if (texture) {
				console.log(`Binding texture to mesh, ptr: ${texturePtr}`);
				return texture;
			} else {
				console.warn(`Texture not found for ptr: ${texturePtr}`);
			}
		}
		return null;
	}

	/**
	 * Converts an FFL color pointer to a THREE.Vector4.
	 * @param {number} colorPtr - The pointer to the color.
	 * @returns {THREE.Vector4|null} - The converted color vector.
	 */
	function getVector4FromFFLColorPtr(colorPtr) {
		if (colorPtr === 0) {
			console.error('Null pointer passed to getVector4FromFFLColorPtr');
			return null;
		}
		const colorData = Module.HEAPF32.subarray(colorPtr / 4, colorPtr / 4 + 4);
		return new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
	}

	/**
	 * Creates an offscreen scene from an array of draw parameters.
	 * @param {Array} drawParams - Array of draw parameter objects.
	 * @param {THREE.Color|null} backgroundColor - Optional background color.
	 * @returns {{scene: THREE.Scene, meshes: Array<THREE.Mesh>}}
	 */
	function createOffscreenScene(drawParams, backgroundColor = null) {
		const tempScene = new THREE.Scene();
		tempScene.background = backgroundColor;
		const meshes = [];
		drawParams.forEach(dp => {
			const mesh = createMeshFromDrawParam(dp, true);
			if (mesh) {
				tempScene.add(mesh);
				meshes.push(mesh);
			}
		});
		return { scene: tempScene, meshes };
	}

	/**
	 * Renders a scene to a texture using an orthographic camera.
	 * @param {THREE.Scene} scene - The scene to render.
	 * @param {number} width - The texture width.
	 * @param {number} height - The texture height.
	 * @returns {THREE.Texture} - The rendered texture.
	 */
	function renderSceneToTexture(scene, width = 512, height = 512) {
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

	/**
	 * Displays a rendered scene by appending an image element to the document.
	 * @param {THREE.Scene} scene - The scene to display.
	 * @param {number} width - The scene width.
	 * @param {number} height - The scene height.
	 */
	function displayScene(scene, width, height) {
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

	/**
	 * Generates the faceline texture for the CharModel.
	 * @param {Object} charModel - The CharModel.
	 * @param {Object} textureTempObject - The texture temp object.
	 * @returns {number|null} - The faceline texture ID.
	 */
	function generateFacelineTexture(charModel, textureTempObject) {
		const drawParams = [
			textureTempObject.facelineTexture.drawParamFaceLine,
			textureTempObject.facelineTexture.drawParamFaceBeard,
			textureTempObject.facelineTexture.drawParamFaceMake
		].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);

		if (drawParams.length === 0) {
			console.error('No faceline drawParams found!');
			return null;
		}

		// Use the faceline color from additional info.
		const bgColor = new THREE.Color(facelineColor.r, facelineColor.g, facelineColor.b, facelineColor.a);
		const { scene: offscreenScene } = createOffscreenScene(drawParams, bgColor);
		const width = (charModel.charModelDesc.resolution / 2);
		const height = charModel.charModelDesc.resolution;
		const facelineTexture = renderSceneToTexture(offscreenScene, width, height);
		if (!facelineTexture) {
			console.error('Failed to generate faceline texture');
			return null;
		}
		textureRegistry.set(facelineTexture.id, facelineTexture);
		displayScene(offscreenScene, width, height);

		// Assign the texture to the CharModel’s faceline parameter.
		const param = charModel.drawParam[FFLiShapeType.OPA_FACELINE];
		param.modulateParam.pTexture2D = facelineTexture.id;
		return facelineTexture.id;
	}

	/**
	 * Generates a mask texture for the CharModel.
	 * @param {Object} charModel - The CharModel.
	 * @param {Object} rawMaskParam - The raw mask draw parameter.
	 * @returns {number|null} - The mask texture ID.
	 */
	function generateMaskTexture(charModel, rawMaskParam) {
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
			console.error('No mask drawParams found!');
			return null;
		}

		const { scene: offscreenScene } = createOffscreenScene(drawParams);
		const width = charModel.charModelDesc.resolution;
		const maskTexture = renderSceneToTexture(offscreenScene, width, width);
		if (!maskTexture) {
			console.error('Failed to generate mask texture');
			return null;
		}
		textureRegistry.set(maskTexture.id, maskTexture);
		displayScene(offscreenScene, width, width);
		return maskTexture.id;
	}

	/**
	 * Generates all mask textures for the CharModel.
	 * @param {Object} charModel - The CharModel.
	 * @param {Object} textureTempObject - The texture temp object.
	 */
	function generateMaskTextures(charModel, textureTempObject) {
		const expressionFlagPtr = charModelPtr + FFLiCharModel.fields.charModelDesc.offset + FFLCharModelDesc.fields.allExpressionFlag.offset;
		charModel.maskTextures.pRenderTextures.forEach((v, i) => {
			if (v === 0) return;
			const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
			const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(Module.HEAPU8.subarray(rawMaskDrawParamPtr, rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
			console.log(rawMaskDrawParam);
			Module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);
			const id = generateMaskTexture(charModel, rawMaskDrawParam);
			if (typeof id !== 'number') {
				throw new Error('failed to make mask???');
			}
			charModel.maskTextures.pRenderTextures[i] = id;
		});
		const maskTempObjectPtr = charModel.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset;
		Module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, charModel.charModelDesc.resourceType);
		Module._FFLiDeleteTextureTempObject(charModelPtr);
	}

	/**
	 * Sets the faceline texture of the CharModel.
	 * @param {number} facelineID - ID of the faceline texture.
	 */
	function setFaceline(facelineID) {
		const texture = textureRegistry.get(facelineID);
		meshes[FFLiShapeType.OPA_FACELINE].material.map = texture;
		meshes[FFLiShapeType.OPA_FACELINE].material.needsUpdate = true;
	}

	/**
	 * Sets the expression of the CharModel.
	 * @param {Object} charModel - The CharModel.
	 * @param {number} expression - The expression index.
	 */
	function setExpression(charModel, expression) {
		const texturePtr = charModel.maskTextures.pRenderTextures[expression];
		charModel.expression = expression;
		const texture = textureRegistry.get(texturePtr);
		meshes[FFLiShapeType.XLU_MASK].material.map = texture;
		meshes[FFLiShapeType.XLU_MASK].material.needsUpdate = true;
	}

	// --------------------------------------------------------------
	// Main Flow: Initialize, Create, Render, Animate!
	// --------------------------------------------------------------

	await initializeFFL();

	const { charModel, charModelPtr, textureTempObject } = createCharModel();

	// Retrieve additional info for faceline color.
	const additionalInfoPtr = Module._malloc(FFLAdditionalInfo.size);
	Module._FFLGetAdditionalInfo(additionalInfoPtr, FFLDataSource.BUFFER, charModelPtr, 0, false);
	const additionalInfo = FFLAdditionalInfo.unpack(Module.HEAPU8.subarray(additionalInfoPtr, additionalInfoPtr + FFLAdditionalInfo.size));
	Module._free(additionalInfoPtr);
	console.log('Additional Info:', additionalInfo);
	const facelineColor = additionalInfo.skinColor;

	const partsTexturesPtr = charModel.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset + FFLiMaskTexturesTempObject.fields.partsTextures.offset;
	Module._FFLiInvalidatePartsTextures(partsTexturesPtr);

	const { scene, camera, renderer } = initThreeJSScene();

	// Create meshes for all shape types.
	const meshes = [];
	for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
		const drawParam = charModel.drawParam[shapeType];
		const mesh = createMeshFromDrawParam(drawParam);
		if (mesh) {
			mesh.renderOrder = drawParam.modulateParam.type;
			scene.add(mesh);
		}
		meshes.push(mesh);
	}
	console.log('Meshes:', meshes);

	// Set mask texture for the default expression.
	charModel.drawParam[FFLiShapeType.XLU_MASK].modulateParam.pTexture2D = charModel.maskTextures.pRenderTextures[charModel.expression];

	// Generate faceline texture.
	const facelineTempObjectPtr = charModel.pTextureTempObject + FFLiTextureTempObject.fields.facelineTexture.offset;
	Module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
	const facelineID = generateFacelineTexture(charModel, textureTempObject);
	if (typeof facelineID !== 'number') {
		console.log('Could not make faceline texture:', facelineID);
	} else {
		setFaceline(facelineID);
		Module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModelPtr, charModel.charModelDesc.resourceType);
	}

	// Generate mask textures.
	generateMaskTextures(charModel, textureTempObject);

	// Set the initial expression.
	setExpression(charModel, charModel.expression);

	// Delete the CharModel from WASM memory when done.
	console.log('Deleting CharModel at ptr:', charModelPtr);
	Module._FFLDeleteCharModel(charModelPtr);
	Module._free(charModelPtr);

	// --------------------------------------------------------------
	// Animation Loop Variables and Function
	// --------------------------------------------------------------
	const blinkInterval = 1000; // milliseconds
	const blinkDuration = 80;   // milliseconds
	let lastBlinkTime = Date.now();
	let isBlinking = false;

	/**
	 * Animation loop that rotates meshes and simulates blinking.
	 */
	function animate() {
		requestAnimationFrame(animate);
		const currentTime = Date.now();

		// Decide whether to start blinking.
		if (!isBlinking && currentTime - lastBlinkTime >= blinkInterval) {
			const chance = 4;
			const expression = (Math.random() < 1 / chance) ? 14 : 5;
			setExpression(charModel, expression);
			isBlinking = true;
			lastBlinkTime = currentTime;
		}
		// End blinking after the blink duration.
		if (isBlinking && currentTime - lastBlinkTime >= blinkDuration) {
			setExpression(charModel, 0);
			isBlinking = false;
			lastBlinkTime = currentTime;
		}

		meshes.forEach(mesh => {
			if (mesh) {
				mesh.rotation.y += 0.01;
			}
		});
		renderer.render(scene, camera);
	}

	animate();
};
