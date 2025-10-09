/**
 * @file Sample CLI tool for rendering a Mii icon with body
 * headlessly using Node.js and THREE.WebGPURenderer.
 * Before running, install: npm install webgpu three fast-png
 * (fast-png is used only because it's native JS, so probably less fuss)
 *
 * Currently, this requires acquiring body models yourself.
 * Search "BodyPath" to see where to get them and replace their paths.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check

// Specific to this example.
import * as fs from 'fs/promises';
import { parseArgs } from 'util';
import * as png from 'fast-png'; // encode
import * as THREE from 'three/webgpu'; // THREE.*, WebGPURenderer
import { addWebGPUExtensions, createThreeRenderer } from '../helpers/HeadlessWebGPU.mjs';
// Dependencies for body scaling.
import { GLTFLoader, SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { addSkeletonScalingExtensions } from '../helpers/SkeletonScalingExtensions.js';
import { detectModelDesc } from '../helpers/ModelScaleDesc.js';
import {
	prepareBodyForCharModel,
	attachHeadToBody, disposeModel,
	adjustCameraForBodyHead,
	getFaceCamera, getWholeBodyCamera
} from '../helpers/BodyUtilities.js';
// Standard non-Node dependencies:
import {
	initializeFFL, setRendererState, createCharModel,
	initCharModelTextures,
	exitFFL, PantsColor, pantsColors, FFLExpression
} from '../ffl.js';
import FFLShaderNodeMaterial from '../materials/FFLShaderNodeMaterial.js';
import ModuleFFL from './ffl-emscripten-single-file.js';
/* globals process -- Node.js */

// Imports for standalone JSDoc types.
/**
 * @typedef {import('../materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo} SampleShaderMaterialColorInfo
 * @typedef {import('../helpers/SkeletonScalingExtensions.js').SkeletonWithAttachments} SkeletonWithAttachments
 * @typedef {import('../helpers/ModelScaleDesc.js').ModelScaleDesc} ModelScaleDesc
 * @typedef {import('../helpers/BodyUtilities.js').BodyModel} BodyModel
 * @typedef {import('../ffl.js').MaterialConstructor} MaterialConstructor
 */

// // ---------------------------------------------------------------------
// //  Body Constants
// // ---------------------------------------------------------------------

// URLs for body models.
// TODO: We should have a script to generate these from the original files.
// Until then, these need to be acquired and placed manually.
// Models from Mii Creator may work, or from here: https://github.com/ariankordi/ffl-raylib-samples/tree/master/models
const maleBodyPath = './miibodymiddle male test.glb';
const femaleBodyPath = './miibodymiddle female test.glb';

const pantsColorDefault = pantsColors[PantsColor.RedRegular].clone().convertLinearToSRGB();

/** @typedef {import('three/examples/jsm/loaders/GLTFLoader.js').GLTF} GLTF */
/**
 * Contains body models for each gender. The glTFs contain animations.
 * @type {Record<import('../ffl.js').FFLGender, GLTF>}
 */
const bodyTemplates = [];

// // ---------------------------------------------------------------------
// //  Model Loading Helpers
// // ---------------------------------------------------------------------

/**
 * Async wrapper to load a GLTF model from a file path.
 * @param {string} path - The file path to load the glTF model from.
 * @returns {Promise<GLTF>}
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
 * @param {Record<number, GLTF>} templates - Array of models to fill.
 * @returns {Promise<void>} Completes when the models are loaded into the array.
 */
const preloadBodyTemplates = templates =>
	Promise.all([loadGLTFFromFS(maleBodyPath),
		loadGLTFFromFS(femaleBodyPath)]).then((values) => {
		templates[0] = values[0];
		templates[1] = values[1];
	});

/**
 * Loads the body model for the specified gender from the glTF templates.
 * Applies a single animation from the glTF.
 * @param {number} gender - The gender for the model.
 * @returns {BodyModel} The body model.
 * @throws {Error} Throws if there is no model for the `genderVal`.
 * @todo This should probably be reduced to not load the animation,
 * so that it's in the caller's control if we want to swap animations.
 * It would have to return the GLTF though so the caller uses .scene/.animations.
 */
