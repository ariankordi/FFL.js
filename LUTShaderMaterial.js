// @ts-check
'use strict';
/*
import * as THREE from 'three';
import { FFLModulateMode, FFLModulateType } from './ffl.js';
*/
// // ---------------------------------------------------------------------
// //  Vertex Shader for LUTShaderMaterial
// //  Derived from LUT.vsh found in Miitomo.
// // ---------------------------------------------------------------------
const _LUTShader_vert = /* glsl */`
#define AGX_FEATURE_ALBEDO_TEXTURE
/**
 * @file    LUT.vsh
 * @brief   LUT
 * @since   2014/10/02
 *
 * Copyright (c)2014 Nintendo Co., Ltd. All rights reserved.
 */

// シェーダーの種類毎に設定されるマクロリスト
// AGX_FEATURE_VERTEX_COLOR         頂点カラーが有効
// AGX_FEATURE_ALBEDO_TEXTURE       アルベドテクスチャーが有効
// AGX_FEATURE_BUMP_TEXTURE         バンプテクスチャーが有効
// AGX_FEATURE_MASK_TEXTURE         マスクテクスチャーが有効
// AGX_FEATURE_ALPHA_TEXTURE        アルファテクスチャーが有効
// AGX_FEATURE_SPHERE_MAP_TEXTURE   スフィア環境マップが有効
// AGX_FEATURE_SKIN_MASK            肌マスクが有効（uColor0）
// AGX_FEATURE_HAIR_MASK            髪マスクが有効（uColor1）
// AGX_FEATURE_ALPHA_TEST           アルファテストが有効
// AGX_FEATURE_FADE_OUT_COLOR       フェードアウトカラーが有効（uColor2）
// AGX_FEATURE_DISABLE_LIGHT        ライトが無効
// AGX_FEATURE_ALPHA_COLOR_FILTER   アルベドアルファによる色替えが有効
// AGX_FEATURE_ALBEDO_ALPHA         アルベドのアルファをカラーのアルファに適用
// AGX_FEATURE_PREMULTIPLY_ALPHA    プレマルチプライアルファな描画
// AGX_FEATURE_MII                  Miiを描画する
// AGX_FEATURE_MII_CONSTANT         Miiを描画する：Constant
// AGX_FEATURE_MII_TEXTURE_DIRECT   Miiを描画する：Texture Direct
// AGX_FEATURE_MII_RGB_LAYERED      Miiを描画する：RGB Layered
// AGX_FEATURE_MII_ALPHA            Miiを描画する：Alpha
// AGX_FEATURE_MII_LUMINANCE_ALPHA  Miiを描画する：Luminance Alpha
// AGX_FEATURE_MII_ALPHA_OPA        Miiを描画する：Alpha Opa
//
// AGX_BONE_MAX     ボーンの最大数

#ifdef GL_ES
precision highp float;
#else
#   define lowp
#   define mediump
#   define highp
#endif

//#ifndef AGX_BONE_MAX
//#   define AGX_BONE_MAX 15
//#endif
#ifndef AGX_DIR_LIGHT_MAX
#   define AGX_DIR_LIGHT_MAX 2
#endif

// ----------------------------------------
// 頂点シェーダーに入力される attribute 変数
//attribute highp   vec3 position;   //!< 入力:[ 1 : 1 ] 位置情報
#if defined(AGX_FEATURE_ALBEDO_TEXTURE) || defined(AGX_FEATURE_BUMP_TEXTURE) || defined(AGX_FEATURE_MASK_TEXTURE) || defined(AGX_FEATURE_ALPHA_TEXTURE)
//attribute mediump vec2 uv;  //!< 入力:[ 1 : 5 ] テクスチャー座標
#endif
//attribute mediump vec3 normal;     //!< 入力:[ 1 : 2 ] 法線ベクトル
//attribute mediump vec4 aBoneIndex;  //!< 入力:[ 1 : 3 ] ボーンのインデックス（最大4つ）
//attribute mediump vec4 aBoneWeight; //!< 入力:[ 1 : 4 ] ボーンの影響度（最大4つ）
#if defined(AGX_FEATURE_VERTEX_COLOR)
//attribute lowp    vec4 _color;      //!< 入力:[ 1 : 6 ] 頂点カラー
#endif
#if defined(AGX_FEATURE_BUMP_TEXTURE)
//attribute mediump vec3 tangent;    //!< 入力:[ 1 : 7 ] 接線ベクトル
#endif

// ^^ Commented attributes are provided by three.js.

// ----------------------------------------
// 頂点シェーダーに入力される uniform 変数
//uniform highp   mat4 modelViewMatrix;                            //!< 入力:[ 4      /  4 :   4 ] モデルの合成行列
//uniform mat4 projectionMatrix;
//uniform highp   mat4 viewMatrix;                           //!< 入力:[ 4      /  4 :   8 ] モデルのビュー行列
//uniform mediump mat3 normalMatrix;                         //!< 入力:[ 3      /  3 :  11 ] モデルの法線用行列
//uniform highp   mat4 modelMatrix;                          //!< 入力:[ 4      /  4 :  15 ] モデルのワールド変換行列
//uniform lowp    int  uBoneCount;                            //!< 入力:[ 1      /  1 :  16 ] ボーンの個数
//uniform highp   mat4 uBoneMatrices[AGX_BONE_MAX];           //!< 入力:[ 4 x 15 / 60 :  76 ] ボーンの行列配列
//uniform mediump mat3 uBoneNormalMatrices[AGX_BONE_MAX];     //!< 入力:[ 3 x 15 / 45 : 121 ] ボーンの法線行列配列
// ^^ Unused in favor of three.js skinning.
uniform lowp    int  uDirLightCount;                        //!< 入力:[ 1      /  1 : 122 ] 方向ライトの数
uniform mediump vec4 uDirLightDirAndType0;//!< 入力:[ 1 x  2 /  2 : 124 ] 平行ライトの向く方向
uniform mediump vec4 uDirLightDirAndType1;//!< 入力:[ 1 x  2 /  2 : 124 ] 平行ライトの向く方向
uniform mediump vec3 uDirLightColor0;     //!< 入力:[ 1 x  2 /  2 : 126 ] 平行ライトのカラー
uniform mediump vec3 uDirLightColor1;     //!< 入力:[ 1 x  2 /  2 : 126 ] 平行ライトのカラー
uniform mediump vec3 uHSLightSkyColor;                      //!< 入力:[ 1      /  1 : 127 ] 半球ライトのスカイカラー
uniform mediump vec3 uHSLightGroundColor;                   //!< 入力:[ 1      /  1 : 128 ] 半球ライトのグラウンドカラー
//uniform mediump vec3 cameraPosition;                                //!< 入力:[ 1      /  1 : 129 ] カメラの位置
// ^^ previously uEyePt
uniform mediump float uAlpha;                               //!< 入力:[ 1      /  1 : 130 ] アルファ値

// ^^ Commented uniforms are provided by three.js.

// ----------------------------------------
// フラグメントシェーダーに渡される varying 変数
varying lowp    vec4    vModelColor;                            //!< 出力:[ 1 : 1 ] モデルの色
#if !defined(AGX_FEATURE_BUMP_TEXTURE)
varying mediump vec3    vNormal;                                //!< 出力:[ 1 : 2 ] モデルの法線
#endif
#if defined(AGX_FEATURE_ALBEDO_TEXTURE) || defined(AGX_FEATURE_BUMP_TEXTURE) || defined(AGX_FEATURE_MASK_TEXTURE) || defined(AGX_FEATURE_ALPHA_TEXTURE)
varying mediump vec2    vTexcoord0;                             //!< 出力:[ 1 : 3 ] テクスチャーUV
#endif
// camera
varying mediump vec3    vEyeVecWorldOrTangent;                  //!< 出力:[ 1 : 4 ] 視線ベクトル
#if !defined(AGX_FEATURE_DISABLE_LIGHT)
// punctual light
varying mediump vec3    vPunctualLightDirWorldOrTangent;        //!< 出力:[ 1 : 5 ] ライトの方向
varying mediump vec3    vPunctualLightHalfVecWorldOrTangent;    //!< 出力:[ 1 : 6 ] カメラとライトのハーフベクトル
// GI
varying mediump vec3    vGISpecularLightColor;                  //!< 出力:[ 1 : 7 ] GIフレネルで使用するカラー
// Lighting Result
varying mediump vec3    vDiffuseColor;                          //!< 出力:[ 1 : 8 ] ディフューズライティング結果
#endif
// Reflect
#if defined(AGX_FEATURE_SPHERE_MAP_TEXTURE)
varying lowp    vec3    vReflectDir;                            //!< 出力:[ 1 : 9 ] 環境マップの反射ベクトル
#endif

// skinning_pars_vertex.glsl.js
#ifdef USE_SKINNING
    uniform mat4 bindMatrix;
    uniform mat4 bindMatrixInverse;
    uniform highp sampler2D boneTexture;
    mat4 getBoneMatrix( const in float i ) {
        int size = textureSize( boneTexture, 0 ).x;
        int j = int( i ) * 4;
        int x = j % size;
        int y = j / size;
        vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
        vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
        vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
        vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
        return mat4( v1, v2, v3, v4 );
    }
#endif

// ------------------------------------------------------------
// 頂点シェーダーのエントリーポイント
// ------------------------------------------------------------
void main()
{
    // ------------------------------------------------------------
    // 頂点変換用の処理
    // ------------------------------------------------------------
    highp   vec4 position_;  //!< 最終的な頂点
    mediump vec3 normal_;    //!< 最終的な法線
    mediump vec3 tangent_;   //!< 最終的な接線
    highp   vec4 positionWorld; //!< ワールド空間上での頂点


    // begin_vertex.glsl.js
    vec3 transformed = vec3( position );
// skinbase_vertex.glsl.js
#ifdef USE_SKINNING
    mat4 boneMatX = getBoneMatrix( skinIndex.x );
    mat4 boneMatY = getBoneMatrix( skinIndex.y );
    mat4 boneMatZ = getBoneMatrix( skinIndex.z );
    mat4 boneMatW = getBoneMatrix( skinIndex.w );
    // skinning_vertex.glsl.js
    vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
    vec4 skinned = vec4( 0.0 );
    skinned += boneMatX * skinVertex * skinWeight.x;
    skinned += boneMatY * skinVertex * skinWeight.y;
    skinned += boneMatZ * skinVertex * skinWeight.z;
    skinned += boneMatW * skinVertex * skinWeight.w;
    transformed = ( bindMatrixInverse * skinned ).xyz;
#endif

    // ----------------------------------------
    // ボーンが存在しない場合は位置と法線に手を加えない
    position_ = vec4(transformed.xyz, 1.0);



    normal_ = normal;
#if defined(AGX_FEATURE_BUMP_TEXTURE)
    tangent_ = tangent.xyz;
#endif
    // skinnormal_vertex.glsl.js
#ifdef USE_SKINNING
    mat4 skinMatrix = mat4( 0.0 );
    skinMatrix += skinWeight.x * boneMatX;
    skinMatrix += skinWeight.y * boneMatY;
    skinMatrix += skinWeight.z * boneMatZ;
    skinMatrix += skinWeight.w * boneMatW;
    skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

    normal_ = vec4( skinMatrix * vec4( normal_, 0.0 ) ).xyz;
#if defined(AGX_FEATURE_BUMP_TEXTURE)
    tangent_ = vec4( skinMatrix * vec4( tangent_, 0.0 ) ).xyz;
#endif // defined(AGX_FEATURE_BUMP_TEXTURE)
#endif // USE_SKINNING

    // ----------------------------------------
    // ワールド上での位置を求める
    positionWorld = modelMatrix * position_;
    // 最終結果を行う
    position_ = projectionMatrix * modelViewMatrix * position_;
    normal_   = normalize(normalMatrix * normal_);
#if defined(AGX_FEATURE_BUMP_TEXTURE)
    tangent  = normalize(normalMatrix * tangent_);
#endif

    // ----------------------------------------
    // 計算結果を保持させる
    gl_Position = position_;
#if !defined(AGX_FEATURE_BUMP_TEXTURE)
    vNormal     = normal_;
#endif
#if defined(AGX_FEATURE_ALBEDO_TEXTURE) || defined(AGX_FEATURE_BUMP_TEXTURE) || defined(AGX_FEATURE_MASK_TEXTURE) || defined(AGX_FEATURE_ALPHA_TEXTURE)
    // テクスチャー座標を設定する
    vTexcoord0 = uv;
#endif
    // モデルの色を指定する
#if defined(AGX_FEATURE_VERTEX_COLOR)
    lowp vec4 modelColor = aColor;

#else
    lowp vec4 modelColor = vec4(1.0, 1.0, 1.0, 1.0);
#endif

    // プリマルチプライドアルファ
#if defined(AGX_FEATURE_PREMULTIPLY_ALPHA)
    modelColor *= uAlpha;
#else
    modelColor.a *= uAlpha;
#endif


    // ------------------------------------------------------------
    // ライト用の処理
    // ------------------------------------------------------------
    mediump vec3 eyeVecWorld;   //!< ワールド状態での視線ベクトル
    mediump vec3 eyeVec;        //!< 最終的にフラグメントシェーダーに渡す視線ベクトル（バンプの有無によって、ワールド座標系になったり、タンジェント座標系になったりする）

    vec4 eye = modelViewMatrix * position_;

    // 視線ベクトルを取得する
    //eyeVecWorld = normalize(cameraPosition - positionWorld.xyz);
    eyeVecWorld = normalize(-(eye.xyz) - positionWorld.xyz);//normalize(cameraPosition - positionWorld.xyz);
    eyeVec = eyeVecWorld;

    lowp vec3 diffuseColor = vec3(0.0); // バーテックスシェーダーで計算できるディフューズの色をここに格納する

#   if defined(AGX_FEATURE_BUMP_TEXTURE)
    // Normal, Binormal, Tangent を取得する
    mediump vec3 n = normal;
    mediump vec3 t = tangent;
    mediump vec3 b = cross(n, t);
    // 接空間からローカルへ変換する行列を設定する（mat3(N, T, B)の逆行列）
    mediump mat3 tangentMatrix = mat3(t.x, b.x, n.x, t.y, b.y, n.y, t.z, b.z, n.z);
    // 視線ベクトルを接空間へ
    vEyeVecWorldOrTangent.xyz = tangentMatrix * eyeVec;
#else
    vEyeVecWorldOrTangent.xyz = eyeVec;
#endif

#if !defined(AGX_FEATURE_DISABLE_LIGHT)
    // punctual lightの設定
    if (uDirLightCount > 0)
    {
        mediump vec3 lightDir;

        // 方向ライト
        if (uDirLightDirAndType0.w < 0.0) { lightDir = uDirLightDirAndType0.xyz; }
        // 点光源ライト
        else                                { lightDir = uDirLightDirAndType0.xyz - positionWorld.xyz; }
        lightDir = normalize(lightDir);

#   if defined(AGX_FEATURE_BUMP_TEXTURE)
        // ライトを接空間へ
        vPunctualLightDirWorldOrTangent.xyz = tangentMatrix * lightDir;
#   else
        vPunctualLightDirWorldOrTangent.xyz = lightDir;
#   endif

        // Halfベクトルを求める
        vPunctualLightHalfVecWorldOrTangent.xyz = normalize(vPunctualLightDirWorldOrTangent.xyz + vEyeVecWorldOrTangent.xyz);

        // Diffuse計算
        diffuseColor += (uDirLightColor0.rgb * clamp(dot(lightDir, normal), 0.0, 1.0));
    }
    if (uDirLightCount > 1)
    {
        mediump vec3 lightDir;

        // 方向ライト
        if (uDirLightDirAndType1.w < 0.0) { lightDir = uDirLightDirAndType1.xyz; }
        // 点光源ライト
        else                                { lightDir = uDirLightDirAndType1.xyz - positionWorld.xyz; }
        lightDir = normalize(lightDir);

        diffuseColor += max(dot(lightDir, normal), 0.0) * uDirLightColor1;
    }
    // ライトは1.0を超えないように
    diffuseColor = min(diffuseColor, 1.0);
#endif

#if defined(AGX_FEATURE_SPHERE_MAP_TEXTURE)
    {
        // キューブ環境マップ用の反射ベクトルを求める
//        vReflectDir = reflect(normalize(positionWorld.xyz - cameraPosition), normal);

        // スフィア環境マップ用の反射ベクトルを求める
//        vReflectDir = normalize((uViewMatrix * vec4(normal, 0.0)).xyz) * 0.5 + 0.5;

        // ビュー座標系での位置と法線を取得
        mediump vec3 viewNormal   = normalize(mat3(uViewMatrix) * normal);
        mediump vec4 viewPosition = uViewMatrix * positionWorld;
        viewPosition = viewPosition / viewPosition.w;
        // ビュー座標系での頂点ベクトルを取得
        viewPosition.z = 1.0 - viewPosition.z;
        mediump vec3 viewPositionVec = normalize(viewPosition.xyz);
        // ビュー座標系での反射ベクトルを求める
        mediump vec3 viewReflect  = viewPositionVec - 2.0 * dot(viewPositionVec, viewNormal) * viewNormal;
        // 両面スフィア環境マップではないので、反射ベクトルを調整
        viewReflect = normalize(viewReflect - vec3(0.0, 0.0, 1.5));
        // 反射ベクトルをテクスチャー座標系へ
        vReflectDir = viewReflect * 0.5 + 0.5;

        // 公式
//        mediump vec3  viewPositionVec = normalize(vec3(uViewMatrix * positionWorld));
//        mediump vec3  viewReflectVec = viewPositionVec - 2.0 * dot(viewPositionVec, normal) * normal;
//        mediump float m = 2.0 * sqrt(viewReflectVec.x * viewReflectVec.x +
//                                     viewReflectVec.y * viewReflectVec.y +
//                                     (viewReflectVec.z + 1.0) * (viewReflectVec.z * 1.0));
//        vReflectDir = viewReflectVec / m + 0.5;

        // 別版
//        mediump vec3 posW = positionWorld.xyz;
//        mediump vec3 dir  = normalize(mat3(uViewMatrix) * normal);
//
//        mediump float radius     = 75.0;
//        mediump vec3  posWDir    = dot(dir, posW) * dir;
//        mediump vec3  posWDirV   = posW - posWDir;
//        mediump float lengthDir  = sqrt(radius * radius - dot(posWDirV, posWDirV)) - length(posWDir);
//        vReflectDir = normalize(posW + dir * lengthDir) * 0.5 + 0.5;
    }
#endif

#if !defined(AGX_FEATURE_DISABLE_LIGHT)
    // GIの計算
    {
        mediump vec3 hemiColor;
        mediump vec3 sky = uHSLightSkyColor;
        mediump vec3 ground = uHSLightGroundColor;

        {
            mediump float skyRatio = (normal.y + 1.0) * 0.5;
            hemiColor =  (sky * skyRatio + ground * (1.0 - skyRatio));
            diffuseColor += hemiColor;
        }

        {
//            mediump vec3 reflectDir = -reflect(normal, eyeVecWorld); // おそらくコレで良いはず
            mediump vec3 reflectDir = 2.0 * dot(eyeVecWorld, normal) * normal - eyeVecWorld; // 多少冗長でも、正しい計算で行なう

            mediump float skyRatio = (reflectDir.y + 1.0) * 0.5;
            hemiColor =  (sky * skyRatio + ground * (1.0 - skyRatio));
            vGISpecularLightColor.rgb = hemiColor;
        }
    }
#endif

    // モデルの色を設定
    vModelColor = modelColor;
#if !defined(AGX_FEATURE_DISABLE_LIGHT)
    vDiffuseColor.rgb = diffuseColor;
#endif
}
`;

