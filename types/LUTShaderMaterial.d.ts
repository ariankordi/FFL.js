/**
 * Custom THREE.ShaderMaterial using the LUT shader from Miitomo.
 * @augments {THREE.ShaderMaterial}
 */
export class LUTShaderMaterial extends THREE.ShaderMaterial {
    /**
     * @enum {number}
     */
    static LUTSpecularTextureType: {
        NONE: number;
        DEFAULT_02: number;
        SKIN_01: number;
        MAX: number;
    };
    /**
     * @enum {number}
     */
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
    private static lutDefinitions;
    /**
     * @type {Object<FFLModulateType, LUTSpecularTextureType>}
     */
    static modulateTypeToLUTSpecular: any;
    /**
     * @type {Object<FFLModulateType, LUTFresnelTextureType>}
     */
    static modulateTypeToLUTFresnel: any;
    /**
     * Cached LUT textures to avoid redundant generation.
     * @typedef {Object} LUTTextures
     * @property {Object<LUTSpecularTextureType, THREE.DataTexture>} specular - Specular LUT textures indexed by LUT type.
     * @property {Object<LUTSpecularTextureType, THREE.DataTexture>} fresnel - Fresnel LUT textures indexed by LUT type.
     */
    /**
     * @type {LUTTextures|null}
     * @private
     */
    private static _lutTextures;
    /**
     * Generates and return LUT textures.
     * @param {number} [lutSize=512] - Width of the LUT.
     * @returns {LUTTextures} Specular and fresnel LUT textures.
     */
    static getLUTTextures(lutSize?: number): {
        /**
         * - Specular LUT textures indexed by LUT type.
         */
        specular: any;
        /**
         * - Fresnel LUT textures indexed by LUT type.
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
     * Retrieves blending parameters based on the FFLModulateType.
     * @param {FFLModulateType} modulateType - The modulate type.
     * @returns {Object} An object containing blending parameters for the material constructor.
     * @throws {Error} Unknown modulate type
     * @private
     */
    private static getBlendOptionsFromModulateType;
    /**
     * Multiplies beard and hair colors by a factor seen
     * in libcocos2dcpp.so in order to match its rendering style.
     * Refer to: https://github.com/ariankordi/FFL-Testing/blob/16dd44c8848e0820e03f8ccb0efa1f09f4bc2dca/src/ShaderMiitomo.cpp#L587
     * @param {THREE.Vector4} color - The original color.
     * @param {FFLModulateType} modulateType - The modulate type, or type of shape.
     * @param {FFLModulateMode} modulateMode - The modulate mode, used to confirm custom body type.
     * @returns {THREE.Vector4} The final color.
     * @private
     */
    private static multiplyColorIfNeeded;
    /**
     * Constructs a LUTShaderMaterial instance.
     * @param {Object} [options={}] - Options for the material.
     * @param {FFLModulateMode} [options.modulateMode=0] - Modulate mode.
     * @param {FFLModulateType} [options.modulateType=0] - Modulate type.
     * @param {THREE.Vector4 | Array<THREE.Vector4>} [options.modulateColor] - Constant color assigned to uColor0/1/2 depending on single or array.
     * @param {boolean} [options.lightEnable=true] - Enable lighting. Needs to be off when drawing faceline/mask textures.
     * @param {THREE.Vector3} [options.lightDirection] - Light direction.
     * Uniforms:
     * @param {boolean} [options.alphaTest=false] - Enables alpha testing in the shader.
     * @param {THREE.Color} [options.hslightGroundColor] - Ground light color.
     * @param {THREE.Color} [options.hslightSkyColor] - Sky light color.
     * @param {THREE.Color} [options.dirLightColor0] - Primary directional light color.
     * @param {THREE.Color} [options.dirLightColor1] - Secondary directional light color.
     * @param {number} [options.dirLightCount=2] - Number of directional lights.
     * @param {THREE.Vector4} [options.dirLightDirAndType0] - Primary directional light vector.
     * @param {THREE.Vector4} [options.dirLightDirAndType1] - Secondary directional light vector.
     * @param {THREE.Color} [options.lightColor] - Light color.
     * General:
     * @param {THREE.Texture} [options.map=null] - Texture map/albedo texture.
     * @param {string} [options.vertexShader] - Vertex shader source.
     * @param {string} [options.fragmentShader] - Fragment shader source.
     * @param {THREE.Side} [options.side=THREE.FrontSide] - Side. This is overridden to no culling for mask shape.
     */
    constructor(options?: {
        modulateMode?: number | undefined;
        modulateType?: number | undefined;
        modulateColor?: THREE.Vector4 | THREE.Vector4[] | undefined;
        lightEnable?: boolean | undefined;
        lightDirection?: THREE.Vector3 | undefined;
        alphaTest?: boolean | undefined;
        hslightGroundColor?: THREE.Color | undefined;
        hslightSkyColor?: THREE.Color | undefined;
        dirLightColor0?: THREE.Color | undefined;
        dirLightColor1?: THREE.Color | undefined;
        dirLightCount?: number | undefined;
        dirLightDirAndType0?: THREE.Vector4 | undefined;
        dirLightDirAndType1?: THREE.Vector4 | undefined;
        lightColor?: THREE.Color | undefined;
        map?: THREE.Texture | undefined;
        vertexShader?: string | undefined;
        fragmentShader?: string | undefined;
        side?: THREE.Side | undefined;
    });
    /** @type {FFLModulateMode} */
    modulateMode: FFLModulateMode;
    /** @type {FFLModulateType} */
    modulateType: FFLModulateType;
    /** @private */
    private _modulateColor;
    /** @type {boolean} */
    lightEnable: boolean;
    /** @type {number|undefined} */
    _side: number | undefined;
    /**
     * Sets the texture map.
     * @param {THREE.Texture} value - The new texture map.
     */
    set map(value: THREE.Texture);
    /**
     * Gets the texture map.
     * @returns {THREE.Texture} The texture map.
     */
    get map(): THREE.Texture;
    /**
     * Sets the primary constant color. Will not set any other colors (uColor1/2).
     * @param {THREE.Vector4} value - The new color as Vector4.
     */
    set modulateColor(value: THREE.Vector4);
    /**
     * Gets the first/primary constant color.
     * @returns {THREE.Vector4} The color as Vector4.
     */
    get modulateColor(): THREE.Vector4;
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
import { FFLModulateMode } from './ffl.js';
import { FFLModulateType } from './ffl.js';
