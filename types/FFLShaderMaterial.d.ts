/**
 * Custom THREE.ShaderMaterial using the FFLShader.
 * @augments {THREE.ShaderMaterial}
 */
export class FFLShaderMaterial extends THREE.ShaderMaterial {
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
     * @private
     */
    private static materialParams;
    /**
     * Retrieves blending parameters based on the FFLModulateType.
     * @param {FFLModulateType} modulateType - The modulate type.
     * @returns {Object} An object containing blending parameters for the material constructor.
     * @throws {Error} Unknown modulate type
     * @private
     */
    private static getBlendOptionsFromModulateType;
    /**
     * Constructs an FFLShaderMaterial instance.
     * @param {Object} [options={}] - Options for the material.
     * @param {FFLModulateMode} [options.modulateMode=0] - Modulate mode.
     * @param {FFLModulateType} [options.modulateType=0] - Modulate type.
     * @param {THREE.Vector4 | Array<THREE.Vector4>} [options.modulateColor] - Constant color assigned to u_const1/2/3 depending on single or array.
     * @param {boolean} [options.lightEnable=true] - Enable lighting. Needs to be off when drawing faceline/mask textures.
     * @param {THREE.Vector3} [options.lightDirection] - Light direction.
     * @param {THREE.Color} [options.lightAmbient] - Ambient light color.
     * @param {THREE.Color} [options.lightDiffuse] - Diffuse light color.
     * @param {THREE.Color} [options.lightSpecular] - Specular light color.
     * @param {boolean} [options.useSpecularModeBlinn] - Whether to override specular mode on all materials with 0 (Blinn-Phong specular).
     * @param {THREE.Texture} [options.map=null] - Texture map.
     * @param {string} [options.vertexShader] - Vertex shader source.
     * @param {string} [options.fragmentShader] - Fragment shader source.
     * @param {THREE.Side} [options.side=THREE.FrontSide] - Side.
     */
    constructor(options?: {
        modulateMode?: number | undefined;
        modulateType?: number | undefined;
        modulateColor?: THREE.Vector4 | THREE.Vector4[] | undefined;
        lightEnable?: boolean | undefined;
        lightDirection?: THREE.Vector3 | undefined;
        lightAmbient?: THREE.Color | undefined;
        lightDiffuse?: THREE.Color | undefined;
        lightSpecular?: THREE.Color | undefined;
        useSpecularModeBlinn?: boolean | undefined;
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
     * Sets the primary constant color. Will not set any other colors (u_const2/3).
     * @param {THREE.Vector4} value - The new color as Vector4.
     */
    set modulateColor(value: THREE.Vector4);
    /**
     * Gets the first/primary constant color.
     * @returns {THREE.Vector4} The color as Vector4.
     */
    get modulateColor(): THREE.Vector4;
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
import { FFLModulateMode } from './ffl.js';
import { FFLModulateType } from './ffl.js';
