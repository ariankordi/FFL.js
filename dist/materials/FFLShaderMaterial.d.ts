export default FFLShaderMaterial;
export type FFLModulateMode = number;
export type FFLModulateType = number;
export type FFLShaderMaterialParameters = {
    /**
     * - Modulate mode.
     */
    modulateMode?: number | undefined;
    /**
     * - Modulate type.
     */
    modulateType?: number | undefined;
    /**
     * -
     * Constant color assigned to u_const1/2/3 depending on single or array.
     */
    color?: THREE.Color | THREE.Color[] | undefined;
    /**
     * - Enable lighting. Needs to be off when drawing faceline/mask textures.
     */
    lightEnable?: boolean | undefined;
    /**
     * - Light direction.
     */
    lightDirection?: THREE.Vector3 | undefined;
    /**
     * - Whether to override
     * specular mode on all materials with 0 (Blinn-Phong specular).
     */
    useSpecularModeBlinn?: boolean | undefined;
    /**
     * - Texture map.
     */
    map?: THREE.Texture | undefined;
};
/**
 * Custom THREE.ShaderMaterial using the FFLShader.
 * @augments {THREE.ShaderMaterial}
 */
declare class FFLShaderMaterial extends THREE.ShaderMaterial {
    /**
     * Default ambient light color.
     * @type {import('three').Color}
     */
    static defaultLightAmbient: import("three").Color;
    /**
     * Default diffuse light color.
     * @type {import('three').Color}
     */
    static defaultLightDiffuse: import("three").Color;
    /**
     * Default specular light color.
     * @type {import('three').Color}
     */
    static defaultLightSpecular: import("three").Color;
    /**
     * Default light direction.
     * @type {import('three').Vector3}
     */
    static defaultLightDir: import("three").Vector3;
    /**
     * Default rim color.
     * @type {import('three').Color}
     */
    static defaultRimColor: import("three").Color;
    /**
     * Default rim color for the body.
     * @type {import('three').Color}
     */
    static defaultRimColorBody: import("three").Color;
    /**
     * Default rim power (intensity).
     * @type {number}
     */
    static defaultRimPower: number;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector3}
     */
    static defaultLightDirection: import("three").Vector3;
    /**
     * Material uniform table mapping to FFLModulateType.
     * Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
     * @package
     */
    static materialParams: {
        ambient: THREE.Color;
        diffuse: THREE.Color;
        specular: THREE.Color;
        specularPower: number;
        specularMode: number;
    }[];
    /** @typedef {import('three').IUniform<import('three').Vector4>} IUniformVector4 */
    /**
     * Constructs an FFLShaderMaterial instance.
     * @param {import('three').ShaderMaterialParameters & FFLShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: import("three").ShaderMaterialParameters & FFLShaderMaterialParameters);
    /** @type {FFLModulateType} */
    _modulateType: FFLModulateType;
    /**
     * Sets whether to override specular mode with 0.
     * @param {boolean} value - The useSpecularModeBlinn value.
     */
    set useSpecularModeBlinn(value: boolean);
    /**
     * Gets the value for whether to override specular mode with 0.
     * @returns {boolean|undefined} The useSpecularModeBlinn value.
     */
    get useSpecularModeBlinn(): boolean | undefined;
    /**
     * Sets the constant color uniforms from THREE.Color.
     * @param {import('three').Color|Array<import('three').Color>} value - The
     * constant color (u_const1), or multiple (u_const1/2/3) to set the uniforms for.
     */
    set color(value: import("three").Color | Array<import("three").Color>);
    /**
     * Gets the constant color (u_const1) uniform as THREE.Color.
     * @returns {import('three').Color|null} The constant color, or null if it is not set.
     */
    get color(): import("three").Color | null;
    _color3: THREE.Color | undefined;
    _opacity: number | undefined;
    /**
     * Sets the value of the modulateMode uniform.
     * @param {FFLModulateMode} value - The new modulateMode value.
     */
    set modulateMode(value: FFLModulateMode);
    /**
     * Gets the value of the modulateMode uniform.
     * @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
     */
    get modulateMode(): FFLModulateMode | null;
    /**
     * Sets the value determining whether lighting is enabled or not.
     * @param {boolean} value - The lightEnable value.
     */
    set lightEnable(value: boolean);
    /**
     * Sets the value determining whether lighting is enabled or not.
     * @returns {boolean|null} The lightEnable value, or null if it is unset.
     */
    get lightEnable(): boolean | null;
    _useSpecularModeBlinn: boolean | undefined;
    /**
     * Sets the material uniforms based on the modulate type value.
     * @param {FFLModulateType} value - The new modulateType value.
     */
    set modulateType(value: FFLModulateType);
    /**
     * Gets the modulateType value.
     * @returns {FFLModulateType|undefined} The modulateType value if it is set.
     */
    get modulateType(): FFLModulateType | undefined;
    /**
     * Sets the texture map (s_texture uniform).
     * @param {import('three').Texture} value - The new texture map.
     */
    set map(value: import("three").Texture);
    /**
     * Gets the texture map if it is set.
     * @returns {import('three').Texture|null} The texture map, or null if it is unset.
     */
    get map(): import("three").Texture | null;
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
import * as THREE from 'three';
