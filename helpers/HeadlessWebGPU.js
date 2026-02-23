// ts-check is skipped here, in order to avoid a tsc error
// due to "webgpu" not being a dependency in package.json.
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

	/* ('init' in renderer) && */ await renderer.init();

	return renderer;
}

/**
 * Template for the BMP file used in {@link encodeBmpImage}.
 * - RGBA masks size = 16 (pushes bfOffBits = 70)
 * - biBitCount = 32, biPlanes = 1, biCompression = 3
 * - bi(X/Y)PelsPerMeter = 2835 (~72 DPI)
 * - Masks set to use RGBA (not BGRA) with transparency.
 */
const bmpHeaderTemplate = /* @__PURE__ */ new Uint8Array([66, 77, 0, 0, 0, 0,
	0, 0, 0, 0, 70, 0, 0, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 32, 0, 3,
	0, 0, 0, 0, 0, 0, 0, 19, 11, 0, 0, 19, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255,
	0, 0, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 0, 0, 255]);
/**
 * Writes a 32-bit (transparent) image in Microsoft BMP format.
 * Useful for testing since it's uncompressed and can be viewed in web browsers.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 * @param {Uint8Array} rgbaPixels - Image data in RGBA format, 32 bits per pixel.
 * @param {boolean} flipY - Whether Y should be flipped in the image (true for WebGL).
 * @returns {Uint8Array} BMP file bytes.
 */
function encodeBmpImage(width, height, rgbaPixels, flipY = false) {
	/** Offset to the pixels/size of the header, pushed to 16 from RGBA masks. */
	const pixelOffset = 70;
	const fileSize = pixelOffset + rgbaPixels.length;

	const bytes = new Uint8Array(fileSize);
	bytes.set(bmpHeaderTemplate); // Copy the BMP header template.

	const dv = new DataView(bytes.buffer);
	// Set required fields within the template.
	dv.setUint32(2, fileSize, true); // bfSize
	dv.setInt32(18, width, true); // biWidth
	dv.setInt32(22, // Height value, negative = top-down.
		flipY ? height : -height, true); // biHeight
	dv.setUint32(34, rgbaPixels.length, true); // biSizeImage

	bytes.set(rgbaPixels, pixelOffset); // Copy pixel data.
	return bytes;
}

export {
	getCanvas,
	addWebGPUExtensions,
	createThreeRenderer,
	encodeBmpImage
};
