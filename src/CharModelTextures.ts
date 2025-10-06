import * as THREE from 'three';
import CharModel, { MaterialConstructor } from "@/CharModel";
import { drawParamToMesh, matSupportsFFL } from "@/DrawParam";
import { _getBGClearMesh, convertModelTexturesToRGBA } from "@/ModulateTextureConversion";
import Renderer from "@/renderer";
import { facelinePartType, FFLiRawMaskDrawParam, FFLiTextureTempObject, maskPartType } from "@/StructFFLiCharModel";
import { _getIdentCamera, createAndRenderToTarget, disposeMany } from '@/RenderTargetUtils';
import { Module } from '@/Module';
import { FFLDrawParam } from '@/structs';

// ---------------- initCharModelTextures(charModel, renderer) ----------------

/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 * Note that this is a separate function due to needing renderer parameter.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {Renderer} renderer - The Three.js renderer.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 */
export function initCharModelTextures(charModel: CharModel, renderer: Renderer, materialClass = charModel._materialClass): void {
	// Check if the passed in renderer is valid by checking the "render" property.
	console.assert(renderer.render !== undefined,
		'initCharModelTextures: renderer is an unexpected type (cannot find .render).');
	const module = charModel._module;
	// Set material class for render textures.
	charModel._materialTextureClass = materialClass;

	const textureTempObject = charModel._getTextureTempObject();

	// Use the textureTempObject to set all available expressions on the CharModel.
	charModel.expressions = textureTempObject.maskTextures.pRawMaskDrawParam
		// expressions is a list of expression indices, where each index is non-null here.
		.map((val: number, idx: number) =>
			// If the value is 0 (null), map it.
			val !== 0 ? idx : -1)
		.filter((i: number) => i !== -1); // -1 = null, filter them out.

	// Draw faceline texture if applicable.
	_drawFacelineTexture(charModel, textureTempObject, renderer, module, materialClass);

	// Warn if renderer.alpha is not set to true.
	const clearAlpha = renderer.getClearAlpha();
	(clearAlpha !== 0) && renderer.setClearAlpha(0); // Override clearAlpha to 0.

	// Draw mask textures for all expressions.
	_drawMaskTextures(charModel, textureTempObject, renderer, module, materialClass);
	// Finalize CharModel, deleting and freeing it.
	charModel._finalizeCharModel();
	// Update the expression to refresh the mask texture.
	charModel.setExpression(charModel.expression);
	// Set clearAlpha back.
	(clearAlpha !== 0) && renderer.setClearAlpha(clearAlpha);

	// convert textures
	if (!matSupportsFFL(charModel._materialClass)) {
		if (!matSupportsFFL(charModel._materialTextureClass)) {
			console.warn('initCharModelTextures: charModel._materialClass does not support modulateMode (no getter), but the _materialTextureClass is either the same or also does not support modulateMode so textures will look wrong');
		} else {
			convertModelTexturesToRGBA(charModel, renderer, charModel._materialTextureClass);
		}
	}
}

/**
 * Draws and applies the faceline texture for the CharModel.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The FFLiTextureTempObject containing faceline DrawParams.
 * @param {Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @package
 */
export function _drawFacelineTexture(charModel: CharModel, textureTempObject: ReturnType<typeof FFLiTextureTempObject.unpack>, renderer: Renderer, module: Module, materialClass: MaterialConstructor): void {
	// Invalidate faceline texture before drawing (ensures correctness)
	const facelineTempObjectPtr = charModel._getFacelineTempObjectPtr();
	module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
	// Gather the drawParams that make up the faceline texture.
	const drawParams = [
		textureTempObject.facelineTexture[facelinePartType.Make],
		textureTempObject.facelineTexture[facelinePartType.Line],
		textureTempObject.facelineTexture[facelinePartType.Beard]
	].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);
	// Note that for faceline DrawParams to not be empty,
	// it must have a texture. For other DrawParams to not
	// be empty they simply need to have a non-zero index count.
	if (drawParams.length === 0) {
		console.debug('_drawFacelineTexture: Skipping faceline texture.');
		return;
	}

	// Get the faceline color from CharModel.
	const bgColor = charModel.facelineColor;

	// Create an offscreen scene.
	const offscreenScene = new THREE.Scene();
	offscreenScene.background = bgColor;

	drawParams.forEach(param => offscreenScene.add(
		drawParamToMesh(param, materialClass, charModel._module, charModel._textureManager)
	));

	// Determine if the alpha value needs to be 0.
	if ('needsFacelineAlpha' in materialClass && materialClass.needsFacelineAlpha) {
		// Three.js does not allow setting an RGB color with alpha value to 0.
		// Therefore, we need to use a plane with a color and opacity of 0.
		const mesh = _getBGClearMesh(bgColor);
		mesh.renderOrder = -1; // Render this before anything else.
		offscreenScene.add(mesh);
	}

	// Render scene to texture.
	const width = charModel._getResolution() / 2;
	const height = charModel._getResolution();
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false,
		// Use mirrored repeat wrapping.
		wrapS: THREE.MirroredRepeatWrapping,
		wrapT: THREE.MirroredRepeatWrapping
	};

	const target = createAndRenderToTarget(offscreenScene,
		_getIdentCamera(), renderer, width, height, options);

	console.debug(`Creating target ${target.texture.id} for faceline`);

	// Apply texture to CharModel.
	_setFaceline(charModel, target);
	// Delete temp faceline object to free resources.
	module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr,
		charModel._ptr!, charModel._model.charModelDesc.resourceType);
	disposeMany(offscreenScene); // Dispose meshes in scene.
}

