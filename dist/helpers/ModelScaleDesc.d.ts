export type BoneWithScaling = import("./SkeletonScalingExtensions.js").BoneWithScaling;
/**
 * Describes the ways in which to apply the scale vector on
 * the model's bones. Each array represents names of bones.
 */
export type ModelScaleDesc = {
    /**
     * - List of bones that should be scaled with the unmodified scale vector.
     * If null, then all bones will receive the unmodified scale vector, unless ones excluded in `none`.
     */
    xyz: Array<string> | null;
    /**
     * - List of bones that should be scaled with all three dimensions
     * of the scale vector, but with Y clamped to a minimum of 1.0. Used for the head bone (cosmetic neck).
     */
    xyzYMin1: Array<string>;
    /**
     * - List of bones that should be scaled using the scale vector with Y and X swapped.
     * If null, then all bones will receive the the vector with Y and X swapped, unless ones excluded in `none`.
     */
    yxz: Array<string> | null;
    /**
     * - List of bones that should be scaled uniformly using X for all dimensions.
     */
    scalar: Array<string>;
    /**
     * - List of bones that should receive no additional scale.
     * Only applicable if `xyz` or `yxz` are non-null.
     */
    none: Array<string> | null;
    /**
     * - The name of the root bone for which to adjust translation
     * (usually something along the lines of "skl_root").
     */
    root: string;
    /**
     * - The name of the bone for which to attach the model's head.
     * NOTE: The head bone is not necessarily used for scaling, but is provided here for convenience.
     */
    head: string;
    /**
     * - The name of a bone that is planted at the bottom of
     * the skeleton, and receives scalar scale. This is used for attaching the shadow model.
     */
    shadow: string;
};
/** @typedef {import('./SkeletonScalingExtensions.js').BoneWithScaling} BoneWithScaling */
/**
 * Describes the ways in which to apply the scale vector on
 * the model's bones. Each array represents names of bones.
 * @typedef {Object} ModelScaleDesc
 * @property {Array<string>|null} xyz - List of bones that should be scaled with the unmodified scale vector.
 * If null, then all bones will receive the unmodified scale vector, unless ones excluded in `none`.
 * @property {Array<string>} xyzYMin1 - List of bones that should be scaled with all three dimensions
 * of the scale vector, but with Y clamped to a minimum of 1.0. Used for the head bone (cosmetic neck).
 * @property {Array<string>|null} yxz - List of bones that should be scaled using the scale vector with Y and X swapped.
 * If null, then all bones will receive the the vector with Y and X swapped, unless ones excluded in `none`.
 * @property {Array<string>} scalar - List of bones that should be scaled uniformly using X for all dimensions.
 * @property {Array<string>|null} none - List of bones that should receive no additional scale.
 * Only applicable if `xyz` or `yxz` are non-null.
 * @property {string} root - The name of the root bone for which to adjust translation
 * (usually something along the lines of "skl_root").
 * @property {string} head - The name of the bone for which to attach the model's head.
 * NOTE: The head bone is not necessarily used for scaling, but is provided here for convenience.
 * @property {string} shadow - The name of a bone that is planted at the bottom of
 * the skeleton, and receives scalar scale. This is used for attaching the shadow model.
 */
/**
 * Scaling description for the body model used in the editor.
 * Tested with Wii U (MiiBodyMiddle.bfres) and Switch (MiiBodyHigh.bfres) body models.
 * Also tested with the Wii (Mii Channel) body model, and the 3DS body should work too.
 * This model is mostly unused outside of system titles and certain first-party Wii channels (Wii Room).
 * Main reference: mii_VariableIconBodyImpl.o from NintendoSDK,
 * void nn::mii::detail::`anonymous namespace'::UpdateScale(class nn::util::Vector3f *,
 * enum nn::mii::detail::VriableIconBodyBoneKind, struct nn::util::Float3 const &)
 * @type {ModelScaleDesc}
 */
export const editorBodyScaleDesc: ModelScaleDesc;
/**
 * Scaling description for the body model used in Miitomo, which
 * is similar to the model used in Tomodachi Life 3DS.
 * In contrast to the editor body, its bones use YXZ scale by default.
 * Reference: FUN_005357f0 in libcocos2dcpp.so 2.4.0 (inlined anim lerp/body scaling)
 * @type {ModelScaleDesc}
 */
export const archBodyScaleDesc: ModelScaleDesc;
/**
 * Detects and returns the appropriate {@link ModelScaleDesc} for the body model.
 * Currently just differentiates between editor's body model and Miitomo body model.
 * @param {THREE.Object3D} object - The model for which to detect the description.
 * @returns {ModelScaleDesc} The `ModelScaleDesc` that was detected.
 * @throws {Error} Throws if the `ModelScaleDesc` could not be detected.
 */
export function detectModelDesc(object: THREE.Object3D): ModelScaleDesc;
/**
 * Apply scaling to a model's bones based on a given scale description.
 * @param {THREE.Object3D} model - The skinned model to apply scaling to.
 * @param {THREE.Vector3Like} scaleVector - The base scale vector.
 * @param {ModelScaleDesc} desc - Scaling behavior descriptor for the model.
 * @throws {Error} Throws if addSkeletonScalingExtensions has not been called yet.
 */
export function applyScaleDesc(model: THREE.Object3D, scaleVector: THREE.Vector3Like, desc: ModelScaleDesc): void;
import * as THREE from 'three';