// // ---------------------------------------------------------------------
// //  Fragment Shader for LUTShaderMaterial
// //  Unmodified from LUT.fsh found in Miitomo.
// // ---------------------------------------------------------------------
const _LUTShader_frag = /* glsl */`
#define AGX_FEATURE_ALBEDO_TEXTURE
#define AGX_FEATURE_MII
/**
 * @file    LUT.fsh
 * @brief   LUT
 * @since   2014/10/02
 *
 * Copyright (c)2014 Nintendo Co., Ltd. All rights reserved.
 */

// シェーダーの種類毎に設定されるマクロリスト
// AGX_FEATURE_VERTEX_COLOR         頂点カラーが有効
// AGX_FEATURE_ALBEDO_TEXTURE       アルベドテクスチャーが有効
// AGX_FEATURE_BUMP_TEXTURE         バンプテクスチャーが有効
// AGX_FEATURE_MASK_TEXTURE         マスクテクスチャーが有効
// AGX_FEATURE_ALPHA_TEXTURE        アルファテクスチャーが有効
// AGX_FEATURE_SPHERE_MAP_TEXTURE   スフィア環境マップが有効
// AGX_FEATURE_SKIN_MASK            肌マスクが有効（uColor0）
// AGX_FEATURE_HAIR_MASK            髪マスクが有効（uColor1）
// AGX_FEATURE_ALPHA_TEST           アルファテストが有効
// AGX_FEATURE_FADE_OUT_COLOR       フェードアウトカラーが有効（uColor2）
// AGX_FEATURE_DISABLE_LIGHT        ライトが無効
// AGX_FEATURE_ALPHA_COLOR_FILTER   アルベドアルファによる色替えが有効
// AGX_FEATURE_ALBEDO_ALPHA         アルベドのアルファをカラーのアルファに適用
// AGX_FEATURE_PREMULTIPLY_ALPHA    プレマルチプライアルファな描画
// AGX_FEATURE_MII                  Miiを描画する
// AGX_FEATURE_MII_CONSTANT         Miiを描画する：Constant
// AGX_FEATURE_MII_TEXTURE_DIRECT   Miiを描画する：Texture Direct
// AGX_FEATURE_MII_RGB_LAYERED      Miiを描画する：RGB Layered
// AGX_FEATURE_MII_ALPHA            Miiを描画する：Alpha
// AGX_FEATURE_MII_LUMINANCE_ALPHA  Miiを描画する：Luminance Alpha
// AGX_FEATURE_MII_ALPHA_OPA        Miiを描画する：Alpha Opa

#ifdef GL_ES
precision mediump float;
#else
#   define lowp
#   define mediump
#   define highp
#endif

/// 変調処理のマクロ
#define FFL_MODULATE_MODE_CONSTANT        0
#define FFL_MODULATE_MODE_TEXTURE_DIRECT  1
#define FFL_MODULATE_MODE_RGB_LAYERED     2
#define FFL_MODULATE_MODE_ALPHA           3
#define FFL_MODULATE_MODE_LUMINANCE_ALPHA 4
#define FFL_MODULATE_MODE_ALPHA_OPA       5

// ----------------------------------------
// フラグメントシェーダーに入力される uniform 変数
uniform int   uMode;   ///< 描画モード
uniform bool uAlphaTest;
uniform bool uLightEnable;
uniform mediump vec4    uColor0;            //!< 入力:[ 1 : 1 ] カラー0 (OR 肌カラー)
uniform mediump vec4    uColor1;            //!< 入力:[ 1 : 2 ] カラー1 (OR 髪カラー)
uniform mediump vec4    uColor2;            //!< 入力:[ 1 : 3 ] カラー2 (OR フェードアウトカラー)
//#if !defined(AGX_FEATURE_DISABLE_LIGHT)
uniform mediump vec3    uLightColor;        //!< 入力:[ 1 : 4 ] ライトの色
//#endif

#if defined(AGX_FEATURE_ALBEDO_TEXTURE)
uniform sampler2D       uAlbedoTexture;     //!< 入力: テクスチャー
#endif
#if defined(AGX_FEATURE_BUMP_TEXTURE)
uniform sampler2D       uNormalTexture;     //!< 入力: ノーマルマップ
#endif
#if defined(AGX_FEATURE_MASK_TEXTURE)
uniform sampler2D       uMaskTexture;       //!< 入力：マスクテクスチャー
#endif
#if defined(AGX_FEATURE_ALPHA_TEXTURE)
uniform sampler2D       uAlphaTexture;      //!< 入力：アルファテクスチャー
#endif
uniform sampler2D       uLUTSpecTexture;    //!< 入力: スペキュラーLUT
uniform sampler2D       uLUTFresTexture;    //!< 入力: フレネルLUT
#if defined(AGX_FEATURE_SPHERE_MAP_TEXTURE)
uniform sampler2D       uSphereMapTexture;  //!< 入力: スフィア環境マップ
#endif

// ----------------------------------------
// フラグメントシェーダーに渡される varying 変数
varying lowp    vec4    vModelColor;                            //!< 出力:[ 1 : 1 ] モデルの色
#if !defined(AGX_FEATURE_BUMP_TEXTURE)
varying mediump vec3    vNormal;                                //!< 出力:[ 1 : 2 ] モデルの法線
#endif
#if defined(AGX_FEATURE_ALBEDO_TEXTURE) || defined(AGX_FEATURE_BUMP_TEXTURE) || defined(AGX_FEATURE_MASK_TEXTURE) || defined(AGX_FEATURE_ALPHA_TEXTURE)
varying mediump vec2    vTexcoord0;                             //!< 出力:[ 1 : 3 ] テクスチャーUV
#endif
// camera
varying mediump vec3    vEyeVecWorldOrTangent;                  //!< 出力:[ 1 : 4 ] 視線ベクトル
//#if !defined(AGX_FEATURE_DISABLE_LIGHT)
// punctual light
varying mediump vec3    vPunctualLightDirWorldOrTangent;        //!< 出力:[ 1 : 5 ] ライトの方向
varying mediump vec3    vPunctualLightHalfVecWorldOrTangent;    //!< 出力:[ 1 : 6 ] カメラとライトのハーフベクトル
// GI
varying mediump vec3    vGISpecularLightColor;                  //!< 出力:[ 1 : 7 ] GIフレネルで使用するカラー
// Lighting Result
varying mediump vec3    vDiffuseColor;                          //!< 出力:[ 1 : 8 ] ディフューズライティング結果
//#endif
// Reflect
#if defined(AGX_FEATURE_SPHERE_MAP_TEXTURE)
varying lowp    vec3    vReflectDir;                            //!< 出力:[ 1 : 9 ] 環境マップの反射ベクトル
#endif

// ------------------------------------------------------------
// フラグメントシェーダーのエントリーポイント
// ------------------------------------------------------------
void main()
{

    // ディフューズカラーを取得
    lowp vec4 albedoColor = vec4(1.0, 1.0, 1.0, 1.0);

    // ============================================================
    //  Mii
    // ============================================================
#if defined(AGX_FEATURE_MII)

   //#if defined(AGX_FEATURE_MII_CONSTANT)
    if(uMode == FFL_MODULATE_MODE_CONSTANT)
    {
        albedoColor = vec4(uColor0.rgb, 1.0);
    }
    //#elif defined(AGX_FEATURE_MII_TEXTURE_DIRECT)
    else if(uMode == FFL_MODULATE_MODE_TEXTURE_DIRECT)
    {
        albedoColor = texture2D(uAlbedoTexture, vTexcoord0);
    }
    //#elif defined(AGX_FEATURE_MII_RGB_LAYERED)
    else if(uMode == FFL_MODULATE_MODE_RGB_LAYERED)
    {
        albedoColor = texture2D(uAlbedoTexture, vTexcoord0);
        albedoColor = vec4(albedoColor.r * uColor0.rgb + albedoColor.g * uColor1.rgb + albedoColor.b * uColor2.rgb,
                           albedoColor.a);
    }
    //#elif defined(AGX_FEATURE_MII_ALPHA)
    else if(uMode == FFL_MODULATE_MODE_ALPHA)
    {
        albedoColor = texture2D(uAlbedoTexture, vTexcoord0);
        albedoColor = vec4(uColor0.rgb, albedoColor.r);
    }
    //#elif defined(AGX_FEATURE_MII_LUMINANCE_ALPHA)
    else if(uMode == FFL_MODULATE_MODE_LUMINANCE_ALPHA)
    {
        albedoColor = texture2D(uAlbedoTexture, vTexcoord0);
        albedoColor = vec4(albedoColor.g * uColor0.rgb, albedoColor.r);
    }
    //#elif defined(AGX_FEATURE_MII_ALPHA_OPA)
    else if(uMode == FFL_MODULATE_MODE_ALPHA_OPA)
    {
        albedoColor = texture2D(uAlbedoTexture, vTexcoord0);
        albedoColor = vec4(albedoColor.r * uColor0.rgb, 1.0);
    }
//#endif

    albedoColor = albedoColor * vModelColor;
#endif

    // ============================================================
    //  Albedo Texture
    // ============================================================
#if !defined(AGX_FEATURE_MII) && defined(AGX_FEATURE_ALBEDO_TEXTURE)
    albedoColor = texture2D(uAlbedoTexture, vTexcoord0);
#endif
#if defined(AGX_FEATURE_ALPHA_TEXTURE)
    albedoColor.a   = texture2D(uAlphaTexture, vTexcoord0).r;
#endif

    // ============================================================
    //  Color Mask
    // ============================================================
    // ----------------------------------------
    // Deprecated
#if defined(AGX_FEATURE_ALPHA_COLOR_FILTER)
    // 一部の場所にColor0を反映する
    albedoColor.rgb = (albedoColor.rgb * albedoColor.a + uColor0.rgb * (1.0 - albedoColor.a));
    albedoColor.a = 1.0;
#elif defined(AGX_FEATURE_MASK_TEXTURE)
    lowp vec3  maskTextureColor = texture2D(uMaskTexture, vTexcoord0).rgb;

#   if defined(AGX_FEATURE_SKIN_MASK) && defined(AGX_FEATURE_HAIR_MASK)
    // 肌と髪両方マスクが存在する
    lowp float maskColorValue = maskTextureColor.g + maskTextureColor.b;
    lowp vec3  maskColor      = maskTextureColor.g * uColor0.rgb + maskTextureColor.b * uColor1.rgb;
    albedoColor.rgb = (albedoColor.rgb * (1.0 - maskColorValue) + maskColor);

#   elif defined(AGX_FEATURE_SKIN_MASK)
    // 肌しかマスクが存在しない
    albedoColor.rgb = (albedoColor.rgb * (1.0 - maskTextureColor.g) + maskTextureColor.g * uColor0.rgb);

#   elif defined(AGX_FEATURE_HAIR_MASK)
    // 髪しかマスクが存在しない
    albedoColor.rgb = (albedoColor.rgb * (1.0 - maskTextureColor.b) + maskTextureColor.b * uColor1.rgb);

#   endif
#endif

    // アルベドに頂点カラーを掛ける
    albedoColor *= vModelColor;

    // ============================================================
    //  Alpha test
    // ============================================================
//#if defined(AGX_FEATURE_ALPHA_TEST)
    if (uAlphaTest && albedoColor.a < 0.5) { discard; }
//#endif

    // ============================================================
    //  Bumpmap
    // ============================================================
    // 頂点からの情報
    lowp vec3 normalWorldOrTangent;
#if defined(AGX_FEATURE_BUMP_TEXTURE)
    // バンプマップから法線を取得する
    mediump vec3 bumpNormal = texture2D(uNormalTexture, vTexcoord0).rgb;

    // 法線の正規化は処理が重いのでいったん正規化しない様に...
//    normalWorldOrTangent = normalize(bumpNormal * 2.0 - 1.0);
    normalWorldOrTangent = bumpNormal * 2.0 - 1.0;

#else
    // 法線を正規化して取得する
    normalWorldOrTangent = normalize(vNormal);
#endif

    // ============================================================
    //  Lighting
    // ============================================================
    // 最終的なカラー情報
    lowp vec4 colorOut = vec4(0.0, 0.0, 0.0, albedoColor.a);  // 最終的に出力される色
    lowp vec3 fresnel  = vec3(0.0, 0.0, 0.0);   // フレネル
    lowp vec3 specular = vec3(0.0, 0.0, 0.0);   // スペキュラー

//#if !defined(AGX_FEATURE_DISABLE_LIGHT)
if (uLightEnable) {

    // BRDFの計算を行う（バンプマッピングの場合は接空間）
    lowp vec3 N = normalWorldOrTangent;
    lowp vec3 V = vEyeVecWorldOrTangent.xyz;//normalize(vEyeVecWorldOrTangent.xyz);
    lowp vec3 I = vPunctualLightDirWorldOrTangent.xyz;//normalize(vPunctualLightDirWorldOrTangent.xyz);
    lowp vec3 H = vPunctualLightHalfVecWorldOrTangent.xyz;//normalize(vPunctualLightHalfVecWorldOrTangent.xyz);


    // ----------------------------------------
    // punctual light
    // 平行光源や点光源などの厳密なライティング計算を行なうもの
    {
        lowp float fSpecular = dot(N, H);

        lowp float specularIntensity = texture2D(uLUTSpecTexture, vec2(fSpecular)).r;
        specular = (specularIntensity * uLightColor.rgb);
    }

    // ----------------------------------------
    // GI
    // 半球ライトやIBL、SHのように法線方向に半球積分された結果でライティング計算を行なうもの
    {
        lowp float fFresnel = dot(N, V);
        lowp float fresnelIntensity = texture2D(uLUTFresTexture, vec2(fFresnel)).r;

        fresnel = (fresnelIntensity * vGISpecularLightColor.rgb);
    }
}
//#endif

#if defined(AGX_FEATURE_SPHERE_MAP_TEXTURE)
    // スフィア環境マップ
    specular += texture2D(uSphereMapTexture, vReflectDir.xy).rgb;
#endif

    // ============================================================
    //  Specular Mask
    // ============================================================
#if !defined(AGX_FEATURE_ALPHA_COLOR_FILTER) && defined(AGX_FEATURE_MASK_TEXTURE)
    // スペキュラーマスク
    specular = specular * maskTextureColor.r + fresnel;
#else
    specular += fresnel;
#endif

    // ============================================================
    //  Output
    // ============================================================
//#if !defined(AGX_FEATURE_DISABLE_LIGHT)
if (uLightEnable)
    colorOut.rgb = vDiffuseColor.rgb * albedoColor.rgb + specular;
//#else
else
    colorOut.rgb = albedoColor.rgb;
//#endif

    // フェードアウトを実装する
#if defined(AGX_FEATURE_FADE_OUT_COLOR)
    colorOut.rgb = (colorOut.rgb * (1.0 - uColor2.a)) + (uColor2.rgb * uColor2.a);
#endif

    // 色を反映させる
    gl_FragColor = colorOut;

    //#include <tonemapping_fragment>
    //#include <colorspace_fragment>
}
`;

