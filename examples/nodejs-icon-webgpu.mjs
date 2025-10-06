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
import * as THREE from 'three/webgpu';
// Standard non-Node dependencies:
import {
	initializeFFL, setRendererState, createCharModel,
	initCharModelTextures, parseHexOrB64ToUint8Array,
	getIconCamera, exitFFL
} from '../ffl.js';
import FFLShaderNodeMaterial from '../materials/FFLShaderNodeMaterial.js';
import ModuleFFL from './ffl-emscripten-single-file.js';

/* globals process -- Node.js */

// // ---------------------------------------------------------------------
// //  WebGPU setup and helpers
// // ---------------------------------------------------------------------

Object.assign(globalThis, globals);
// @ts-ignore -- Incomplete navigator type.
globalThis.navigator = { gpu: create([]) };
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
 * @returns {THREE.WebGPURenderer} The created renderer.
 */
function createThreeRenderer(width = 1, height = 1) {
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
	return renderer;
}

// // ---------------------------------------------------------------------
// //  CLI argument parsing.
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

Example:
  node nodejs-icon-webgpu.mjs ../AFLResHigh_2_3.dat 000d142a303f434b717a7b84939ba6b2bbbec5cbc9d0e2ea010d15252b3250535960736f726870757f8289a0a7aeb1 mii.png 256
`);
}

// Parse CLI arguments.
const argv = process.argv.slice(2);
if (argv.length < 3 || argv.length > 4) {
	usage();
	process.exit(1);
}
const [resourcePath, data, outFile, widthArg] = argv;
/** Width, default = 256. */
const width = widthArg ? parseInt(widthArg, 10) : 256;
if (Number.isNaN(width) || width <= 0) {
	console.error('Width must be a positive integer.');
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
	const resourceFile = fs.readFile(resourcePath);

	/** The renderer. Dimensions are not passed, because render targets are used. */
	const renderer = createThreeRenderer();
	await renderer.init();

	let ffl;
	let currentCharModel;
	try {
		ffl = await initializeFFL(await resourceFile, ModuleFFL);

		setRendererState(renderer, ffl.module); // Tell FFL.js we are WebGPU

		const scene = new THREE.Scene();
		scene.background = null; // Transparent background.

		// Create Mii model and add to the scene.
		const studioRaw = parseHexOrB64ToUint8Array(data);
		currentCharModel = createCharModel(studioRaw, null,
			FFLShaderNodeMaterial, ffl.module);

		initCharModelTextures(currentCharModel, renderer);
		scene.add(currentCharModel.meshes); // Add to scene

		// Use the camera for an icon pose.
		const camera = getIconCamera();

		// Render the scene, and read the pixels into a buffer.
		const rt = new THREE.RenderTarget(width, height, {
			// samples: 4, // Uncomment for antialiasing.
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter
		});
		renderer.setRenderTarget(rt); // Set new target.

		renderer.render(scene, camera);

		// Read the pixels out and encode to PNG.
		const pixels = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, rt.width, rt.height);
		const pngPixels = encode({
			width: rt.width, height: rt.height,
			channels: 4 /* RGBA */, data: /** @type {Uint8Array} */ (pixels)
		});

		fs.writeFile(outFile, pngPixels);
	} finally {
		// Clean up.
		(currentCharModel) && currentCharModel.dispose(); // Mii model
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
