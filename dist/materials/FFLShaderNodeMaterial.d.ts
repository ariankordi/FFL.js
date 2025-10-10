/**
 * NodeMaterial port of {@link FFLShaderMaterial} in Three.js Shading Language.
 * Makes use of {@link TextureShaderNodeMaterial} for texture modulation.
 */
export default class FFLShaderNodeMaterial extends NodeMaterial {
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
    /** @param {import('../ffl.js').FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: import("../ffl.js").FFLModulateMode);
    /** @returns {import('../ffl.js').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
    get modulateMode(): import("../ffl.js").FFLModulateMode | undefined;
    /**
     * Sets the material uniforms based on the modulate type value.
     * @param {import('../ffl.js').FFLModulateType} value - The new modulateType value.
     */
    set modulateType(value: import("../ffl.js").FFLModulateType);
    /**
     * Gets the modulateType value.
     * @returns {import('../ffl.js').FFLModulateType|undefined} The modulateType value if it is set.
     */
    get modulateType(): import("../ffl.js").FFLModulateType | undefined;
    lightEnable: boolean;
    uLightAmbient: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>>;
    uLightDiffuse: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>>;
    uLightSpecular: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>>;
    uLightDir: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<import("three").Vector3>>;
    uRimPower: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<number>>;
    fragmentNode: import("three/tsl").ShaderNodeObject<import("three/src/nodes/TSL.js").ShaderCallNodeInternal>;
    diffuse: Color | undefined;
    color1: Color | undefined;
    color2: Color | undefined;
    _modulateMode: number | undefined;
    _modulateType: number | undefined;
    uMaterialAmbient: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>> | undefined;
    uMaterialDiffuse: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>> | undefined;
    uMaterialSpecular: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>> | undefined;
    uMaterialSpecularMode: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<number>> | undefined;
    uMaterialSpecularPower: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<number>> | undefined;
    uRimColor: import("three/tsl").ShaderNodeObject<import("three/webgpu").UniformNode<Color>> | undefined;
    /**
     * Sets the light direction.
     * @param {import('three').Vector3} value - The new light direction.
     */
    set lightDirection(value: import("three").Vector3);
    /**
     * Gets the light direction.
     * @returns {import('three').Vector3} The light direction.
     */
    get lightDirection(): import("three").Vector3;
}
import { NodeMaterial } from 'three/webgpu';
import { Color } from 'three';
