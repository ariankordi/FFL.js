var CTRShaderMaterial = (function(three) {

//#region rolldown:runtime
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
three = __toESM(three);

//#region materials/CTRShaderMaterial.js
/**
	* @file NigaoeShaderMaterial.js
	* Three.js shader material reproducing the Blinn-Phong
	* lighting seen in the 3DS's Mii Maker title.
	* Partially derived from Citra's shader generator.
	* @author Arian Kordi <https://github.com/ariankordi>
	*/
	const vertexShader = `
#include <skinning_pars_vertex>
#include <uv_pars_vertex>
#include <normal_pars_vertex>

// Normquat encoding of view-space normal.
varying vec4 vNormquat; // vs_out_attr1
varying vec3 vViewPosition; // vs_out_attr2

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

	vViewPosition = -mvPosition.xyz;

	float t = 0.5 * (1.0 + vNormal.z);
	float rsqt = inversesqrt(t);
	vNormquat = vec4(0.5 * vNormal.xy * rsqt, 1.0 / rsqt, 0.0);
}
`;
	const fragmentShader = `
#include <uv_pars_fragment>
#include <map_pars_fragment>

uniform vec3 diffuse;
uniform float opacity;

uniform vec3 lightDirection;

varying vec4 vNormquat; // vs_out_attr1
varying vec3 vViewPosition; // vs_out_attr2

// These are usually uniforms, but for simplicity they are constants here.
const vec3 shadowColor = vec3(0.07843, 0.09020, 0.10196);
const vec3 specular0 = vec3(0.99608, 0.99608, 0.99608);

vec3 quaternionRotate(vec4 q, vec3 v) { // glsl_fs_shader_gen.cpp:1315
	return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

float getSpecular(float pos) {
	// Get from look-up table. (Citra: LookupLightingLUTUnsigned)
	// int index = int(clamp(floor(pos * 256.0), 0.f, 255.f)); // clamp may not be needed
	// return specLUT_R[index];

	// Expression that approximates the look-up table. Not pixel exact.
	// This results in lighting that looks "brighter" than it should.
	return pow(max(pos, 0.0), 8.0) * 0.42; // set to 18 and kinda looks like wii

	// A similar expression is probably used to generate the
	// LUT table itself, but I haven't looked into this yet.
}
// The look-up table can be captured from Mii Maker in Citra,
// however some games (such as niconico) contain a H3d BCH called
// "Mii_Material.bch", and StreetPass Mii Plaza has this as a model.

void main() {
	vec4 diffuseColor = vec4(diffuse, 1.0); // Color/texel from Three.js.
	#include <map_fragment>
	#include <alphamap_fragment>

	// Rotate the surface-local normal by the interpolated
	// normal quaternion to convert it to eyespace.
	// (glsl_fs_shader_gen.cpp:L555-L556)
	vec4 normNormquat = normalize(vNormquat);
	vec3 normal = quaternionRotate(normNormquat, vec3(0.0, 0.0, 1.0));

	// The following produces Blinn-Phong specular lighting.

	// Get diffuse color.
	float d = max(dot(lightDirection, normal), 0.0);
	vec3 primary = vec3(d * specular0); // primary_fragment_color

	// Defined in Citra as half_vector (glsl_fs_shader_gen.cpp:642)
	vec3 H = normalize(normalize(vViewPosition) + lightDirection);
	float NdotH = max(dot(normal, H), 0.0);

	// Multiply LUT and constant specular color.
	vec3 secondary = getSpecular(NdotH) * specular0; // secondary_fragment_color

	// Combiner stage 0.
	vec3 fragColor = diffuseColor.rgb;
	// Combiner stage 1.
	fragColor.rgb = (1.0 - primary) * shadowColor;
	// Combiner stage 2.
	fragColor.rgb = (1.0 - fragColor.rgb) * diffuseColor.rgb + secondary;

	gl_FragColor = vec4(fragColor, diffuseColor.a * opacity);
}
`;
	/**
	* Custom THREE.ShaderMaterial styled after 3DS Mii rendering.
	* @augments {THREE.ShaderMaterial}
	*/
	var CTRShaderMaterial = class CTRShaderMaterial extends three.ShaderMaterial {
		static defaultLightDirection = /* @__PURE__ */ new three.Vector3(-.53906, .53906, .64697);
		/**
		* Constructs an  instance.
		* @param {THREE.ShaderMaterialParameters} [options] -
		* Parameters for the material.
		*/
		constructor(options = {}) {
			/** @type {Object<string, THREE.IUniform>} */
			const uniforms = {
				opacity: { value: 1 },
				lightDirection: { value: CTRShaderMaterial.defaultLightDirection.clone() }
			};
			const blankMatrix3 = { value: /* @__PURE__ */ new three.Matrix3() };
			if (Number(three.REVISION) < 151) uniforms.uvTransform = blankMatrix3;
			else uniforms.mapTransform = blankMatrix3;
			super({
				vertexShader,
				fragmentShader,
				uniforms
			});
			this.color = /* @__PURE__ */ new three.Color();
			this.setValues(options);
			this.opacity = this.opacity;
		}
		/** @returns {THREE.Color|undefined} The color. */
		get color() {
			return this.uniforms.diffuse ? this.uniforms.diffuse.value : void 0;
		}
		set color(value) {
			this.uniforms.diffuse = { value };
		}
		/**
		* Gets the opacity of the constant color.
		* @returns {number} The opacity value.
		*/
		get opacity() {
			if (this._opacity !== void 0) {
				const ret = this._opacity;
				this._opacity = void 0;
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
		set opacity(value) {
			if (this.uniforms) {
				this.uniforms.opacity = { value };
				this._opacity = void 0;
			} else
 /** @type {number|undefined} @private */
			this._opacity = value;
		}
		/** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
		get map() {
			return this.uniforms.map ? this.uniforms.map.value : null;
		}
		/** @param {THREE.Texture} value - The new texture map. */
		set map(value) {
			this.uniforms.map = { value };
		}
		/**
		* Gets the light direction.
		* @returns {THREE.Vector3} The light direction.
		*/
		get lightDirection() {
			return this.uniforms.lightDirection.value;
		}
		/**
		* Sets the light direction.
		* @param {THREE.Vector3} value - The new light direction.
		*/
		set lightDirection(value) {
			this.uniforms.lightDirection = { value };
		}
	};
	var CTRShaderMaterial_default = CTRShaderMaterial;

//#endregion
return CTRShaderMaterial_default;
})(THREE);