// // ---------------------------------------------------------------------
// //  Helper: HermitianCurve for LUT generation
// // ---------------------------------------------------------------------
/**
 * Represents a Hermitian curve interpolation for LUT generation.
 */
class HermitianCurve {
  /**
   * Constructs a HermitianCurve with given control points (keys).
   * @param {Array<{x: number, y: number, dx: number, dy: number}>} keys - Control points defining the curve.
   */
  constructor(keys) {
    this.keys = keys.sort((a, b) => a.x - b.x);
  }

  /**
   * Performs Hermite interpolation between two points.
   * @param {number} t - Interpolation factor (0 to 1).
   * @param {number} p0 - Start point value.
   * @param {number} p1 - End point value.
   * @param {number} m0 - Tangent at start point.
   * @param {number} m1 - Tangent at end point.
   * @returns {number} - Interpolated value.
   */
  interpolate(t, p0, p1, m0, m1) {
    const h00 = 2 * t * t * t - 3 * t * t + 1;
    const h10 = t * t * t - 2 * t * t + t;
    const h01 = -2 * t * t * t + 3 * t * t;
    const h11 = t * t * t - t * t;
    return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
  }

  /**
   * Clamps a value between a minimum and maximum.
   * @param {number} value - Value to clamp.
   * @param {number} min - Minimum allowed value.
   * @param {number} max - Maximum allowed value.
   * @returns {number} - Clamped value.
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generates a Lookup Table (LUT) based on the Hermitian curve.
   * @param {number} [lutSize=512] - Size of the LUT.
   * @returns {Uint8Array} - The generated LUT.
   */
  generateLUT(lutSize = 512) {
    const lut = new Uint8Array(lutSize);
    let keyIdx = 0;
    for (let i = 0; i < lutSize; i++) {
      const pos = i / (lutSize - 1);
      while (keyIdx < this.keys.length - 2 && pos > this.keys[keyIdx + 1].x) {
        keyIdx++;
      }
      const p0 = this.keys[keyIdx];
      const p1 = this.keys[keyIdx + 1];
      let t = (pos - p0.x) / (p1.x - p0.x);
      t = isNaN(t) ? 0 : t;
      let y = this.interpolate(
        t,
        p0.y,
        p1.y,
        p0.dx * (p1.x - p0.x),
        p1.dx * (p1.x - p0.x)
      );
      lut[i] = Math.round(this.clamp(y, 0, 1) * 255);
    }
    return lut;
  }
}

