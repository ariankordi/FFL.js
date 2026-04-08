/**
 * @file NigaoeShaderMaterial.js
 * Three.js shader material reproducing the lighting
 * style seen in the Wii's Mii Channel title, aka
 * Nigaoe Channel (from "drawLikeNigaoeChannel" SDK sample).
 *
 * It may be worth looking into remaking more lighting styles:
 * - Mii icons (RFL_Icon.c in RFL decomp)
 * - Wii series: Sports, Resort, Fit, Play, Play Motion
 * - (They will have more custom combiner configurations.)
 *
 * NOTE: This will NOT produce accurate colors with FFL,
 * due to colors from RFL (e.g. skin colors) all varying.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check
import * as THREE from 'three';

// // ---------------------------------------------------------------------
// //  Vertex Shader
// // ---------------------------------------------------------------------
const vertexShader = /* glsl */`
#include <skinning_pars_vertex>

#include <uv_pars_vertex>
#include <normal_pars_vertex>

varying vec2 vEnvUv;

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

	// To use OpenGL direction Y in UVs, remove the minus sign from Y.
	vEnvUv.xy = (vec2(vNormal.x, -vNormal.y) * 0.5)
		+ 0.5; // From Dolphin, cpostmtx = 0.5.
}
`;

// // ---------------------------------------------------------------------
// //  Fragment Shader
// // ---------------------------------------------------------------------
const fragmentShader = /* glsl */`
#include <map_pars_fragment>
#include <uv_pars_fragment>
#include <normal_pars_fragment>

uniform vec3 diffuse;
uniform float opacity;

uniform sampler2D envMap;
varying vec2 vEnvUv;

uniform bool lightEnable;
uniform int modulateMode;
uniform vec3 colorG;
uniform vec3 colorB;

vec4 getModulatedColor(vec4 pixel) {
	vec4 color;
	if (modulateMode == 0) { // CONSTANT
		color = vec4(diffuse, 1.0);
	} else if (modulateMode == 1) { // TEXTURE_DIRECT
		color = pixel;
	} else if (modulateMode == 2) { // RGB_LAYERED
		vec3 rgb = diffuse.rgb * pixel.r +
					colorG.rgb * pixel.g +
					colorB.rgb * pixel.b;
		color = vec4(rgb, pixel.a);
	} else if (modulateMode == 3) { // ALPHA
		color = vec4(diffuse.rgb * pixel.r, pixel.r);
	} else if (modulateMode == 4) { // LUMINANCE_ALPHA (glass)
		color = vec4(diffuse.rgb * pixel.g, pixel.r);
	} else if (modulateMode == 5) { // ALPHA_OPA (cap)
		color = vec4(diffuse.rgb * pixel.r, 1.0);
	}

	if (modulateMode != 0 && color.a == 0.0) { // != CONSTANT
		discard; // Alpha discard for mask texture.
	}
	return color;
}

void main() {
	vec4 diffuseColor = vec4(1.0); // Will be set to texture color.
	#include <map_fragment>
	#include <alphamap_fragment>

	diffuseColor = getModulatedColor(diffuseColor);

	if (lightEnable) {
		// Get specular highlight from sphere map/env texture.
		vec3 specular = texture(envMap, vEnvUv.xy).rrr; // Use red channel.
		diffuseColor.rgb += (specular * specular); // env^2
	}
	gl_FragColor = vec4(diffuseColor.rgb, diffuseColor.a * opacity);
}
`;

/**
 * Texture used as the env/sphere map, extracted from the Mii Channel in RenderDoc.
 * Converted from RGBA8 to R8 to save room, since only the single channel is used.
 */
// eslint-disable-next-line @stylistic/max-len, @stylistic/comma-spacing -- Embedded data.
const envTextureData = /* @__PURE__ */ new Uint8Array(/* @__PURE__ */ new Int32Array([1364283729,1364283729,1313952081,1179142218,1263028550,1364283726,1364283729,1364283729,1364283729,1364283729,1145523281,976895296,1094728763,1380796485,1364283729,1364283729,1364283729,1246908753,876035910,825307442,943076402,1195523643,1364283981,1364283729,1364283729,1095323985,774713401,909324335,1060912184,1060845884,1364347973,1364283729,1364283729,859785040,740961069,1010250800,1162232383,994198342,1363821629,1364283729,1364283729,707737927,774514473,1178614323,1381060426,1179340883,1229012028,1364283730,1230131537,640298814,892151846,1347044157,1650482262,1347837281,1128022345,1364283979,1112232273,606414899,1009986854,1532251204,1919904099,1516596850,1027688530,1364282948,927355217,622994732,1111110185,1666929484,-2055309971,1752596870,994464090,1364346687,792480593,639705894,1195324975,1784764496,-1752268426,1988662683,1112233572,1364017211,691422546,673325092,1279474224,1869045590,-1533572486,-2137807702,1146117229,1380400445,640696654,723852834,1346780468,1953194585,-1449357953,-2070238546,1179672688,1329805887,623721802,757472800,1346911797,1953260892,-1550283905,-2104187994,1179672431,1262500415,590035784,791093023,1397374775,1970103387,-1785690499,2072679577,1179671916,1228749119,556349255,791158557,1363754807,1919640666,-1987739527,1937672074,1112431206,1178220860,556283205,791093020,1363623735,1885888601,2105309557,1769175421,1078613344,1111045691,556283205,757538589,1296383284,1801739606,1936945521,1651076721,1011240793,1110980152,556349001,740695837,1245854260,1700747601,1802267240,1499489897,926894418,1178154036,556415561,707009565,1195324977,1582912333,1633968993,1381522784,876233290,1211708209,606944586,656546590,1094464557,1448168775,1499093336,1229935703,791886402,1262236719,623919438,606018590,1026961450,1296713282,1347572047,1111903055,757937209,1329607470,674514258,555490337,909192231,1161969466,1195919430,960381509,740961843,1380136750,758795089,488316708,808199971,1010382644,1027620671,808859963,724052011,1363884592,893604177,471736873,723984927,875770157,892745526,707604531,757671461,1364279861,1061966161,471934512,606149915,741026342,758000941,606480683,841623332,1364282428,1230131537,556149819,505158429,656745249,640100135,589373988,976169509,1364283976,1347506513,657274949,454893346,522067227,505356063,623059231,1144467242,1364283729,1364283729,792347984,505488425,471670302,522067485,723919906,1346648367,1364283729,1364283729,1044992337,623455285,555819300,606216481,875374886,1364347196,1364283729,1364283729,1263685969,808663876,690563372,741026089,1111044913,1364283980,1364283729,1364283729,1364283729,1044597585,875836985,959919412,1363886910,1364283729,1364283729,1364283729,1364283729,1330729297,1111902284,1279805250,1364283727,1364283729,1364283729]).buffer);

