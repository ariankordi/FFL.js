/** @typedef {import('three/tsl').ShaderNodeObject<*>} ShaderNodeObject */
/**
 * A NodeMaterial (TSL/WebGPURenderer) that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 */
export default class TextureShaderNodeMaterial extends NodeMaterial {
    /**
     * @typedef {Object} FragmentInputs
     * @property {ShaderNodeObject} diffuse - color
     * @property {ShaderNodeObject} colorG - color
     * @property {ShaderNodeObject} colorB - color
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
        colorG: ShaderNodeObject;
        /**
         * - color
         */
        colorB: ShaderNodeObject;
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
    /** @param {import('three').MeshBasicMaterialParameters & {colorG?: Color, colorB?: Color}} [options] - Options */
    constructor(options?: import("three").MeshBasicMaterialParameters & {
        colorG?: Color;
        colorB?: Color;
    });
    map: import("three").Texture | null | undefined;
    color: import("three").ColorRepresentation;
    colorG: Color;
    colorB: Color;
    /** @param {import('../ffl.js').FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: import("../ffl.js").FFLModulateMode);
    /** @returns {import('../ffl.js').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
    get modulateMode(): import("../ffl.js").FFLModulateMode | undefined;
    modulateType: number;
    lightEnable: boolean;
    fragmentNode: import("three/tsl").ShaderNodeObject<import("three/src/nodes/tsl/TSLCore.js").ShaderCallNodeInternal>;
    /** @private */
    private _modulateMode;
}
export type ShaderNodeObject = import("three/tsl").ShaderNodeObject<any>;
import { NodeMaterial } from 'three/webgpu';
import { Color } from 'three';