// // ---------------------------------------------------------------------
// //  LUTShaderMaterial Class
// // ---------------------------------------------------------------------
/**
 * Custom THREE.ShaderMaterial using the LUT shader from Miitomo.
 */
class LUTShaderMaterial extends THREE.ShaderMaterial {
  // Enumerations for LUT types.

  /**
   * @enum {number}
   */
  static LUTSpecularTextureType = {
    NONE: 0,
    DEFAULT_02: 1,
    SKIN_01: 2,
    MAX: 3,
  };
  /**
   * @enum {number}
   */
  static LUTFresnelTextureType = {
    NONE: 0,
    DEFAULT_02: 1,
    SKIN_01: 2,
    MAX: 3,
  };

  /**
   * @private
   * LUT definitions for materials used in the original shader.
   * Taken from XMLs in the same folder as the original TGAs..
   * @typedef {Object.<LUTSpecularTextureType, HermitianCurve>} SpecularLUT
   * @typedef {Object.<LUTFresnelTextureType, HermitianCurve>} FresnelLUT
   *
   * @type {{ specular: SpecularLUT, fresnel: FresnelLUT }}
   */
  static lutDefinitions = {
    specular: {
      [LUTShaderMaterial.LUTSpecularTextureType.NONE]: new HermitianCurve([
        { x: 0, y: 0, dx: 0, dy: 0 },
        { x: 1, y: 0, dx: 0, dy: 0 },
      ]),
      [LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02]: new HermitianCurve([
        { x: 0, y: 0, dx: 0, dy: 0 },
        { x: 0.05, y: 0, dx: 0, dy: 0 },
        {
          x: 0.8,
          y: 0.038,
          dx: 0.157894736842105,
          dy: 0.157894736842105,
        },
        { x: 1, y: 0.11, dx: 0, dy: 0 },
      ]),
      [LUTShaderMaterial.LUTSpecularTextureType.SKIN_01]: new HermitianCurve([
        {
          x: 0,
          y: 0.03,
          dx: -0.105263157894737,
          dy: -0.105263157894737,
        },
        { x: 1, y: 0, dx: 0, dy: 0 },
      ]),
    },
    fresnel: {
      [LUTShaderMaterial.LUTFresnelTextureType.NONE]: new HermitianCurve([
        { x: 0, y: 0, dx: 0, dy: 0 },
        { x: 1, y: 0, dx: 0, dy: 0 },
      ]),
      [LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02]: new HermitianCurve([
        {
          x: 0,
          y: 0.3,
          dx: -0.105263157894734,
          dy: -0.105263157894734,
        },
        {
          x: 0.175,
          y: 0.23,
          dx: -0.626315789473681,
          dy: -0.626315789473681,
        },
        {
          x: 0.6,
          y: 0.05,
          dx: -0.210526315789474,
          dy: -0.210526315789474,
        },
        {
          x: 1,
          y: 0,
          dx: -0.105263157894737,
          dy: -0.105263157894737,
        },
      ]),
      [LUTShaderMaterial.LUTFresnelTextureType.SKIN_01]: new HermitianCurve([
        {
          x: 0.005,
          y: 0.35,
          dx: -0.105263157894734,
          dy: -0.105263157894734,
        },
        {
          x: 0.173,
          y: 0.319,
          dx: -0.205263157894734,
          dy: -0.205263157894734,
        },
        {
          x: 0.552,
          y: 0.051,
          dx: -0.210526315789474,
          dy: -0.210526315789474,
        },
        { x: 1, y: 0.001, dx: 0, dy: 0 },
      ]),
    },
  };

