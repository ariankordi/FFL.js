export default FFLShaderMaterial;
export type FFLModulateMode = number;
export type FFLModulateType = number;
export type FFLShaderMaterialParameters = {
    /**
     * - Modulate mode.
     */
    modulateMode?: FFLModulateMode;
    /**
     * - Modulate type.
     */
    modulateType?: FFLModulateType;
    /**
     * - Constant color.
     */
    color?: THREE.Color | null;
    colorG?: THREE.Color;
    colorB?: THREE.Color;
    /**
     * - Enable lighting. Needs to be off when drawing faceline/mask textures.
     */
    lightEnable?: boolean;
    /**
     * - Light direction.
     */
    lightDirection?: THREE.Vector3;
    /**
     * - Whether to override
     * specular mode on all materials with 0 (Blinn-Phong specular).
     */
    useSpecularModeBlinn?: boolean;
    /**
     * - Texture map.
     */
    map?: THREE.Texture | null;
};
/**
 * Custom THREE.ShaderMaterial using the FFLShader.
 * @augments {THREE.ShaderMaterial}
 */
declare class FFLShaderMaterial extends THREE.ShaderMaterial {
    /**
     * Default ambient light color.
     * @type {THREE.Color}
     */
    static defaultLightAmbient: THREE.Color;
    /**
     * Default diffuse light color.
     * @type {THREE.Color}
     */
    static defaultLightDiffuse: THREE.Color;
    /**
     * Default specular light color.
     * @type {THREE.Color}
     */
    static defaultLightSpecular: THREE.Color;
    /**
     * Default light direction.
     * @type {THREE.Vector3}
     */
    static defaultLightDir: THREE.Vector3;
    /**
     * Default rim color.
     * @type {THREE.Color}
     */
    static defaultRimColor: THREE.Color;
    /**
     * Default rim color for the body.
     * @type {THREE.Color}
     */
    static defaultRimColorBody: THREE.Color;
    /**
     * Default rim power (intensity).
     * @type {number}
     */
    static defaultRimPower: number;
    /**
     * Alias for default light direction.
     * @type {THREE.Vector3}
     */
    static defaultLightDirection: THREE.Vector3;
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
    /**
     * Constructs an FFLShaderMaterial instance.
     * @param {THREE.ShaderMaterialParameters & FFLShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: THREE.ShaderMaterialParameters & FFLShaderMaterialParameters);
    set color(value: THREE.Color);
    /** @returns {THREE.Color|undefined} The color. */
    get color(): THREE.Color | undefined;
    set colorG(value: THREE.Color);
    /** @returns {THREE.Color|undefined} colorG color if defined. */
    get colorG(): THREE.Color | undefined;
    set colorB(value: THREE.Color);
    /** @returns {THREE.Color|undefined} colorB color if defined. */
    get colorB(): THREE.Color | undefined;
    /**
     * @type {FFLModulateType}
     * @private
     */
    private _modulateType;
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
    /** @private */
    private _useSpecularModeBlinn;
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
     * @param {THREE.Texture} value - The new texture map.
     */
    set map(value: THREE.Texture);
    /**
     * Gets the texture map if it is set.
     * @returns {THREE.Texture|null} The texture map, or null if it is unset.
     */
    get map(): THREE.Texture | null;
    /**
     * Sets the light direction.
     * @param {THREE.Vector3} value - The new light direction.
     */
    set lightDirection(value: THREE.Vector3);
    /**
     * Gets the light direction.
     * @returns {THREE.Vector3} The light direction.
     */
    get lightDirection(): THREE.Vector3;
}
import * as THREE from 'three';
