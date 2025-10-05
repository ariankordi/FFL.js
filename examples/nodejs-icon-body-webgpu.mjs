/**
 * @file Sample for rendering a Mii icon headlessly
 * using Node.js and THREE.WebGPURenderer.
 * Before running, install: npm install webgpu three fast-png
 * (fast-png is used only because it's native JS, so probably less fuss)
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check

import * as fs from 'fs/promises';
import { create, globals } from 'webgpu';
import { encode } from 'fast-png';
import * as THREE from 'three/webgpu'; // THREE.WebGPURenderer
// Dependencies for body scaling.
import { GLTFLoader, SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { addSkeletonScalingExtensions } from '../helpers/SkeletonScalingExtensions.js';
import { detectModelDesc, applyScaleDesc } from '../helpers/ModelScaleDesc.js';
// Standard non-Node dependencies:
import {
	initializeFFL, setRendererState, createCharModel,
	initCharModelTextures, parseHexOrB64ToUint8Array,
	exitFFL, FFLGender, PantsColor, pantsColors
} from '../ffl.js';
import FFLShaderNodeMaterial from '../materials/FFLShaderNodeMaterial.js';
import ModuleFFL from './ffl-emscripten-single-file.js';
/* globals process -- Node.js */

// Imports for standalone JSDoc types.
/**
 * @typedef {import('../materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo} SampleShaderMaterialColorInfo
 * @typedef {import('../helpers/SkeletonScalingExtensions.js').SkeletonWithAttachments} SkeletonWithAttachments
 * @typedef {import('../helpers/ModelScaleDesc.js').ModelScaleDesc} ModelScaleDesc
 * @typedef {import('../ffl.js').MaterialConstructor} MaterialConstructor
 */

// URLs for body models.
const maleBodyPath = '../../body test/miibodymiddle m normal fix 1.0a.glb';
const femaleBodyPath = '../../body test/miibodymiddle f normal fix 1.0.glb';

// Animation-related state.
/** @type {THREE.AnimationMixer|null} */
let mixer = null;
/** @type {THREE.Clock} */
// const clock = new THREE.Clock();

/**
 * A body model with its ModelScaleDesc and animations altogether.
 * @typedef {Object} BodyModel
 * @property {THREE.Object3D} model
 * @property {Array<THREE.AnimationClip>} animations - AnimationClips from the glTF.
 * @property {ModelScaleDesc} scaleDesc
 */

const pantsColorDefault = pantsColors[PantsColor.RedRegular].clone().convertLinearToSRGB();

/**
 * Contains body models for each gender.
 * The value is the GLTFLoader GLTF type, since it contains animations.
 * @type {Record<import('../ffl.js').FFLGender, import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
 */
const bodyTemplates = [];

// // ---------------------------------------------------------------------
// //  Model Loading Helpers
// // ---------------------------------------------------------------------

/**
 * Async wrapper to load a GLTF model from URL.
 * @param {string} url - The URL to load the glTF model from.
 * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
 * The GLTF object. `gltf.scene` contains the mesh group.
 */
// const loadGLTF = async url =>
// 	new Promise((resolve, reject) => {
// 		new GLTFLoader().load(url, resolve, undefined, reject);
// 	});

/**
 * Async wrapper to load a GLTF model from a file path.
 * @param {string} path - The file path to load the glTF model from.
 * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
 * The GLTF object. `gltf.scene` contains the mesh group.
 */
async function loadGLTFFromFS(path) {
	const content = await fs.readFile(path);
	return new Promise((resolve, reject) => {
		new GLTFLoader().parse(content.buffer,
			', ', resolve, reject);
	});
}

/**
 * Preloads male and female body GLTFs.
 * @returns {Promise<void>} A new Promise that completes when the models are loaded.
 */
const preloadBodyTemplates = () =>
	Promise.all([loadGLTFFromFS(maleBodyPath),
		loadGLTFFromFS(femaleBodyPath)]).then((values) => {
		bodyTemplates[FFLGender.MALE] = values[0];
		bodyTemplates[FFLGender.FEMALE] = values[1];
	});

/**
 * Loads the body model for the specified gender from the glTF templates.
 * Applies a single animation from the glTF.
 * @param {FFLGender} gender - The gender for the model.
 * @returns {BodyModel} The body model.
 * @throws {Error} Throws if there is no model for the `genderVal`.
 * @todo This should probably be reduced to not load the animation,
 * so that it's in the caller's control if we want to swap animations.
 * It would have to return the GLTF though so the caller uses .scene/.animations.
 */
