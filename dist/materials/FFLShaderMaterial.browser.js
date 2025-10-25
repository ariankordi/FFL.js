var FFLShaderMaterial = (function(three) {

//#region rolldown:runtime
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
three = __toESM(three);

//#region materials/FFLShaderMaterial.js
/**
	* @typedef {number} FFLModulateMode
	* @typedef {number} FFLModulateType
	*/
	/**
	* @typedef {Object} FFLShaderMaterialParameters
	* @property {FFLModulateMode} [modulateMode] - Modulate mode.
	* @property {FFLModulateType} [modulateType] - Modulate type.
	* @property {THREE.Color|Array<THREE.Color>} [color] -
	* Constant color assigned to u_const1/2/3 depending on single or array.
	* @property {boolean} [lightEnable] - Enable lighting. Needs to be off when drawing faceline/mask textures.
	* @property {THREE.Vector3} [lightDirection] - Light direction.
	* @property {boolean} [useSpecularModeBlinn] - Whether to override
	* specular mode on all materials with 0 (Blinn-Phong specular).
	* @property {THREE.Texture} [map] - Texture map.
	*/
	const _FFLShader_vert = `
attribute vec4 _color;
attribute vec3 tangent;
varying vec4 v_color;
varying vec4 v_position;
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec2 v_texCoord;

#include <skinning_pars_vertex>

void main()
{
	#include <begin_vertex>
    #include <skinbase_vertex>

    v_position = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position =  projectionMatrix * v_position;

    vec3 objectNormal = normal;
    vec3 objectTangent = tangent.xyz;
    #include <skinnormal_vertex>

    v_normal = normalize(normalMatrix * objectNormal);

    v_texCoord = uv;
    // safe normalize
    if (tangent != vec3(0.0, 0.0, 0.0))
    {
        v_tangent = normalize(normalMatrix * objectTangent);
    }
    else
    {
        v_tangent = vec3(0.0, 0.0, 0.0);
    }

    v_color = _color;
}
`;
	const _FFLShader_frag = `
varying mediump vec4 v_color;
varying highp vec4 v_position;
varying highp vec3 v_normal;
varying mediump vec3 v_tangent;
varying mediump vec2 v_texCoord;

uniform mediump vec4 u_const1;
uniform mediump vec4 u_const2;
uniform mediump vec4 u_const3;

uniform mediump vec3 u_light_ambient;
uniform mediump vec3 u_light_diffuse;
uniform mediump vec3 u_light_dir;
uniform bool u_light_enable;
uniform mediump vec3 u_light_specular;

uniform mediump vec3 u_material_ambient;
uniform mediump vec3 u_material_diffuse;
uniform mediump vec3 u_material_specular;
uniform int u_material_specular_mode;
uniform mediump float u_material_specular_power;

uniform int u_mode;

uniform mediump vec3 u_rim_color;
uniform mediump float u_rim_power;

uniform sampler2D s_texture;

void main()
{
    mediump vec4 color;

    if(u_mode == 0) // FFL_MODULATE_MODE_CONSTANT
    {
        color = u_const1;
    }
    else if(u_mode == 1) // FFL_MODULATE_MODE_TEXTURE_DIRECT
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.rgb, u_const1.a * texel.a);
    }
    else if(u_mode == 2) // FFL_MODULATE_MODE_RGB_LAYERED
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.r * u_const1.rgb + texel.g * u_const2.rgb + texel.b * u_const3.rgb, u_const1.a * texel.a);
    }
    else if(u_mode == 3) // FFL_MODULATE_MODE_ALPHA
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(u_const1.rgb, u_const1.a * texel.r);
    }
    else if(u_mode == 4) // FFL_MODULATE_MODE_LUMINANCE_ALPHA
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.g * u_const1.rgb, u_const1.a * texel.r);
    }
    else if(u_mode == 5) // FFL_MODULATE_MODE_ALPHA_OPA
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        color = vec4(texel.r * u_const1.rgb, u_const1.a);
    }

    // avoids little outline around mask elements
    if(u_mode != 0 && color.a == 0.0)
    {
        discard;
    }

    if(u_light_enable)
    {
        /// 環境光の計算
        mediump vec3 ambient = u_light_ambient.xyz * u_material_ambient.xyz;

        /// 法線ベクトルの正規化
        mediump vec3 norm = normalize(v_normal);

        /// 視線ベクトル
        mediump vec3 eye = normalize(-v_position.xyz);

        // ライトの向き
        mediump float fDot =  max(dot(u_light_dir, norm), 0.1);

        /// Diffuse計算
        mediump vec3 diffuse = u_light_diffuse.xyz * u_material_diffuse.xyz * fDot;

        /// Specular計算
        mediump float specularBlinn = pow(max(dot(reflect(-u_light_dir, norm), eye), 0.0), u_material_specular_power);

        /// Specularの値を確保する変数を宣言
        mediump float reflection;
        mediump float strength = v_color.g;
        if(u_material_specular_mode == 0)
        {
            /// Blinnモデルの場合
            strength = 1.0;
            reflection = specularBlinn;
        }
        else
        {
            /// Aisoモデルの場合
           	mediump float dotLT = dot(u_light_dir, v_tangent);
			mediump float dotVT = dot(eye, v_tangent);
			mediump float dotLN = sqrt(1.0 - dotLT * dotLT);
			mediump float dotVR = dotLN*sqrt(1.0 - dotVT * dotVT) - dotLT * dotVT;

			mediump float specularAniso = pow(max(0.0, dotVR), u_material_specular_power);
			reflection = mix(specularAniso, specularBlinn, v_color.r);
        }
        /// Specularの色を取得
        mediump vec3 specular = u_light_specular.xyz * u_material_specular.xyz * reflection * strength;

        // リムの色を計算
        mediump vec3 rimColor = u_rim_color.rgb * pow(v_color.a * (1.0 - abs(norm.z)), u_rim_power);

        // カラーの計算
        color.rgb = (ambient + diffuse) * color.rgb + specular + rimColor;
    }

    gl_FragColor = color;
}
`;
	/**
	* Custom THREE.ShaderMaterial using the FFLShader.
	* @augments {THREE.ShaderMaterial}
	*/
	var FFLShaderMaterial = class FFLShaderMaterial extends three.ShaderMaterial {
		/**
		* Default ambient light color.
		* @type {THREE.Color}
		*/
		static defaultLightAmbient = /* @__PURE__ */ new three.Color(.73, .73, .73);
		/**
		* Default diffuse light color.
		* @type {THREE.Color}
		*/
		static defaultLightDiffuse = /* @__PURE__ */ new three.Color(.6, .6, .6);
		/**
		* Default specular light color.
		* @type {THREE.Color}
		*/
		static defaultLightSpecular = /* @__PURE__ */ new three.Color(.7, .7, .7);
		/**
		* Default light direction.
		* @type {THREE.Vector3}
		*/
		static defaultLightDir = /* @__PURE__ */ new three.Vector3(-.45315, .42262, .78489);
		/**
		* Default rim color.
		* @type {THREE.Color}
		*/
		static defaultRimColor = /* @__PURE__ */ new three.Color(.3, .3, .3);
		/**
		* Default rim color for the body.
		* @type {THREE.Color}
		*/
		static defaultRimColorBody = /* @__PURE__ */ new three.Color(.4, .4, .4);
		/**
		* Default rim power (intensity).
		* @type {number}
		*/
		static defaultRimPower = 2;
		/**
		* Alias for default light direction.
		* @type {THREE.Vector3}
		*/
		static defaultLightDirection = this.defaultLightDir;
		/**
		* Material uniform table mapping to FFLModulateType.
		* Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
		* @package
		*/
		static materialParams = [
			{
				ambient: new three.Color(.85, .75, .75),
				diffuse: new three.Color(.75, .75, .75),
				specular: new three.Color(.3, .3, .3),
				specularPower: 1.2,
				specularMode: 0
			},
			{
				ambient: new three.Color(1, 1, 1),
				diffuse: new three.Color(.7, .7, .7),
				specular: new three.Color(0, 0, 0),
				specularPower: 40,
				specularMode: 1
			},
			{
				ambient: new three.Color(.9, .85, .85),
				diffuse: new three.Color(.75, .75, .75),
				specular: new three.Color(.22, .22, .22),
				specularPower: 1.5,
				specularMode: 0
			},
			{
				ambient: new three.Color(.85, .75, .75),
				diffuse: new three.Color(.75, .75, .75),
				specular: new three.Color(.3, .3, .3),
				specularPower: 1.2,
				specularMode: 0
			},
			{
				ambient: new three.Color(1, 1, 1),
				diffuse: new three.Color(.7, .7, .7),
				specular: new three.Color(.35, .35, .35),
				specularPower: 10,
				specularMode: 1
			},
			{
				ambient: new three.Color(.75, .75, .75),
				diffuse: new three.Color(.72, .72, .72),
				specular: new three.Color(.3, .3, .3),
				specularPower: 1.5,
				specularMode: 0
			},
			{
				ambient: new three.Color(1, 1, 1),
				diffuse: new three.Color(.7, .7, .7),
				specular: new three.Color(0, 0, 0),
				specularPower: 40,
				specularMode: 1
			},
			{
				ambient: new three.Color(1, 1, 1),
				diffuse: new three.Color(.7, .7, .7),
				specular: new three.Color(0, 0, 0),
				specularPower: 40,
				specularMode: 1
			},
			{
				ambient: new three.Color(1, 1, 1),
				diffuse: new three.Color(.7, .7, .7),
				specular: new three.Color(0, 0, 0),
				specularPower: 40,
				specularMode: 1
			},
			{
				ambient: new three.Color(.95622, .95622, .95622),
				diffuse: new three.Color(.49673, .49673, .49673),
				specular: new three.Color(.24099, .24099, .24099),
				specularPower: 3,
				specularMode: 0
			},
			{
				ambient: new three.Color(.95622, .95622, .95622),
				diffuse: new three.Color(1.08497, 1.08497, 1.08497),
				specular: new three.Color(.2409, .2409, .2409),
				specularPower: 3,
				specularMode: 0
			}
		];
		/** @typedef {THREE.IUniform<THREE.Vector4>} IUniformVector4 */
		/**
		* Constructs an FFLShaderMaterial instance.
		* @param {THREE.ShaderMaterialParameters & FFLShaderMaterialParameters} [options] -
		* Parameters for the material.
		*/
		constructor(options = {}) {
			/** @type {Object<string, THREE.IUniform>} */
			const uniforms = {
				u_light_ambient: { value: FFLShaderMaterial.defaultLightAmbient },
				u_light_diffuse: { value: FFLShaderMaterial.defaultLightDiffuse },
				u_light_specular: { value: FFLShaderMaterial.defaultLightSpecular },
				u_light_dir: { value: FFLShaderMaterial.defaultLightDir.clone() },
				u_light_enable: { value: true },
				u_rim_power: { value: FFLShaderMaterial.defaultRimPower }
			};
			super({
				vertexShader: _FFLShader_vert,
				fragmentShader: _FFLShader_frag,
				uniforms
			});
			/**
			* @type {FFLModulateType}
			* @private
			*/
			this._modulateType = 0;
			this.useSpecularModeBlinn = false;
			this.setValues(options);
		}
		/**
		* Gets the constant color (u_const1) uniform as THREE.Color.
		* @returns {THREE.Color|null} The constant color, or null if it is not set.
		*/
		get color() {
			if (!this.uniforms.u_const1) return null;
			else if (this._color3) return this._color3;
			const color4 = this.uniforms.u_const1.value;
			const color3 = new three.Color(color4.x, color4.y, color4.z);
			/**
			* @type {THREE.Color}
			* @private
			*/
			this._color3 = color3;
			return color3;
		}
		/**
		* Sets the constant color uniforms from THREE.Color.
		* @param {THREE.Color|Array<THREE.Color>} value - The
		* constant color (u_const1), or multiple (u_const1/2/3) to set the uniforms for.
		*/
		set color(value) {
			/**
			* @param {THREE.Color} color - THREE.Color instance.
			* @param {number} opacity - Opacity mapped to .a.
			* @returns {THREE.Vector4} Vector4 containing color and opacity.
			*/
			function toColor4(color, opacity$1 = 1) {
				return new three.Vector4(color.r, color.g, color.b, opacity$1);
			}
			if (Array.isArray(value)) {
				/** @type {IUniformVector4} */ this.uniforms.u_const1 = { value: toColor4(value[0]) };
				/** @type {IUniformVector4} */ this.uniforms.u_const2 = { value: toColor4(value[1]) };
				/** @type {IUniformVector4} */ this.uniforms.u_const3 = { value: toColor4(value[2]) };
				return;
			}
			const color3 = value || new three.Color(1, 1, 1);
			/** @type {THREE.Color} */
			this._color3 = color3;
			const opacity = this.opacity;
			if (this._opacity) delete this._opacity;
			/** @type {IUniformVector4} */ this.uniforms.u_const1 = { value: toColor4(color3, opacity) };
		}
		/**
		* Gets the opacity of the constant color.
		* @returns {number} The opacity value.
		*/
		get opacity() {
			if (!this.uniforms.u_const1) return this._opacity || 1;
			return this.uniforms.u_const1.value.w;
		}
		/**
		* Sets the opacity of the constant color.
		* NOTE: that this is actually set in the constructor
		* of Material, meaning it is the only one set BEFORE uniforms are
		* @param {number} value - The new opacity value.
		*/
		set opacity(value) {
			if (!this.uniforms || !this.uniforms.u_const1) {
				/** @private */
				this._opacity = 1;
				return;
			}
			/** @type {IUniformVector4} */ this.uniforms.u_const1.value.w = value;
		}
		/**
		* Gets the value of the modulateMode uniform.
		* @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
		*/
		get modulateMode() {
			return this.uniforms.u_mode ? this.uniforms.u_mode.value : null;
		}
		/**
		* Sets the value of the modulateMode uniform.
		* @param {FFLModulateMode} value - The new modulateMode value.
		*/
		set modulateMode(value) {
			this.uniforms.u_mode = { value };
		}
		/**
		* Sets the value determining whether lighting is enabled or not.
		* @returns {boolean|null} The lightEnable value, or null if it is unset.
		*/
		get lightEnable() {
			return this.uniforms.u_light_enable ? this.uniforms.u_light_enable.value : null;
		}
		/**
		* Sets the value determining whether lighting is enabled or not.
		* @param {boolean} value - The lightEnable value.
		*/
		set lightEnable(value) {
			this.uniforms.u_light_enable = { value };
		}
		/**
		* Sets whether to override specular mode with 0.
		* @param {boolean} value - The useSpecularModeBlinn value.
		*/
		set useSpecularModeBlinn(value) {
			/** @private */
			this._useSpecularModeBlinn = value;
			if (this._modulateType !== void 0) this.modulateType = this._modulateType;
		}
		/**
		* Gets the value for whether to override specular mode with 0.
		* @returns {boolean|undefined} The useSpecularModeBlinn value.
		*/
		get useSpecularModeBlinn() {
			return this._useSpecularModeBlinn;
		}
		/**
		* Gets the modulateType value.
		* @returns {FFLModulateType|undefined} The modulateType value if it is set.
		*/
		get modulateType() {
			return this._modulateType;
		}
		/**
		* Sets the material uniforms based on the modulate type value.
		* @param {FFLModulateType} value - The new modulateType value.
		*/
		set modulateType(value) {
			const matParam = FFLShaderMaterial.materialParams[value];
			if (!matParam) return;
			this._modulateType = value;
			this.uniforms.u_material_ambient = { value: matParam.ambient };
			this.uniforms.u_material_diffuse = { value: matParam.diffuse };
			this.uniforms.u_material_specular = { value: matParam.specular };
			this.uniforms.u_material_specular_mode = { value: this._useSpecularModeBlinn ? 0 : matParam.specularMode };
			this.uniforms.u_material_specular_power = { value: matParam.specularPower };
			const rimColor = value > 8 ? FFLShaderMaterial.defaultRimColorBody : FFLShaderMaterial.defaultRimColor;
			this.uniforms.u_rim_color = { value: rimColor };
		}
		/**
		* Gets the texture map if it is set.
		* @returns {THREE.Texture|null} The texture map, or null if it is unset.
		*/
		get map() {
			return this.uniforms.s_texture ? this.uniforms.s_texture.value : null;
		}
		/**
		* Sets the texture map (s_texture uniform).
		* @param {THREE.Texture} value - The new texture map.
		*/
		set map(value) {
			this.uniforms.s_texture = { value };
		}
		/**
		* Gets the light direction.
		* @returns {THREE.Vector3} The light direction.
		*/
		get lightDirection() {
			return this.uniforms.u_light_dir.value;
		}
		/**
		* Sets the light direction.
		* @param {THREE.Vector3} value - The new light direction.
		*/
		set lightDirection(value) {
			this.uniforms.u_light_dir = { value };
		}
	};
	var FFLShaderMaterial_default = FFLShaderMaterial;

//#endregion
return FFLShaderMaterial_default;
})(THREE);