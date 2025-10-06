/**
 * @file Contains functions to help attach a Mii body model
 * to its head, apply materials, and draw an icon. Taken from a jsfiddle
 * a jsfiddle I made to draw the Mii with body scaling and shaders.
 * This may later be broken into more concise snippets in FFL.js itself.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check

import * as THREE from 'three';
import { applyScaleDesc } from './ModelScaleDesc.js';


// Imports for standalone JSDoc types.
/**
 * @typedef {import('../materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo} SampleShaderMaterialColorInfo
 * @typedef {import('./SkeletonScalingExtensions.js').SkeletonWithAttachments} SkeletonWithAttachments
 * @typedef {import('./ModelScaleDesc.js').ModelScaleDesc} ModelScaleDesc
 * @typedef {import('../ffl.js').MaterialConstructor} MaterialConstructor
 */

/**
 * A body model with its ModelScaleDesc and animations altogether.
 * @typedef {Object} BodyModel
 * @property {THREE.Object3D} model
 * @property {Array<THREE.AnimationClip>} animations - AnimationClips from the glTF.
 * @property {ModelScaleDesc} scaleDesc
 * @property {THREE.AnimationMixer} mixer
 */

// // ---------------------------------------------------------------------
// //  Model Loading Helpers
// // ---------------------------------------------------------------------

/**
 * Async wrapper to load a GLTF model from URL.
 * @param {string} url - The URL to load the glTF model from.
 * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
 * The GLTF object. `gltf.scene` contains the mesh group.
 */
// const loadGLTF = async url =>
// 	new Promise((resolve, reject) => {
// 		new GLTFLoader().load(url, resolve, undefined, reject);
// 	});

// // ---------------------------------------------------------------------
// //  Body Model Setup
// // ---------------------------------------------------------------------

/**
 * Searches the Object3D for a SkinnedMesh that contains the given bone.
 * @param {THREE.Object3D} root - Where to search for the SkinnedMesh.
 * @param {string} boneName - Name of the bone in the parent SkinnedMesh to find.
 * @returns {THREE.SkinnedMesh|null} The SkinnedMesh containing the bone, or null if it was not found.
 */
function findSkinnedMeshWithBone(root, boneName) {
	let found = /** @type {THREE.SkinnedMesh|null} */ (null);
	root.traverse((node) => {
		if (!found && node instanceof THREE.SkinnedMesh &&
			node.skeleton.bones.some(bone => bone.name === boneName)) {
			found = node;
		}
	});
	return found;
}

/**
 * Finds body and pants meshes, and applies modulateMode/modulateType.
 * @param {THREE.Object3D} model - The body model meshes.
 */
function applyModulateToBody(model) {
	/** @type {THREE.SkinnedMesh|null} */
	let lastSkinnedMesh = null;
	// To find the pants, let's find the last SkinndMesh and assume that's it.
	model.traverse((node) => {
		if (node instanceof THREE.SkinnedMesh) {
			lastSkinnedMesh = node;
		}
	});
	// (TODO: This method will NOT WORK for body models extracted from Miitomo PODs.)

	let meshIndex = 0;
	model.traverse((mesh) => {
		// The reason this is identifying SkinnedMesh instead of just Mesh
		// is to avoid detecting the head model. But, if the head is also
		// a SkinnedMesh and it's attached to the body, then it will catch here.
		if (!(mesh instanceof THREE.SkinnedMesh)) {
			return;
		}

		/**
		 * Assume that the mesh is pants if it is the last
		 * skinned mesh, or even. Otherwise, a it's the body.
		 */
		const isPants = lastSkinnedMesh
			? mesh.id === lastSkinnedMesh.id
			// If there is no lastSkinnedMesh, then assume this
			// is the pants if it is the second mesh.
			: (meshIndex % 2 === 0);

		mesh.geometry.userData.modulateMode = 0; // Constant color/opaque.
		mesh.geometry.userData.modulateType = isPants
			? 10 // Pants
			: 9; // Body

		meshIndex++;
	});
}

/**
 * Applies colors and the current material to the body/pants.
 * @param {BodyModel} body - The body model to prepare.
 * @param {MaterialConstructor} mat - The material to apply on the body model.
 * @param {THREE.Color} favoriteColor - The favorite color of the CharModel.
 * @param {THREE.Vector3Like} bodyScale - The vector to scale the body model with.
 * @param {THREE.Color} pantsColor - The pants color for the body.
 */
function prepareBodyForCharModel(body, mat, favoriteColor, bodyScale, pantsColor) {
	applyModulateToBody(body.model); // Add modulateMode/modulateType.
	applyMaterialToGroup(body.model, mat, null); // TODO: info.colorInfo);

	// Set the colors on the body model.
	body.model.traverse((mesh) => {
		// The reason this is identifying SkinnedMesh instead of just Mesh
		// is to avoid detecting the head model. But, if the head is also
		// a SkinnedMesh and it's attached to the body, then it will catch here.
		if (!(mesh instanceof THREE.SkinnedMesh) ||
			!('modulateType' in mesh.geometry.userData)) {
			return;
		}
		// HACK HACK HACK HACKAHCKACHA HACKA HACK HACK
		if (mesh.geometry.userData.modulateType === 9) { // Body
			mesh.material.color = favoriteColor;
		} else if (mesh.geometry.userData.modulateType === 10) { // Pants
			mesh.material.color = pantsColor;
		}
	});

	applyScaleDesc(body.model,
		/* scaleVector */ bodyScale,
		/* desc */ body.scaleDesc);
}