  // Tables mapping modulate type to LUT type.
  /**
   * @type {Object.<FFLModulateType, LUTSpecularTextureType>}
   */
  static modulateTypeToLUTSpecular = [
    LUTShaderMaterial.LUTSpecularTextureType.SKIN_01, // 0: FACELINE
    LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02, // 1: BEARD
    LUTShaderMaterial.LUTSpecularTextureType.SKIN_01, // 2: NOSE
    LUTShaderMaterial.LUTSpecularTextureType.SKIN_01, // 3: FOREHEAD
    LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02, // 4: HAIR
    LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02, // 5: CAP
    LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02, // 6: MASK
    LUTShaderMaterial.LUTSpecularTextureType.NONE, // 7: NOSELINE
    LUTShaderMaterial.LUTSpecularTextureType.NONE, // 8: GLASS
    LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02, // 9: CUSTOM (BODY)
    LUTShaderMaterial.LUTSpecularTextureType.DEFAULT_02, // 10: CUSTOM (PANTS)
  ];
  /**
   * @type {Object.<FFLModulateType, LUTFresnelTextureType>}
   */
  static modulateTypeToLUTFresnel = [
    LUTShaderMaterial.LUTFresnelTextureType.SKIN_01, // 0: FACELINE
    LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02, // 1: BEARD
    LUTShaderMaterial.LUTFresnelTextureType.SKIN_01, // 2: NOSE
    LUTShaderMaterial.LUTFresnelTextureType.SKIN_01, // 3: FOREHEAD
    LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02, // 4: HAIR
    LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02, // 5: CAP
    LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02, // 6: MASK
    LUTShaderMaterial.LUTFresnelTextureType.NONE, // 7: NOSELINE
    LUTShaderMaterial.LUTFresnelTextureType.NONE, // 8: GLASS
    LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02, // 9: CUSTOM (BODY)
    LUTShaderMaterial.LUTFresnelTextureType.DEFAULT_02, // 10: CUSTOM (PANTS)
  ];