function loadBodyModel(gender) {
	const gltf = bodyTemplates[gender];
	if (!gltf) {
		throw new Error(`No body model loaded for gender ${gender}`);
	}

	// Use this method to clone model with proper skinning.
	const model = SkeletonUtils.clone(gltf.scene);

	// Assign one animation from the glTF model.
	const animations = gltf.animations;
	const mixer = new THREE.AnimationMixer(model);
	if (animations.length) {
		// Use the animation named 'Wait' if it exists, otherwise choose the first one.
		let clip = animations.find(a => a.name === 'Wait');
		if (!clip) {
			clip = animations[0];
		}

		mixer.clipAction(clip).play()
			.setLoop(THREE.LoopRepeat, Infinity);
	}

	return {
		model, animations, mixer,
		scaleDesc: detectModelDesc(model)
	};
}

// // ---------------------------------------------------------------------
// //  Rendering Function
// // ---------------------------------------------------------------------

/**
 * @typedef {Object} IconRenderRequest
 * @property {Uint8Array} data
 * @property {number} width
 * @property {boolean} isAllBody
 * @property {number} expression
 */

/**
 * @param {THREE.Renderer} renderer - The Three.js renderer.
 * @param {import('../ffl.js').Module} module - The FFL.js module.
 * @param {MaterialConstructor} matClass - The material class for the head and body.
 * @param {IconRenderRequest} request - Parameters for rendering the icon.
 * @returns {Promise<Uint8Array>} Rendered image as PNG pixels.
 */
async function renderRequestToPNG(renderer, module, matClass, request) {
	const scene = new THREE.Scene();
	// Scene should have a transparent background.
	// Usually, it's transparent white (FFFFFF00) - then colored glasses
	// are fully accurate. I tried it and it didn't work though, maybe glass blending options are off?

	/** @type {import('../ffl.js').CharModel|null} */ let charModel = null;
	/** @type {BodyModel|null} */ let body = null;

	try {
		// Create Mii model and add to the scene.
		charModel = createCharModel(request.data, // CharModel CPU step
			request.expression, matClass, module);
		initCharModelTextures(charModel, renderer); // CharModel GPU step

		// TODO: In certain instances (charline), nose and forehead
		// may disappear due to frustum culling. This is probably
		// from mask/glass not being properly marked transparent?
		// For now, disable frustumCulled on every head mesh.
		charModel.meshes.traverse(m => m.frustumCulled = false);

		body = loadBodyModel(charModel.charInfo.gender);
		const bodyMdl = body.model;

		body.mixer.update(0); // Set animation to 0th frame.
		// Set uniforms on the new body model, and attach the head to it.
		prepareBodyForCharModel(body, matClass,
			charModel.favoriteColor,
			charModel.getBodyScale(),
			pantsColorDefault);

		attachHeadToBody(body, charModel.meshes);
		scene.add(bodyMdl); // Also adds the head model to the scene.

		// Use the camera for an icon pose.
		/** @type {THREE.PerspectiveCamera} */ let camera;
		if (!request.isAllBody) { // Face only render.
			camera = getFaceCamera();
			adjustCameraForBodyHead(camera, body);
		} else { // whole_body/all_body camera.
			// TODO: Should eventually use 270x360 (3:4) aspect ratio like real account renders.
			camera = getWholeBodyCamera(1, charModel.charInfo.height);
		}

		// Render the scene, and read the pixels into a buffer.
		const rt = new THREE.RenderTarget(request.width, request.width, {
			samples: 4, // Uncomment for antialiasing.
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter
		});
		renderer.setRenderTarget(rt); // Set new target.
		// rt.viewport = new THREE.Vector4(0, 0, 200, 200);

		renderer.render(scene, camera);

		// Read the pixels out and encode to PNG.
		const pixels = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, rt.width, rt.height);
		// console.debug('pixel size:', pixels.length, ', sqrt:', Math.sqrt(pixels.length / 4))

		const pngPixels = png.encode({
			width: rt.width, height: rt.height,
			channels: 4 /* RGBA */, data: /** @type {Uint8Array} */ (pixels)
		});

		return pngPixels;
	} finally {
		charModel && charModel.dispose(); // Mii model
		if (body) {
			disposeModel(body.model); // Body model
			body.mixer.uncacheRoot(body.model);
		}
	}
}

