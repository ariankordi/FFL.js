import * as THREE from 'three';
import CharModel from './CharModel';
import Renderer from './renderer';
import { _copyRendererToCanvas, _restoreRendererState, _saveRendererState } from './ExportTexture';

export enum ViewType {
	/** Typical icon body view. */
	Face = 0,
	/** FFLMakeIcon matrix */
	MakeIcon = 1,
	/** Custom view with 45 degree field-of-view. */
	IconFovy45 = 2
};

// -------------- getCameraForViewType(viewType, width, height) --------------
/**
 * @param {ViewType} viewType - The {@link ViewType} enum value.
 * @param {number} width - Width of the view.
 * @param {number} height - Height of the view.
 * @returns {import('three').PerspectiveCamera} The camera representing the view type specified.
 * @throws {Error} not implemented (ViewType.Face)
 */
export function getCameraForViewType(viewType: ViewType, width = 1, height = 1): THREE.PerspectiveCamera {
	const aspect = width / height;
	switch (viewType) {
		case ViewType.MakeIcon: {
			/** rad2deg(Math.atan2(43.2 / aspect, 500) / 0.5); */
			const fovy = 9.8762;
			const camera = new THREE.PerspectiveCamera(fovy, aspect, 500, 1000);
			camera.position.set(0, 34.5, 600);
			camera.lookAt(0, 34.5, 0.0);
			return camera;
		}
		case ViewType.IconFovy45: {
			const camera = new THREE.PerspectiveCamera(45, aspect, 50, 1000);
			camera.position.set(0, 34, 110);
			camera.lookAt(0, 34, 0);
			return camera;
		}
		default:
			throw new Error('getCameraForViewType: not implemented');
	}
}

// ----------- makeIconFromCharModel(charModel, renderer, options) -----------
/**
 * Creates an icon of the CharModel with the specified view type.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {Renderer} renderer - The renderer.
 * @param {Object} [options] - Optional settings for rendering the icon.
 * @param {ViewType} [options.viewType] - The view type that the camera derives from.
 * @param {number} [options.width] - Desired icon width in pixels.
 * @param {number} [options.height] - Desired icon height in pixels.
 * @param {import('three').Scene} [options.scene] - Optional scene
 * if you want to provide your own (e.g., with background, or models).
 * @param {import('three').Camera} [options.camera] - Optional camera
 * to use instead of the one derived from {@link ViewType}.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas
 * to draw into. Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the icon.
 */
export function makeIconFromCharModel(charModel: CharModel, renderer: Renderer, options: Record<string, any> = {}): HTMLCanvasElement {
	// Set locals from options object.
	let {
		viewType = ViewType.MakeIcon,
		width = 256,
		height = 256,
		scene,
		camera,
		canvas
	} = options;

	// Create an offscreen scene for the icon if one is not provided.
	if (!scene) {
		scene = new THREE.Scene();
		scene.background = null; // Transparent background.
	}
	// Add meshes from the CharModel.
	scene.add(charModel.meshes.clone());
	// If the meshes aren't cloned then they disappear from the
	// primary scene, however geometry/material etc are same

	// Get camera based on viewType parameter.
	if (!camera) {
		camera = getCameraForViewType(viewType);
	}

	const state = _saveRendererState(renderer);

	renderer.setRenderTarget(null); // Switch to primary target.
	renderer.setSize(width, height, false);
	renderer.render(scene, camera); // Render scene.

	canvas = _copyRendererToCanvas(renderer, canvas); // Populate canvas.

	_restoreRendererState(renderer, state);
	return canvas;
	// Caller needs to dispose CharModel.
}