  /**
   * @private
   * Cached LUT textures to avoid redundant generation.
   * @typedef {Object} LUTTextures
   * @property {Object.<LUTSpecularTextureType, THREE.DataTexture>} specular - Specular LUT textures indexed by LUT type.
   * @property {Object.<LUTSpecularTextureType, THREE.DataTexture>} fresnel - Fresnel LUT textures indexed by LUT type.
   */
  /** @type {LUTTextures|null} */
  static _lutTextures = null;

  /**
   * Generates and return LUT textures.
   * @param {number} [lutSize=512] - Width of the LUT.
   * @returns {LUTTextures} - Specular and fresnel LUT textures.
   */
  static getLUTTextures(lutSize = 512) {
    if (LUTShaderMaterial._lutTextures) {
      return LUTShaderMaterial._lutTextures;
    }
    const textures = /** @type {LUTTextures} */ ({ specular: {}, fresnel: {} });
    // Get the texture format dynamically based on Three.js version.
    const r8 = Number(THREE.REVISION) < 137
      ? THREE.LuminanceFormat
      : THREE.RedFormat;

    /**
     * Helper function to generate LUT textures.
     * @param {Object.<number, HermitianCurve>} lutType - The mapping for LUT type to {@link HermitanCurve}.
     * @param {Object.<number, THREE.DataTexture>} target - The {@link LUTTextures} type instance to emit textures to.
     */
    function generateLUTTextures(lutType, target) {
        for (const key in lutType) {
            const lutData = lutType[key].generateLUT(lutSize);
            target[Number(key)] = Object.assign(
                new THREE.DataTexture(
                  // Uint8Array.from(lutData.flatMap(value => [value, 0, 0, 255])), // RGBA
                  lutData,
                  lutSize,
                  1,
                  r8,
                  // THREE.RGBAFormat, // RGBA
                  THREE.UnsignedByteType
                ),
                {
                  colorSpace: THREE.LinearSRGBColorSpace,
                  needsUpdate: true
                }
            );
        }
    };

    generateLUTTextures(LUTShaderMaterial.lutDefinitions.specular, textures.specular);
    generateLUTTextures(LUTShaderMaterial.lutDefinitions.fresnel, textures.fresnel);

    LUTShaderMaterial._lutTextures = textures;
    return textures;
  }