function loadBodyModel(gender) {
	const gltf = bodyTemplates[gender];
	if (!gltf) {
		throw new Error(`No body template for gender ${gender}`);
	}

	/**
	 * Cloned scene/group to avoid modifying the template.
	 * In order to maintain proper skinning/armature animations,
	 * SkeletonUtils.clone is used instead of gltf.scene.clone(true);
	 * per donmccurdy's recommendation: https://discourse.threejs.org/t/how-to-clone-a-gltf/78858/2
	 * @type {THREE.Object3D}
	 */
	const model = SkeletonUtils.clone(gltf.scene);
	// model.position.y = 45;

	// Assign one animation from the glTF model.
	const animations = gltf.animations;
	if (animations.length) {
		// Always replace the existing mixer.
		mixer = new THREE.AnimationMixer(model);

		// Use the animation named 'Wait' if it exists, otherwise choose the first one.
		let clip = animations.find(a => a.name === 'Wait');
		if (!clip) {
			clip = animations[0];
		}

		mixer.clipAction(clip).play()
			.setLoop(THREE.LoopRepeat, Infinity);
	}

	const scaleDesc = detectModelDesc(model);

	return { model, scaleDesc, animations };
}

// // ---------------------------------------------------------------------
// //  Body Model Setup
// // ---------------------------------------------------------------------

/**
 * Searches the Object3D for a SkinnedMesh that contains the given bone.
 * @param {THREE.Object3D} root - Where to search for the SkinnedMesh.
 * @param {string} boneName - Name of the bone in the parent SkinnedMesh to find.
 * @returns {THREE.SkinnedMesh|null} The SkinnedMesh containing the bone, or null if it was not found.
 */
function findSkinnedMeshWithBone(root, boneName) {
	let found = /** @type {THREE.SkinnedMesh|null} */ (null);
	root.traverse((node) => {
		if (found || !(node instanceof THREE.SkinnedMesh)) {
			return;
		}
		if (node.skeleton.bones.some(bone => bone.name === boneName)) {
			found = node;
		}
	});
	return found;
}

/**
 * Finds body and pants meshes, and applies modulateMode/modulateType.
 * @param {THREE.Object3D} model - The body model meshes.
 */
function applyModulateToBody(model) {
	/** @type {THREE.SkinnedMesh|null} */
	let lastSkinnedMesh = null;
	// To find the pants, let's find the last SkinndMesh and assume that's it.
	model.traverse((node) => {
		if (node instanceof THREE.SkinnedMesh) {
			lastSkinnedMesh = node;
		}
	});
	// (TODO: This method will NOT WORK for body models extracted from Miitomo PODs.)

	let meshIndex = 0;
	model.traverse((mesh) => {
		// The reason this is identifying SkinnedMesh instead of just Mesh
		// is to avoid detecting the head model. But, if the head is also
		// a SkinnedMesh and it's attached to the body, then it will catch here.
		if (!(mesh instanceof THREE.SkinnedMesh)) {
			return;
		}

		/**
		 * Assume that the mesh is pants if it is the last
		 * skinned mesh, or even. Otherwise, a it's the body.
		 */
		const isPants = lastSkinnedMesh
			? mesh.id === lastSkinnedMesh.id
			// If there is no lastSkinnedMesh, then assume this
			// is the pants if it is the second mesh.
			: (meshIndex % 2 === 0);

		mesh.geometry.userData.modulateMode = 0; // Constant color/opaque.
		mesh.geometry.userData.modulateType = isPants
			? 10 // Pants
			: 9; // Body

		meshIndex++;
	});
}

/**
 * Applies colors and the current material to the body/pants.
 * @param {BodyModel} body - The body model to prepare.
 * @param {MaterialConstructor} mat - The material to apply on the body model.
 * @param {THREE.Color} favoriteColor - The favorite color of the CharModel.
 * @param {THREE.Vector3Like} bodyScale - The vector to scale the body model with.
 * @param {THREE.Color} [pantsColor] - The pants color for the body.
 */
