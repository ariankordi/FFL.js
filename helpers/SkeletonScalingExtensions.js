/*!
 * @file Extensions for Three.js to help allow per-bone scaling of skeletons.
 * @author Arian Kordi <https://github.com/ariankordi>
 */

// @ts-check
/*
Helpful references:
- [ ] https://github.com/lo-th/phy/blob/main/src/3TH/character/SkeletonExtand.js
- [ ] https://github.com/lo-th/lab/blob/master/src/lth/Skeleton_Add.js
- [ ] https://github.com/lo-th/Avatar.lab/blob/gh-pages/src/skeleton.js
Author of the THREE.Skeleton.prototype.update override, and
thus this entire method for scaling a model, is lo-th.
All other references I found on GitHub were simply copying his code.
*/

import * as THREE from 'three';

// // ---------------------------------------------------------------------
// //  Extensions for Skeleton Scaling
// // ---------------------------------------------------------------------

/**
 * A description for a model attached to a bone on a {@link THREE.Skeleton}.
 * This kind of attachment will follow the position of a scaled bone
 * while also allowing the attached model to maintain its own separate scale.
 * @typedef {{
 * obj: THREE.Object3D,
 * boneIdx: number,
 * localScale: THREE.Vector3|null
 * }} SkeletonAttachment
 */

/**
 * Custom version of {@link THREE.Skeleton} to add attachments.
 * @typedef {THREE.Skeleton & {
 * _attachments: Array<SkeletonAttachment>|undefined,
 * attach: function(THREE.Object3D, string, boolean=): void,
 * detach: function(THREE.Object3D): void
 * detachAll: function(): void
 * }} SkeletonWithAttachments
 */

/**
 * Custom version of {@link THREE.Bone} with custom scaling properties.
 * Note that the misspelled "scalling" name is still used from lo-th's original code.
 * @typedef {THREE.Bone & {
 * scalling: THREE.Vector3|undefined,
 * scaleForRootAdjust: THREE.Vector3Like|undefined,
 * }} BoneWithScaling
 */

/**
 * Adds extensions (override functions) to the THREE.Skeleton namespace ({@link THREE.Skeleton})
 * to enable hierarchical per-bone local scaling for Three.js skeletons.
 * @param {typeof THREE.Skeleton} Skeleton - The THREE.Skeleton class.
 */
