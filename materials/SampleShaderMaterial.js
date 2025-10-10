/**
 * @file SampleShaderMaterial.js
 * Three.js material class using the Switch SampleShader.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check
import * as THREE from 'three';

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

// // ---------------------------------------------------------------------
// //  Vertex Shader for SampleShaderMaterial
// //  Derived from SampleShader.bnsh found in the NintendoSDK.
// // ---------------------------------------------------------------------
const _SampleShader_vert = /* glsl */`
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

// // ---------------------------------------------------------------------
// //  Fragment Shader for SampleShaderMaterial
// //  Mostly unmodified from SampleShader.bnsh found in the NintendoSDK.
// // ---------------------------------------------------------------------
const _SampleShader_frag = /* glsl */`
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

// ----------------------------------------------------------------------------

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

class NnMiiMaterialTables {
	/**
	 * Material uniform table mapping to FFLModulateType.
	 * @type {Array<DrawParamMaterial>}
	 * @package
	 */
	static drawParamMaterials = [
		// ShapeFaceline
		{
			halfLambertFactor: 0.4,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 2.6,
			specularFactorB: 0.02,
			specularShinness: 0.8,
			rimLightPower: 2.0,
			rimLightWidth: 0.3
		},
		// ShapeBeard
		{
			halfLambertFactor: 0.2,
			sssSpecularBlendFactor: 0.0,
			specularFactorA: 1.0,
			specularFactorB: 0.0,
			specularShinness: 1.3,
			rimLightPower: 1.0,
			rimLightWidth: 0.5
		},
		// ShapeNose
		{
			halfLambertFactor: 0.3,
			sssSpecularBlendFactor: 0.0,
			specularFactorA: 2.6,
			specularFactorB: 0.02,
			specularShinness: 0.8,
			rimLightPower: 0.55,
			rimLightWidth: 0.0
		},
		// ShapeForehead (Same as faceline)
		{
			halfLambertFactor: 0.4,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 2.6,
			specularFactorB: 0.02,
			specularShinness: 0.8,
			rimLightPower: 2.0,
			rimLightWidth: 0.3
		},
		// ShapeHair
		{
			halfLambertFactor: 0.45,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 1.0,
			specularFactorB: 0.06,
			specularShinness: 0.8,
			rimLightPower: 1.0,
			rimLightWidth: 0.5
		},
		// ShapeCap
		// index 0 (red): specularFactorB = 0.0
		// index 2 (yellow): specularFactorA = 1.1
		// index 6 (sky blue): specularFactorB = 0.8
		// index 9 (brown): specularShinness = 2.0
		{
			halfLambertFactor: 0.6,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 2.0,
			specularFactorB: 0.02,
			specularShinness: 0.8,
			rimLightPower: 1.0,
			rimLightWidth: 0.5
		},
		// ShapeMask
		{
			halfLambertFactor: 0.0,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 0.0,
			specularFactorB: 0.0,
			specularShinness: 0.1,
			rimLightPower: 1.0,
			rimLightWidth: 0.5
		},
		// ShapeNoseline (Same as mask)
		{
			halfLambertFactor: 0.0,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 0.0,
			specularFactorB: 0.0,
			specularShinness: 0.1,
			rimLightPower: 1.0,
			rimLightWidth: 0.5
		},
		// ShapeGlass
		{
			halfLambertFactor: 0.35,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 0.3,
			specularFactorB: 0.0,
			specularShinness: 30.0,
			rimLightPower: 1.0,
			rimLightWidth: 0.0
		},
		// Body
		{
			halfLambertFactor: 0.5,
			sssSpecularBlendFactor: 0.0,
			specularFactorA: 1.0,
			specularFactorB: 0.0,
			specularShinness: 0.8,
			rimLightPower: 1.0,
			rimLightWidth: 0.0
		},
		// Pants
		{
			halfLambertFactor: 0.6,
			sssSpecularBlendFactor: 1.0,
			specularFactorA: 1.0,
			specularFactorB: 0.02,
			specularShinness: 0.7,
			rimLightPower: 1.0,
			rimLightWidth: 0.5
		}
	];