function prepareBodyForCharModel(body, mat, favoriteColor, bodyScale,
	pantsColor = pantsColorDefault) {
	applyModulateToBody(body.model); // Add modulateMode/modulateType.
	applyMaterialToGroup(body.model, mat, null); // TODO: info.colorInfo);

	// Set the colors on the body model.
	body.model.traverse((mesh) => {
		// The reason this is identifying SkinnedMesh instead of just Mesh
		// is to avoid detecting the head model. But, if the head is also
		// a SkinnedMesh and it's attached to the body, then it will catch here.
		if (!(mesh instanceof THREE.SkinnedMesh) ||
			!('modulateType' in mesh.geometry.userData)) {
			return;
		}
		// HACK HACK HACK HACKAHCKACHA HACKA HACK HACK
		if (mesh.geometry.userData.modulateType === 9) { // Body
			mesh.material.color = favoriteColor;
		} else if (mesh.geometry.userData.modulateType === 10) { // Pants
			mesh.material.color = pantsColor;
		}
	});

	applyScaleDesc(body.model,
		/* scaleVector */ bodyScale,
		/* desc */ body.scaleDesc);
}

/** The absolute world-scale of the head divided by the body's scale. */
const headToBodyScale = 10.0 / 7.0;

/**
 * Attaches the head model to the body model's head bone.
 * Also calls {@link SkeletonWithAttachments.attach} so that the head
 * model's position follows the scaled head bone without getting scaled itself.
 * @param {BodyModel} body - The body model to attach the head ot.
 * @param {THREE.Group} head - The head (CharModel) to attach.
 * @throws {Error} Throws if the head bone or SkinnedMesh was not found.
 */
function attachHeadToBody(body, head) {
	//  * @param {string} headBoneName - The name of the head bone from {@link typeof ModelScaleDesc.head}.
	const headBoneName = body.scaleDesc.head;
	if (headBoneName === 'Head') {
		console.error('TODO: Head is not attached correctly to the Miitomo body. Skipping it so you can see what the model looks like anyway.');
		return;
	}

	const headBone = body.model.getObjectByName(headBoneName);
	if (!(headBone instanceof THREE.Bone)) {
		throw new Error('Head bone not found.');
	}
	// Locate the skeleton in the SkinnedMesh, needed to call attach().
	const skinnedMesh = findSkinnedMeshWithBone(body.model, headBoneName);
	if (!skinnedMesh) {
		throw new Error('No skinned mesh with head bone.');
	}
	const skeleton = /** @type {SkeletonWithAttachments} */ (skinnedMesh.skeleton);

	// Set head to body scale ratio.
	// Multiply by 0.1, assuming the body's world scale was normalized to 1.0.
	head.scale.multiplyScalar(0.1 * headToBodyScale);

	// Add the model to the scene, and attach it to the SkeletonWithAttachments.
	headBone.add(head); // This will render it.
	skeleton.attach(head, headBoneName); // This positions it with the scaled bone.
}

// // ---------------------------------------------------------------------
// //  Shader/Material Class Helpers
// // ---------------------------------------------------------------------

/**
 * Applies a new material class to the mesh and applying existing
 * parameters from the old material and userData to an FFL-compatible material.
 * Also see `onShaderMaterialChange` from FFL.js/examples/demo-basic.js.
 * @param {THREE.Mesh} mesh - The mesh to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Specific object needed for SampleShaderMaterial.
 */
function applyMaterialClassToMesh(mesh, newMatClass, colorInfo) {
	/** Whether the new material supports FFL swizzling. */
	const forFFLMaterial = 'modulateMode' in newMatClass.prototype;
	// Recreate material with same parameters but using the new shader class.
	const oldMat = /** @type {THREE.MeshBasicMaterial} */ (mesh.material);
	/** Get modulateMode/Type */
	const userData = mesh.geometry.userData;

	/** Do not include the parameters if forFFLMaterial is false. */
	const modulateModeType = forFFLMaterial
		? { // modulateMode/Type will be used from the userData or old material.
			modulateMode: 'modulateMode' in oldMat ? oldMat.modulateMode : userData.modulateMode ?? 0,
			// This setter will set side too:
			modulateType: 'modulateType' in oldMat ? oldMat.modulateType : userData.modulateType ?? 0
		}
		: {};

	/**
	 * Parameters for the shader material. Using SampleShaderMaterialParameters
	 * as a lowest common denominator, but others can also be used.
	 * @type {import('three').MeshBasicMaterialParameters
	 * & import('../materials/SampleShaderMaterial.js').SampleShaderMaterialParameters}
	 */
	const params = {
		// _side = original side from LUTShaderMaterial, must be set first
		side: ('_side' in oldMat) ? /** @type {THREE.Side} */ (oldMat._side) : oldMat.side,
		...modulateModeType,
		color: oldMat.color, // should be after modulateType
		transparent: Boolean(oldMat.transparent || oldMat.alphaTest)
	};
	if (oldMat.map) {
		params.map = oldMat.map;
	}

	if ('modulateType' in userData) {
		params.modulateMode = userData.modulateMode ?? 0;
		params.modulateType = userData.modulateType;
	}
	if (colorInfo && 'colorInfo' in newMatClass.prototype) {
		// console.debug('got colorinfo on', mesh)
		params.colorInfo = colorInfo;
	}

	mesh.material = new newMatClass(params);
	oldMat.dispose(); // Dispose the old material, keeping the map.
}

