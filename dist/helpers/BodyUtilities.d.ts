export type SampleShaderMaterialColorInfo = import("../materials/SampleShaderMaterial.js").SampleShaderMaterialColorInfo;
export type SkeletonWithAttachments = import("./SkeletonScalingExtensions.js").SkeletonWithAttachments;
export type ModelScaleDesc = import("./ModelScaleDesc.js").ModelScaleDesc;
export type MaterialConstructor = import("../ffl.js").MaterialConstructor;
/**
 * A body model with its ModelScaleDesc and animations altogether.
 */
export type BodyModel = {
    model: THREE.Object3D;
    /**
     * - AnimationClips from the glTF.
     */
    animations: Array<THREE.AnimationClip>;
    scaleDesc: ModelScaleDesc;
    mixer: THREE.AnimationMixer;
};
/**
 * Applies colors and the current material to the body/pants.
 * @param {BodyModel} body - The body model to prepare.
 * @param {MaterialConstructor} mat - The material to apply on the body model.
 * @param {THREE.Color} favoriteColor - The favorite color of the CharModel.
 * @param {THREE.Vector3Like} bodyScale - The vector to scale the body model with.
 * @param {THREE.Color} pantsColor - The pants color for the body.
 */
export function prepareBodyForCharModel(body: BodyModel, mat: MaterialConstructor, favoriteColor: THREE.Color, bodyScale: THREE.Vector3Like, pantsColor: THREE.Color): void;
/**
 * Attaches the head model to the body model's head bone.
 * Also calls {@link SkeletonWithAttachments.attach} so that the head
 * model's position follows the scaled head bone without getting scaled itself.
 * @param {BodyModel} body - The body model to attach the head ot.
 * @param {THREE.Group} head - The head (CharModel) to attach.
 * @throws {Error} Throws if the head bone or SkinnedMesh was not found.
 */
export function attachHeadToBody(body: BodyModel, head: THREE.Group): void;
/**
 * Calls {@link applyMaterialClassToMesh} on a group of multiple
 * meshes (head or body model), using the name of the material.
 * @param {THREE.Object3D} group - The group to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Needed for SampleShaderMaterial.
 * @returns {void}
 */
export function applyMaterialToGroup(group: THREE.Object3D, newMatClass: MaterialConstructor, colorInfo: SampleShaderMaterialColorInfo | null): void;
/**
 * Disposes geometry, material and map, and skeleton.
 * @param {THREE.Object3D} model - The group of meshes or SkinnedMeshes to dispose.
 */
export function disposeModel(model: THREE.Object3D): void;
/**
 * Intended to match Wii U Mii Maker, and therefore also account/NNAS/cdn-mii 1.0.0 renders.
 * Parameters are from FUN_02086e94 in ffl_app.rpx, search for 57.553 / 0x42663646
 * @returns {THREE.PerspectiveCamera} Camera for the face only view.
 */
export function getFaceCamera(): THREE.PerspectiveCamera;
/**
 * Gets whole body camera that accounts for the height.
 * Performs Z-position interpolation like in FUN_02086e94 in ffl_app.rpx (Wii U Mii Maker).
 * @param {number} aspect - Aspect ratio for the camera.
 * @param {number} height - Height value of the CharModel to use in interpolation.
 * @returns {THREE.PerspectiveCamera} Camera for the whole body view.
 */
export function getWholeBodyCamera(aspect: number, height: number): THREE.PerspectiveCamera;
/**
 * Moves the position of the camera up so that the head is in center.
 * @param {THREE.Camera} camera - The camera whose position to move.
 * @param {BodyModel} body - The body model.
 */
export function adjustCameraForBodyHead(camera: THREE.Camera, body: BodyModel): void;
import * as THREE from 'three';