	// // -----------------------------------------------------------------
	// //  Sub-Specular Scattering Colors
	// // -----------------------------------------------------------------

	/*
	static sssFacelineColors = null;
	static sssFavoriteColorsBody = null;
	static sssFavoriteColorsCap = null;
	static sssCommonColors = null;
	static sssPantsColors = null;
	*/

	// Linear -------------------------------------------------------------

	static sssFacelineColors = [
		0xA52200,
		0xA40900,
		0x4B0000,
		0xB20A00,
		0x330300,
		0x0F0100,
		0xA72800,
		0x961C09,
		0x140101,
		0x050000
	];

	static sssFavoriteColorsBody = [
		0x2A0301,
		0x460000,
		0x331501,
		0x061506,
		0x000C09,
		0x000724,
		0x03112C,
		0x0C0919,
		0x050422,
		0x000004,
		0x0B162C,
		0x000000
	];

	static sssFavoriteColorsCap = [
		0x550001,
		0x82460A,
		0x64230A,
		0x1E500A,
		0x0A1E0D,
		0x050F32,
		0x143958,
		0x500F14,
		0x1E0757,
		0x0A0502,
		0x7C7C64,
		0x000000
	];

	static sssCommonColors = [
		0x020101,
		0x030100,
		0x040100,
		0x060201,
		0x060607,
		0x030300,
		0x060401,
		0x0A0803,
		0x000000,
		0x050505,
		0x050302,
		0x040402,
		0x030408,
		0x020504,
		0x040200,
		0x080000,
		0x010205,
		0x080400,
		0x060505,
		0x0A0400,
		0x000000,
		0x0C0303,
		0x0C0705,
		0x070403,
		0x060101,
		0x0C0505,
		0x0C0808,
		0x0C0909,
		0x050202,
		0x070103,
		0x060103,
		0x090303,
		0x090104,
		0x080406,
		0x090405,
		0x0C0507,
		0x0C080A,
		0x0C0A0A,
		0x020103,
		0x020203,
		0x030103,
		0x050308,
		0x060409,
		0x09060A,
		0x08070A,
		0x09080B,
		0x0B090C,
		0x0A090B,
		0x010103,
		0x000305,
		0x02060A,
		0x04090C,
		0x06090B,
		0x06080C,
		0x06090C,
		0x080B0C,
		0x000202,
		0x000302,
		0x000304,
		0x010504,
		0x020607,
		0x030808,
		0x060907,
		0x060A09,
		0x060B09,
		0x000302,
		0x030600,
		0x000504,
		0x020705,
		0x030801,
		0x070900,
		0x040906,
		0x070B03,
		0x070B06,
		0x090C08,
		0x070702,
		0x080704,
		0x0A0902,
		0x0A0906,
		0x0A0A06,
		0x0A0A05,
		0x0A0B06,
		0x0A0C07,
		0x060300,
		0x0B0906,
		0x0C0B03,
		0x0C0B06,
		0x0C0B07,
		0x0C0C07,
		0x080301,
		0x0C0700,
		0x0A0705,
		0x0C0805,
		0x0C0907,
		0x0B0A08,
		0x030303,
		0x070707,
		0x090909,
		0x0B0A0A,
		0x060606
	];

	static sssPantsColors = [
		0x000000,
		0x280000
	];

	// // -----------------------------------------------------------------
	// //  Specular Colors
	// // -----------------------------------------------------------------

	/*
	static specularFacelineColors = null;
	static specularFavoriteColorsBody = null;
	static specularFavoriteColorsCap = null;
	static specularCommonColors = null;
	static specularGlassColor = null;
	static specularPantsColors = null;
	static rimFacelineForeheadColors = null;
	*/

	// Linear -------------------------------------------------------------

