/**
 * A NodeMaterial (TSL/WebGPURenderer) that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 */
export default class TextureShaderNodeMaterial extends NodeMaterial {
    static fragmentNode: import("three/src/nodes/TSL.js", { with: { "resolution-mode": "import" } }).ShaderNodeFn<[]>;
    /** @param {import('three').MeshBasicMaterialParameters & {color?: Color|Array<Color>}} [options] */
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
    /** @param {import('../ffl').FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: import("../ffl").FFLModulateMode);
    /** @returns {import('../ffl').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
    get modulateMode(): import("../ffl").FFLModulateMode | undefined;
    modulateType: number;
    lightEnable: boolean;
    fragmentNode: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/src/nodes/TSL.js", { with: { "resolution-mode": "import" } }).ShaderCallNodeInternal>;
    diffuse: Color | undefined;
    color1: Color | undefined;
    color2: Color | undefined;
    _modulateMode: number | undefined;
}
import NodeMaterial from 'three/src/materials/nodes/NodeMaterial.js';
import { Color } from 'three';
