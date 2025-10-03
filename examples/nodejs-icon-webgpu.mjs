// @ts-check

import * as fs from 'fs/promises';
import { create, globals } from 'webgpu';
import { encode } from 'fast-png';
import * as THREE from 'three/webgpu';
import {
	initializeFFL, setRendererState, createCharModel,
	initCharModelTextures, parseHexOrB64ToUint8Array,
	getCameraForViewType, ViewType, exitFFL
} from '../ffl.js';
import TextureShaderNodeMaterial from '../materials/TextureShaderNodeMaterial.js';
import ModuleFFL from './ffl-emscripten-single-file.js';

// Configure WebGPU.
Object.assign(globalThis, globals);
// @ts-ignore -- Incomplete navigator type.
globalThis.navigator = { gpu: create([]) };
/**
 * Dummy canvas context which has a configure()
 * function that does nothing.
 * If only render targets are used, no other functions are needed.
 */
const webgpuCanvasContext = { configure() { } };
// @ts-ignore -- Incomplete type. It is needed by Three.js.
globalThis.VideoFrame ??= (class VideoFrame { });

// --------------- Main Entrypoint (Scene & Animation) -----------------

/**
 * Emscripten module instance returned after initialization.
 * @type {import('../ffl.js').Module}
 */
//let moduleFFL;
/**
 * FFLResourceDesc returned by {@link initializeFFL}, needed for calling {@link exitFFL}.
 * @type {import('../ffl.js').FFLResourceDesc}
 */
//let resourceDesc;

// Global GL context and renderer.
/** @type {THREE.Scene} */
//let scene;
/** @type {THREE.WebGLRenderer} */
//let renderer;

/**
 * Create a mock canvas for Three.js to use.
 * @param {number} width
 * @param {number} height
 * @param {function(string, Object): WebGLRenderingContext|WebGL2RenderingContext} getContext -
 * Function that gets the context from the canvas.
 * @returns {HTMLCanvasElement}
 */
function getCanvas(width, height, getContext) {
	return {
		width, height, style: {},
		addEventListener() { },
		removeEventListener() { },
		getContext
	};
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {THREE.WebGPURenderer}
 */
function createThreeRenderer(width, height) {
	const canvas = getCanvas(width, height,
		type => type === 'webgpu'
			? webgpuCanvasContext
			: console.assert(false, `unsupported canvas context type ${type}`)
	);

	// WebGLRenderer constructor sets "self" as the context. (which is window)
	// Mock all functions called on it as of r162.
	globalThis.self ??= {
		requestAnimationFrame() { },
		cancelAnimationFrame() { }
	};
	// Create the Three.js renderer and scene.
	const renderer = new THREE.WebGPURenderer({
		canvas, alpha: true
	});
	return renderer;
}

/**
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 */
/*
function flipSceneY(scene, camera) {
	// The pixels coming from WebGL are upside down.
	camera.projectionMatrix.elements[5] *= -1; // Flip the camera Y axis.
	// When flipping the camera, the triangles are in the wrong direction.
	scene.traverse((mesh) => {
		if (mesh.isMesh && mesh.material.side === THREE.FrontSide) {
			// Fix triangle winding by changing the culling (side).
			mesh.material.side = THREE.BackSide;
		}
	});
}
*/

// // ---------------------------------------------------------------------
// //  Scene Setup
// // ---------------------------------------------------------------------

/**
 * Adds {@link THREE.AmbientLight} and {@link THREE.DirectionalLight} to
 * a scene, using values similar to what the FFLShader is using.
 * @param {import('three').Scene} scene - The scene to add lights to.
 * @todo TODO: Why does it look worse when WebGLRenderer.useLegacyLights is not enabled?
 */
function addLightsToScene(scene) {
	const intensity = Number(THREE.REVISION) >= 155 ? Math.PI : 1.0;
	const ambientLight = new THREE.AmbientLight(new THREE.Color(0.73, 0.73, 0.73), intensity);
	const directionalLight = new THREE.DirectionalLight(
		new THREE.Color(0.60, 0.60, 0.60), intensity);
	directionalLight.position.set(-0.455, 0.348, 0.5);
	scene.add(ambientLight, directionalLight);
}

/** Entrypoint */
async function main() {
	const resource = fs.readFile('../AFLResHigh_2_3.dat');
	const data = '000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1';

	const width = 256;
	const height = 256;

	let ffl;
	let currentCharModel;

	/** Renderer created with 1px small "swapchain" texture. */
	const renderer = createThreeRenderer(1, 1);
	await renderer.init();
	try {
		ffl = await initializeFFL(await resource, ModuleFFL);

		setRendererState(renderer, ffl.module); // Tell FFL.js we are WebGPU

		const scene = new THREE.Scene();
		scene.background = null; // Transparent background.
		addLightsToScene(scene);

		// Create Mii model and add to the scene.
		const studioRaw = parseHexOrB64ToUint8Array(data);
		currentCharModel = createCharModel(studioRaw, null,
			THREE.MeshStandardMaterial, ffl.module);

		initCharModelTextures(currentCharModel, renderer, TextureShaderNodeMaterial);
		scene.add(currentCharModel.meshes); // Add to scene

		// Use the camera for an icon pose.
		const camera = getCameraForViewType(ViewType.MakeIcon);
		// flipSceneY(scene, camera);

		// Render the scene, and read the pixels into a buffer.
		const rt = new THREE.RenderTarget(width, height, {
			samples: 4, // Antialiasing
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter
		});
		renderer.setRenderTarget(rt); // Set new target.

		renderer.render(scene, camera);

		const pixels = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, rt.width, rt.height);
		const pngPixels = encode({
			width: rt.width, height: rt.height,
			channels: 4 /* RGBA */, data: /** @type {Uint8Array} */ (pixels)
		});
		fs.writeFile('/Volumes/shm/mii.png', pngPixels);
	} finally {
		// Clean up.
		(currentCharModel) && currentCharModel.dispose(); // Mii model
		ffl && exitFFL(ffl.module, ffl.resourceDesc); // Free fflRes from memory.
		renderer.dispose(); // Dispose Three.js renderer.
		console.warn('WARNING: There\'s currently a weird bug with this script where it doesn\'t exit, so you can hit CTRL-C now')
	}
}

main();
