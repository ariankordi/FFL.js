export default CTRShaderMaterial;
/**
 * Custom THREE.ShaderMaterial styled after 3DS Mii rendering.
 * @augments {THREE.ShaderMaterial}
 */
declare class CTRShaderMaterial extends THREE.ShaderMaterial {
    static defaultLightDirection: THREE.Vector3;
    set color(value: THREE.Color);
    /** @returns {THREE.Color|undefined} The color. */
    get color(): THREE.Color | undefined;
    _opacity: number | undefined;
    /** @param {THREE.Texture} value - The new texture map. */
    set map(value: THREE.Texture);
    /** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
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
