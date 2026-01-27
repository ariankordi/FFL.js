var SampleShaderMaterial = (function(three) {

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

//#region materials/SampleShaderMaterial.js
/**
	* @file SampleShaderMaterial.js
	* Three.js material class using the Switch SampleShader.
	* @author Arian Kordi <https://github.com/ariankordi>
	*/
	/**
	* @typedef {number} FFLModulateMode
	* @typedef {number} FFLModulateType
	*/
	/**
	* @typedef {Object} SampleShaderMaterialColorInfo
	* @property {number} facelineColor
	* @property {number} favoriteColor
	* @property {number} hairColor
	* @property {number} beardColor
	* @property {number} pantsColor - PantsColor from ffl.js, 0-4.
	*/
	/**
	* @typedef {Object} SampleShaderMaterialParameters
	* @property {FFLModulateMode} [modulateMode] - Modulate mode.
	* @property {FFLModulateType} [modulateType] - Modulate type.
	* @property {THREE.Color|Array<THREE.Color>} [color] -
	* Constant color assigned to constColor1/2/3 depending on single or array.
	* @property {boolean} [lightEnable] - Enable lighting. Needs to be off when drawing faceline/mask textures.
	* @property {THREE.Vector3} [lightDirection] - Light direction.
	* @property {THREE.Texture} [map] - Texture map.
	* @property {SampleShaderMaterialColorInfo} [colorInfo] -
	* Info needed to resolve shader uniforms. This is required
	* or else lighting will not be applied. It can come from
	* CharModel.getColorInfo, or getColorInfoFromCharInfoB64 for glTFs.
	*/
	const _SampleShader_vert = `
//#define VARYING_QUALIFIER out
#define VARYING_QUALIFIER varying
#define VARYING_INSTANCE Out

// v_ prefix was added to avoid conflicts.
VARYING_QUALIFIER vec2 v_texCoord;
VARYING_QUALIFIER vec3 v_normal;
VARYING_QUALIFIER float v_specularMix;

/// ================================================================
/// 頂点シェーダーの実装
/// ================================================================

//layout( location = 0 ) in vec4 i_Position;
//layout( location = 1 ) in vec3 i_Normal;
//layout( location = 2 ) in vec2 i_TexCoord;
//layout( location = 3 ) in vec4 i_Parameter;

//attribute vec4 position;
//attribute vec2 uv;
//attribute vec3 normal;
// All provided by three.js ^^

// vertex color is not actually the color of the shape, as such
// it is a custom attribute _COLOR in the glTF

attribute vec4 _color; // i_Parameter

// A bunch of unnecessary code was removed.
// See: https://github.com/ariankordi/FFL-Testing/blob/renderer-server-prototype/fs/content/shaders/SampleShader.vert

//uniform mat4 mv;
//uniform mat4 proj;

#include <skinning_pars_vertex>

void main()
{

  #include <begin_vertex>
  #include <skinbase_vertex>
  #include <skinning_vertex>

  /// ビュー行列に変換
  //vec3 vPos = TRANSFORM_POS(mv,i_Position);
  //gl_Position = PROJECT(proj,vec4(vPos,1.0));

  vec4 vPos = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * vPos;

  vec3 objectNormal = normal;

  #include <skinnormal_vertex>

  v_normal = normalize(normalMatrix * objectNormal);

  v_texCoord = uv.xy;
  //normal = TRANSFORM_VEC(mv,i_Normal);
  v_specularMix = _color.r;
}
`;
	const _SampleShader_frag = `
//#define VARYING_QUALIFIER in
#define VARYING_QUALIFIER varying
#define VARYING_INSTANCE In

VARYING_QUALIFIER vec2 v_texCoord;
VARYING_QUALIFIER highp vec3 v_normal; // Modified to add highp.
VARYING_QUALIFIER float v_specularMix;

/// ================================================================
/// ピクセルシェーダーの実装
/// ================================================================

//layout( location = 0 ) out vec4 o_Color;

// NOTE: NOT SURE HOW TO SET UNIFORM BLOCKS IN RIO
//layout( std140 ) uniform u_Modulate
//{
    uniform int  modulateType;
    uniform int  gammaType;
    uniform int  drawType;
    uniform bool lightEnable; // custom
    uniform vec4 constColor1;
    uniform vec4 constColor2;
    uniform vec4 constColor3;
    uniform vec4 lightDirInView;
    // Modified to be vec3:
    uniform vec3 lightColor;
    uniform vec3 u_SssColor;
    uniform vec3 u_SpecularColor;
    uniform vec3 u_RimColor;
    // End

    uniform float u_HalfLambertFactor;
    uniform float u_SssSpecularFactor;

    uniform float u_SpecularFactorA;
    uniform float u_SpecularFactorB;
    uniform float u_SpecularShinness;
    uniform float u_RimPower;

    uniform float u_RimWidth;
//};


uniform sampler2D s_Tex;

/// 変調モード
#define MODULATE_TYPE_CONSTANT        ( 0 )
#define MODULATE_TYPE_TEXTRUE         ( 1 )
#define MODULATE_TYPE_LAYERED         ( 2 )
#define MODULATE_TYPE_ALPHA           ( 3 )

// NOTE: Glass/Luminance Alpha is usually 4 in FFL.
//#define MODULATE_TYPE_ALPHA_OPA       ( 4 )
// Alpha Opa is usually 5. The two values are swapped around.
//#define MODULATE_TYPE_GLASS           ( 5 )

// For consistency with FFL, these values will be swapped in the shader.
#define MODULATE_TYPE_GLASS             ( 4 )
#define MODULATE_TYPE_ALPHA_OPA         ( 5 )

#define MODULATE_TYPE_ICONBODY        ( 6 )

#define USE_DEGAMMA(type) (type != 0)

#define DRAW_TYPE_NORMAL   0
#define DRAW_TYPE_FACELINE 1
#define DRAW_TYPE_HAIR     2

// All occurrences of ".0" were find-replaced to ".0"

vec4 GetAlbedo()
{
    vec4 texel;
    vec4 albedo;

    if(modulateType != MODULATE_TYPE_CONSTANT &&
        modulateType != MODULATE_TYPE_ICONBODY)
    {
        texel = texture(s_Tex,v_texCoord);
    }
    switch(modulateType)
    {
    case MODULATE_TYPE_CONSTANT:
        //albedo = vec4(constColor1.rgb,1.0);
        albedo = constColor1;
        break;
    // modified to handle constColor1 alpha:
    case MODULATE_TYPE_TEXTRUE:
        //albedo = texel;
        albedo = vec4(texel.rgb, constColor1.a * texel.a);
        break;
    case MODULATE_TYPE_LAYERED:
        albedo = vec4(constColor1.rgb * texel.r
            + constColor2.rgb * texel.g
            + constColor3.rgb * texel.b
            , constColor1.a * texel.a);
        break;
    case MODULATE_TYPE_ALPHA:
        albedo = vec4(constColor1.rgb, constColor1.a * texel.r);
        break;
    case MODULATE_TYPE_ALPHA_OPA:
        albedo = vec4(constColor1.rgb * texel.r, constColor1.a);
        break;
    case MODULATE_TYPE_GLASS:
        // NOTE: glass background color on switch is R but here it's G
        albedo = vec4(constColor1.rgb * texel.g,
          constColor1.a * texel.r);//pow(texel.r, constColor2.g));
          // Not sure why it has pow? without it looks better...
        break;
    case MODULATE_TYPE_ICONBODY:
        albedo = vec4(constColor1.rgb, constColor1.a);
        break;
    default:
        albedo = vec4(0.0);
        break;
    }
    return albedo;
}

vec3 ToLinear(vec3 rgb)
{
    return pow(rgb,vec3(2.2));
}

vec3 ToSrgb(vec3 rgb)
{
    return pow(rgb,vec3(1.0/2.2));
}

vec3 GetRimColor(vec3 color,float normalZ,float width,float power)
{
    return color * pow(width * (1.0 - abs(normalZ)),power);
}

void main()
{
    /// ModulateTypeを考慮してアルベドを取得
    vec4 albedo = GetAlbedo();
    // NOTE: faceline color A channel is 1 here but 0 on switch, needs to be modified
    // NOTE: THE BELOW CODE ALSO TARGETS BEARD!!!!
    /*if(drawType == DRAW_TYPE_FACELINE &&
        modulateType == MODULATE_TYPE_TEXTRUE &&
        albedo.a != 0.0)
    {
        albedo.a = 0.0;
    }*/
    if(albedo.a == 0.0 && drawType != DRAW_TYPE_FACELINE)
    {
        discard;
    }
    if(!lightEnable)
    {
        gl_FragColor = albedo;
        return;
    }

    if(USE_DEGAMMA(gammaType))
    {
        /// SRGB to Linear
        albedo.rgb = ToLinear(albedo.rgb);
    }

    vec3 preNormal = v_normal;

    /// ライティング向け計算
    vec3 normal = normalize(preNormal); ///< ビュー空間法線
    vec3 lightDir = normalize(lightDirInView.xyz); ///< ビュー空間ライト方向

    /// diffuseの計算
    float diffuseFactor = max(0.0,dot(normal, lightDir));

    /// 拡散値計算
    float halfLambert = ((diffuseFactor) * u_HalfLambertFactor + (1.0 - u_HalfLambertFactor));

    /// スペキュラ計算
    vec3 halfDir = normalize(lightDir + vec3(0.0,0.0,1.0));
    float specAngle = max(dot(halfDir,normal),0.0);
    float specular = pow(specAngle,u_SpecularShinness);

    /// 髪型は、スペキュラの係数をParameterのr値でAB補間
    float specularFactor;
    if(drawType != DRAW_TYPE_HAIR)
    {
        specularFactor = u_SpecularFactorA;
    }
    else
    {
        specularFactor = mix(u_SpecularFactorA,u_SpecularFactorB,v_specularMix);
    }

    vec4 outputColor = vec4(vec3(0.0),albedo.a);

    vec3 diffuseColor = lightColor.rgb * albedo.rgb * halfLambert;
    vec3 specularColor = specular * specularFactor * lightColor.rgb * u_SpecularColor.rgb;
    vec3 sssColor =  u_SssColor.rgb * (1.0 - halfLambert);
    float sssSpecularFactor = (1.0 - albedo.a * u_SssSpecularFactor);
    //float sssSpecularFactor = 1.0;

    /// FACELINEは、アルファ値を考慮して計算する
    if(drawType == DRAW_TYPE_FACELINE)
    {
        outputColor = vec4(diffuseColor + (specularColor + sssColor) * sssSpecularFactor,1.0);
    }
    else
    {
        outputColor = vec4(diffuseColor + (specularColor + sssColor),albedo.a);
    }

    outputColor.rgb += GetRimColor(u_RimColor.rgb,clamp(normal.z,0.0,1.0),u_RimWidth,u_RimPower);

    if(USE_DEGAMMA(gammaType))
    {
        /// Linear to SRGB
        outputColor.rgb = ToSrgb(outputColor.rgb);
    }

    gl_FragColor = outputColor;
}
`;
	/**
	* @typedef {Object} DrawParamMaterial
	* @property {number} halfLambertFactor
	* @property {number} sssSpecularBlendFactor
	* @property {number} specularFactorA
	* @property {number} specularFactorB
	* @property {number} specularShinness
	* @property {number} rimLightPower
	* @property {number} rimLightWidth
	*/
	const NnMiiMaterialTables = {
		drawParamMaterials: [
			{
				halfLambertFactor: .4,
				sssSpecularBlendFactor: 1,
				specularFactorA: 2.6,
				specularFactorB: .02,
				specularShinness: .8,
				rimLightPower: 2,
				rimLightWidth: .3
			},
			{
				halfLambertFactor: .2,
				sssSpecularBlendFactor: 0,
				specularFactorA: 1,
				specularFactorB: 0,
				specularShinness: 1.3,
				rimLightPower: 1,
				rimLightWidth: .5
			},
			{
				halfLambertFactor: .3,
				sssSpecularBlendFactor: 0,
				specularFactorA: 2.6,
				specularFactorB: .02,
				specularShinness: .8,
				rimLightPower: .55,
				rimLightWidth: 0
			},
			{
				halfLambertFactor: .4,
				sssSpecularBlendFactor: 1,
				specularFactorA: 2.6,
				specularFactorB: .02,
				specularShinness: .8,
				rimLightPower: 2,
				rimLightWidth: .3
			},
			{
				halfLambertFactor: .45,
				sssSpecularBlendFactor: 1,
				specularFactorA: 1,
				specularFactorB: .06,
				specularShinness: .8,
				rimLightPower: 1,
				rimLightWidth: .5
			},
			{
				halfLambertFactor: .6,
				sssSpecularBlendFactor: 1,
				specularFactorA: 2,
				specularFactorB: .02,
				specularShinness: .8,
				rimLightPower: 1,
				rimLightWidth: .5
			},
			{
				halfLambertFactor: 0,
				sssSpecularBlendFactor: 1,
				specularFactorA: 0,
				specularFactorB: 0,
				specularShinness: .1,
				rimLightPower: 1,
				rimLightWidth: .5
			},
			{
				halfLambertFactor: 0,
				sssSpecularBlendFactor: 1,
				specularFactorA: 0,
				specularFactorB: 0,
				specularShinness: .1,
				rimLightPower: 1,
				rimLightWidth: .5
			},
			{
				halfLambertFactor: .35,
				sssSpecularBlendFactor: 1,
				specularFactorA: .3,
				specularFactorB: 0,
				specularShinness: 30,
				rimLightPower: 1,
				rimLightWidth: 0
			},
			{
				halfLambertFactor: .5,
				sssSpecularBlendFactor: 0,
				specularFactorA: 1,
				specularFactorB: 0,
				specularShinness: .8,
				rimLightPower: 1,
				rimLightWidth: 0
			},
			{
				halfLambertFactor: .6,
				sssSpecularBlendFactor: 1,
				specularFactorA: 1,
				specularFactorB: .02,
				specularShinness: .7,
				rimLightPower: 1,
				rimLightWidth: .5
			}
		],
		sssFacelineColors: [
			10822144,
			10750208,
			4915200,
			11667968,
			3343104,
			983296,
			10954752,
			9837577,
			1310977,
			327680
		],
		sssFavoriteColorsBody: [
			2753281,
			4587520,
			3347713,
			398598,
			3081,
			1828,
			201004,
			788761,
			328738,
			4,
			726572,
			0
		],
		sssFavoriteColorsCap: [
			5570561,
			8537610,
			6562570,
			1986570,
			663053,
			331570,
			1325400,
			5246740,
			1967959,
			656642,
			8158308,
			0
		],
		sssCommonColors: [
			131329,
			196864,
			262400,
			393729,
			394759,
			197376,
			394241,
			657411,
			0,
			328965,
			328450,
			263170,
			197640,
			132356,
			262656,
			524288,
			66053,
			525312,
			394501,
			656384,
			0,
			787203,
			788229,
			459779,
			393473,
			787717,
			788488,
			788745,
			328194,
			459011,
			393475,
			590595,
			590084,
			525318,
			590853,
			787719,
			788490,
			789002,
			131331,
			131587,
			196867,
			328456,
			394249,
			591370,
			526090,
			591883,
			723212,
			657675,
			65795,
			773,
			132618,
			264460,
			395531,
			395276,
			395532,
			527116,
			514,
			770,
			772,
			66820,
			132615,
			198664,
			395527,
			395785,
			396041,
			770,
			198144,
			1284,
			132869,
			198657,
			461056,
			264454,
			461571,
			461574,
			592904,
			460546,
			526084,
			657666,
			657670,
			657926,
			657925,
			658182,
			658439,
			393984,
			723206,
			789251,
			789254,
			789255,
			789511,
			525057,
			788224,
			657157,
			788485,
			788743,
			723464,
			197379,
			460551,
			592137,
			723466,
			394758
		],
		sssPantsColors: [0, 2621440],
		specularFacelineColors: [
			2954511,
			2299914,
			2034179,
			1904133,
			2098947,
			524801,
			2954511,
			2298890,
			984321,
			328193
		],
		specularFavoriteColorsBody: [
			2754052,
			3347973,
			3353350,
			1583622,
			6153,
			134692,
			797751,
			3215897,
			1509410,
			525057,
			3681324,
			328965
		],
		specularFavoriteColorsCap: [
			4128770,
			3613959,
			3939850,
			1851141,
			335365,
			67395,
			1059389,
			4591380,
			1442604,
			656642,
			2631710,
			131586
		],
		specularCommonColors: [
			328708,
			2100226,
			3016961,
			4069123,
			2368550,
			2562050,
			4465411,
			6832139,
			197379,
			2105890,
			3348486,
			3155207,
			1384788,
			1059884,
			3151362,
			5506561,
			594740,
			5514752,
			2368031,
			7086081,
			328965,
			8002570,
			7879953,
			4595721,
			4329221,
			8334863,
			8338712,
			8342555,
			3740168,
			4983817,
			4524297,
			5904393,
			6491148,
			5775635,
			6496528,
			8203798,
			8274974,
			8343584,
			1575689,
			1052702,
			2492683,
			3611162,
			4334619,
			6304798,
			3291748,
			3884147,
			4672637,
			4148854,
			461856,
			334131,
			799850,
			1722489,
			2379375,
			2703997,
			2575229,
			3168895,
			201243,
			6173,
			204588,
			665649,
			930374,
			1525080,
			2379343,
			2511968,
			2644827,
			335111,
			2174976,
			77326,
			1785104,
			2442499,
			4803585,
			3231508,
			5200137,
			4937746,
			6119449,
			4995590,
			5454606,
			6704136,
			6703636,
			7098643,
			6968848,
			6970387,
			7103511,
			4070144,
			7555602,
			8346123,
			8214547,
			8084759,
			8217367,
			5447172,
			8338433,
			6831631,
			8341263,
			8342805,
			7492122,
			1315860,
			3092271,
			3750201,
			4341822,
			65793
		],
		specularPantsColors: [328965, 3942400],
		rimFacelineForeheadColors: [
			4398614,
			3942417,
			4068358,
			3939850,
			4197894,
			4198408,
			4398870,
			3941653,
			3935235,
			3937290
		],
		specularGlassColors: [1644825],
		getTypeToSssColorTable() {
			return [
				this.sssFacelineColors,
				this.sssCommonColors,
				this.sssFacelineColors,
				this.sssFacelineColors,
				this.sssCommonColors,
				this.sssFavoriteColorsCap,
				null,
				null,
				null,
				this.sssFavoriteColorsBody,
				this.sssPantsColors
			];
		},
		getTypeToSpecularColorTable() {
			return [
				this.specularFacelineColors,
				this.specularCommonColors,
				this.specularFacelineColors,
				this.specularFacelineColors,
				this.specularCommonColors,
				this.specularFavoriteColorsCap,
				null,
				null,
				this.specularGlassColors,
				this.specularFavoriteColorsBody,
				this.specularPantsColors
			];
		},
		modifyCapMaterial(material, index) {
			switch (index) {
				case 0:
					material.specularFactorB = 0;
					break;
				case 2:
					material.specularFactorA = 1.1;
					break;
				case 6:
					material.specularFactorB = .8;
					break;
				case 9:
					material.specularShinness = 2;
					break;
			}
		}
	};
	/**
	* Custom THREE.ShaderMaterial using the SampleShader.
	* @augments {THREE.ShaderMaterial}
	*/
	var SampleShaderMaterial = class SampleShaderMaterial extends three.ShaderMaterial {
		/** Indicates that this material requires an alpha value of 0 in the faceline color. */
		static needsFacelineAlpha = true;
		/**
		* Default ambient light color.
		* @type {THREE.Color}
		*/
		static defaultLightColor = /* @__PURE__ */ new three.Color(1, 1, 1);
		/**
		* Default light direction.
		* @type {THREE.Vector3}
		*/
		static defaultLightDir = /* @__PURE__ */ new three.Vector3(-.1227878, .70710677, .6963642);
		/**
		* Alias for default light direction.
		* @type {THREE.Vector3}
		*/
		static defaultLightDirection = this.defaultLightDir;
		/** @typedef {THREE.IUniform<THREE.Vector4>} IUniformVector4 */
		/**
		* Constructs an SampleShaderMaterial instance.
		* @param {THREE.ShaderMaterialParameters & SampleShaderMaterialParameters} [options] -
		* Parameters for the material.
		*/
		constructor(options = {}) {
			/** @type {Object<string, THREE.IUniform>} */
			const uniforms = {
				lightColor: { value: SampleShaderMaterial.defaultLightColor },
				lightDirInView: { value: SampleShaderMaterial.defaultLightDir.clone() },
				lightEnable: { value: true },
				gammaType: { value: 1 }
			};
			super({
				vertexShader: _SampleShader_vert,
				fragmentShader: _SampleShader_frag,
				uniforms
			});
			/**
			* @type {FFLModulateType}
			* @private
			*/
			this._modulateType = 0;
			/** @private */
			this._sssColorTable = NnMiiMaterialTables.getTypeToSssColorTable();
			/** @private */
			this._specularColorTable = NnMiiMaterialTables.getTypeToSpecularColorTable();
			this.setValues(options);
		}
		/**
		* Gets the constant color (constColor1) uniform as THREE.Color.
		* @returns {THREE.Color|null} The constant color, or null if it is not set.
		*/
		get color() {
			if (!this.uniforms.constColor1) return null;
			else if (this._color3) return this._color3;
			const color4 = this.uniforms.constColor1.value;
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
		* constant color (constColor1), or multiple (constColor1/2/3) to set the uniforms for.
		*/
		set color(value) {
			/**
			* @param {THREE.Color} color - THREE.Color instance.
			* @param {number} opacity - Opacity mapped to .a.
			* @returns {THREE.Vector4} Vector4 containing color and opacity.
			*/
			function toColor4(color, opacity = 1) {
				return new three.Vector4(color.r, color.g, color.b, opacity);
			}
			if (Array.isArray(value)) {
				/** @type {IUniformVector4} */ this.uniforms.constColor1 = { value: toColor4(value[0]) };
				/** @type {IUniformVector4} */ this.uniforms.constColor2 = { value: toColor4(value[1]) };
				/** @type {IUniformVector4} */ this.uniforms.constColor3 = { value: toColor4(value[2]) };
				return;
			}
			const color3 = value || new three.Color(1, 1, 1);
			/** @type {THREE.Color} */
			this._color3 = color3;
			const opacity = this.opacity;
			if (this._opacity) delete this._opacity;
			/** @type {IUniformVector4} */ this.uniforms.constColor1 = { value: toColor4(color3, opacity) };
			if (value && this._modulateType === 0) this.uniforms.drawType = { value: 0 };
		}
		/**
		* Gets the opacity of the constant color.
		* @returns {number} The opacity value.
		*/
		get opacity() {
			if (!this.uniforms.constColor1) return this._opacity || 1;
			return this.uniforms.constColor1.value.w;
		}
		/**
		* Sets the opacity of the constant color.
		* NOTE: that this is actually set in the constructor
		* of Material, meaning it is the only one set BEFORE uniforms are
		* @param {number} value - The new opacity value.
		*/
		set opacity(value) {
			if (!this.uniforms || !this.uniforms.constColor1) {
				/** @private */
				this._opacity = 1;
				return;
			}
			/** @type {IUniformVector4} */ this.uniforms.constColor1.value.w = value;
		}
		/**
		* Gets the value of the modulateMode uniform.
		* @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
		*/
		get modulateMode() {
			return this.uniforms.modulateType ? this.uniforms.modulateType.value : null;
		}
		/**
		* Sets the value of the modulateMode uniform.
		* @param {FFLModulateMode} value - The new modulateMode value.
		*/
		set modulateMode(value) {
			this.uniforms.modulateType = { value };
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
		/**
		* Gets the modulateType value.
		* @returns {FFLModulateType|undefined} The modulateType value if it is set.
		*/
		get modulateType() {
			return this._modulateType;
		}
		setUniformsFromMatParam(matParam) {
			this.uniforms.u_HalfLambertFactor = { value: matParam.halfLambertFactor };
			this.uniforms.u_SssSpecularFactor = { value: matParam.sssSpecularBlendFactor };
			this.uniforms.u_SpecularFactorA = { value: matParam.specularFactorA };
			this.uniforms.u_SpecularFactorB = { value: matParam.specularFactorB };
			this.uniforms.u_SpecularShinness = { value: matParam.specularShinness };
			this.uniforms.u_RimPower = { value: matParam.rimLightPower };
			this.uniforms.u_RimWidth = { value: matParam.rimLightWidth };
		}
		/**
		* Sets the material uniforms based on the modulate type value.
		* @param {FFLModulateType} value - The new modulateType value.
		*/
		set modulateType(value) {
			const matParam = NnMiiMaterialTables.drawParamMaterials[value];
			if (!matParam) return;
			/** @private */
			this._modulateType = value;
			/** Default = DRAW_TYPE_NORMAL */
			let drawType = 0;
			if (value === 0) drawType = 1;
			else if (value === 4) drawType = 2;
			this.uniforms.drawType = { value: drawType };
			this.setUniformsFromMatParam(matParam);
		}
		/**
		* Gets the texture map if it is set.
		* @returns {THREE.Texture|null} The texture map, or null if it is unset.
		*/
		get map() {
			return this.uniforms.s_Tex ? this.uniforms.s_Tex.value : null;
		}
		/**
		* Sets the texture map (s_Tex uniform).
		* @param {THREE.Texture} value - The new texture map.
		*/
		set map(value) {
			this.uniforms.s_Tex = { value };
		}
		/**
		* Gets the light direction.
		* @returns {THREE.Vector3} The light direction.
		*/
		get lightDirection() {
			return this.uniforms.lightDirInView.value;
		}
		/**
		* Sets the light direction.
		* @param {THREE.Vector3} value - The new light direction.
		*/
		set lightDirection(value) {
			this.uniforms.lightDirInView = { value };
		}
		get colorInfo() {
			return null;
		}
		/**
		* Sets the information about color indices that are needed
		* to resolve material table elements for shader uniforms.
		* @param {SampleShaderMaterialColorInfo} value - The colorInfo.
		* Use getColorInfo() on the CharModel to get this.
		*/
		set colorInfo(value) {
			console.assert(this._modulateType !== void 0, "modulateType must be set before colorInfo");
			/**
			* 0->8
			* @param {number} c - Ver3 hair color.
			* @returns {number} The corresponding common color.
			*/
			const ver3ToVer4HairColor = (c) => c === 0 ? 8 : c & 2147483647;
			const getSssTable = () => this._sssColorTable[this._modulateType];
			const getSpecularTable = () => this._specularColorTable[this._modulateType];
			let sssColor = /* @__PURE__ */ new three.Color(0);
			let specularColor = /* @__PURE__ */ new three.Color(0);
			/** The working color space, needed to set colors from hex without conversion. */
			const workingSpace = three.ColorManagement ? three.ColorManagement.workingColorSpace : "";
			/**
			* @param {number} hex - Hexadecimal/numerical color value.
			* @returns {THREE.Color} The THREE.Color corresponding to the value.
			*/
			const newColor = (hex) => new three.Color().setHex(hex, workingSpace);
			switch (this._modulateType) {
				case 0:
				case 3:
					sssColor = newColor(getSssTable()[value.facelineColor]);
					specularColor = newColor(getSpecularTable()[value.facelineColor]);
					break;
				case 1:
				case 4: {
					const color = ver3ToVer4HairColor(this._modulateType === 1 ? value.beardColor : value.hairColor);
					sssColor = newColor(getSssTable()[color]);
					specularColor = newColor(getSpecularTable()[color]);
					break;
				}
				case 5: {
					const matParam = NnMiiMaterialTables.drawParamMaterials[this._modulateType];
					NnMiiMaterialTables.modifyCapMaterial(matParam, value.favoriteColor);
					this.setUniformsFromMatParam(matParam);
				}
				case 9:
					sssColor = newColor(getSssTable()[value.favoriteColor]);
					specularColor = newColor(getSpecularTable()[value.favoriteColor]);
					break;
				case 8:
					specularColor = newColor(getSpecularTable()[0]);
					break;
				case 10: {
					const index = value.pantsColor === 3 ? 1 : 0;
					sssColor = newColor(getSssTable()[index]);
					specularColor = newColor(getSpecularTable()[index]);
					break;
				}
			}
			this.uniforms.u_SssColor = { value: sssColor };
			this.uniforms.u_SpecularColor = { value: specularColor };
			if (this._modulateType === 0 || this._modulateType === 3) {
				const color = new three.Color(NnMiiMaterialTables.rimFacelineForeheadColors[value.facelineColor]);
				this.uniforms.u_RimColor = { value: color };
			} else this.uniforms.u_RimColor = { value: new three.Color(0) };
		}
		/**
		* Method to get colorInfo from FFLiCharInfo included in glTFs.
		* @param {string} base64 - Base64-encoded FFLiCharInfo from glTF.
		* @returns {SampleShaderMaterialColorInfo} The colorInfo for use in this material.
		* @throws {Error} Throws if the input's size does not match.
		*/
		static getColorInfoFromCharInfoB64(base64) {
			/** CharInfo data decoded inline from Base64. */
			const data = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
			if (data.length !== 288) throw new Error("getColorInfoFromCharInfoB64: Input is not FFLiCharInfo.");
			const dv = new DataView(data.buffer);
			return {
				facelineColor: dv.getUint32(8, true),
				favoriteColor: dv.getUint32(236, true),
				hairColor: dv.getUint32(24, true),
				beardColor: dv.getUint32(128, true),
				pantsColor: 0
			};
		}
		/**
		* Re-assigns normal attribute on the glass mesh to the
		* normals for glass found in ShapeHigh.dat.
		* @param {THREE.BufferGeometry} geometry -
		* The geometry in which to re-assign the normal attribute.
		*/
		static assignNormalsForGlass(geometry) {
			const glassNormalBuffer = /* @__PURE__ */ new Float32Array([
				-.10568,
				-.70254,
				.70254,
				.10568,
				-.70254,
				.70254,
				-.10568,
				.70254,
				.70254,
				.10568,
				.70254,
				.70254
			]);
			const attribute = new three.BufferAttribute(glassNormalBuffer, 3);
			geometry.setAttribute("normal", attribute);
		}
		/**
		* @param {{modulateParam: {type: number}}} drawParam - The FFLDrawParam for the mesh to check.
		* @param {THREE.BufferGeometry} geometry - BufferGeometry to modify.
		*/
		static modifyBufferGeometry(drawParam, geometry) {
			if (drawParam.modulateParam.type === 8) this.assignNormalsForGlass(geometry);
		}
	};
	var SampleShaderMaterial_default = SampleShaderMaterial;

//#endregion
return SampleShaderMaterial_default;
})(THREE);