	static specularFacelineColors = [
		0x2D150F,
		0x23180A,
		0x1F0A03,
		0x1D0E05,
		0x200703,
		0x080201,
		0x2D150F,
		0x23140A,
		0x0F0501,
		0x050201
	];

	static specularFavoriteColorsBody = [
		0x2A0604,
		0x331605,
		0x332B06,
		0x182A06,
		0x001809,
		0x020E24,
		0x0C2C37,
		0x311219,
		0x170822,
		0x080301,
		0x382C2C,
		0x050505
	];

	static specularFavoriteColorsCap = [
		0x3F0002,
		0x372507,
		0x3C1E0A,
		0x1C3F05,
		0x051E05,
		0x010743,
		0x102A3D,
		0x460F14,
		0x16032C,
		0x0A0502,
		0x28281E,
		0x020202
	];

	static specularCommonColors = [
		0x050404,
		0x200C02,
		0x2E0901,
		0x3E1703,
		0x242426,
		0x271802,
		0x442303,
		0x68400B,
		0x030303,
		0x202222,
		0x331806,
		0x302507,
		0x152154,
		0x102C2C,
		0x301602,
		0x540601,
		0x091334,
		0x542600,
		0x24221F,
		0x6C2001,
		0x050505,
		0x7A1C0A,
		0x783D11,
		0x462009,
		0x420F05,
		0x7F2E0F,
		0x7F3D18,
		0x7F4C1B,
		0x391208,
		0x4C0C09,
		0x450909,
		0x5A1809,
		0x630C0C,
		0x582113,
		0x632110,
		0x7D2E16,
		0x7E441E,
		0x7F5020,
		0x180B09,
		0x10101E,
		0x26090B,
		0x371A1A,
		0x42241B,
		0x60341E,
		0x323A64,
		0x3B4473,
		0x474C7D,
		0x3F4E76,
		0x070C20,
		0x051933,
		0x0C346A,
		0x1A4879,
		0x244E6F,
		0x29427D,
		0x274B7D,
		0x305A7F,
		0x03121B,
		0x00181D,
		0x031F2C,
		0x0A2831,
		0x0E3246,
		0x174558,
		0x244E4F,
		0x265460,
		0x285B5B,
		0x051D07,
		0x213000,
		0x012E0E,
		0x1B3D10,
		0x254503,
		0x494C01,
		0x314F14,
		0x4F5909,
		0x4B5812,
		0x5D6019,
		0x4C3A06,
		0x533B0E,
		0x664C08,
		0x664A14,
		0x6C5113,
		0x6A5610,
		0x6A5C13,
		0x6C6417,
		0x3E1B00,
		0x734A12,
		0x7F5A0B,
		0x7D5813,
		0x7B5D17,
		0x7D6317,
		0x531E04,
		0x7F3C01,
		0x683E0F,
		0x7F470F,
		0x7F4D15,
		0x72521A,
		0x141414,
		0x2F2F2F,
		0x393939,
		0x42403E,
		0x010101
	];

	static specularPantsColors = [
		0x050505,
		0x3C2800
	];

	static rimFacelineForeheadColors = [
		0x431E16,
		0x3C2811,
		0x3E1406,
		0x3C1E0A,
		0x400E06,
		0x401008,
		0x431F16,
		0x3C2515,
		0x3C0C03,
		0x3C140A
	];

	/** Single specular color for glass. */
	static specularGlassColors = [0x191919];

	/**
	 * Gets a table that maps {@link FFLModulateType} to the
	 * sssColor table indexed by Ver4 color values.
	 * @returns {Array<Array<number>|null>} The sssColor tables mapping to
	 * each {@link FFLModulateType}, or null if it doesn't apply.
	 */
	static getTypeToSssColorTable = () =>
		[
			// ShapeFaceline
			this.sssFacelineColors,
			// ShapeBeard
			this.sssCommonColors,
			// ShapeNose
			this.sssFacelineColors,
			// ShapeForehead
			this.sssFacelineColors,
			// ShapeHair
			this.sssCommonColors,
			// ShapeCap
			this.sssFavoriteColorsCap,
			// ShapeMask - Color is zeroes.
			null,
			// ShapeNoseline - Color is zeroes.
			null,
			// ShapeGlass - Color is zeroes.
			null,
			// Body
			this.sssFavoriteColorsBody,
			// Pants
			this.sssPantsColors
		];

