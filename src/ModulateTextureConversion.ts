import * as THREE from 'three';
import CharModel, { MaterialConstructor } from './CharModel';
import Renderer from './renderer';
import { _getIdentCamera, _isWebGPU, createAndRenderToTarget } from './RenderTargetUtils';
import { FFLModulateType } from './enums';

/**
 * Gets a plane whose color and opacity can be set.
 * This can be used to simulate background clear, or specifically
 * to set the background's color to a value but alpha to 0.
 * @param {import('three').Color} color - The color of the plane.
 * @param {number} [opacity] - The opacity of the plane, default is transparent.
 * @returns {import('three').Mesh} The plane with the color and opacity specified.
 * @package
 */
export function _getBGClearMesh(color: THREE.Color, opacity = 0.0) {
	const plane = new THREE.PlaneGeometry(2, 2);
	// Create mesh that has color but arbitrary alpha value.
	return new THREE.Mesh(plane,
		new THREE.MeshBasicMaterial({
			color: color,
			transparent: true,
			opacity: opacity,
			blending: THREE.NoBlending
		})
	);
}

/**
 * Takes the texture in `material` and draws it using `materialTextureClass`, using
 * the modulateMode property in `userData`, using the `renderer` and sets it back
 * in the `material`. So it converts a swizzled (using modulateMode) texture to RGBA.
 * NOTE: Does NOT handle mipmaps. But these textures
 * usually do not have mipmaps anyway so it's fine
 * @param {Renderer} renderer - The renderer.
 * @param {import('three').MeshBasicMaterial} material - The original material of the mesh.
 * @param {Object<string, *>} userData - The original mesh.geometry.userData to get modulateMode/Type from.
 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
 * @returns {import('three').RenderTarget} The RenderTarget of the final RGBA texture.
 */
export function _texDrawRGBATarget(renderer: Renderer, material: THREE.MeshBasicMaterial, userData: Record<string, unknown>, materialTextureClass: MaterialConstructor) {
	const scene = new THREE.Scene();
	// Simulate clearing the background with this color, but opacity of 0.
	const bgClearRGBMesh = _getBGClearMesh(material.color);
	scene.add(bgClearRGBMesh); // Must be drawn first.

	console.assert(material.map, '_texDrawRGBATarget: material.map is null or undefined');
	/** Shortcut to the existing texture. */
	const tex = (material.map as THREE.Texture);
	// This material is solely for the texture itself and not the shape.
	// It actually does not need color set on it, or modulate type (blending)
	const texMat = new materialTextureClass({
		map: tex,
		modulateMode: userData.modulateMode,
		color: material.color,
		side: THREE.DoubleSide,
		lightEnable: false
	});
	texMat.blending = THREE.NoBlending;
	texMat.transparent = true;

	const plane = new THREE.PlaneGeometry(2, 2);
	const textureMesh = new THREE.Mesh(plane, texMat);
	scene.add(textureMesh);

	const flipY = _isWebGPU(renderer);
	const target = createAndRenderToTarget(scene,
		_getIdentCamera(flipY), renderer,
		tex.image.width, tex.image.height, {
			wrapS: tex.wrapS, wrapT: tex.wrapT, // Preserve wrap.
			depthBuffer: false, stencilBuffer: false
		});

	(target.texture as THREE.Texture & { _target: THREE.RenderTarget })._target = target;

	// Dispose previous texture and replace with this one.
	(material.map as THREE.Texture).dispose();
	material.map = target.texture;
	// Set color to default and modulateMode to TEXTURE_DIRECT.
	material.color = new THREE.Color(1, 1, 1);
	userData.modulateMode = 1;

	return target; // Caller is responsible for disposing the RenderTarget.
}

/**
 * Converts a CharModel's textures, including ones that may be using swizzled modulateMode
 * textures that are R/RG format, to RGBA and also applying colors, so that
 * the CharModel can be rendered without a material that supports modulateMode.
 * @param {CharModel} charModel - The CharModel whose textures to convert.
 * @param {Renderer} renderer - The renderer.
 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
 */
export function convertModelTexturesToRGBA(charModel: CharModel, renderer: Renderer, materialTextureClass: MaterialConstructor) {
	const convertTextureForTypes = [
		FFLModulateType.SHAPE_CAP, FFLModulateType.SHAPE_NOSELINE, FFLModulateType.SHAPE_GLASS];

	charModel.meshes.traverse((mesh) => {
		if (!(mesh instanceof THREE.Mesh) ||
			!mesh.geometry.userData.modulateType ||
			!mesh.material.map ||
			convertTextureForTypes.indexOf(mesh.geometry.userData.modulateType) === -1
		) {
			return;
		}
		const target = _texDrawRGBATarget(renderer, mesh.material,
			mesh.geometry.userData, materialTextureClass);
		// HACK?: Push to _maskTargets so that it will be disposed.
		charModel._maskTargets.push(target);
	});
}

/**
 * Converts all textures in the CharModel that are associated
 * with RenderTargets into THREE.DataTextures, so that the
 * CharModel can be exported using e.g., GLTFExporter.
 * @param {CharModel} charModel - The CharModel whose textures to convert.
 * @param {Renderer} renderer - The renderer.
 */
export async function convModelTargetsToDataTex(charModel: CharModel, renderer: Renderer) {
	charModel.meshes.traverse(async (mesh) => {
		if (!(mesh instanceof THREE.Mesh) || !mesh.material.map) {
			return;
		}
		const tex = mesh.material.map;
		console.assert(tex.format === THREE.RGBAFormat,
			'convModelTargetsToDataTex: found a texture that is not of format THREE.RGBAFormat, but, this function is only meant to be used if all textures in CharModel meshes are RGBA (so render targets)...');
		/** RGBA */
		const data = new Uint8Array(tex.image.width * tex.image.height * 4);
		const target = /** @type {import('three').RenderTarget} */ tex._target;
		console.assert(target, 'convModelTargetsToDataTex: mesh.material.map (texture)._target is null or undefined.');
		await renderer.readRenderTargetPixelsAsync(target, 0, 0,
			tex.image.width, tex.image.height);
		// Construct new THREE.DataTexture from the read data.
		// So... draw the texture, download it out, and upload it again.
		const dataTex = new THREE.DataTexture(data, tex.image.width,
			tex.image.height, THREE.RGBAFormat, THREE.UnsignedByteType);
		// Copy wrap and filtering options.
		dataTex.wrapS = tex.wrapS;
		dataTex.wrapT = tex.wrapT;
		dataTex.minFilter = tex.minFilter;
		dataTex.magFilter = tex.magFilter;

		dataTex.needsUpdate = true;
		mesh.material.map = dataTex;
	});
	// The original render targets are no longer needed now, dispose them.
	charModel.disposeTargets();
	// Note that expressions cannot be set on the CharModel anymore.
}
