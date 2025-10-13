/**
 * A description for a model attached to a bone on a {@link THREE.Skeleton}.
 * This kind of attachment will follow the position of a scaled bone
 * while also allowing the attached model to maintain its own separate scale.
 */
export type SkeletonAttachment = {
    obj: THREE.Object3D;
    boneIdx: number;
    localScale: THREE.Vector3 | null;
};
/**
 * Custom version of {@link THREE.Skeleton} to add attachments.
 */
export type SkeletonWithAttachments = THREE.Skeleton & {
    _attachments: Array<SkeletonAttachment> | undefined;
    attach: (arg0: THREE.Object3D, arg1: string, arg2: boolean | undefined) => void;
    detach: (arg0: THREE.Object3D) => void;
    detachAll: () => void;
};
/**
 * Custom version of {@link THREE.Bone} with custom scaling properties.
 * Note that the misspelled "scalling" name is still used from lo-th's original code.
 */
export type BoneWithScaling = THREE.Bone & {
    scalling: THREE.Vector3 | undefined;
    scaleForRootAdjust: THREE.Vector3Like | undefined;
};
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
export function addSkeletonScalingExtensions(Skeleton: typeof THREE.Skeleton): void;
import * as THREE from 'three';
