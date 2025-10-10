export default SampleShaderMaterial;
export type FFLModulateMode = number;
export type FFLModulateType = number;
export type SampleShaderMaterialColorInfo = {
    facelineColor: number;
    favoriteColor: number;
    hairColor: number;
    beardColor: number;
    /**
     * - PantsColor from ffl.js, 0-4.
     */
    pantsColor: number;
};
export type SampleShaderMaterialParameters = {
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
     * Constant color assigned to constColor1/2/3 depending on single or array.
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
     * - Texture map.
     */
    map?: THREE.Texture | undefined;
    /**
     * -
     * Info needed to resolve shader uniforms. This is required
     * or else lighting will not be applied. It can come from
     * CharModel.getColorInfo, or getColorInfoFromCharInfoB64 for glTFs.
     */
    colorInfo?: SampleShaderMaterialColorInfo | undefined;
};
export type DrawParamMaterial = {
    halfLambertFactor: number;
    sssSpecularBlendFactor: number;
    specularFactorA: number;
    specularFactorB: number;
    specularShinness: number;
    rimLightPower: number;
    rimLightWidth: number;
};
/**
 * Custom THREE.ShaderMaterial using the SampleShader.
 * @augments {THREE.ShaderMaterial}
 */
declare class SampleShaderMaterial extends THREE.ShaderMaterial {
    /** Indicates that this material requires an alpha value of 0 in the faceline color. */
    static needsFacelineAlpha: boolean;
    /**
     * Default ambient light color.
     * @type {import('three').Color}
     */
    static defaultLightColor: import("three").Color;
    /**
     * Default light direction.
     * @type {import('three').Vector3}
     */
    static defaultLightDir: import("three").Vector3;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector3}
     */
    static defaultLightDirection: import("three").Vector3;
    /**
     * Method to get colorInfo from FFLiCharInfo included in glTFs.
     * @param {string} base64 - Base64-encoded FFLiCharInfo from glTF.
     * @returns {SampleShaderMaterialColorInfo} The colorInfo for use in this material.
     * @throws {Error} Throws if the input's size does not match.
     */
    static getColorInfoFromCharInfoB64(base64: string): SampleShaderMaterialColorInfo;
    /**
     * Re-assigns normal attribute on the glass mesh to the
     * normals for glass found in ShapeHigh.dat.
     * @param {import('three').BufferGeometry} geometry -
     * The geometry in which to re-assign the normal attribute.
     */
    static assignNormalsForGlass(geometry: import("three").BufferGeometry): void;
    /**
     * @param {{modulateParam: {type: number}}} drawParam - The FFLDrawParam for the mesh to check.
     * @param {import('three').BufferGeometry} geometry - BufferGeometry to modify.
     */
    static modifyBufferGeometry(drawParam: {
        modulateParam: {
            type: number;
        };
    }, geometry: import("three").BufferGeometry): void;
    /** @typedef {import('three').IUniform<import('three').Vector4>} IUniformVector4 */
    /**
     * Constructs an SampleShaderMaterial instance.
     * @param {import('three').ShaderMaterialParameters & SampleShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: import("three").ShaderMaterialParameters & SampleShaderMaterialParameters);
    /** @type {FFLModulateType} */
    _modulateType: FFLModulateType;
    /** @package */
    _sssColorTable: (number[] | null)[];
    /** @package */
    _specularColorTable: (number[] | null)[];
    /**
     * Sets the constant color uniforms from THREE.Color.
     * @param {import('three').Color|Array<import('three').Color>} value - The
     * constant color (constColor1), or multiple (constColor1/2/3) to set the uniforms for.
     */
    set color(value: import("three").Color | Array<import("three").Color>);
    /**
     * Gets the constant color (constColor1) uniform as THREE.Color.
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
    setUniformsFromMatParam(matParam: DrawParamMaterial): void;
    /**
     * Sets the texture map (s_Tex uniform).
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
    /**
     * Sets the information about color indices that are needed
     * to resolve material table elements for shader uniforms.
     * @param {SampleShaderMaterialColorInfo} value - The colorInfo.
     * Use getColorInfo() on the CharModel to get this.
     */
    set colorInfo(value: SampleShaderMaterialColorInfo);
    get colorInfo(): SampleShaderMaterialColorInfo;
}
import * as THREE from 'three';
