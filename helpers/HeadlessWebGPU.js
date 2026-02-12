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
 * Writes a 32-bit (transparent) image in Microsoft BMP format.
 * Useful for testing since it's uncompressed and can be viewed in web browsers.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 * @param {Uint8Array} rgbaPixels - Image data in RGBA format, 32 bits per pixel.
 * @param {boolean} flipY - Whether Y should be flipped in the image, should be true for WebGL.
 * @returns {Uint8Array} BMP file bytes.
 */
function encodeBmpImage(width, height, rgbaPixels, flipY = false) {
	const sizeof_BITMAPFILEHEADER = 14;
	const sizeof_DIB = 40;
	// Contains RGBA masks. This is the format GIMP emits.
	const masksSize = 16;
	const dibSize = sizeof_DIB + masksSize;
	const pixelOffset = sizeof_BITMAPFILEHEADER + dibSize;
	const fileSize = pixelOffset + rgbaPixels.length;

	const bytes = new Uint8Array(fileSize);
	const view = new DataView(bytes.buffer);

	// Encode BITMAPFILEHEADER (14 bytes).
	view.setUint16(0, 0x4D42, true); // 'BM'
	view.setUint32(2, fileSize, true); // bfSize
	view.setUint16(6, 0, true); // bfReserved1
	view.setUint16(8, 0, true); // bfReserved2
	view.setUint32(10, pixelOffset, true); // bfOffBits

	// Encode BITMAPINFOHEADER (40 bytes).
	view.setUint32(14, dibSize, true); // biSize
	view.setInt32(18, width, true); // biWidth
        const biHeight = flipY ? height : -height; // Negative = top-down.
	view.setInt32(22, biHeight, true); // biHeight
	view.setUint16(26, 1, true); // biPlanes
	view.setUint16(28, 32, true); // biBitCount
	view.setUint32(30, 3, true); // biCompression = BI_BITFIELDS
	view.setUint32(34, rgbaPixels.length, true); // biSizeImage
	view.setInt32(38, 2835, true); // biXPelsPerMeter (~72 DPI)
	view.setInt32(42, 2835, true); // biYPelsPerMeter
	view.setUint32(46, 0, true); // biClrUsed
	view.setUint32(50, 0, true); // biClrImportant

	// Copy RGBA channel masks.
	// This is needed for transparency to work, and for
	// RGBA pixels to show up properly instead of needing BGRA.
	view.setUint32(54, 0x000000FF, true); // Red
	view.setUint32(58, 0x0000FF00, true); // Green
	view.setUint32(62, 0x00FF0000, true); // Blue
	view.setUint32(66, 0xFF000000, true); // Alpha

	// Copy BGRA pixel data.
	bytes.set(rgbaPixels, pixelOffset);
	return bytes;
}

export {
	getCanvas,
	addWebGPUExtensions,
	createThreeRenderer,
	encodeBmpImage
};
