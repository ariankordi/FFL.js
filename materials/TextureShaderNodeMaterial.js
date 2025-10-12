/**
 * @file TextureShaderNodeMaterial.js
 * Three.js node material class (for WebGPURenderer) that handles
 * FFL modulated/swizzled textures with mixed colors.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check
import { Color } from 'three';
import {
	Fn, uniform, materialReference, float, vec4, int
} from 'three/tsl';
import { NodeMaterial } from 'three/webgpu';

// TODO: This type should not be any.
/** @typedef {import('three/tsl').ShaderNodeObject<*>} ShaderNodeObject */

/**
 * A NodeMaterial (TSL/WebGPURenderer) that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 */
export default class TextureShaderNodeMaterial extends NodeMaterial {
	/** @param {import('three').MeshBasicMaterialParameters & {color?: Color|Array<Color>}} [options] - Options */
	constructor(options = {}) {
		super();

		// TODO: Why aren't these set by "setValues" automatically?

		this.map = options.map; // Set texture map.
		// Use setter to set all colors if they are there.
		this.color = options.color ?? new Color();

		// Set FFL specific defaults so they are considered valid parameters.
		this.modulateMode = this.modulateType = 0;
		this.lightEnable = false;

		this.setValues(options); // Set all from options.

		// TODO: This should use colorNode instead.
		// However, whenever I try, I see: "No stack defined for assign operation."
		// This error is very obtuse and always stumps me.
		// I seemingly get the same error any time I don't have a fragmentNode.
		// So, for now this will use the fragmentNode, which is ok since it can still be combined.
		this.fragmentNode = TextureShaderNodeMaterial.fragmentNode({
			diffuse: uniform(this.diffuse),
			color1: uniform(this.color1),
			color2: uniform(this.color2),
			opacity: uniform(this.opacity),
			modulateMode: uniform(this.modulateMode),
			texel: this.map ? materialReference('map', 'texture') : null
		});
	}

	/**
	 * @typedef {Object} FragmentInputs
	 * @property {ShaderNodeObject} diffuse - color
	 * @property {ShaderNodeObject} color1 - color
	 * @property {ShaderNodeObject} color2 - color
	 * @property {ShaderNodeObject} opacity - float
	 * @property {ShaderNodeObject} modulateMode - int
	 * @property {ShaderNodeObject|null} texel - texture
	 */
	/** @type {import('three/src/nodes/tsl/TSLBase.js').ShaderNodeFn<[FragmentInputs]>} */
	static fragmentNode = Fn((/** @type {FragmentInputs} */ args) => {
		const { diffuse, color1, color2, opacity, modulateMode, texel } = args;
		// Start with diffuse/opacity.
		const diffuseColor = vec4(diffuse, opacity);

		if (!texel) {
			return diffuseColor;
		}
		// Sample map.
		// const texel = texture(textureMap, uv());

		// Default map behavior (equivalent to <map_fragment> multiply).
		const baseResult = vec4(
			diffuseColor.rgb.mul(texel.rgb),
			diffuseColor.a.mul(texel.a)
		);

		// Precompute all modulate modes.
		const rgbLayered = vec4(
			diffuse
				.mul(texel.r)
				.add(color1.mul(texel.g))
				.add(color2.mul(texel.b)),
			texel.a
		);
		const alpha = vec4(diffuse.mul(texel.r), texel.r);
		const luminanceAlpha = vec4(diffuse.mul(texel.g), texel.r);
		const alphaOpa = vec4(diffuse.mul(texel.r), 1);

		// Flags for selection: f2..f5 are 1.0 if modulateMode == 2/3/4/5 else 0.0.
		const eq2 = float(modulateMode.equal(int(2)));
		const eq3 = float(modulateMode.equal(int(3)));
		const eq4 = float(modulateMode.equal(int(4)));
		const eq5 = float(modulateMode.equal(int(5)));

		// For default behavior (mode 0 or any other not in 2..5),
		// use baseResult. Weight = 1 - (f2+f3+f4+f5).
		const eq0 = float(1).sub(eq2.add(eq3).add(eq4).add(eq5));

		const outColor = vec4(
			baseResult.mul(eq0)
				.add(rgbLayered.mul(eq2))
				.add(alpha.mul(eq3))
				.add(luminanceAlpha.mul(eq4))
				.add(alphaOpa.mul(eq5))
		);

		// TODO: Alpha testing / if (modulateMode != 0 && outColor.a == 0.0) discard;

		return outColor;
	});

	/**
	 * Gets the constant color (diffuse) uniform as THREE.Color.
	 * @returns {import('three').Color|undefined} The constant color if set.
	 */
	get color() {
		return this.diffuse;
	}

	/**
	 * Sets the constant color uniforms from THREE.Color.
	 * @param {import('three').Color|Array<import('three').Color>} value -
	 * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
	 */
	set color(value) {
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances.
			this.diffuse = value[0];
			this.color1 = value[1];
			this.color2 = value[2];
		} else {
			// Otherwise, assign diffuse and the other colors
			// all to the single color instance.
			this.diffuse = this.color1 = this.color2 = value;
		}
	}

	/** @returns {import('../ffl.js').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
	get modulateMode() {
		return this._modulateMode;
	}

	/** @param {import('../ffl.js').FFLModulateMode} value - The new modulateMode value. */
	set modulateMode(value) {
		this._modulateMode = value;
	}
}
