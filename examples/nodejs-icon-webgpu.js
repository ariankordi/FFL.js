/**
 * @file Sample for rendering a Mii icon headlessly
 * using Node.js and THREE.WebGPURenderer.
 * Before running, install: npm install webgpu three fast-png
 * (fast-png is used only because it's native JS, so probably less fuss)
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check

import * as fs from 'node:fs/promises';
import { encode } from 'fast-png';
import * as THREE from 'three/webgpu';
import { addWebGPUExtensions, createThreeRenderer } from '../helpers/HeadlessWebGPU.js';
// Standard non-Node dependencies:
import { FFL, CharModel, ModelIcon } from '../ffl.js';
import FFLShaderNodeMaterial from '../materials/FFLShaderNodeMaterial.js';
import ModuleFFL from './ffl-emscripten-single-file.cjs';

/* globals process Buffer -- Node.js */

/**
 * Parses either hex or Base64 -> U8.
 * Additionally strips spaces from the input.
 * @param {string} text - Input encoded text.
 * @returns {Uint8Array} Decoded bytes.
 */
function parseHexOrBase64ToBytes(text) {
	text = text.replace(/\s+/g, ''); // Strip spaces.
	// Check if it is hex, otherwise assume it is Base64.
	return /^[0-9a-fA-F]+$/.test(text)
		? Buffer.from(text, 'hex')
		: Buffer.from(text, 'base64');
}

addWebGPUExtensions();

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
const width = widthArg ? Number.parseInt(widthArg, 10) : 256;
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
	const renderer = await createThreeRenderer();

	let ffl;
	let currentCharModel;
	try {
		ffl = await FFL.initWithResource(await resourceFile, ModuleFFL);
		ffl.setRenderer(renderer); // Tell FFL.js we are WebGPU

		const scene = new THREE.Scene();
		scene.background = null; // Transparent background.

		// Create Mii model and add to the scene.
		const studioRaw = parseHexOrBase64ToBytes(data);
		currentCharModel = new CharModel(ffl, studioRaw,
			null, FFLShaderNodeMaterial, renderer);

		scene.add(currentCharModel.meshes); // Add to scene

		// Use the camera for an icon pose.
		const camera = ModelIcon.getCamera();

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
		(ffl) && ffl.dispose(); // Free fflRes from memory.
		renderer.dispose(); // Dispose Three.js renderer.

		// Destroy the GPUDevice.
		const device = /** @type {Object<string, *>} */ (renderer.backend).device;
		if (device instanceof GPUDevice) {
			await device.queue.onSubmittedWorkDone();
			device.destroy();
		}
	}
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- needs lib = es2017
main();