/** The absolute world-scale of the head divided by the body's scale. */
const headToBodyScale = 10.0 / 7.0;

/**
 * Attaches the head model to the body model's head bone.
 * Also calls {@link SkeletonWithAttachments.attach} so that the head
 * model's position follows the scaled head bone without getting scaled itself.
 * @param {BodyModel} body - The body model to attach the head ot.
 * @param {THREE.Group} head - The head (CharModel) to attach.
 * @throws {Error} Throws if the head bone or SkinnedMesh was not found.
 */
function attachHeadToBody(body, head) {
	//  * @param {string} headBoneName - The name of the head bone from {@link typeof ModelScaleDesc.head}.
	const headBoneName = body.scaleDesc.head;
	if (headBoneName === 'Head') {
		console.error('TODO: Head is not attached correctly to the Miitomo body. Skipping it so you can see what the model looks like anyway.');
		return;
	}

	const headBone = body.model.getObjectByName(headBoneName);
	if (!(headBone instanceof THREE.Bone)) {
		throw new Error('Head bone not found.');
	}
	// Locate the skeleton in the SkinnedMesh, needed to call attach().
	const skinnedMesh = findSkinnedMeshWithBone(body.model, headBoneName);
	if (!skinnedMesh) {
		throw new Error('No skinned mesh with head bone.');
	}
	const skeleton = /** @type {SkeletonWithAttachments} */ (skinnedMesh.skeleton);

	// Set head to body scale ratio.
	// Multiply by 0.1, assuming the body's world scale was normalized to 1.0.
	head.scale.multiplyScalar(0.1 * headToBodyScale);

	// Add the model to the scene, and attach it to the SkeletonWithAttachments.
	headBone.add(head); // This will render it.
	skeleton.attach(head, headBoneName); // This positions it with the scaled bone.
}

// // ---------------------------------------------------------------------
// //  Shader/Material Class Helpers
// // ---------------------------------------------------------------------

/**
 * Applies a new material class to the mesh and applying existing
 * parameters from the old material and userData to an FFL-compatible material.
 * Also see `onShaderMaterialChange` from FFL.js/examples/demo-basic.js.
 * @param {THREE.Mesh} mesh - The mesh to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Specific object needed for SampleShaderMaterial.
 */
function applyMaterialClassToMesh(mesh, newMatClass, colorInfo) {
	/** Whether the new material supports FFL swizzling. */
	const forFFLMaterial = 'modulateMode' in newMatClass.prototype;
	// Recreate material with same parameters but using the new shader class.
	const oldMat = /** @type {THREE.MeshBasicMaterial} */ (mesh.material);
	/** Get modulateMode/Type */
	const userData = mesh.geometry.userData;

	/** Do not include the parameters if forFFLMaterial is false. */
	const modulateModeType = forFFLMaterial
		? { // modulateMode/Type will be used from the userData or old material.
			modulateMode: 'modulateMode' in oldMat ? oldMat.modulateMode : userData.modulateMode ?? 0,
			// This setter will set side too:
			modulateType: 'modulateType' in oldMat ? oldMat.modulateType : userData.modulateType ?? 0
		}
		: {};

	/**
	 * Parameters for the shader material. Using SampleShaderMaterialParameters
	 * as a lowest common denominator, but others can also be used.
	 * @type {import('three').MeshBasicMaterialParameters
	 * & import('../materials/SampleShaderMaterial.js').SampleShaderMaterialParameters}
	 */
	const params = {
		// _side = original side from LUTShaderMaterial, must be set first
		side: ('_side' in oldMat) ? /** @type {THREE.Side} */ (oldMat._side) : oldMat.side,
		...modulateModeType,
		color: oldMat.color, // should be after modulateType
		transparent: Boolean(oldMat.transparent || oldMat.alphaTest)
	};
	if (oldMat.map) {
		params.map = oldMat.map;
	}

	if ('modulateType' in userData) {
		params.modulateMode = userData.modulateMode ?? 0;
		params.modulateType = userData.modulateType;
	}
	if (colorInfo && 'colorInfo' in newMatClass.prototype) {
		// console.debug('got colorinfo on', mesh)
		params.colorInfo = colorInfo;
	}

	mesh.material = new newMatClass(params);
	oldMat.dispose(); // Dispose the old material, keeping the map.

	// HACK: For SampleShaderMaterial with glTF head models, let's not
	// set drawType uniform to faceline. TODO: Specifically only
	// needs to be done if it's not from FFL.js, and, if faceline
	// color is not transparent (will also result in beards having wrong color)
	/*
	if (mesh.material instanceof SampleShaderMaterial &&
		userData.modulateType === 0) {
		// TODO: This will also break if you request: /miis/image.glb?shaderType=switch&data=
		// 0804400308040402020C0308060406020A0000020000000804100A01001E4004000214031304170D06020A040109
		// (Should we automatically include &shaderType=switch when SampleShaderMaterial is detected?)
		mesh.material.uniforms.drawType.value = 0;
	}
	*/
}

