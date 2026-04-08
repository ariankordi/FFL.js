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
     * - Texture map.
     */
    map?: THREE.Texture | null;
    /**
     * -
     * Info needed to resolve shader uniforms. This is required
     * or else lighting will not be applied. It can come from
     * CharModel.getColorInfo, or getColorInfoFromCharInfoB64 for glTFs.
     */
    colorInfo?: SampleShaderMaterialColorInfo;
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
     * @type {THREE.Color}
     */
    static defaultLightColor: THREE.Color;
    /**
     * Default light direction.
     * @type {THREE.Vector3}
     */
    static defaultLightDir: THREE.Vector3;
    /**
     * Alias for default light direction.
     * @type {THREE.Vector3}
     */
    static defaultLightDirection: THREE.Vector3;
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
     * @param {THREE.BufferGeometry} geometry -
     * The geometry in which to re-assign the normal attribute.
     */
    static assignNormalsForGlass(geometry: THREE.BufferGeometry): void;
    /**
     * @param {{modulateParam: {type: number}}} drawParam - The FFLDrawParam for the mesh to check.
     * @param {THREE.BufferGeometry} geometry - BufferGeometry to modify.
     */
    static modifyBufferGeometry(drawParam: {
        modulateParam: {
            type: number;
        };
    }, geometry: THREE.BufferGeometry): void;
    /**
     * Constructs an SampleShaderMaterial instance.
     * @param {THREE.ShaderMaterialParameters & SampleShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: THREE.ShaderMaterialParameters & SampleShaderMaterialParameters);
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
    /** @private */
    private _sssColorTable;
    /** @private */
    private _specularColorTable;
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