/**
 * Calls {@link applyMaterialClassToMesh} on a group of multiple
 * meshes (head or body model), using the name of the material.
 * @param {THREE.Object3D} group - The group to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Needed for SampleShaderMaterial.
 * @returns {void}
 */
const applyMaterialToGroup = (group, newMatClass, colorInfo) =>
	group.traverse(node =>
		(node instanceof THREE.Mesh) &&
		applyMaterialClassToMesh(node, newMatClass, colorInfo)
	);

/**
 * Disposes geometry, material and map, and skeleton.
 * @param {THREE.Object3D} model - The group of meshes or SkinnedMeshes to dispose.
 */
function disposeModel(model) {
	model.traverse((node) => {
		if (node instanceof THREE.Mesh) {
			node.geometry.dispose();
			if (node.material instanceof THREE.Material) {
				const map = /** @type {THREE.MeshBasicMaterial} */ (node.material).map;
				if (map) {
					map.dispose();
				}
				node.material.dispose();
			}
		}
		// Additionally dispose skeleton if it is a SkinnedMesh.
		if (node instanceof THREE.SkinnedMesh && node.skeleton) {
			node.skeleton.dispose();
		}
	});
}

// // ---------------------------------------------------------------------
// //  Body Camera Helpers
// // ---------------------------------------------------------------------

/**
 * Moves the position of the camera up so that the head is in center.
 * @param {THREE.Camera} camera - The camera whose position to move.
 * @param {BodyModel} body - The body model.
 */
function adjustCameraForBodyHead(camera, body) {
	body.model.updateMatrixWorld(); // Propagate transforms.
	// Update the skeleton to account for body scaling.
	body.model.traverse(s => s instanceof THREE.SkinnedMesh && s.skeleton.update());

	const head = /** @type {THREE.Bone} */ (body.model.getObjectByName(body.scaleDesc.head));
	// const root = /** @type {THREE.Bone} */ (body.model.getObjectByName(body.scaleDesc.root));
	console.assert(head);// && root);
	// Get the world translation of the body's root, and the head position.
	const headPos = new THREE.Vector3().setFromMatrixPosition(head.matrixWorld);
	const rootPos = new THREE.Vector3().setFromMatrixPosition(body.model.matrixWorld);

	camera.position.y += headPos.y - rootPos.y; // Move the camera up.
}

/**
 * Intended to match Wii U Mii Maker, and therefore also account/NNAS/cdn-mii 1.0.0 renders.
 * Parameters are from FUN_02086e94 in ffl_app.rpx, search for 57.553 / 0x42663646
 * @returns {THREE.PerspectiveCamera} Camera for the face only view.
 */
function getFaceCamera() {
	// Create camera with 15 degrees FOV.
	const camera = new THREE.PerspectiveCamera(15, 1 /* square */, 50, 1000);
	camera.position.set(0.0, 4.805, 57.553); // 4.205 + 0.6
	return camera;
}

/**
 * Gets whole body camera that accounts for the height.
 * Performs Z-position interpolation like in FUN_02086e94 in ffl_app.rpx (Wii U Mii Maker).
 * @param {number} aspect - Aspect ratio for the camera.
 * @param {number} height - Height value of the CharModel to use in interpolation.
 * @returns {THREE.PerspectiveCamera} Camera for the whole body view.
 */
