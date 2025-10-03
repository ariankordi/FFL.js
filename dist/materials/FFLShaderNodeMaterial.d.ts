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
    /** @param {import('../ffl').FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: import("../ffl").FFLModulateMode);
    /** @returns {import('../ffl').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
    get modulateMode(): import("../ffl").FFLModulateMode | undefined;
    /**
     * Sets the material uniforms based on the modulate type value.
     * @param {import('../ffl').FFLModulateType} value - The new modulateType value.
     */
    set modulateType(value: import("../ffl").FFLModulateType);
    /**
     * Gets the modulateType value.
     * @returns {import('../ffl').FFLModulateType|undefined} The modulateType value if it is set.
     */
    get modulateType(): import("../ffl").FFLModulateType | undefined;
    lightEnable: boolean;
    uLightAmbient: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>>;
    uLightDiffuse: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>>;
    uLightSpecular: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>>;
    uLightDir: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<import("three").Vector3>>;
    uRimColor: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>>;
    uRimPower: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<number>>;
    fragmentNode: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/src/nodes/TSL.js", { with: { "resolution-mode": "import" } }).ShaderCallNodeInternal>;
    diffuse: Color | undefined;
    color1: Color | undefined;
    color2: Color | undefined;
    _modulateMode: number | undefined;
    _modulateType: number | undefined;
    uMaterialAmbient: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>> | undefined;
    uMaterialDiffuse: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>> | undefined;
    uMaterialSpecular: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<Color>> | undefined;
    uMaterialSpecularPower: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<number>> | undefined;
    uMaterialSpecularMode: import("three/tsl", { with: { "resolution-mode": "import" } }).ShaderNodeObject<import("three/webgpu", { with: { "resolution-mode": "import" } }).UniformNode<number>> | undefined;
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
