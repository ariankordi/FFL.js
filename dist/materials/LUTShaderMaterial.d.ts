export default LUTShaderMaterial;
export type FFLModulateMode = number;
export type FFLModulateType = number;
export type LUTShaderMaterialParameters = {
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
     * Constant color assigned to uColor0/1/2 depending on single or array.
     */
    color?: THREE.Color | THREE.Color[] | undefined;
    /**
     * - Light direction.
     */
    lightDirection?: THREE.Vector3 | undefined;
    /**
     * - Enable lighting. Needs to be off when drawing faceline/mask textures.
     */
    lightEnable?: boolean | undefined;
    /**
     * - Texture map.
     */
    map?: THREE.Texture | undefined;
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
     * @package
     */
    static lutDefinitions: {
        specular: any;
        fresnel: any;
    };
    /** @type {Object<FFLModulateType, LUTSpecularTextureType>} */
    static modulateTypeToLUTSpecular: any;
    /** @type {Object<FFLModulateType, LUTFresnelTextureType>} */
    static modulateTypeToLUTFresnel: any;
    /**
     * Cached LUT textures to avoid redundant generation.
     * @typedef {Object} LUTTextures
     * @property {Object<LUTSpecularTextureType, import('three').DataTexture>} specular -
     * Specular LUT textures indexed by LUT type.
     * @property {Object<LUTSpecularTextureType, import('three').DataTexture>} fresnel -
     * Fresnel LUT textures indexed by LUT type.
     */
    /**
     * @type {LUTTextures|null}
     * @package
     */
    static _lutTextures: {
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
    } | null;
    /**
     * Generates and return LUT textures.
     * @param {number} [lutSize] - Width of the LUT.
     * @returns {LUTTextures} Specular and fresnel LUT textures.
     */
    static getLUTTextures(lutSize?: number): {
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
    /** @type {import('three').Color} */
    static defaultHSLightGroundColor: import("three").Color;
    /** @type {import('three').Color} */
    static defaultHSLightSkyColor: import("three").Color;
    /** @type {import('three').Color} */
    static defaultDirLightColor0: import("three").Color;
    /** @type {import('three').Color} */
    static defaultDirLightColor1: import("three").Color;
    static defaultDirLightCount: number;
    /** @type {import('three').Vector4} */
    static defaultDirLightDirAndType0: import("three").Vector4;
    /** @type {import('three').Vector4} */
    static defaultDirLightDirAndType1: import("three").Vector4;
    /** @type {import('three').Color} */
    static defaultLightColor: import("three").Color;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector4}
     */
    static defaultLightDirection: import("three").Vector4;
    /**
     * Multiplies beard and hair colors by a factor seen
     * in libcocos2dcpp.so in order to match its rendering style.
     * Refer to: https://github.com/ariankordi/FFL-Testing/blob/16dd44c8848e0820e03f8ccb0efa1f09f4bc2dca/src/ShaderMiitomo.cpp#L587
     * @param {import('three').Color} color - The original color.
     * @param {FFLModulateType} modulateType - The modulate type, or type of shape.
     * @param {FFLModulateMode} modulateMode - The modulate mode, used to confirm custom body type.
     * @returns {import('three').Color} The final color.
     * @package
     */
    static multiplyColorIfNeeded(color: import("three").Color, modulateType: FFLModulateType, modulateMode: FFLModulateMode): import("three").Color;
    /** @typedef {import('three').IUniform<import('three').Vector4>} IUniformVector4 */
    /**
     * Constructs a LUTShaderMaterial instance.
     * NOTE: Pass parameters in this order: side, modulateType, color
     * @param {import('three').ShaderMaterialParameters & LUTShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: import("three").ShaderMaterialParameters & LUTShaderMaterialParameters);
    /** @type {FFLModulateType} */
    _modulateType: FFLModulateType;
    /**
     * Sets the constant color uniforms from THREE.Color.
     * @param {import('three').Color|Array<import('three').Color>} value - The
     * constant color (uColor0), or multiple (uColor0/1/2) to set the uniforms for.
     */
    set color(value: import("three").Color | Array<import("three").Color>);
    /**
     * Gets the constant color (uColor0) uniform as THREE.Color.
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
    /** @type {number|undefined} */
    _side: number | undefined;
    /**
     * Sets the texture map.
     * @param {import('three').Texture} value - The new texture map.
     */
    set map(value: import("three").Texture);
    /**
     * Gets the texture map.
     * @returns {THREE['Texture']} The texture map.
     */
    get map(): typeof THREE.Texture;
    /**
     * Sets the light direction, overriding w with -1.
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