function getWholeBodyCamera(aspect, height) {
	// Create camera with 15 degrees FOV.
	const camera = new THREE.PerspectiveCamera(15, aspect);

	// These values are usually included in this order within a table.
	const yOffset = 0;
	const yFactor1 = 10.85;
	const yFactor2 = 90.0;
	// const fovy = 15.0;
	const coefficientZMin = 0.85;
	const coefficientZMax = 1.32;

	const rootHeight = 0;
	/** Camera Y position. */
	const y = (yFactor1 - rootHeight) *
		(height / 64 * 0.15 + 0.85) + rootHeight;

	/** Height normalized to [-1, 1] range. */
	const heightFactor = (height / 127.0 - 0.5) * 2;
	/** Camera Z position / zoom. */
	let z = ((coefficientZMax + coefficientZMin) * 0.5 - 1.0) * heightFactor *
		heightFactor + (coefficientZMax - coefficientZMin) * 0.5 * heightFactor + 1.0;
	z *= yFactor2;

	camera.position.set(0.0, y + yOffset, z);
	return camera;
}

// // ---------------------------------------------------------------------
// //  WebGPU setup and helpers
// // ---------------------------------------------------------------------

Object.assign(globalThis, globals);
// @ts-ignore -- Incomplete navigator type.
globalThis.navigator = {
	gpu: create([]),
	userAgent: '' // THREE.GLTFLoader accesses this.
};
/**
 * Dummy canvas context which has a configure()
 * function that does nothing.
 * If only render targets are used, no other functions are needed.
 */
const gpuCanvasContext = { configure() { } };
// @ts-ignore -- Incomplete type. It is needed by Three.js.
globalThis.VideoFrame ??= (class VideoFrame { });

/**
 * @param {number} width - Width of the canvas.
 * @param {number} height - Height of the canvas.
 * @param {typeof HTMLCanvasElement.prototype.getContext} getContext -
 * Function that gets the context from the canvas.
 * @returns {HTMLCanvasElement} Mock canvas-like object for Three.js to use.
 */
function getCanvas(width, height, getContext) {
	return {
		width, height,
		// @ts-expect-error -- Incomplete style type.
		style: {},
		addEventListener() { },
		removeEventListener() { },
		getContext
	};
}

/**
 * Creates the renderer. The default sizes create a 1x1 swapchain texture.
 * @param {number} [width] - Width for the canvas/renderer.
 * @param {number} [height] - Height for the canvas/renderer.
 * @returns {Promise<THREE.WebGPURenderer>} The created renderer.
 */
async function createThreeRenderer(width = 1, height = 1) {
	const canvas = getCanvas(width, height,
		// @ts-expect-error -- Does not return a real GPUCanvasContext.
		type => type === 'webgpu'
			? gpuCanvasContext
			: console.assert(false, `unsupported canvas context type ${type}`)
	);

	// WebGLRenderer constructor sets "self" as the context. (which is window)
	// Mock all functions called on it as of r162.
	globalThis.self ??= {
		// @ts-expect-error -- Incompatible no-op requestAnimationFrame.
		requestAnimationFrame() { },
		cancelAnimationFrame() { }
	};
	// Create the Three.js renderer and scene.
	const renderer = new THREE.WebGPURenderer({
		canvas, alpha: true
	});

	// Call renderer.init in case it is WebGPURenderer.
	if ('init' in renderer) {
		await /** @type {*} */ (renderer).init();
	}

	return renderer;
}

// // ---------------------------------------------------------------------
// //  CLI argument parsing
// // ---------------------------------------------------------------------

/** Print usage info and exit. */
function usage() {
	console.error(`Usage:
  node ${process.argv[1]} <resourceFile> <hexOrBase64Data> <outputFile> [width]

Arguments:
  resourceFile      Path to FFLResHigh.dat/AFLResHigh_2_3.dat.
  hexOrBase64Data   Hex or Base64 Mii data. Most formats are supported.
  outputFile        Path to write PNG image.
  width             Optional. Image width and height in pixels (default: 256).
  type              Optional camera view type. Accepts 'face' or 'all_body' (default: face).

Example:
  node nodejs-icon-webgpu.mjs ../AFLResHigh_2_3.dat 000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1 mii.png 256 face
`);
}

// Parse CLI arguments.
const argv = process.argv.slice(2);
if (argv.length < 3 || argv.length > 5) {
	usage();
	process.exit(1);
}
const [resourcePath, data, outFile, widthArg, type] = argv;
/** Width, default = 256. */
const width = widthArg ? parseInt(widthArg, 10) : 256;
if (Number.isNaN(width) || width <= 0) {
	console.error('Width must be a positive integer.');
	process.exit(1);
}
let isAllBody = false;
switch (type) {
	case undefined: // Default = face.
	case 'face':
		break;
	case 'all_body':
		isAllBody = true;
		break;
	default:
		console.error('Unsupported camera view type.');
		process.exit(1);
}
/** Height = width for square icon. */
const height = width;