/**
 * Custom THREE.ShaderMaterial styled after Mii rendering on the Mii Channel.
 * @augments {THREE.ShaderMaterial}
 */
class NigaoeShaderMaterial extends THREE.ShaderMaterial {
	/** @param {THREE.ShaderMaterialParameters} [options] - Parameters for the material. */
	constructor(options = {}) {
		// Set default uniforms.
		/** @type {Object<string, THREE.IUniform>} */
		const uniforms = {
			opacity: { value: 1 }
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
		this.envMap = NigaoeShaderMaterial.getDefaultEnvTexture();

		// Set defaults so that they are considered valid parameters.
		this.color = /* @__PURE__ */ new THREE.Color();
		this.colorG = /* @__PURE__ */ new THREE.Color();
		this.colorB = /* @__PURE__ */ new THREE.Color();
		this.lightEnable = true;
		this.modulateType = 0;

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
		// eslint-disable-next-line no-self-assign -- Commit opacity uniform from temporary storage.
		this.opacity = this.opacity;
	}

	static getDefaultEnvTexture() {
		const r8 = Number(THREE.REVISION) <= 136
			? /** @type {THREE.PixelFormat} */ (1024) // THREE.LuminanceFormat
			: THREE.RedFormat;
		const texture = /* @__PURE__ */ new THREE.DataTexture(
			envTextureData, 32, 32, r8, THREE.UnsignedByteType);
		// envTexture.flipY = true; // 1. This flips on CPU, 2. The fragment shader flips Y already.
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.needsUpdate = true;
		return texture;
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

	/**
	 * Gets the texture map if it is set.
	 * @returns {THREE.Texture|null} The texture map, or null if it is unset.
	 */
	get envMap() {
		return this.uniforms.envMap ? this.uniforms.envMap.value : null;
	}

	/**
	 * Sets the texture map (envMap uniform).
	 * @param {THREE.Texture} value - The new texture map.
	 */
	set envMap(value) {
		this.uniforms.envMap = { value: value };
	}

	/** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
	get map() {
		return this.uniforms.map ? this.uniforms.map.value : null;
	}

	/** @param {THREE.Texture} value - The new texture map. */
	set map(value) {
		this.uniforms.map = { value: value };
	}

	// For modulate:

	/** @returns {THREE.Color|undefined} colorG color if defined. */
	get colorG() {
		return this.uniforms.colorG ? this.uniforms.colorG.value : undefined;
	}

	set colorG(/** @type {THREE.Color} */ value) {
		this.uniforms.colorG = { value };
	}

	/** @returns {THREE.Color|undefined} colorB color if defined. */
	get colorB() {
		return this.uniforms.colorB ? this.uniforms.colorB.value : undefined;
	}

	set colorB(/** @type {THREE.Color} */ value) {
		this.uniforms.colorB = { value };
	}

	/** @returns {number|null} The modulateMode value, or null if it is unset. */
	get modulateMode() {
		return this.uniforms.modulateMode ? this.uniforms.modulateMode.value : null;
	}

	/** @param {number} value - The new modulateMode value. */
	set modulateMode(value) {
		this.uniforms.modulateMode = { value: value };
	}

	/**
	 * Sets the value determining whether lighting is enabled or not.
	 * @returns {boolean|null} The lightEnable value, or null if it is unset.
	 */
	get lightEnable() {
		return this.uniforms.lightEnable ? this.uniforms.lightEnable.value : null;
	}

	/**
	 * Sets the value determining whether lighting is enabled or not.
	 * @param {boolean} value - The lightEnable value.
	 */
	set lightEnable(value) {
		this.uniforms.lightEnable = { value };
	}
}

export default NigaoeShaderMaterial;