// // ---------------------------------------------------------------------
// //  CLI Entrypoint
// // ---------------------------------------------------------------------

/** Entrypoint */
async function main() {
	// Parse CLI arguments.
	const { values, positionals } = parseArgs({
		options: {
			resource: { type: 'string', short: 'r' },
			width: { type: 'string', short: 'w', default: '256' },
			type: { type: 'string', short: 't', default: 'face' },
			expression: { type: 'string', short: 'e', default: '0' },
			outPrefix: { type: 'string', short: 'o', default: 'output-' }
		},
		allowPositionals: true
	});

	if (!values.resource || positionals.length === 0) {
		console.error(`
Usage:
  node ${process.argv[1]} --resource <resourceFile> [--width 256] [--type face|all_body] [--expression 0-18] <mii1> <mii2> ...

Mii data is accepted as Base64 or hex. Supported: Wii U/3DS (FFSD), Wii (RCD/RSD), Mii Studio code/URL data
Example:
  node ${process.argv[1]} --resource ../AFLResHigh_2_3.dat --type face --expression 0 \\
    000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1
`);
		process.exit(1);
	}

	const resourcePath = values.resource;
	const width = parseInt(values.width, 10);
	// const height = width;
	const isAllBody = values.type === 'all_body';
	// Only all_body and face are supported now. Default is face.
	const expression = parseInt(values.expression, 10);
	const outPrefix = values.outPrefix;
	const charDataArray = positionals;

	// Validate inputs. Mii data is validated by rendering functions.
	if (Number.isNaN(width) || width <= 0) {
		console.error('Width must be a positive integer.');
		process.exit(1);
	}

	if (width % 64 !== 0) {
		console.error('The resolution needs to be a multiple of 64. If it\'s not, the pixels will have this weird padding applied that doesn\'t play nice with PNG encoders. Examples: 128, 192, 256');
		process.exit(1);
	}

	if (Number.isNaN(expression) || expression < 0 || expression >= FFLExpression.MAX) {
		console.error(`Expression must be in range: 0-${FFLExpression.MAX - 1}.`);
		process.exit(1);
	}
	const resourceFile = fs.readFile(resourcePath);

	addSkeletonScalingExtensions(THREE.Skeleton);
	addWebGPUExtensions(); // Add WebGPU extensions needed for Node.js.

	/** The renderer. Dimensions are not passed, because render targets are used. */
	const renderer = await createThreeRenderer();
	/** Reassign the device lost handler to do nothing. */
	renderer.onDeviceLost = () => { };

	try {
		await preloadBodyTemplates(bodyTemplates); // Load body models.
	} catch (e) {
		console.error('Could not load body models. TODO, as of right now this script needs you to acquire them manually. Search for "BodyPath = ..." in the script for details. Sorry.');
		throw e;
	}

	/** @type {Awaited<ReturnType<typeof initializeFFL>>|null} */ let ffl = null;
	// TODO: Why doesn't this type show up properly?
	const matClass = /** @type {MaterialConstructor} */
		(/** @type {*} */ (FFLShaderNodeMaterial));

	try {
		// Initialize FFL, which loads resource into memory.
		ffl = await initializeFFL(await resourceFile, ModuleFFL);
		setRendererState(renderer, ffl.module); // Tell FFL.js we are WebGPU

		// Go through all Mii data inputs.
		for (const dataString of charDataArray) {
			// Add a timestamp by ms at the end of the filename.
			const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
			const outFile = `${outPrefix}${timestamp}.png`;

			console.info(`Rendering: ${outFile}`);
			/** @type {IconRenderRequest} */ const request = {
				data: Buffer.from(dataString, 'hex'),
				width, isAllBody, expression
			};
			// Create the icon render and write it to its file output.
			const pngData = await renderRequestToPNG(renderer, ffl.module, matClass, request);
			await fs.writeFile(outFile, pngData);
		}
	} finally {
		// Clean up.
		ffl && exitFFL(ffl.module, ffl.resourceDesc); // Free FFL resource from WASM heap.
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
