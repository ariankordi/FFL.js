// @ts-check

import { globals, create } from 'webgpu';
import { WebGPURenderer } from 'three/webgpu';

// // ---------------------------------------------------------------------
// //  WebGPU Setup and Helpers
// // ---------------------------------------------------------------------

/**
 * @param {number} width - Width of the canvas.
 * @param {number} height - Height of the canvas.
 * @param {typeof HTMLCanvasElement.prototype.getContext} getContext -
 * Function that gets the context from the canvas.
 * @returns {HTMLCanvasElement} Mock canvas-like object for Three.js to use.
 */
const getCanvas = (width, height, getContext) =>
	({
		width, height,
		// @ts-expect-error -- Incomplete style type.
		style: {},
		addEventListener() { },
		removeEventListener() { },
		getContext
	});

/**
 * Adds WebGPU related extensions to the global scope
 * if using Node.js. It defines navigator, as well as
 * userAgent and VideoFrame as they are used by Three.js.
 * @param {typeof globalThis} obj - The globalThis object to assign globals to.
 */
function addWebGPUExtensions(obj = globalThis) {
	// @ts-ignore -- Incomplete dummy type.
	obj.VideoFrame ??= (class VideoFrame { });
	if (obj.navigator) {
		return; // Skip the following below if in a browser.
	}
	Object.assign(obj, globals); // Merge WebGPU globals.
	// @ts-ignore -- Incomplete navigator type.
	obj.navigator = {
		gpu: create([]),
		userAgent: '' // THREE.GLTFLoader accesses this.
	};
}

/**
 * Creates the renderer. The default sizes create a 1x1 swapchain texture.
 * @param {number} [width] - Width for the canvas/renderer.
 * @param {number} [height] - Height for the canvas/renderer.
 * @returns {Promise<import('three/webgpu').Renderer>} The created renderer.
 */
async function createThreeRenderer(width = 1, height = 1) {
	/**
	 * Dummy canvas context which has a configure()
	 * function that does nothing.
	 * If only render targets are used, no other functions are needed.
	 */
	const gpuCanvasContext = { configure() { } };

	const canvas = getCanvas(width, height,
		// @ts-expect-error -- Does not return a real GPUCanvasContext.
		type => type === 'webgpu'
			? gpuCanvasContext
			: console.assert(false, `unsupported canvas context type ${type}`)
	);

	// WebGLRenderer constructor sets "self" as the context. (which is window)
	// Mock all functions called on it as of r180.
	globalThis.self ??= {
		// @ts-expect-error -- Incompatible no-op requestAnimationFrame.
		requestAnimationFrame() { },
		cancelAnimationFrame() { }
	};
	// Create the Three.js renderer and scene.
	const renderer = new WebGPURenderer({
		canvas, alpha: true
	});
	// if ('init' in renderer) {
	await /** @type {*} */ (renderer).init();
	// }

	return renderer;
}

export { getCanvas, addWebGPUExtensions, createThreeRenderer };