	/**
	 * Gets a table that maps {@link FFLModulateType} to the
	 * specularColor table indexed by Ver4 color values.
	 * @returns {Array<Array<number>|null>} The specularColor tables mapping to
	 * each {@link FFLModulateType}, or null if it doesn't apply.
	 */
	static getTypeToSpecularColorTable = () =>
		[
			// ShapeFaceline
			this.specularFacelineColors,
			// ShapeBeard
			this.specularCommonColors,
			// ShapeNose
			this.specularFacelineColors,
			// ShapeForehead
			this.specularFacelineColors,
			// ShapeHair
			this.specularCommonColors,
			// ShapeCap
			this.specularFavoriteColorsCap,
			// ShapeMask - Color is zeroes.
			null,
			// ShapeNoseline - Color is zeroes.
			null,
			// ShapeGlass - Single color.
			this.specularGlassColors,
			// Body
			this.specularFavoriteColorsBody,
			// Pants
			this.specularPantsColors
		];

	/**
	 * Because the cap material is the only one where material
	 * parameters vary, this function will modify it based on the index.
	 * @param {DrawParamMaterial} material - The material for cap.
	 * @param {number} index - The favorite color index.
	 */
	static modifyCapMaterial(material, index) {
		switch (index) {
			case 0: // FFL_FAVORITE_COLOR_RED
				material.specularFactorB = 0.0;
				break;
			case 2: // FFL_FAVORITE_COLOR_YELLOW
				material.specularFactorA = 1.1;
				break;
			case 6: // FFL_FAVORITE_COLOR_SKYBLUE
				material.specularFactorB = 0.8;
				break;
			case 9: // FFL_FAVORITE_COLOR_BROWN
				material.specularShinness = 2.0;
				break;
		}
	}
}

// // ---------------------------------------------------------------------
// //  SampleShaderMaterial Class
// // ---------------------------------------------------------------------
/**
 * Custom THREE.ShaderMaterial using the SampleShader.
 * @augments {THREE.ShaderMaterial}
 */
class SampleShaderMaterial extends THREE.ShaderMaterial {
	/** Indicates that this material requires an alpha value of 0 in the faceline color. */
	static needsFacelineAlpha = true;

	// Default light and rim light uniforms.

	/**
	 * Default ambient light color.
	 * @type {THREE.Color}
	 */
	static defaultLightColor = new THREE.Color(1.0, 1.0, 1.0);
	/**
	 * Default light direction.
	 * @type {THREE.Vector3}
	 */
	static defaultLightDir = new THREE.Vector3(-0.1227878, 0.70710677, 0.6963642);

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
		// Set default uniforms.
		/** @type {Object<string, THREE.IUniform>} */
		const uniforms = {
			lightColor: {
				value: SampleShaderMaterial.defaultLightColor
			},
			lightDirInView: { value: SampleShaderMaterial.defaultLightDir.clone() },
			lightEnable: { value: true }, // Default to true.
			gammaType: { value: 1 } // TODO: potentially allow fully linear flow?
			// 0 = linear (output is LINEAR, use HARDWARE DEGAMMA), 1 = sRGB
			// if type is sRGB, it will degamma input and output colors
			// from/to sRGB, which is being used right now
		};

		// Construct the ShaderMaterial using the shader source.
		super({
			vertexShader: _SampleShader_vert,
			fragmentShader: _SampleShader_frag,
			uniforms: uniforms
		});

		// Initialize default values.
		/** @type {FFLModulateType} */
		this._modulateType = 0;

		// Set material color tables for this instance.
		/** @package */
		this._sssColorTable = NnMiiMaterialTables.getTypeToSssColorTable();
		/** @package */
		this._specularColorTable = NnMiiMaterialTables.getTypeToSpecularColorTable();