/**
 * Calls {@link applyMaterialClassToMesh} on a group of multiple
 * meshes (head or body model), using the name of the material.
 * @param {THREE.Object3D} group - The group to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Needed for SampleShaderMaterial.
 * @returns {void}
 */
const applyMaterialToGroup = (group, newMatClass, colorInfo) =>
	group.traverse(node =>
		(node instanceof THREE.Mesh) &&
		applyMaterialClassToMesh(node, newMatClass, colorInfo)
	);

/**
 * Disposes geometry, material and map, and skeleton.
 * @param {THREE.Object3D} model - The group of meshes or SkinnedMeshes to dispose.
 */
function disposeModel(model) {
	model.traverse((node) => {
		if (node instanceof THREE.Mesh) {
			node.geometry.dispose();
			if (node.material instanceof THREE.Material) {
				const map = /** @type {THREE.MeshBasicMaterial} */ (node.material).map;
				if (map) {
					map.dispose();
				}
				node.material.dispose();
			}
		}
		// Additionally dispose skeleton if it is a SkinnedMesh.
		if (node instanceof THREE.SkinnedMesh && node.skeleton) {
			node.skeleton.dispose();
		}
	});
}

// // ---------------------------------------------------------------------
// //  Icon Camera Helpers
// // ---------------------------------------------------------------------

/**
 * Intended to match Wii U Mii Maker, and therefore also account/NNAS/cdn-mii 1.0.0 renders.
 * Parameters are from FUN_02086e94 in ffl_app.rpx, search for 57.553 / 0x42663646
 * @returns {THREE.PerspectiveCamera} Camera for the face only view.
 */
function getFaceCamera() {
	// Create camera with 15 degrees FOV.
	const camera = new THREE.PerspectiveCamera(15, 1 /* square */, 50, 1000);
	// Intended to be used with the head at 0.14 (<- exact) scale.
	camera.position.set(0.0, 4.805, 57.553); // 4.205 + 0.6
	return camera;
}

/**
 * Gets whole body camera that accounts for the height.
 * Performs Z-position interpolation like in FUN_02086e94 in ffl_app.rpx (Wii U Mii Maker).
 * @param {number} aspect - Aspect ratio for the camera.
 * @param {number} height - Height value of the CharModel to use in interpolation.
 * @returns {THREE.PerspectiveCamera} Camera for the whole body view.
 */
function getWholeBodyCamera(aspect, height) {
	// Create camera with 15 degrees FOV.
	const camera = new THREE.PerspectiveCamera(15, aspect);

	// These values are usually included in this order within a table.
	const yOffset = 0;
	const yFactor1 = 10.85;
	const yFactor2 = 90.0;
	// const fovy = 15.0;
	const coefficientZMin = 0.85;
	const coefficientZMax = 1.32;

	const rootHeight = 0;
	/** Camera Y position. */
	const y = (yFactor1 - rootHeight) *
		(height / 64 * 0.15 + 0.85) + rootHeight;

	/** Height normalized to [-1, 1] range. */
	const heightFactor = (height / 127.0 - 0.5) * 2;
	/** Camera Z position / zoom. */
	let z = ((coefficientZMax + coefficientZMin) * 0.5 - 1.0) * heightFactor *
		heightFactor + (coefficientZMax - coefficientZMin) * 0.5 * heightFactor + 1.0;
	z *= yFactor2;

	camera.position.set(0.0, y + yOffset, z);
	return camera;
}

/**
 * Moves the position of the camera up so that the head is in center.
 * @param {THREE.Camera} camera - The camera whose position to move.
 * @param {BodyModel} body - The body model.
 */
function adjustCameraForBodyHead(camera, body) {
	body.model.updateMatrixWorld(); // Propagate transforms.
	// Forced skeleton update to account for body scaling.
	body.model.traverse(s => s instanceof THREE.SkinnedMesh && s.skeleton.update());

	const head = /** @type {THREE.Bone} */ (body.model.getObjectByName(body.scaleDesc.head));
	// const root = /** @type {THREE.Bone} */ (body.model.getObjectByName(body.scaleDesc.root));
	console.assert(head);// && root);
	// Get the world translation of the body's root, and the head position.
	const headPos = new THREE.Vector3().setFromMatrixPosition(head.matrixWorld);
	const rootPos = new THREE.Vector3().setFromMatrixPosition(body.model.matrixWorld);

	camera.position.y += headPos.y - rootPos.y; // Move the camera up.
}

export {
	prepareBodyForCharModel,
	attachHeadToBody,
	applyMaterialToGroup,
	disposeModel,
	getFaceCamera,
	getWholeBodyCamera,
	adjustCameraForBodyHead
};
