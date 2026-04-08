export default LUTShaderMaterial;
export type FFLModulateMode = number;
export type FFLModulateType = number;
export type LUTShaderMaterialParameters = {
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
     * - Light direction.
     */
    lightDirection?: THREE.Vector3;
    /**
     * - Enable lighting. Needs to be off when drawing faceline/mask textures.
     */
    lightEnable?: boolean;
    /**
     * - Texture map.
     */
    map?: THREE.Texture | null;
};
/**
 * Custom THREE.ShaderMaterial using the LUT shader from Miitomo.
 * @augments {THREE.ShaderMaterial}
 */
declare class LUTShaderMaterial extends THREE.ShaderMaterial {
    /** @enum {number} */
    static LUTSpecularTextureType: {
        NONE: number;
        DEFAULT_02: number;
        SKIN_01: number;
        MAX: number;
    };
    /** @enum {number} */
    static LUTFresnelTextureType: {
        NONE: number;
        DEFAULT_02: number;
        SKIN_01: number;
        MAX: number;
    };
    /**
     * LUT definitions for materials used in the original shader.
     * Taken from XMLs in the same folder as the original TGAs..
     * @typedef {Object<LUTSpecularTextureType, HermitianCurve>} SpecularLUT
     * @typedef {Object<LUTFresnelTextureType, HermitianCurve>} FresnelLUT
     * @type {{ specular: SpecularLUT, fresnel: FresnelLUT }}
     * @private
     */
    private static _lutDefinitions;
    /** @type {Object<FFLModulateType, LUTSpecularTextureType>} */
    static lutSpecularTypes: any;
    /** @type {Object<FFLModulateType, LUTFresnelTextureType>} */
    static lutFresnelTypes: any;
    /**
     * Cached LUT textures to avoid redundant generation.
     * @typedef {Object} LUTTextures
     * @property {Object<LUTSpecularTextureType, THREE.DataTexture>} specular -
     * Specular LUT textures indexed by LUT type.
     * @property {Object<LUTSpecularTextureType, THREE.DataTexture>} fresnel -
     * Fresnel LUT textures indexed by LUT type.
     */
    /**
     * @type {LUTTextures|null}
     * @private
     */
    private static _lutTextures;
    /**
     * Generates and return LUT textures.
     * @param {number} [lutSize] - Width of the LUT.
     * @returns {LUTTextures} Specular and fresnel LUT textures.
     * @public
     */
    public static getLUTTextures(lutSize?: number): {
        /**
         * -
         * Specular LUT textures indexed by LUT type.
         */
        specular: any;
        /**
         * -
         * Fresnel LUT textures indexed by LUT type.
         */
        fresnel: any;
    };
    /** @type {THREE.Color} */
    static defaultHSLightGroundColor: THREE.Color;
    /** @type {THREE.Color} */
    static defaultHSLightSkyColor: THREE.Color;
    /** @type {THREE.Color} */
    static defaultDirLightColor0: THREE.Color;
    /** @type {THREE.Color} */
    static defaultDirLightColor1: THREE.Color;
    static defaultDirLightCount: number;
    /** @type {THREE.Vector4} */
    static defaultDirLightDirAndType0: THREE.Vector4;
    /** @type {THREE.Vector4} */
    static defaultDirLightDirAndType1: THREE.Vector4;
    /** @type {THREE.Color} */
    static defaultLightColor: THREE.Color;
    /**
     * Alias for default light direction.
     * @type {THREE.Vector4}
     */
    static defaultLightDirection: THREE.Vector4;
    /**
     * Constructs a LUTShaderMaterial instance.
     * NOTE: Pass parameters in this order: side, modulateType, color
     * @param {THREE.ShaderMaterialParameters & LUTShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: THREE.ShaderMaterialParameters & LUTShaderMaterialParameters);
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
     * @type {THREE.Side|undefined}
     * @package
     */
    _side: THREE.Side | undefined;
    /**
     * Sets the texture map.
     * @param {THREE.Texture} value - The new texture map.
     */
    set map(value: THREE.Texture);
    /**
     * Gets the texture map.
     * @returns {THREE.Texture|null} The texture map.
     */
    get map(): THREE.Texture | null;
    /**
     * Sets the light direction, overriding w with -1.
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