  // Default light colors for the LUT shader.
  /** @type {THREE.Color} */
  static defaultHSLightGroundColor = new THREE.Color(0.87843, 0.72157, 0.5898)/*.convertSRGBToLinear()*/;
  /** @type {THREE.Color} */
  static defaultHSLightSkyColor = new THREE.Color(0.87843, 0.83451, 0.80314)/*.convertSRGBToLinear()*/;
  /** @type {THREE.Color} */
  static defaultDirLightColor0 = new THREE.Color(0.35137, 0.32392, 0.32392)/*.convertSRGBToLinear()*/;
  /** @type {THREE.Color} */
  static defaultDirLightColor1 = new THREE.Color(0.10039, 0.09255, 0.09255)/*.convertSRGBToLinear()*/;
  static defaultDirLightCount = 2;
  /** @type {THREE.Vector4} */
  static defaultDirLightDirAndType0 = new THREE.Vector4(-0.2, 0.5, 0.8, -1.0);
  /** @type {THREE.Vector4} */
  static defaultDirLightDirAndType1 = new THREE.Vector4(0.0, -0.19612, 0.98058, -1.0);
  /** @type {THREE.Color} */
  static defaultLightColor = new THREE.Color(0.35137, 0.32392, 0.32392)/*.convertSRGBToLinear()*/;

  /**
   * Alias for default light direction.
   * @type {THREE.Vector4}
   */
  static defaultLightDirection = this.defaultDirLightDirAndType0;

  /**
   * @private
   * Retrieves blending parameters based on the FFLModulateType.
   * @param {FFLModulateType} modulateType - The modulate type.
   * @returns {Object} An object containing blending parameters for the material constructor.
   * @throws {Error} Unknown modulate type
   */
  static getBlendOptionsFromModulateType(modulateType) {
    if (modulateType >= 0 && modulateType <= 5) {
      // Opaque (DrawOpa)
      return {
        blending: THREE.CustomBlending,
        blendSrcAlpha: THREE.SrcAlphaFactor,
        blendDstAlpha: THREE.OneFactor,
      };
    } else if (modulateType >= 6 && modulateType <= 8) {
      // Translucent (DrawXlu)
      return {
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendDstAlpha: THREE.OneFactor,
      };
    } else if (modulateType >= 9 && modulateType <= 13) {
      // Mask Textures
      return {
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneMinusDstAlphaFactor,
        blendSrcAlpha: THREE.SrcAlphaFactor,
        blendDst: THREE.DstAlphaFactor,
      };
    } else if (modulateType >= 14 && modulateType <= 17) {
      // Faceline Texture
      return {
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
      };
    } else {
      throw new Error(`getBlendOptionsFromModulateType: Unknown modulate type: ${modulateType}`);
    }
  }

  /**
   * @private
   * Multiplies beard and hair colors by a factor seen
   * in libcocos2dcpp.so in order to match its rendering style.
   * @param {THREE.Vector4} color - The original color.
   * @param {FFLModulateType} modulateType - The modulate type, or type of shape.
   * @param {FFLModulateMode} modulateMode - The modulate mode, used to confirm custom body type.
   * Refer to: https://github.com/ariankordi/FFL-Testing/blob/16dd44c8848e0820e03f8ccb0efa1f09f4bc2dca/src/ShaderMiitomo.cpp#L587
   * @returns {THREE.Vector4} The final color.
   */
  static multiplyColorIfNeeded(color, modulateType, modulateMode) {
    if (
      modulateType === 1 || // SHAPE_BEARD
      modulateType === 4 || // SHAPE_HAIR
      (modulateMode === 0 && // CONSTANT
      modulateType === 9) // CUSTOM (BODY)
    ) {
      const mul = 0.9019608;
      // Multiply XYZ (RGB) by mul and not alpha.
      return new THREE.Vector4(
        color.x * mul, color.y * mul, color.z * mul, color.w
      )
    }
    return color; // no multiply needed
  }