/**
 * Iterates through mask textures and draws each mask texture.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The temporary texture object.
 * @param {Renderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @package
 */
export function _drawMaskTextures(charModel: CharModel, textureTempObject: ReturnType<typeof FFLiTextureTempObject.unpack>, renderer: Renderer, module: Module, materialClass: MaterialConstructor): void {
	const maskTempObjectPtr = charModel._getMaskTempObjectPtr();
	const expressionFlagPtr = charModel._getExpressionFlagPtr();

	// Collect all scenes and only dispose them at the end.
	/** @type {Array<import('three').Scene>} */
	const scenes = [];

	// Iterate through pMaskRenderTextures to find out which masks are needed.
	for (let i = 0; i < charModel._model.pMaskRenderTextures.length; i++) {
		// pRenderTexture will be set to 1 if mask is meant to be drawn there.
		if (charModel._model.pMaskRenderTextures[i] === 0) {
			continue;
		}
		const rawMaskDrawParamPtr = textureTempObject.maskTextures.pRawMaskDrawParam[i];
		const rawMaskDrawParam = FFLiRawMaskDrawParam.unpack(
			module.HEAPU8.subarray(rawMaskDrawParamPtr,
				rawMaskDrawParamPtr + FFLiRawMaskDrawParam.size));
		module._FFLiInvalidateRawMask(rawMaskDrawParamPtr);

		const { target, scene } = _drawMaskTexture(charModel,
			rawMaskDrawParam, renderer, materialClass);
		console.debug(`Creating target ${target.texture.id} for mask ${i}`);
		charModel._maskTargets[i] = target;

		scenes.push(scene);
	}

	// Some texures are shared which is why this
	// needs to be done given that disposeMeshes
	// unconditionally deletes textures.
	scenes.forEach((scene) => {
		disposeMany(scene);
	});

	module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr,
		expressionFlagPtr, charModel._model.charModelDesc.resourceType);
	module._FFLiDeleteTextureTempObject(charModel._ptr!);
}

/**
 * Draws a single mask texture based on a RawMaskDrawParam.
 * Note that the caller needs to dispose meshes within the returned scene.
 * @param {CharModel} charModel - The CharModel.
 * @param {Array<FFLDrawParam>} rawMaskParam - The RawMaskDrawParam.
 * @param {Renderer} renderer - The renderer.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 * @returns {{target: import('three').RenderTarget, scene: import('three').Scene}}
 * The RenderTarget and scene of this mask texture.
 * @package
 */
export function _drawMaskTexture(charModel: CharModel, rawMaskParam: ReturnType<typeof FFLDrawParam.unpack>[], renderer: Renderer, materialClass: MaterialConstructor): { target: THREE.RenderTarget; scene: THREE.Scene } {
	const drawParams = [
		rawMaskParam[maskPartType.MustacheR],
		rawMaskParam[maskPartType.MustacheL],
		rawMaskParam[maskPartType.Mouth],
		rawMaskParam[maskPartType.EyebrowR],
		rawMaskParam[maskPartType.EyebrowL],
		rawMaskParam[maskPartType.EyeR],
		rawMaskParam[maskPartType.EyeL],
		rawMaskParam[maskPartType.Mole]
	].filter(dp => dp && dp.primitiveParam.indexCount !== 0);
	console.assert(drawParams.length, '_drawMaskTexture: All DrawParams are empty.');
	// Configure the RenderTarget for no depth/stencil.
	const options = {
		depthBuffer: false,
		stencilBuffer: false
	};
	// Create an offscreen transparent scene for 2D mask rendering.
	const offscreenScene = new THREE.Scene();
	offscreenScene.background = null;
	drawParams.forEach(param => offscreenScene.add(
		drawParamToMesh(param, materialClass, charModel._module, charModel._textureManager)
	));
	const width = charModel._getResolution();

	const target = createAndRenderToTarget(offscreenScene,
		_getIdentCamera(), renderer, width, width, options);

	return { target, scene: offscreenScene };
	// Caller needs to dispose meshes in scene.
}

/**
 * Sets the faceline texture of the given CharModel from the RenderTarget.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').RenderTarget} target - RenderTarget for the faceline texture.
 * @throws {Error} CharModel must be initialized with OPA_FACELINE in meshes.
 * @package
 */
export function _setFaceline(charModel: CharModel, target: THREE.RenderTarget): void {
	console.assert(target && target.texture, 'setFaceline: passed in RenderTarget is invalid');
	charModel._facelineTarget = target; // Store for later disposal.
	if (charModel._isTexOnly()) {
		return;
	}
	const mesh = charModel._facelineMesh;
	if (!mesh || !(mesh instanceof THREE.Mesh)) {
		throw new Error('setFaceline: faceline shape does not exist');
	}
	// Update texture and material.
	(target.texture as THREE.Texture & { _target: THREE.RenderTarget })._target = target;
	(mesh.material as THREE.MeshBasicMaterial).map = target.texture;
	(mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
}
