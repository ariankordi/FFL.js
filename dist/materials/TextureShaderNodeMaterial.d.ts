/** @typedef {import('three/tsl').ShaderNodeObject<*>} ShaderNodeObject */
/**
 * A NodeMaterial (TSL/WebGPURenderer) that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 */
export default class TextureShaderNodeMaterial extends NodeMaterial {
    /**
     * @typedef {Object} FragmentInputs
     * @property {ShaderNodeObject} diffuse - color
     * @property {ShaderNodeObject} color1 - color
     * @property {ShaderNodeObject} color2 - color
     * @property {ShaderNodeObject} opacity - float
     * @property {ShaderNodeObject} modulateMode - int
     * @property {ShaderNodeObject|null} texel - texture
     */
    /** @type {import('three/src/nodes/tsl/TSLBase.js').ShaderNodeFn<[FragmentInputs]>} */
    static fragmentNode: import("three/src/nodes/tsl/TSLBase.js").ShaderNodeFn<[{
        /**
         * - color
         */
        diffuse: ShaderNodeObject;
        /**
         * - color
         */
        color1: ShaderNodeObject;
        /**
         * - color
         */
        color2: ShaderNodeObject;
        /**
         * - float
         */
        opacity: ShaderNodeObject;
        /**
         * - int
         */
        modulateMode: ShaderNodeObject;
        /**
         * - texture
         */
        texel: ShaderNodeObject | null;
    }]>;
    /** @param {import('three').MeshBasicMaterialParameters & {color?: Color|Array<Color>}} [options] - Options */
    constructor(options?: import("three").MeshBasicMaterialParameters & {
        color?: Color | Array<Color>;
    });
    map: import("three").Texture | null | undefined;
    /**
     * Sets the constant color uniforms from THREE.Color.
     * @param {import('three').Color|Array<import('three').Color>} value -
     * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
     */
    set color(value: import("three").Color | Array<import("three").Color>);
    /**
     * Gets the constant color (diffuse) uniform as THREE.Color.
     * @returns {import('three').Color|undefined} The constant color if set.
     */
    get color(): import("three").Color | undefined;
    /** @param {import('../ffl.js').FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: import("../ffl.js").FFLModulateMode);
    /** @returns {import('../ffl.js').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
    get modulateMode(): import("../ffl.js").FFLModulateMode | undefined;
    modulateType: number;
    lightEnable: boolean;
    fragmentNode: import("three/tsl").ShaderNodeObject<import("three/src/nodes/tsl/TSLCore.js").ShaderCallNodeInternal>;
    diffuse: Color | undefined;
    color1: Color | undefined;
    color2: Color | undefined;
    _modulateMode: number | undefined;
}
export type ShaderNodeObject = import("three/tsl").ShaderNodeObject<any>;
import { NodeMaterial } from 'three/webgpu';
import { Color } from 'three';
