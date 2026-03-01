export default GeometryConverter;
declare namespace GeometryConverter {
    /**
     * Converts and normalizes CharModel {@link THREE.BufferGeometry}
     * so that the attribute data is compatible with
     * model exporters, such as THREE.GLTFExporter.
     *
     * To convert textures, see ModelTexturesConverter from ffl.js.
     * @param {THREE.BufferGeometry} geometry - The BufferGeometry from the CharModel to modify.
     * @throws {TypeError} Throws if an unsupported attribute is encountered.
     * @public
     * @todo It may be worth looking into using getX/Y/Z methods of BufferGeometry to simplify this.
     */
    function normalize(geometry: THREE.BufferGeometry): void;
    /**
     * De-interleaves an InterleavedBufferAttribute into a standalone BufferAttribute.
     * @param {THREE.InterleavedBufferAttribute} attr - The interleaved attribute.
     * @returns {THREE.BufferAttribute} A new BufferAttribute containing de-interleaved data.
     * @private
     */
    function _interleavedToBufferAttribute(attr: THREE.InterleavedBufferAttribute): THREE.BufferAttribute;
    /**
     * Creates a new Float32Array by copying only a subset of components per vertex.
     * @param {Float32Array} src - The source Float32Array.
     * @param {number} count - Number of vertices.
     * @param {number} srcItemSize - Original components per vertex.
     * @param {number} targetItemSize - Number of components to copy per vertex.
     * @returns {Float32Array} A new Float32Array with reduced component count.
     * @private
     */
    function _copyFloat32Reduced(src: Float32Array, count: number, srcItemSize: number, targetItemSize: number): Float32Array;
    /**
     * Converts a 16-bit half-float value to a 32-bit float.
     * @param {number} half - The half-float value.
     * @returns {number} The corresponding 32-bit float value.
     * @private
     */
    function _halfToFloat(half: number): number;
    /**
     * Converts a Uint16Array assumed to represent half-float values into a Float32Array.
     * @param {Uint16Array} halfArray - The Uint16Array of half-float values.
     * @returns {Float32Array} A Float32Array with converted float values.
     * @private
     */
    function _halfArrayToFloat(halfArray: Uint16Array): Float32Array;
    /**
     * Converts an Int8Array of SNORM values to a Float32Array.
     * If the targetItemSize is less than the original (e.g. for normals), only the first targetItemSize
     * components of each vertex are copied.
     * @param {Int8Array} src - The source Int8Array.
     * @param {number} count - Number of vertices.
     * @param {number} srcItemSize - Original number of components per vertex.
     * @param {number} targetItemSize - Number of components per vertex for the output.
     * @returns {Float32Array} A Float32Array with converted values.
     * @private
     */
    function _snormToFloat(src: Int8Array, count: number, srcItemSize: number, targetItemSize: number): Float32Array;
}
import * as THREE from 'three';
