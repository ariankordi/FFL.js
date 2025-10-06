import * as THREE from 'three';
import Renderer from './renderer';

/**
 * @param {Renderer} renderer - The input renderer.
 * @returns {boolean} Whether the renderer is THREE.WebGPURenderer.
 * @package
 */
export const _isWebGPU = (renderer: Renderer): boolean => 'isWebGPURenderer' in renderer;

// -------------------------- getIdentCamera(flipY) --------------------------
/**
 * Returns an ortho camera that is effectively the same as
 * if you used identity MVP matrix, for rendering 2D planes.
 * @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {import('three').OrthographicCamera} The orthographic camera.
 * @package
 */
export function _getIdentCamera(flipY = false): THREE.OrthographicCamera {
	// Create an orthographic camera with bounds [-1, 1] in x and y.
	const camera = new THREE.OrthographicCamera(-1, 1,
		// Use [1, -1] except when using flipY.
		(flipY ? -1 : 1), (flipY ? 1 : -1), 0.1, 10);
	camera.position.z = 1;
	return camera;
}

// - createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions) -
/**
 * Creates a Three.js RenderTarget, renders the scene with
 * the given camera, and returns the render target.
 * @param {import('three').Scene} scene - The scene to render.
 * @param {import('three').Camera} camera - The camera to use.
 * @param {Renderer} renderer - The renderer.
 * @param {number} width - Desired width of the target.
 * @param {number} height - Desired height of the target.
 * @param {Object} [targetOptions] - Optional options for the render target.
 * @returns {import('three').RenderTarget} The render target (which contains .texture).
 */
export function createAndRenderToTarget(scene: THREE.Scene, camera: THREE.Camera, renderer: Renderer, width: number, height: number, targetOptions = {}): THREE.RenderTarget {
	// Set default options for the RenderTarget.
	const options = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		...targetOptions
	};

	const renderTarget = _isWebGPU(renderer)
		? new THREE.RenderTarget(width, height, options)
		: new THREE.WebGLRenderTarget(width, height, options);
	// Get previous render target to switch back to.
	const prevTarget = renderer.getRenderTarget();
	// Only works on Three.js r102 and above.
	renderer.setRenderTarget(
		/** @type {import('three').RenderTarget} */ (renderTarget)); // Set new target.
	renderer.render(scene, camera); // Render.
	renderer.setRenderTarget(prevTarget); // Set previous target.
	return renderTarget; // This needs to be disposed when done.
}

// -------------------------- disposeMeshes(target) --------------------------
/**
 * Disposes meshes in a {@link THREE.Object3D} and removes them from the {@link THREE.Scene} specified.
 * @param {import('three').Scene|import('three').Object3D} group - The scene or group to dispose meshes from.
 * @param {import('three').Scene} [scene] - The scene to remove the meshes from, if provided.
 */
export function disposeMany(group: THREE.Scene | THREE.Object3D, scene?: THREE.Scene): void {
	// Taken from: https://github.com/igvteam/spacewalk/blob/21c0a9da27f121a54e0cf6c0d4a23a9cf80e6623/js/utils/utils.js#L135C10-L135C29

	/**
	 * Disposes a single material along with its texture map.
	 * @param {import('three').MeshBasicMaterial} material - The material with `map` property to dispose.
	 */
	function disposeMaterial(material: THREE.MeshBasicMaterial): void {
		// Dispose texture in material.
		if (material.map) {
			// console.debug('Disposing texture ', child.material.map.id);
			// If this was created by TextureManager
			// then it overrides dispose() to also
			// remove itself from the TextureManager map.
			material.map.dispose();
		}
		material.dispose(); // Dispose material itself.
	}

	// Traverse all children of the scene/group/THREE.Object3D.
	group.traverse((child) => {
		if (!(child instanceof THREE.Mesh)) {
			// Only dispose of meshes.
			return;
		}
		// Dispose geometry, material, and texture.
		if (child.geometry) {
			child.geometry.dispose();
		}

		if (child.material) {
			// Dispose depending on if it is an array or not.
			Array.isArray(child.material)
				// Assume that materials are compatible with THREE.MeshBasicMaterial for .map.
				? child.material.forEach((material) => {
					disposeMaterial(/** @type {import('three').MeshBasicMaterial} */ (material));
				})
				: disposeMaterial(/** @type {import('three').MeshBasicMaterial} */(child.material));
		}
	});

	// If this is a scene, remove this group/Object3D from it.
	if (scene && scene instanceof THREE.Scene) {
		scene.remove(group);
	}

	// Set group and its children to null to break references.
	group.children = [];
}
