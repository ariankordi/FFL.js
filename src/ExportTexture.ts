import * as THREE from 'three';
import Renderer from '@/renderer';
import { _getIdentCamera } from '@/RenderTargetUtils';

/**
 * Saves the current renderer state and returns an object to restore it later.
 * @param {Renderer} renderer - The renderer to save state from.
 * @returns {{target: import('three').RenderTarget|null,
 * colorSpace: import('three').ColorSpace, size: import('three').Vector2}}
 * The saved state object.
 */
export function _saveRendererState(renderer: Renderer): { target: THREE.RenderTarget | null; colorSpace: THREE.ColorSpace; size: THREE.Vector2 } {
	const size = new THREE.Vector2();
	renderer.getSize(size);

	return {
		target: renderer.getRenderTarget(),
		colorSpace: renderer.outputColorSpace as THREE.ColorSpace,
		size
	};
}

/**
 * Restores a renderer's state from a saved state object.
 * @param {Renderer} renderer - The renderer to restore state to.
 * @param {{target: import('three').RenderTarget|null,
 * colorSpace: import('three').ColorSpace, size: import('three').Vector2}} state -
 * The saved state object.
 */
export function _restoreRendererState(renderer: Renderer, state: { target: THREE.RenderTarget | null; colorSpace: THREE.ColorSpace; size: THREE.Vector2 }): void {
	renderer.setRenderTarget(state.target);
	renderer.outputColorSpace = state.colorSpace;
	renderer.setSize(state.size.x, state.size.y, false);
}

/**
 * Copies the renderer's swapchain to a canvas.
 * @param {Renderer} renderer - The renderer.
 * @param {HTMLCanvasElement} [canvas] - Optional target canvas. If not provided, a new one is created.
 * @returns {HTMLCanvasElement} The canvas containing the rendered output.
 * @throws {Error} Throws if the canvas is defined but invalid.
 */
export function _copyRendererToCanvas(renderer: Renderer, canvas?: HTMLCanvasElement): HTMLCanvasElement {
	const sourceCanvas = renderer.domElement;
	// If the target canvas is not simply undefined, it's null, then error out.
	if (canvas !== undefined && !(canvas instanceof HTMLCanvasElement)) {
		throw new Error('copyRendererToCanvas: canvas is neither a valid canvas nor undefined.');
	}
	const targetCanvas = canvas || document.createElement('canvas');
	targetCanvas.width = sourceCanvas.width;
	targetCanvas.height = sourceCanvas.height;
	// NOTE: Line below guarantees the canvas to be valid.
	(targetCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(sourceCanvas, 0, 0);

	return targetCanvas;
}

// --------------- textureToCanvas(texture, renderer, options) ---------------
/**
 * Renders a texture to a canvas. If no canvas is provided, a new one is created.
 * @param {import('three').Texture} texture - The texture to render.
 * @param {Renderer} renderer - The renderer.
 * @param {Object} [options] - Options for canvas output.
 * @param {boolean} [options.flipY] - Flip the Y axis. Default is oriented for OpenGL.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas to draw into.
 * Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the rendered texture.
 */
export function textureToCanvas(texture: THREE.Texture, renderer: Renderer, options: { flipY: boolean; canvas?: HTMLCanvasElement; } = { flipY: true }): HTMLCanvasElement {
	const { flipY } = options;
	let { canvas } = options;
	// Create a new scene using a full-screen quad.
	const scene = new THREE.Scene();
	scene.background = null; // Transparent background.
	// Assign a transparent, textured, and double-sided material.
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide, map: texture, transparent: true
	});
	/** Full-screen quad. */
	const plane = new THREE.PlaneGeometry(2, 2);
	const mesh = new THREE.Mesh(plane, material);
	scene.add(mesh);
	/** Ortho camera filling whole screen. */
	const camera = _getIdentCamera(flipY);

	// Get previous render target, color space, and size.
	const state = _saveRendererState(renderer);

	// Render to the main canvas to extract pixels.
	renderer.setRenderTarget(null); // Render to primary target.
	// Get width and set it on renderer.
	const { width, height } = texture.image;
	renderer.setSize(width, height, false);
	// Use working color space.
	renderer.outputColorSpace = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
	renderer.render(scene, camera);

	canvas = _copyRendererToCanvas(renderer, canvas); // Populate canvas.

	// Cleanup and restore renderer state.
	material.dispose();
	plane.dispose();
	scene.remove(mesh);
	_restoreRendererState(renderer, state);

	return canvas; // Either a new canvas or the same one.
}