function addSkeletonScalingExtensions(Skeleton) {
	if (/** @type {*} */ (Skeleton.prototype)._attachments) {
		console.warn('addSkeletonScalingExtensions: Already run, skipping.');
		return; // Already run, skip this.
	}

	// Replace function that runs every time a skeleton is updated.
	// Original function (r178, 2025, functionality is simple):
	// https://github.com/mrdoob/three.js/blob/e117b283555e0ccc5034fa5193b951bc987280ed/src/objects/Skeleton.js#L198
	Skeleton.prototype.update = (function () {
		// Static, shared variables to be used temporarily for every run.

		/** @readonly */ // - (Below two are defined in three.js Skeleton.js)
		const _identityMatrix = new THREE.Matrix4().identity();
		// Used in main bone scale loop:
		const _offsetMatrix = new THREE.Matrix4();

		const scaleMatrix = new THREE.Matrix4();
		const posVec = new THREE.Vector3();

		// Used for decomposing/composing when updating attachments:
		const tmpQuat = new THREE.Quaternion();
		const tmpTrans = new THREE.Vector3();

		/**
		 * Adjusts translation, if the parent is the root (skl_root).
		 * @param {BoneWithScaling} bone - The bone to check/adjust for.
		 * @param {THREE.Matrix4} matrix - The local matrix.
		 */
		function adjustTranslationForRoot(bone, matrix) {
			// Run if: this bone has a parent bone, and the parent is skl_root.
			if (!bone.scalling || !(bone.parent instanceof THREE.Bone) ||
				// scaleForRootAdjust being present indicates that parent is the root.
				!(/** @type {BoneWithScaling} */ (bone.parent).scaleForRootAdjust)) {
				return;
			}
			// if (!bone.scalling || !bone.isScallingRoot) return;

			// Get translation/W-axis from matrix.
			const translation = tmpTrans.setFromMatrixPosition(matrix);
			// Use the scale vector to adjust translation.
			const scale = /** @type {THREE.Vector3Like} */
				(/** @type {BoneWithScaling} */ (bone.parent).scaleForRootAdjust);

			// Multiply translation by YYX axes:
			translation.x *= scale.y;
			translation.y *= scale.y;
			translation.z *= scale.x;
			// Move Y down to keep the model's root (legs) planted.
			translation.y += (scale.x - scale.y); //* 1.0;
			// 1.0 = Local-to-world scale of the body model.

			matrix.setPosition(translation); // Set translation back on matrix.
		}

		/**
		 * @param {Array<SkeletonAttachment>} attachments - The attachment array.
		 * @param {typeof THREE.Skeleton.prototype.boneMatrices} boneMatrices -
		 * The raw matrices array to update the attachment with.
		 */
		function updateAttachments(attachments, boneMatrices) {
			for (const at of attachments) {
				// _offsetMatrix - Temporary matrix for the bone's worldMatrix.
				// scaleMatrix - Temporary matrix for the inverted parent.

				// Get the world matrix of the bone we just fed to skinning:
				_offsetMatrix.fromArray(boneMatrices, at.boneIdx * 16); // Already scaled.

				// The caller wants to preserve the attachment's own local scale.
				if (at.localScale) {
					// Remove the bone's scale by re-composing with the local scale.
					_offsetMatrix.decompose(tmpTrans, tmpQuat, posVec);
					_offsetMatrix.compose(tmpTrans, tmpQuat, at.localScale);
				}

				// Copy bone-space to world-space for the attachment.
				// at.obj.matrixWorld.copy(_offsetMatrix);// .multiply(at.local);
				// at.obj.matrixWorldNeedsUpdate = false; // Make the matrix stay put.

				/** The world matrix of the object's parent, or identity if there is none. */
				const parentWorld = at.obj.parent ? at.obj.parent.matrixWorld : _identityMatrix;
				scaleMatrix.copy(parentWorld).invert(); // Convert world to local matrix.

				// Multiply two matrices and store result in the object's matrix.
				at.obj.matrix.multiplyMatrices(scaleMatrix, _offsetMatrix);
				at.obj.updateMatrixWorld(true); // Update now. (Not recommended to change directly.)
			}
		}

		/**
		 * Override of the update function to apply per-bone scaling and attachments.
		 * In the author (https://github.com/lo-th)'s words: "force local scalling"
		 * From lab (2019): https://github.com/lo-th/lab/blob/5e8949f3202a952df2269e80f40a93f362cf22aa/src/lth/Skeleton_Add.js#L136
		 * From Avatar.lab (2017): https://github.com/lo-th/Avatar.lab/blob/e96e7f3862c04feb7ce9fb6744561ffb8661fb21/src/skeleton.js#L5
		 * @this {SkeletonWithAttachments}
		 */
		return function update() {
			// For each bone, calculate the matrixWorld and then apply custom per-bone scaling.
			for (let i = 0; i < this.bones.length; i++) { // Flatten bone matrices to array.
				const bone = /** @type {BoneWithScaling|undefined} */ (this.bones[i]);
				/** Current bone's matrixWorld. It will be re-assigned if there is scaling. */
				let matrixWorld = bone ? bone.matrixWorld : _identityMatrix;

				// If the bone has "scalling" (note spelling!), apply it to the bone.
				if (bone && bone.scalling) {
					matrixWorld = _offsetMatrix.copy(matrixWorld).scale(bone.scalling);

					// Adjust translation for the root (skl_root).
					// if (bone.parent && bone.parent instanceof THREE.Bone &&
					//	 bone.scalling && /** @type {BoneWithScaling} */ (bone.parent)
					//	 .isScallingRoot) {
					adjustTranslationForRoot(bone, matrixWorld);

					// Adjust translation for children so they follow the scaled parent.
					for (const child of bone.children) {
						scaleMatrix.copy(matrixWorld).multiply(child.matrix);
						posVec.setFromMatrixPosition(scaleMatrix);
						child.matrixWorld.setPosition(posVec);
					}
				}

				// Update boneMatrices[] (like the original update function)
				_offsetMatrix.multiplyMatrices(matrixWorld, this.boneInverses[i]);
				_offsetMatrix.toArray(this.boneMatrices, i * 16);
			}

			// Update all registered attachments after bones are updated.
			if (this._attachments) {
				updateAttachments(this._attachments, this.boneMatrices);
			}

			// Finally, update boneTexture (like the original update function)
			if (this.boneTexture) {
				this.boneTexture.needsUpdate = true;
			}
		};
	})();

	// Define SkeletonWithAttachments extensions.

	/** @type {SkeletonWithAttachments} */ (Skeleton.prototype).attach =
	/**
	 * @param {THREE.Object3D} obj - The Object3D to attach (SkinnedMesh, glTF scene, etc.)
	 * @param {string} boneName - Bone name to look up once.
	 * @param {boolean} [useBoneScale] - If this is false, then the bone's individual
	 * scale is ignored, and the object's local scale will be used when attaching.
	 * @throws {Error} Throws if the bone specified in `boneName` cannot be found.
	 * @this {SkeletonWithAttachments}
	 */
	function (obj, boneName, useBoneScale = false) {
		const boneIdx = this.bones.findIndex(b => b.name === boneName);
		if (boneIdx === -1) {
			throw new Error(`Bone '${boneName}' not found.`);
		}

		// Turn off auto‐updates so our manual matrix stays put.
		obj.matrixAutoUpdate = false;
		// obj.matrixWorldAutoUpdate = false; // Not modifying matrixWorld directly.

		const localScale = useBoneScale ? null : obj.scale;
		/** @type {SkeletonAttachment} */
		const att = { obj, boneIdx, localScale };

		// Add the attachment or create the _attachments array.
		if (this._attachments) {
			this._attachments.push(att);
		} else {
			this._attachments = [att];
		}
		// this.update(); // Update the attachment instantly. (Not needed)
	};

	/** @type {SkeletonWithAttachments} */ (Skeleton.prototype).detach =
	/**
	 * @param {THREE.Object3D} obj - The object to detach.
	 * @this {SkeletonWithAttachments}
	 */
	function (obj) {
		if (this._attachments) {
			this._attachments = this._attachments.filter(a => a.obj !== obj);
		}
	};

	/** @type {SkeletonWithAttachments} */ (Skeleton.prototype).detachAll =
	function () {
		this._attachments = null;
	};
}

export { addSkeletonScalingExtensions };
