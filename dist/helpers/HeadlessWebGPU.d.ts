/**
 * @param {number} width - Width of the canvas.
 * @param {number} height - Height of the canvas.
 * @param {typeof HTMLCanvasElement.prototype.getContext} getContext -
 * Function that gets the context from the canvas.
 * @returns {HTMLCanvasElement} Mock canvas-like object for Three.js to use.
 */
export function getCanvas(width: number, height: number, getContext: typeof HTMLCanvasElement.prototype.getContext): HTMLCanvasElement;
/**
 * Adds WebGPU related extensions to the global scope
 * if using Node.js. It defines navigator, as well as
 * userAgent and VideoFrame as they are used by Three.js.
 * @param {typeof globalThis} obj - The globalThis object to assign globals to.
 */
export function addWebGPUExtensions(obj?: typeof globalThis): void;
/**
 * Creates the renderer. The default sizes create a 1x1 swapchain texture.
 * @param {number} [width] - Width for the canvas/renderer.
 * @param {number} [height] - Height for the canvas/renderer.
 * @returns {Promise<import('three/webgpu').Renderer>} The created renderer.
 */
export function createThreeRenderer(width?: number, height?: number): Promise<import("three/webgpu").Renderer>;
/**
 * Writes a 32-bit (transparent) image in Microsoft BMP format.
 * Useful for testing since it's uncompressed and can be viewed in web browsers.
 * NOTE: If the output has inverted colors, you must output BGRA instead of RGBA.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 * @param {Uint8Array} bgraPixels - Image data in BGRA format, 32 bits per pixel.
 * @returns {Uint8Array} BMP file bytes.
 */
export function encodeBmpImage(width: number, height: number, bgraPixels: Uint8Array): Uint8Array;
