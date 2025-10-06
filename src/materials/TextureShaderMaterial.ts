import * as THREE from 'three';
import { FFLModulateMode } from '../enums';

/**
 * A material class that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 * @augments {THREE.ShaderMaterial}
 */
export default class TextureShaderMaterial extends THREE.ShaderMaterial {
	public lightEnable: boolean;
	public modulateType: number;
	public _color3?: THREE.Color;

	/**
	 * @typedef {Object} TextureShaderMaterialParameters
	 * @property {FFLModulateMode} [modulateMode] - Modulate mode.
	 * @property {FFLModulateType} [modulateType] - Modulate type.
	 * @property {import('three').Color|Array<import('three').Color>} [color] -
	 * Constant color assigned to u_const1/2/3 depending on single or array.
	 */

	/**
	 * The material constructor.
	 * @param {THREE.ShaderMaterialParameters & TextureShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		// Set default uniforms.
		const uniforms: Record<string, THREE.IUniform> = {
			opacity: { value: 1.0 }
		};
		const blankMatrix3 = { value: new THREE.Matrix3() };
		if (Number(THREE.REVISION) < 151) {
			uniforms.uvTransform = blankMatrix3;
		} else {
			uniforms.mapTransform = blankMatrix3;
		}

		// Construct the ShaderMaterial using the shader source.
		super({
			vertexShader: /* glsl */`
				#include <common>
				#include <uv_pars_vertex>

				void main() {
					#include <begin_vertex>
					#include <uv_vertex>
					#include <project_vertex>
				}`,
			fragmentShader: /* glsl */`
				#include <common>
				#include <uv_pars_fragment>
				#include <map_pars_fragment>
				uniform vec3 diffuse;
				uniform float opacity;
				uniform int modulateMode;
				uniform vec3 color1;
				uniform vec3 color2;

				void main() {
					vec4 diffuseColor = vec4( diffuse, opacity );

					#include <map_fragment>
					#include <alphamap_fragment>
				#ifdef USE_MAP
					if (modulateMode == 2) { // FFL_MODULATE_MODE_RGB_LAYERED
					diffuseColor = vec4(
					  diffuse.rgb * sampledDiffuseColor.r +
					  color1.rgb * sampledDiffuseColor.g +
					  color2.rgb * sampledDiffuseColor.b,
					  sampledDiffuseColor.a
					);
				  } else if (modulateMode == 3) { // FFL_MODULATE_MODE_ALPHA
					diffuseColor = vec4(
					  diffuse.rgb * sampledDiffuseColor.r,
					  sampledDiffuseColor.r
					);
				  } else if (modulateMode == 4) { // FFL_MODULATE_MODE_LUMINANCE_ALPHA
					diffuseColor = vec4(
					  diffuse.rgb * sampledDiffuseColor.g,
					  sampledDiffuseColor.r
					);
				  } else if (modulateMode == 5) { // FFL_MODULATE_MODE_ALPHA_OPA
					diffuseColor = vec4(
					  diffuse.rgb * sampledDiffuseColor.r,
					  1.0
					);
				  }
				#endif

				  // avoids little outline around mask elements
				  if (modulateMode != 0 && diffuseColor.a == 0.0) { // FFL_MODULATE_MODE_CONSTANT
					  discard;
				  }

					gl_FragColor = diffuseColor;
					//#include <colorspace_fragment>
				}`,
			uniforms: uniforms
		});
		// Set defaults so that they are valid parameters.
		this.lightEnable = false;
		this.modulateType = 0;

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
	}

	/**
	 * Gets the constant color (diffuse) uniform as THREE.Color.
	 * @returns {import('three').Color|null} The constant color, or null if it is not set.
	 */
	get color(): THREE.Color | null {
		return this.uniforms.diffuse ? this.uniforms.diffuse.value : null;
	}

	/**
	 * Sets the constant color uniforms from THREE.Color.
	 * @param {import('three').Color|Array<import('three').Color>} value -
	 * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
	 */
	set color(value: THREE.Color | THREE.Color[]) {
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances.
			this.uniforms.diffuse = { value: value[0] };
			this.uniforms.color1 = { value: value[1] };
			this.uniforms.color2 = { value: value[2] };
			return;
		}
		// Set single color as THREE.Color, defaulting to white.
		const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
		this._color3 = color3;
		this.uniforms.diffuse = { value: color3 };
	}

	/** @returns {FFLModulateMode|null}The modulateMode value, or null if it is unset. */
	get modulateMode(): FFLModulateMode | null {
		return this.uniforms.modulateMode ? this.uniforms.modulateMode.value : null;
	}

	/** @param {FFLModulateMode} value - The new modulateMode value. */
	set modulateMode(value: FFLModulateMode) {
		this.uniforms.modulateMode = { value: value };
	}

	/** @returns {import('three').Texture|null}The texture map, or null if it is unset. */
	get map(): THREE.Texture | null {
		return this.uniforms.map ? this.uniforms.map.value : null;
	}

	/** @param {import('three').Texture} value - The new texture map. */
	set map(value: THREE.Texture) {
		this.uniforms.map = { value: value };
	}
}