// // ---------------------------------------------------------------------
// //  Rendering entrypoint
// // ---------------------------------------------------------------------

/** Entrypoint */
async function main() {
	/*
	const resourceFile = fs.readFile('../AFLResHigh_2_3.dat');
	const data = '000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1';
	const outFile = 'mii.png';
	const width = 256;
	const height = width;
	*/
	console.assert(width % 64 == 0, 'The resolution needs to be a multiple of 64. If it\'s not, the pixels will have this weird padding applied that doesn\'t play nice with PNG encoders. Examples: 128, 192, 256');
	const resourceFile = fs.readFile(resourcePath);

	addSkeletonScalingExtensions(THREE.Skeleton);

	/** The renderer. Dimensions are not passed, because render targets are used. */
	const renderer = await createThreeRenderer();

	await preloadBodyTemplates(); // Load body models.

	// Local types.
	/** @type {Awaited<ReturnType<typeof initializeFFL>>|null} */ let ffl = null;
	/** @type {import('../ffl.js').CharModel|null} */ let currentCharModel = null;
	/** @type {BodyModel|null} */ let body = null;
	// TODO: Why doesn't this type show up properly?
	const matClass = /** @type {MaterialConstructor} */
		(/** @type {*} */ (FFLShaderNodeMaterial));

	try {
		ffl = await initializeFFL(await resourceFile, ModuleFFL);

		setRendererState(renderer, ffl.module); // Tell FFL.js we are WebGPU

		const scene = new THREE.Scene();
		scene.background = null; // Transparent background.
		// Create Mii model and add to the scene.
		const studioRaw = parseHexOrB64ToUint8Array(data);
		currentCharModel = createCharModel(studioRaw, null,
			matClass, ffl.module); // CharModel CPU step
		initCharModelTextures(currentCharModel, renderer); // CharModel GPU step

		// TODO: In certain instances (charline), nose and forehead
		// may disappear due to frustum culling. This is probably
		// from mask/glass not being properly marked transparent?
		// For now, disable frustumCulled on every object on the head.
		currentCharModel.meshes.traverse(m => m.frustumCulled = false);

		body = loadBodyModel(currentCharModel.charInfo.gender);
		const bodyMdl = body.model;

		mixer.update(0); // TODO: Currently a global, change this!
		// Set uniforms on the new body model, and attach the head to it.
		prepareBodyForCharModel(body, matClass,
			currentCharModel.favoriteColor,
			currentCharModel.getBodyScale());

		attachHeadToBody(body, currentCharModel.meshes);
		scene.add(bodyMdl); // Also adds the head model to the scene.

		// Use the camera for an icon pose.
		/** @type {THREE.PerspectiveCamera} */ let camera;
		if (!isAllBody) { // Face only render.
			camera = getFaceCamera();
			adjustCameraForBodyHead(camera, body);
		} else { // whole_body/all_body camera.
			// TODO: Use 270x360 (3:4) aspect ratio like real account renders.
			camera = getWholeBodyCamera(1, currentCharModel.charInfo.height);
		}

		// Render the scene, and read the pixels into a buffer.
		const rt = new THREE.RenderTarget(width, height, {
			// samples: 4, // Uncomment for antialiasing.
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter
		});
		renderer.setRenderTarget(rt); // Set new target.
		// rt.viewport = new THREE.Vector4(0, 0, 200, 200)

		renderer.render(scene, camera);

		// Read the pixels out and encode to PNG.
		const pixels = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, rt.width, rt.height);
		// console.debug('pixel size:', pixels.length, ', sqrt:', Math.sqrt(pixels.length / 4))

		const pngPixels = encode({
			width: rt.width, height: rt.height,
			channels: 4 /* RGBA */, data: /** @type {Uint8Array} */ (pixels)
		});

		fs.writeFile(outFile, pngPixels);
	} finally {
		// Clean up.
		currentCharModel && currentCharModel.dispose(); // Mii model
		body && disposeModel(body.model); // Body model
		ffl && exitFFL(ffl.module, ffl.resourceDesc); // Free fflRes from memory.

		renderer.dispose(); // Dispose Three.js renderer.

		// Destroy the GPUDevice.
		const device = /** @type {Object<string, *>} */ (renderer.backend).device;
		if (device instanceof GPUDevice) {
			await device.queue.onSubmittedWorkDone();
			device.destroy();
		}
	}
}

main();
