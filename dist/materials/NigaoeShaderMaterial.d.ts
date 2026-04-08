export default NigaoeShaderMaterial;
/**
 * Custom THREE.ShaderMaterial styled after Mii rendering on the Mii Channel.
 * @augments {THREE.ShaderMaterial}
 */
declare class NigaoeShaderMaterial extends THREE.ShaderMaterial {
    static getDefaultEnvTexture(): THREE.DataTexture;
    set color(value: THREE.Color);
    /** @returns {THREE.Color|undefined} The color. */
    get color(): THREE.Color | undefined;
    /**
     * Sets the texture map (envMap uniform).
     * @param {THREE.Texture} value - The new texture map.
     */
    set envMap(value: THREE.Texture);
    /**
     * Gets the texture map if it is set.
     * @returns {THREE.Texture|null} The texture map, or null if it is unset.
     */
    get envMap(): THREE.Texture | null;
    _opacity: number | undefined;
    /** @param {THREE.Texture} value - The new texture map. */
    set map(value: THREE.Texture);
    /** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
    get map(): THREE.Texture | null;
}
import * as THREE from 'three';
