// @ts-check
import * as THREE from 'three';

// Also see (for more shader chunk use): https://github.com/mrdoob/three.js/blob/1639cfb8505b4b1a812ff6e856ff04e8f8b0bdbb/src/renderers/shaders/ShaderLib/meshnormal.glsl.js#L10
// // ---------------------------------------------------------------------
// //  Vertex Shader
// // ---------------------------------------------------------------------
const vertexShader = /* glsl */`
#include <skinning_pars_vertex>
#include <uv_pars_vertex>
#include <normal_pars_vertex>

varying vec4 fragNormquat;  // normquat encoding of view-space normal (matches vs_out_attr1)
varying vec3 fragViewPos;   // negated view-space pos = Citra vs_out_attr2 = "view" in FS

void main() {
	#include <begin_vertex>
	#include <beginnormal_vertex>
	#include <skinbase_vertex>
	#include <skinning_vertex>

	#include <project_vertex>
	#include <uv_vertex>

	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	fragViewPos = -mvPosition.xyz;

	// Encode as normquat: rotation quaternion from (0,0,1) to N, w=0.
	// Citra VS instructions 19-28: t=0.5*(1+Nz), q.xy=0.5*N.xy*rsq(t), q.z=sqrt(t), q.w=0
	// quaternion_rotate(q, (0,0,1)) = N exactly.
	float t = 0.5 * (1.0 + transformedNormal.z);
	if (t > 0.0) {
	    float rsqt = inversesqrt(t);
	    fragNormquat = vec4(0.5 * transformedNormal.xy * rsqt, 1.0 / rsqt, 0.0);
	} else {
	    fragNormquat = vec4(0.0, 1.0, 0.0, 0.0);  // Nz=-1 edge case
	}
}
`;

// // ---------------------------------------------------------------------
// //  Fragment Shader
// // ---------------------------------------------------------------------
const fragmentShader = /* glsl */`
#include <uv_pars_fragment>
#include <map_pars_fragment>

uniform vec3 diffuse;
uniform float opacity;

uniform vec3 lightDirection;

varying vec4 fragNormquat;  // normquat encoding of view-space normal (matches vs_out_attr1)
varying vec3 fragViewPos;   // negated view-space pos = Citra vs_out_attr2 = "view" in FS

const vec3 shadowColor = vec3(0.07843, 0.09020, 0.10196);
const vec3 specular0 = vec3(0.99608, 0.99608, 0.99608);

vec3 quaternion_rotate(vec4 q, vec3 v) {
	return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec3 byteround(vec3 x) {
	return floor(x * 255.0 + 0.5) / 255.0;
}

void main() {
	vec4 diffuseColor = vec4(diffuse, 1.0);
	#include <map_fragment>
	#include <alphamap_fragment>

	// Reconstruct normal from normquat (matches Citra FS exactly)
	vec3 normal = quaternion_rotate(normalize(fragNormquat), vec3(0.0, 0.0, 1.0));

	// Diffuse (TEV primary_fragment_color)
	float d = max(dot(lightDirection, normal), 0.0);
	vec3 primary = clamp(byteround(vec3(d * specular0)), 0.0, 1.0);

	// Specular via D0 LUT (Citra formula: R[idx] + G[idx]*delta, idx=floor(NdotH*256))
	// fragViewPos = -viewSpacePos = Citra "view"; half_vector = normalize(view) + lightDirection
	vec3 H = normalize(normalize(fragViewPos) + lightDirection);
	float NdotH = max(dot(normal, H), 0.0);

	// float scaled = clamp(NdotH * 256.0, 0.0, 255.0);
	// int lutIdx = int(floor(scaled));
	// float specVal = specLUT_R[lutIdx];

	// Approximate — replaces the 256-entry table, not pixel-exact
	float specVal = pow(max(NdotH, 0.0), 8.0) * 0.42; // set to 18 and kinda looks like wii

	vec3 secondary = clamp(specVal * specular0, 0.0, 1.0);

	// TEV stages with byteround quantization after each stage
	// vec3 tex0 = byteround(colDiffuse.rgb);
	vec3 stage0 = byteround(clamp(diffuseColor.rgb, 0.0, 1.0));
	vec3 stage1 = byteround(clamp((vec3(1.0) - primary) * shadowColor, 0.0, 1.0));
	vec3 color = clamp((vec3(1.0) - stage1) * stage0 + secondary, 0.0, 1.0);
	gl_FragColor = vec4(color.rgb, diffuseColor.a * opacity);
}
`;

/**
 * Custom THREE.ShaderMaterial styled after 3DS Mii rendering.
 * @augments {THREE.ShaderMaterial}
 */
class CtrLutMaterial extends THREE.ShaderMaterial {
	static defaultLightDir = /* @__PURE__ */ new THREE.Vector3(-0.53906, 0.53906, 0.64697);

	/**
	 * Constructs an  instance.
	 * @param {THREE.ShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		// Set default uniforms.
		/** @type {Object<string, THREE.IUniform>} */
		const uniforms = {
			opacity: { value: 1 },
			lightDirection: { value: CtrLutMaterial.defaultLightDir.clone() }
		};
		const blankMatrix3 = { value: /* @__PURE__ */ new THREE.Matrix3() };
		if (Number(THREE.REVISION) < 151) {
			uniforms.uvTransform = blankMatrix3;
		} else {
			uniforms.mapTransform = blankMatrix3;
		}

		// Construct the ShaderMaterial using the shader source.
		super({
			vertexShader,
			fragmentShader,
			uniforms
		});

		// Initialize default values.
		this.color = /* @__PURE__ */ new THREE.Color();

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
		// eslint-disable-next-line no-self-assign -- Commit opacity uniform from temporary storage.
		this.opacity = this.opacity;
	}

	/** @returns {THREE.Color|undefined} The color. */
	get color() {
		return this.uniforms.diffuse ? this.uniforms.diffuse.value : undefined;
	}

	set color(/** @type {THREE.Color} */ value) {
		this.uniforms.diffuse = { value: value };
	}

	/**
	 * Gets the opacity of the constant color.
	 * @returns {number} The opacity value.
	 */
	// @ts-ignore - Already defined on parent class.
	get opacity() {
		if (this._opacity !== undefined) {
			const ret = this._opacity;
			this._opacity = undefined;
			return ret;
		}
		return this.uniforms.opacity ? this.uniforms.opacity.value : 1;
	}

	/**
	 * Sets the opacity of the constant color.
	 * NOTE: that this is actually set in the constructor
	 * of Material, meaning it is the only one set BEFORE uniforms are
	 * @param {number} value - The new opacity value.
	 */
	// @ts-ignore - Already defined on parent class.
	set opacity(value) {
		if (this.uniforms) {
			this.uniforms.opacity = { value };
			this._opacity = undefined;
		} else {
			// Store here for later when color is set.
			/** @type {number|undefined} @private */
			this._opacity = value;
		}
	}

	/** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
	get map() {
		return this.uniforms.map ? this.uniforms.map.value : null;
	}

	/** @param {THREE.Texture} value - The new texture map. */
	set map(value) {
		this.uniforms.map = { value: value };
	}

	/**
	 * Gets the light direction.
	 * @returns {THREE.Vector3} The light direction.
	 */
	get lightDirection() {
		// Should always be set as long as this is constructed.
		return this.uniforms.lightDirection.value;
	}

	/**
	 * Sets the light direction.
	 * @param {THREE.Vector3} value - The new light direction.
	 */
	set lightDirection(value) {
		this.uniforms.lightDirection = { value: value };
	}
}

export default CtrLutMaterial;