  /**
   * Constructs a LUTShaderMaterial instance.
   * @param {Object} [options={}] - Options for the material.
   * @param {FFLModulateMode} [options.modulateMode=0] - Modulate mode.
   * @param {FFLModulateType} [options.modulateType=0] - Modulate type.
   * @param {THREE.Vector4 | Array<THREE.Vector4>} [options.modulateColor] - Constant color assigned to uColor0/1/2 depending on single or array.
   * @param {boolean} [options.lightEnable=true] - Enable lighting. Needs to be off when drawing faceline/mask textures.
   * @param {THREE.Vector3} [options.lightDirection] - Light direction.
   * Uniforms:
   * @param {boolean} [options.alphaTest=false] - Enables alpha testing in the shader.
   * @param {THREE.Color} [options.hslightGroundColor] - Ground light color.
   * @param {THREE.Color} [options.hslightSkyColor] - Sky light color.
   * @param {THREE.Color} [options.dirLightColor0] - Primary directional light color.
   * @param {THREE.Color} [options.dirLightColor1] - Secondary directional light color.
   * @param {number} [options.dirLightCount=2] - Number of directional lights.
   * @param {THREE.Vector4} [options.dirLightDirAndType0] - Primary directional light vector.
   * @param {THREE.Vector4} [options.dirLightDirAndType1] - Secondary directional light vector.
   * @param {THREE.Color} [options.lightColor] - Light color.
   * General:
   * @param {string} [options.vertexShader] - Vertex shader source.
   * @param {string} [options.fragmentShader] - Fragment shader source.
   * @param {THREE.Texture} [options.map=null] - Texture map/albedo texture.
   * @param {string} [options.vertexShader] - Vertex shader source.
   * @param {string} [options.fragmentShader] - Fragment shader source.
   * @param {THREE.Side} [options.side=THREE.FrontSide] - Side. This is overridden to no culling for mask shape.
   */
  constructor(options = {}) {
    const modulateMode = options.modulateMode ?? 0;
    const modulateType = options.modulateType ?? 0;
    const lightEnable = options.lightEnable ?? true;
    const texture = options.map || null;
    // Enable alpha test for DrawXlu stage.
    const alphaTest = (modulateType >= 6 && modulateType <= 8)
                ? true : options.alphaTest;
    // Force culling to none for mask.
    const side = modulateType === 6 ? THREE.DoubleSide : (options.side || THREE.FrontSide);

    // Process modulateColor input.
    let colorUniforms = {};
    if (Array.isArray(options.modulateColor) && options.modulateColor.length === 3) {
      colorUniforms = {
        // Assign multiple modulateColor elements to constant color uniforms.
        uColor0: { value: options.modulateColor[0] },
        uColor1: { value: options.modulateColor[1] },
        uColor2: { value: options.modulateColor[2] }
      };
    } else {
      // Use multiplyColorIfNeeded method for a single color.
      const modulateColor = options.modulateColor || new THREE.Vector4(1, 1, 1, 1);
      const color = LUTShaderMaterial.multiplyColorIfNeeded(
        Array.isArray(modulateColor) ? modulateColor[0] : modulateColor, modulateType, modulateMode);

      colorUniforms = {
        // Assign single color with white as a placeholder.
        uColor0: { value: color }
      };
    }

    // Assign LUT texture using modulate type.
    const lutTextures = LUTShaderMaterial.getLUTTextures();
    const specType =
      LUTShaderMaterial.modulateTypeToLUTSpecular[modulateType] ??
      LUTShaderMaterial.LUTSpecularTextureType.NONE;
    const fresType =
      LUTShaderMaterial.modulateTypeToLUTFresnel[modulateType] ??
      LUTShaderMaterial.LUTFresnelTextureType.NONE;
    const lutSpecTexture = lutTextures.specular[specType];
    const lutFresTexture = lutTextures.fresnel[fresType];

    const uniforms = Object.assign({}, colorUniforms, {
      uBoneCount: { value: 0 },
      uAlpha: { value: 1.0 },
      uHSLightGroundColor: {
        value:
          options.hslightGroundColor ||
          LUTShaderMaterial.defaultHSLightGroundColor,
      },
      uHSLightSkyColor: {
        value: options.hslightSkyColor || LUTShaderMaterial.defaultHSLightSkyColor,
      },
      uDirLightColor0: {
        value: options.dirLightColor0 || LUTShaderMaterial.defaultDirLightColor0,
      },
      uDirLightColor1: {
        value: options.dirLightColor1 || LUTShaderMaterial.defaultDirLightColor1,
      },
      uDirLightCount: {
        value: options.dirLightCount || LUTShaderMaterial.defaultDirLightCount,
      },
      uDirLightDirAndType0: {
        value:
          options.dirLightDirAndType0 ||
          LUTShaderMaterial.defaultDirLightDirAndType0.clone(),
      },
      uDirLightDirAndType1: {
        value:
          options.dirLightDirAndType1 ||
          LUTShaderMaterial.defaultDirLightDirAndType1.clone(),
      },
      uLightEnable: { value: lightEnable },
      uLightColor: {
        value: options.lightColor || LUTShaderMaterial.defaultLightColor,
      },
      uMode: { value: modulateMode },
      // NOTE about uAlphaTest:
      // Only real purpose it serves is to discard/
      // skip writing depth for DrawXlu elements.
      // Usually (not in Miitomo) all DrawXlu elements have depth writing disabled
      // but in this case Miitomo has it enabled but discards depth writes here
      uAlphaTest: { value: alphaTest },
      uAlbedoTexture: { value: texture },
      uLUTSpecTexture: { value: lutSpecTexture },
      uLUTFresTexture: { value: lutFresTexture }
    });

    super({
      vertexShader:
        options.vertexShader ||
        _LUTShader_vert,
      fragmentShader:
        options.fragmentShader ||
        _LUTShader_frag,
      uniforms: uniforms,
      side: side,
      // skinning: options.skinning || false, // Not needed with newer Three.js.
      // Merge blend options, only if modulateMode is not 0/opqaue.
      ...modulateMode !== 0 ? LUTShaderMaterial.getBlendOptionsFromModulateType(modulateType) : {}
      // NOTE: ^^ Assumes that default blending is equivalent to constant blending (test faceline make?)
      //...getBlendOptionsFromModulateType(modulateType) // Merge blend options
    });
    // Expose these properties.
    /** @type {FFLModulateMode} */
    this.modulateMode = modulateMode;
    /** @type {FFLModulateType} */
    this.modulateType = modulateType;
    // Set alias for modulateColor as strictly a single color.
    /** @private */
    this._modulateColor = Array.isArray(options.modulateColor) ? null : options.modulateColor;
    /** @type {boolean} */
    this.lightEnable = lightEnable;
    /** @type {number|undefined} */
    this._side = options.side; // Store original side.
  }

  /**
   * Gets the texture map.
   * @returns {THREE.Texture}
   */
  get map() {
    return this.uniforms.uAlbedoTexture.value; // Expose as 'map'
  }
  /**
   * Sets the texture map.
   * @param {THREE.Texture} value - The new texture map.
   */
  set map(value) {
    this.uniforms.uAlbedoTexture.value = value;
  }
  /**
   * Gets the first/primary constant color.
   * @returns {THREE.Vector4} The color as Vector4.
   */
  get modulateColor() {
    // Use alias for modulateColor if it is set.
    if (this._modulateColor) {
      return this._modulateColor;
    }
    return this.uniforms.uColor0.value;
  }
  /**
   * Sets the primary constant color. Will not set any other colors (uColor1/2).
   * @param {THREE.Vector4} value - The new color as Vector4.
   */
  set modulateColor(value) {
    this._modulateColor = null; // Clear alias for modulateColor.
    this.uniforms.uColor0.value = value;
  }
  /**
   * Gets the light direction.
   * @returns {THREE.Vector3}
   */
  get lightDirection() {
    return this.uniforms.uDirLightDirAndType0.value;
  }
  /**
   * Sets the light direction, overriding w with -1.
   * @param {THREE.Vector3} value - The new light direction.
   */
  set lightDirection(value) {
    this.uniforms.uDirLightDirAndType0.value = value;
    this.uniforms.uDirLightDirAndType0.value.w = -1; // Override w
  }
  // TODO: normalMap, etc...? see: https://github.com/pixiv/three-vrm/blob/776c2823dcf3453d689a2d56aa82b289fdf963cf/packages/three-vrm-materials-mtoon/src/MToonMaterial.ts#L75
}

/** @global */
window.LUTShaderMaterial = LUTShaderMaterial;
//export { LUTShaderMaterial };