		// Use the setters to set the rest of the uniforms.
		this.setValues(options);
	}

	/**
	 * Gets the constant color (constColor1) uniform as THREE.Color.
	 * @returns {THREE.Color|null} The constant color, or null if it is not set.
	 */
	get color() {
		if (!this.uniforms.constColor1) {
			// If color is not set, return null.
			return null;
		} else if (this._color3) {
			// Use cached THREE.Color instance if it is set.
			return this._color3;
		}
		// Get THREE.Color from constColor1 (Vector4).
		const color4 = /** @type {IUniformVector4} */ (this.uniforms.constColor1).value;
		const color3 = new THREE.Color(color4.x, color4.y, color4.z);
		this._color3 = color3; // Cache the THREE.Color instance.
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
		function toColor4(color, opacity = 1.0) {
			return new THREE.Vector4(color.r, color.g, color.b, opacity);
		}
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances to constColor1/2/3.
			/** @type {IUniformVector4} */ (this.uniforms.constColor1) =
				{ value: toColor4(value[0]) };
			/** @type {IUniformVector4} */ (this.uniforms.constColor2) =
				{ value: toColor4(value[1]) };
			/** @type {IUniformVector4} */ (this.uniforms.constColor3) =
				{ value: toColor4(value[2]) };
			return;
		}
		// Set single color as THREE.Color, defaulting to white.
		const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
		/** @type {THREE.Color} */
		this._color3 = color3;
		// Assign single color with white as a placeholder.
		const opacity = this.opacity;
		if (this._opacity) {
			// if _opacity is set then the above returned it, delete when done
			delete this._opacity;
		}
		/** @type {IUniformVector4} */ (this.uniforms.constColor1) =
			{ value: toColor4(color3, opacity) };

		// Check if a constant color is being set for faceline.
		if (value && this._modulateType === 0) { // SHAPE_FACELINE
			this.uniforms.drawType = { value: 0 }; // DRAW_TYPE_NORMAL
		}
	}

	/**
	 * Gets the opacity of the constant color.
	 * @returns {number} The opacity value.
	 */
	// @ts-ignore - Already defined on parent class.
	get opacity() {
		if (!this.uniforms.constColor1) {
			// Get from _opacity if it is set before constant color.
			return this._opacity ? this._opacity : 1;
		}
		// Return w (alpha) of the constant color uniform.
		return /** @type {IUniformVector4} */ (this.uniforms.constColor1).value.w;
	}

	/**
	 * Sets the opacity of the constant color.
	 * NOTE: that this is actually set in the constructor
	 * of Material, meaning it is the only one set BEFORE uniforms are
	 * @param {number} value - The new opacity value.
	 */
	// @ts-ignore - Already defined on parent class.
	set opacity(value) {
		if (!this.uniforms || !this.uniforms.constColor1) {
			// Store here for later when color is set.
			this._opacity = 1;
			return;
		}
		/** @type {IUniformVector4} */ (this.uniforms.constColor1).value.w = value;
	}

	/**
	 * Gets the value of the modulateMode uniform.
	 * @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
	 */
	get modulateMode() {
		// Confusingly, this shader refers to modulate MODE as modulate "type".
		return this.uniforms.modulateType ? this.uniforms.modulateType.value : null;
	}

	/**
	 * Sets the value of the modulateMode uniform.
	 * @param {FFLModulateMode} value - The new modulateMode value.
	 */
	set modulateMode(value) {
		this.uniforms.modulateType = { value: value };
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
		this.uniforms.lightEnable = { value: value };
	}

	/**
	 * Gets the modulateType value.
	 * @returns {FFLModulateType|undefined} The modulateType value if it is set.
	 */
	get modulateType() {
		// This isn't actually a uniform so this is a private property.
		return this._modulateType;
	}

	setUniformsFromMatParam(/** @type {DrawParamMaterial} */ matParam) {
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
		// Get material uniforms for modulate type from drawParamMaterials table.
		const matParam = NnMiiMaterialTables.drawParamMaterials[value];
		if (!matParam) {
			// Out of bounds modulateType that don't have materials
			// are usually for mask/faceline textures, so don't throw error
			return;
		}
		this._modulateType = value;

		// Set drawType uniform.
		/** Default = DRAW_TYPE_NORMAL */
		let drawType = 0;
		if (value === 0) { // SHAPE_FACELINE
			drawType = 1; // DRAW_TYPE_FACELINE
		} else if (value === 4) { // SHAPE_HAIR
			drawType = 2; // DRAW_TYPE_HAIR
		}
		this.uniforms.drawType = { value: drawType };

		// Set material uniforms from matParam object.
		this.setUniformsFromMatParam(matParam);

		// Placeholders.
		// this.uniforms.u_SssColor = { value: new THREE.Color(1, 1, 1) };
		// this.uniforms.u_SpecularColor = { value: new THREE.Color(1, 1, 1) };
		// this.uniforms.u_RimColor = { value: new THREE.Color(1, 1, 1) };
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
		this.uniforms.s_Tex = { value: value };
	}

	/**
	 * Gets the light direction.
	 * @returns {THREE.Vector3} The light direction.
	 */
	get lightDirection() {
		// Should always be set as long as this is constructed.
		return this.uniforms.lightDirInView.value;
	}

	/**
	 * Sets the light direction.
	 * @param {THREE.Vector3} value - The new light direction.
	 */
	set lightDirection(value) {
		// NOTE: Fourth component will be undefined/NaN, but it's unused anyway.
		this.uniforms.lightDirInView = { value: value };
	}

	get colorInfo() {
		// @ts-expect-error -- The getter needs to work, but a value can't be provided.
		return null;
	}

	/**
	 * Sets the information about color indices that are needed
	 * to resolve material table elements for shader uniforms.
	 * @param {SampleShaderMaterialColorInfo} value - The colorInfo.
	 * Use getColorInfo() on the CharModel to get this.
	 */
	set colorInfo(value) {
		console.assert(this._modulateType !== undefined, 'modulateType must be set before colorInfo');

		// facelineColor: maps identically, no conv needed
		/**
		 * 0->8
		 * @param {number} c - Ver3 hair color.
		 * @returns {number} The corresponding common color.
		 */
		const ver3ToVer4HairColor = c => c === 0
			? 8 // ver3 0 -> common 8
			// Applying the commonColorEnableMask.
			: (c & ~(1 << 31));

		// Functions to get sssColor/specularColor tables for the current modulateType.
		// Ignore null tables completely. Manually ignore mask, noseline, glass.

		const getSssTable = () =>
			/** @type {Array<number>} */ (this._sssColorTable[this._modulateType]);
		const getSpecularTable = () =>
			/** @type {Array<number>} */ (this._specularColorTable[this._modulateType]);

		let sssColor = new THREE.Color(0);
		let specularColor = new THREE.Color(0);

		/** The working color space, needed to set colors from hex without conversion. */
		const workingSpace = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
		/**
		 * @param {number} hex - Hexadecimal/numerical color value.
		 * @returns {THREE.Color} The THREE.Color corresponding to the value.
		 */
		const newColor = hex => new THREE.Color().setHex(hex, workingSpace);

		switch (this._modulateType) {
			case 0: // SHAPE_FACELINE
			case 3: // SHAPE_FOREHEAD
				sssColor = newColor(getSssTable()[value.facelineColor]);
				specularColor = newColor(getSpecularTable()[value.facelineColor]);
				break;
			case 1: // SHAPE_BEARD
			case 4: { // SHAPE_HAIR
				const color = ver3ToVer4HairColor(
					this._modulateType === 1
						? value.beardColor
						: value.hairColor
				);
				sssColor = newColor(getSssTable()[color]);
				specularColor = newColor(getSpecularTable()[color]);
				break;
			}
			case 5: { // SHAPE_CAP
				const matParam = NnMiiMaterialTables.drawParamMaterials[this._modulateType];
				// Additionally, modify the cap material if needed, and re-set the drawParamMaterials.
				NnMiiMaterialTables.modifyCapMaterial(matParam, value.favoriteColor);
				this.setUniformsFromMatParam(matParam);
			}
			// eslint-disable-next-line no-fallthrough -- Ignore fallthrough.
			case 9: { // Body: Favorite color.
				sssColor = newColor(getSssTable()[value.favoriteColor]);
				specularColor = newColor(getSpecularTable()[value.favoriteColor]);
				break;
			}
			// case 6: // SHAPE_MASK
			// case 7: { // SHAPE_NOSELINE
			// sssColor and specularColor are zeroes.
			// 	break;
			// }
			case 8: { // SHAPE_GLASS
				// Only gets specularColor, sssColor is zeroed.
				specularColor = newColor(getSpecularTable()[0]);
				break;
			}

			case 10: { // Pants - Gray or Gold ONLY
				// Use gold color if pantsColor is PantsColor.GoldSpecial.
				const index = value.pantsColor === 3 ? 1 : 0;
				sssColor = newColor(getSssTable()[index]);
				specularColor = newColor(getSpecularTable()[index]);
				break;
			}
		}

		this.uniforms.u_SssColor = { value: sssColor };
		this.uniforms.u_SpecularColor = { value: specularColor };

		// SHAPE_FACELINE || SHAPE_FOREHEAD: Apply rimColor.
		if (this._modulateType === 0 || this._modulateType === 3) {
			const color = new THREE.Color(
				NnMiiMaterialTables.rimFacelineForeheadColors[value.facelineColor]
			);
			this.uniforms.u_RimColor = { value: color };
		} else {
			this.uniforms.u_RimColor = { value: new THREE.Color(0) };
		}
	}

	/**
	 * Method to get colorInfo from FFLiCharInfo included in glTFs.
	 * @param {string} base64 - Base64-encoded FFLiCharInfo from glTF.
	 * @returns {SampleShaderMaterialColorInfo} The colorInfo for use in this material.
	 * @throws {Error} Throws if the input's size does not match.
	 */
	static getColorInfoFromCharInfoB64(base64) {
		/** CharInfo data decoded inline from Base64. */
		const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
		if (data.length !== 288) { // sizeof(FFLiCharInfo)
			throw new Error('getColorInfoFromCharInfoB64: Input is not FFLiCharInfo.');
		}
		const dv = new DataView(data.buffer);
		return {
			// Read little-endian values from the CharInfo.
			facelineColor: dv.getUint32(8, true),
			favoriteColor: dv.getUint32(236, true),
			hairColor: dv.getUint32(24, true),
			beardColor: dv.getUint32(128, true),
			pantsColor: 0 // Always use gray.
		};
	}

	/**
	 * Re-assigns normal attribute on the glass mesh to the
	 * normals for glass found in ShapeHigh.dat.
	 * @param {THREE.BufferGeometry} geometry -
	 * The geometry in which to re-assign the normal attribute.
	 */
	static assignNormalsForGlass(geometry) {
		const glassNormalBuffer = new Float32Array([-0.10568, -0.70254,
			0.70254, 0.10568, -0.70254, 0.70254, -0.10568,
			0.70254, 0.70254, 0.10568, 0.70254, 0.70254]);
		const attribute = new THREE.BufferAttribute(glassNormalBuffer, 3);
		geometry.setAttribute('normal', attribute);
	}

	/**
	 * @param {{modulateParam: {type: number}}} drawParam - The FFLDrawParam for the mesh to check.
	 * @param {THREE.BufferGeometry} geometry - BufferGeometry to modify.
	 */
	static modifyBufferGeometry(drawParam, geometry) {
		if (drawParam.modulateParam.type === 8) { // SHAPE_GLASS
			this.assignNormalsForGlass(geometry);
		}
	}
}

export default SampleShaderMaterial;
