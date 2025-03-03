export type FFLiCharInfo = {
    miiVersion: number;
    faceline: FFLiCharInfo_faceline;
    hair: FFLiCharInfo_hair;
    eye: FFLiCharInfo_eye;
    eyebrow: FFLiCharInfo_eyebrow;
    nose: FFLiCharInfo_nose;
    mouth: FFLiCharInfo_mouth;
    beard: FFLiCharInfo_beard;
    glass: FFLiCharInfo_glass;
    mole: FFLiCharInfo_mole;
    body: FFLiCharInfo_body;
    personal: FFLiCharInfo_personal;
    createID: FFLCreateID;
    padding_0: number;
    authorType: number;
    authorID: Array<number>;
};
export type FFLCharModelDesc = {
    resolution: number;
    allExpressionFlag: Uint32Array;
    modelFlag: number;
    resourceType: number;
};
export type FFLCharModelSource = {
    dataSource: number;
    pBuffer: number;
    index: number;
};
export type StudioCharInfo = {
    beardColor: number;
    beardType: number;
    build: number;
    eyeAspect: number;
    eyeColor: number;
    eyeRotate: number;
    eyeScale: number;
    eyeType: number;
    eyeX: number;
    eyeY: number;
    eyebrowAspect: number;
    eyebrowColor: number;
    eyebrowRotate: number;
    eyebrowScale: number;
    eyebrowType: number;
    eyebrowX: number;
    eyebrowY: number;
    facelineColor: number;
    facelineMake: number;
    facelineType: number;
    facelineWrinkle: number;
    favoriteColor: number;
    gender: number;
    glassColor: number;
    glassScale: number;
    glassType: number;
    glassY: number;
    hairColor: number;
    hairFlip: number;
    hairType: number;
    height: number;
    moleScale: number;
    moleType: number;
    moleX: number;
    moleY: number;
    mouthAspect: number;
    mouthColor: number;
    mouthScale: number;
    mouthType: number;
    mouthY: number;
    mustacheScale: number;
    mustacheType: number;
    mustacheY: number;
    noseScale: number;
    noseType: number;
    noseY: number;
};
/**
 * Emscripten "Module" type.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
 */
export type Module = {
    onRuntimeInitialized: () => void;
    destroy: (arg0: object) => void;
    /**
     * // USE_TYPED_ARRAYS == 2
     */
    calledRun: boolean | null;
    HEAP8: Int8Array;
    HEAPU8: Uint8Array;
    HEAPU16: Uint16Array;
    HEAPU32: Uint32Array;
    /**
     * Runtime methods:
     */
    HEAPF32: Float32Array;
    _malloc: (arg0: number) => number;
    _free: (arg0: number) => void;
    addFunction: (arg0: (...args: any[]) => any, arg1: string | undefined) => number;
    /**
     * ------------------------------- FFL Bindings -------------------------------
     */
    removeFunction: (arg0: number) => void;
    _FFLInitCharModelCPUStepWithCallback: (arg0: number, arg1: number, arg2: number, arg3: number) => any;
    _FFLInitCharModelCPUStep: (arg0: number, arg1: number, arg2: number) => any;
    _FFLDeleteCharModel: (arg0: number) => any;
    _FFLGetDrawParamOpaFaceline: (arg0: number) => any;
    _FFLGetDrawParamOpaBeard: (arg0: number) => any;
    _FFLGetDrawParamOpaNose: (arg0: number) => any;
    _FFLGetDrawParamOpaForehead: (arg0: number) => any;
    _FFLGetDrawParamOpaHair: (arg0: number) => any;
    _FFLGetDrawParamOpaCap: (arg0: number) => any;
    _FFLGetDrawParamXluMask: (arg0: number) => any;
    _FFLGetDrawParamXluNoseLine: (arg0: number) => any;
    _FFLGetDrawParamXluGlass: (arg0: number) => any;
    _FFLSetExpression: (arg0: number, arg1: number) => any;
    _FFLGetExpression: (arg0: number) => any;
    _FFLSetViewModelType: (arg0: number, arg1: number) => any;
    _FFLGetBoundingBox: (arg0: number, arg1: number) => any;
    _FFLIsAvailableExpression: (arg0: number, arg1: number) => any;
    _FFLSetCoordinate: (arg0: number, arg1: number) => any;
    _FFLSetScale: (arg0: number) => any;
    _FFLiGetRandomCharInfo: (arg0: number, arg1: number, arg2: number, arg3: number) => any;
    _FFLpGetStoreDataFromCharInfo: (arg0: number, arg1: number) => any;
    _FFLpGetCharInfoFromStoreData: (arg0: number, arg1: number) => any;
    _FFLGetAdditionalInfo: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: boolean) => any;
    _FFLInitRes: (arg0: number, arg1: number) => any;
    _FFLInitResGPUStep: () => any;
    _FFLExit: () => any;
    _FFLIsAvailable: () => any;
    _FFLGetFavoriteColor: (arg0: number, arg1: number) => any;
    _FFLSetLinearGammaMode: (arg0: number) => any;
    _FFLGetFacelineColor: (arg0: number, arg1: number) => any;
    _FFLSetTextureFlipY: (arg0: boolean) => any;
    _FFLSetNormalIsSnorm8_8_8_8: (arg0: boolean) => any;
    _FFLSetFrontCullForFlipX: (arg0: boolean) => any;
    _FFLSetTextureCallback: (arg0: number) => any;
    _FFLiDeleteTextureTempObject: (arg0: number) => any;
    _FFLiDeleteTempObjectMaskTextures: (arg0: number, arg1: number, arg2: number) => any;
    _FFLiDeleteTempObjectFacelineTexture: (arg0: number, arg1: number, arg2: number) => any;
    _FFLiiGetEyeRotateOffset: (arg0: number) => any;
    _FFLiiGetEyebrowRotateOffset: (arg0: number) => any;
    _FFLiInvalidateTempObjectFacelineTexture: (arg0: number) => any;
    _FFLiInvalidatePartsTextures: (arg0: number) => any;
    _FFLiInvalidateRawMask: (arg0: number) => any;
    _FFLiVerifyCharInfoWithReason: (arg0: number, arg1: boolean) => any;
    _exit: () => void;
};
export type FFLAttributeBuffer = {
    size: number;
    stride: number;
    ptr: number;
};
export type FFLAttributeBufferParam = {
    attributeBuffers: Array<FFLAttributeBuffer>;
};
export type FFLPrimitiveParam = {
    primitiveType: number;
    indexCount: number;
    pAdjustMatrix: number;
    pIndexBuffer: number;
};
export type FFLColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export type FFLVec3 = {
    x: number;
    y: number;
    z: number;
};
export type FFLModulateParam = {
    mode: FFLModulateMode;
    type: FFLModulateType;
    /**
     * - Pointer to FFLColor
     */
    pColorR: number;
    /**
     * - Pointer to FFLColor
     */
    pColorG: number;
    /**
     * - Pointer to FFLColor
     */
    pColorB: number;
    pTexture2D: number;
};
export type FFLDrawParam = {
    attributeBufferParam: FFLAttributeBufferParam;
    modulateParam: FFLModulateParam;
    cullMode: FFLCullMode;
    primitiveParam: FFLPrimitiveParam;
};
export type FFLCreateID = {
    data: Array<number>;
};
export type FFLiCharInfo_faceline = {
    type: number;
    color: number;
    texture: number;
    make: number;
};
export type FFLiCharInfo_hair = {
    type: number;
    color: number;
    flip: number;
};
export type FFLiCharInfo_eye = {
    type: number;
    color: number;
    scale: number;
    aspect: number;
    rotate: number;
    x: number;
    y: number;
};
export type FFLiCharInfo_eyebrow = {
    type: number;
    color: number;
    scale: number;
    aspect: number;
    rotate: number;
    x: number;
    y: number;
};
export type FFLiCharInfo_nose = {
    type: number;
    scale: number;
    y: number;
};
export type FFLiCharInfo_mouth = {
    type: number;
    color: number;
    scale: number;
    aspect: number;
    y: number;
};
export type FFLiCharInfo_beard = {
    mustache: number;
    type: number;
    color: number;
    scale: number;
    y: number;
};
export type FFLiCharInfo_glass = {
    type: number;
    color: number;
    scale: number;
    y: number;
};
export type FFLiCharInfo_mole = {
    type: number;
    scale: number;
    x: number;
    y: number;
};
export type FFLiCharInfo_body = {
    height: number;
    build: number;
};
export type FFLiCharInfo_personal = {
    name: string;
    creator: string;
    gender: number;
    birthMonth: number;
    birthDay: number;
    favoriteColor: number;
    favorite: number;
    copyable: number;
    ngWord: number;
    localonly: number;
    regionMove: number;
    fontRegion: number;
    roomIndex: number;
    positionInRoom: number;
    birthPlatform: number;
};
export type FFLAdditionalInfo = {
    name: string;
    creator: string;
    createID: FFLCreateID;
    skinColor: FFLColor;
    flags: number;
    facelineType: number;
    hairType: number;
};
export type FFLiFacelineTextureTempObject = {
    pTextureFaceLine: number;
    drawParamFaceLine: FFLDrawParam;
    pTextureFaceMake: number;
    drawParamFaceMake: FFLDrawParam;
    pTextureFaceBeard: number;
    drawParamFaceBeard: FFLDrawParam;
    pRenderTextureCompressorParam: Array<number>;
};
export type FFLiRawMaskDrawParam = {
    /**
     * - 2
     */
    drawParamRawMaskPartsEye: Array<FFLDrawParam>;
    /**
     * - 2
     */
    drawParamRawMaskPartsEyebrow: Array<FFLDrawParam>;
    drawParamRawMaskPartsMouth: FFLDrawParam;
    /**
     * - 2
     */
    drawParamRawMaskPartsMustache: Array<FFLDrawParam>;
    drawParamRawMaskPartsMole: FFLDrawParam;
    drawParamRawMaskPartsFill: FFLDrawParam;
};
export type FFLiMaskTexturesTempObject = {
    partsTextures: Array<number>;
    pRawMaskDrawParam: Array<number>;
    _remaining: Uint8Array;
};
export type FFLiTextureTempObject = {
    maskTextures: FFLiMaskTexturesTempObject;
    facelineTexture: FFLiFacelineTextureTempObject;
};
export type FFLiMaskTextures = {
    pRenderTextures: Array<number>;
};
export type FFLBoundingBox = {
    [x: string]: FFLVec3;
};
export type FFLPartsTransform = {
    [x: string]: FFLVec3;
};
/**
 * PartsTransform with THREE.Vector3 type.
 */
export type PartsTransform = {
    [x: string]: THREE.Vector3;
};
export type FFLiCharModel = {
    charInfo: FFLiCharInfo;
    charModelDesc: FFLCharModelDesc;
    expression: FFLExpression;
    pTextureTempObject: number;
    drawParam: Array<FFLDrawParam>;
    pShapeData: Array<number>;
    facelineRenderTexture: Array<Object>;
    pCapGlassNoselineTextures: Array<number>;
    maskTextures: FFLiMaskTextures;
    beardHairFaceCenterPos: Array<FFLVec3>;
    partsTransform: FFLPartsTransform;
    modelType: number;
    boundingBox: Array<FFLBoundingBox>;
};
export type FFLResourceDesc = {
    pData: Array<number>;
    size: Array<number>;
};
export type FFLTextureInfo = {
    width: number;
    height: number;
    mipCount: number;
    format: FFLTextureFormat;
    isGX2Tiled: number;
    imageSize: number;
    imagePtr: number;
    mipSize: number;
    mipPtr: number;
    mipLevelOffset: Array<number>;
};
export type FFLModulateMode = number;
export namespace FFLModulateMode {
    let CONSTANT: number;
    let TEXTURE_DIRECT: number;
    let RGB_LAYERED: number;
    let ALPHA: number;
    let LUMINANCE_ALPHA: number;
    let ALPHA_OPA: number;
}
export type FFLModulateType = number;
export namespace FFLModulateType {
    let SHAPE_FACELINE: number;
    let SHAPE_BEARD: number;
    let SHAPE_NOSE: number;
    let SHAPE_FOREHEAD: number;
    let SHAPE_HAIR: number;
    let SHAPE_CAP: number;
    let SHAPE_MASK: number;
    let SHAPE_NOSELINE: number;
    let SHAPE_GLASS: number;
    let MUSTACHE: number;
    let MOUTH: number;
    let EYEBROW: number;
    let EYE: number;
    let MOLE: number;
    let FACE_MAKE: number;
    let FACE_LINE: number;
    let FACE_BEARD: number;
    let FILL: number;
    let SHAPE_MAX: number;
}
export type FFLExpression = number;
export namespace FFLExpression {
    let NORMAL: number;
    let MAX: number;
}
export type FFLModelFlag = number;
export namespace FFLModelFlag {
    let NORMAL_1: number;
    export { NORMAL_1 as NORMAL };
    export let HAT: number;
    export let FACE_ONLY: number;
    export let FLATTEN_NOSE: number;
    export let NEW_EXPRESSIONS: number;
    export let NEW_MASK_ONLY: number;
}
/**
 * @typedef {Object} FFLiCharInfo_faceline
 * @property {number} type
 * @property {number} color
 * @property {number} texture
 * @property {number} make
 */
/**
 * @typedef {Object} FFLiCharInfo_hair
 * @property {number} type
 * @property {number} color
 * @property {number} flip
 */
/**
 * @typedef {Object} FFLiCharInfo_eye
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} rotate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_eyebrow
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} rotate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_nose
 * @property {number} type
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_mouth
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} aspect
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_beard
 * @property {number} mustache
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_glass
 * @property {number} type
 * @property {number} color
 * @property {number} scale
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_mole
 * @property {number} type
 * @property {number} scale
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} FFLiCharInfo_body
 * @property {number} height
 * @property {number} build
 */
/**
 * @typedef {Object} FFLiCharInfo_personal
 * @property {string} name
 * @property {string} creator
 * @property {number} gender
 * @property {number} birthMonth
 * @property {number} birthDay
 * @property {number} favoriteColor
 * @property {number} favorite
 * @property {number} copyable
 * @property {number} ngWord
 * @property {number} localonly
 * @property {number} regionMove
 * @property {number} fontRegion
 * @property {number} roomIndex
 * @property {number} positionInRoom
 * @property {number} birthPlatform
 */
/**
 * @typedef {Object} FFLiCharInfo
 * @property {number} miiVersion
 * @property {FFLiCharInfo_faceline} faceline
 * @property {FFLiCharInfo_hair} hair
 * @property {FFLiCharInfo_eye} eye
 * @property {FFLiCharInfo_eyebrow} eyebrow
 * @property {FFLiCharInfo_nose} nose
 * @property {FFLiCharInfo_mouth} mouth
 * @property {FFLiCharInfo_beard} beard
 * @property {FFLiCharInfo_glass} glass
 * @property {FFLiCharInfo_mole} mole
 * @property {FFLiCharInfo_body} body
 * @property {FFLiCharInfo_personal} personal
 * @property {FFLCreateID} createID
 * @property {number} padding_0
 * @property {number} authorType
 * @property {Array<number>} authorID
 */
/** @type {_.StructInstance<FFLiCharInfo>} */
export const FFLiCharInfo: _.StructInstance<FFLiCharInfo>;
/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution
 * @property {Uint32Array} allExpressionFlag
 * @property {number} modelFlag
 * @property {number} resourceType
 */
/** @type {_.StructInstance<FFLCharModelDesc>} */
export const FFLCharModelDesc: _.StructInstance<FFLCharModelDesc>;
/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @public
 */
export const FFLCharModelDescDefault: FFLCharModelDesc;
export type FFLDataSource = number;
export namespace FFLDataSource {
    let OFFICIAL: number;
    let DEFAULT: number;
    let MIDDLE_DB: number;
    let STORE_DATA_OFFICIAL: number;
    let STORE_DATA: number;
    let BUFFER: number;
    let DIRECT_POINTER: number;
}
/**
 * @typedef {Object} FFLCharModelSource
 * @property {number} dataSource
 * @property {number} pBuffer
 * @property {number} index
 */
/** @type {_.StructInstance<FFLCharModelSource>} */
export const FFLCharModelSource: _.StructInstance<FFLCharModelSource>;
export type FFLGender = number;
export namespace FFLGender {
    let MALE: number;
    let FEMALE: number;
    let ALL: number;
}
export type FFLAge = number;
export namespace FFLAge {
    export let CHILD: number;
    export let ADULT: number;
    export let ELDER: number;
    let ALL_1: number;
    export { ALL_1 as ALL };
}
export type FFLRace = number;
export namespace FFLRace {
    export let BLACK: number;
    export let WHITE: number;
    export let ASIAN: number;
    let ALL_2: number;
    export { ALL_2 as ALL };
}
/**
 * Fetches the FFL resource from the specified path or the "content"
 * attribute of this HTML element: meta[itemprop=ffl-js-resource-fetch-path]
 * It then calls {@link initializeFFL} on the specified module.
 * @param {Module|Promise<Module>|function(): Promise<Module>} module - The Emscripten module by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1), or as a function returning a promise (window.Module when MODULARIZE=1).
 * @param {string|null} resourcePath - The URL for the FFL resource.
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when fetch is finished and initializeFFL returns, returning the final Emscripten {@link Module} instance and the {@link FFLResourceDesc} object that can later be passed into {@link exitFFL}.
 * @throws {Error} resourcePath must be a URL string, or, an HTML element with FFL resource must exist and have content.
 */
export function initializeFFLWithResource(module: Module | Promise<Module> | (() => Promise<Module>), resourcePath: string | null): Promise<{
    module: Module;
    resourceDesc: FFLResourceDesc;
}>;
/**
 * @param {Module} module - Emscripten module.
 * @param {FFLResourceDesc} resourceDesc - The FFLResourceDesc received from {@link initializeFFL}.
 * @public
 * @todo TODO: Needs to somehow destroy Emscripten instance.
 */
export function exitFFL(module: Module, resourceDesc: FFLResourceDesc): void;
/**
 * Represents an FFLCharModel, which is the head model.
 * Encapsulates a pointer to the underlying instance and provides helper methods.
 *
 * NOTE: This is a wrapper around CharModel. In order to create one,
 * either call createCharModel or pass the pointer of a manually created
 * CharModel in here. So *DO NOT* call this constructor directly!
 * @public
 */
export class CharModel {
    /**
     * @enum {number}
     */
    static BodyScaleMode: {
        Apply: number;
        Limit: number;
    };
    /**
     * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
     * @param {Module} module - The Emscripten module.
     * @param {function(new: THREE.Material, ...*): THREE.Material} materialClass - The material class (e.g., FFLShaderMaterial).
     * @param {TextureManager|null} texManager - The {@link TextureManager} instance for this CharModel.
     */
    constructor(ptr: number, module: Module, materialClass: new (...args: any[]) => THREE.Material, texManager: TextureManager | null);
    /** @package */
    _module: Module;
    /**
     * The data used to construct the CharModel, set in {@link createCharModel} and used in {@link updateCharModel}.
     * @type {*}
     * @package
     */
    _data: any;
    /**
     * @type {function(new: THREE.Material, ...*): THREE.Material}
     * @public
     */
    public _materialClass: new (...args: any[]) => THREE.Material;
    /** @package */
    _textureManager: TextureManager | null;
    /**
     * Pointer to the FFLiCharModel in memory, set to null when deleted.
     * @package
     */
    _ptr: number;
    /** @private */
    private __ptr;
    /**
     * The unpacked representation of the underlying
     * FFLCharModel instance. Note that this is not
     * meant to be updated at all and changes to
     * this instance will not apply in FFL whatsoever.
     * @readonly
     */
    readonly _model: FFLiCharModel;
    /**
     * @type {THREE.RenderTarget|null}
     * @package
     */
    _facelineTarget: THREE.RenderTarget | null;
    /**
     * @type {Array<THREE.RenderTarget|null>}
     * @package
     */
    _maskTargets: Array<THREE.RenderTarget | null>;
    /**
     * Group of THREE.Mesh objects representing the CharModel.
     * @type {THREE.Group|null}
     * @public
     */
    public meshes: THREE.Group | null;
    /**
     * This is the method that populates meshes
     * from the internal FFLiCharModel instance.
     * @param {Module} module - Module to pass to drawParamToMesh to access mesh data.
     * @throws {Error} Throws if this.meshes is null or undefined.
     * @private
     */
    private _addCharModelMeshes;
    /** @package */
    _facelineMesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap> | null | undefined;
    /** @package */
    _maskMesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap> | null | undefined;
    /**
     * @returns {number} Pointer to pTextureTempObject.
     * @private
     */
    private _getTextureTempObjectPtr;
    /**
     * @returns {FFLiTextureTempObject} The TextureTempObject containing faceline and mask DrawParams.
     * @package
     */
    _getTextureTempObject(): FFLiTextureTempObject;
    /**
     * Get the unpacked result of FFLGetAdditionalInfo.
     * @returns {FFLAdditionalInfo} The FFLAdditionalInfo object.
     * @private
     */
    private _getAdditionalInfo;
    /**
     * Accesses partsTransform in FFLiCharModel,
     * converting every FFLVec3 to THREE.Vector3.
     * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
     * @throws {Error} Throws if this._model.partsTransform has objects that do not have "x" property.
     * @private
     */
    private _getPartsTransform;
    /**
     * @returns {THREE.Color} The faceline color as THREE.Color.
     * @private
     */
    private _getFacelineColor;
    /**
     * @returns {THREE.Color} The favorite color as THREE.Color.
     * @private
     */
    private _getFavoriteColor;
    /**
     * @returns {Uint8Array} The CharInfo instance.
     * @private
     */
    private _getCharInfoUint8Array;
    /**
     * @returns {number} Pointer to pTextureTempObject->maskTextures->partsTextures.
     * @package
     */
    _getPartsTexturesPtr(): number;
    /**
     * @returns {number} Pointer to pTextureTempObject->facelineTexture.
     * @package
     */
    _getFacelineTempObjectPtr(): number;
    /**
     * @returns {number} Pointer to pTextureTempObject->maskTextures.
     * @package
     */
    _getMaskTempObjectPtr(): number;
    /**
     * @returns {number} Pointer to charModelDesc.allExpressionFlag.
     * @package
     */
    _getExpressionFlagPtr(): number;
    /**
     * Either gets the boundingBox in the CharModel or calculates it from the meshes.
     * @returns {THREE.Box3} The bounding box.
     * @throws {Error} Throws if this.meshes is null.
     * @private
     */
    private _getBoundingBox;
    /**
     * Get the texture resolution.
     * @returns {number} The texture resolution.
     * @package
     */
    _getResolution(): number;
    /**
     * Finalizes the CharModel.
     * Frees and deletes the CharModel right after generating textures.
     * This is **not** the same as `dispose()` which cleans up the scene.
     * @package
     */
    _finalizeCharModel(): void;
    /**
     * Disposes RenderTargets for textures created by the CharModel.
     * @public
     */
    public disposeTextures(): void;
    /**
     * Disposes the CharModel and removes all associated resources.
     * - Disposes materials and geometries.
     * - Deletes faceline texture if it exists.
     * - Deletes all mask textures.
     * - Removes all meshes from the scene.
     * @param {boolean} disposeTextures - Whether or not to dispose of mask and faceline render targets.
     * @public
     */
    public dispose(disposeTextures?: boolean): void;
    /**
     * Serializes the CharModel data to FFLStoreData.
     * @returns {Uint8Array} The exported FFLStoreData.
     * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo returns false, usually when CharInfo verification fails.
     * @public
     */
    public getStoreData(): Uint8Array;
    /**
     * Sets the expression for this CharModel and updates the corresponding mask texture.
     * @param {number} expression - The new expression index.
     * @throws {Error} CharModel must have been initialized with the expression enabled in the flag and have XLU_MASK in meshes.
     * @public
     */
    public setExpression(expression: number): void;
    /**
     * Gets the faceline texture, or the texture that wraps around
     * the faceline shape (opaque, the one hair is placed atop).
     * Not to be confused with the texture containing facial features
     * such as eyes, mouth, etc. which is the mask.
     * The faceline texture may not exist if it is not needed, in which
     * case the faceline color is used directly, see property {@link facelineColor}.
     * @returns {THREE.RenderTarget|null} The faceline render target, or null if it does not exist, in which case {@link facelineColor} should be used. Access .texture on this object to get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
     */
    getFaceline(): THREE.RenderTarget | null;
    /**
     * Gets the mask texture, or the texture containing facial
     * features such as eyes, mouth, eyebrows, etc. This is wrapped
     * around the mask shape, which is a transparent shape
     * placed in front of the head model.
     * @param {FFLExpression} expression - The desired expression, or the current expression.
     * @returns {THREE.RenderTarget|null} The mask render target for the given expression, or null if the CharModel was not initialized with that expression. Access .texture on this object to get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
     */
    getMask(expression?: FFLExpression): THREE.RenderTarget | null;
    /**
     * The current expression for this CharModel.
     * Read-only. Use setExpression to set the expression.
     * @returns {FFLExpression} The current expression.
     * @public
     */
    public get expression(): FFLExpression;
    /**
     * Contains the CharInfo of the model.
     * Changes to this will not be reflected whatsoever.
     * @returns {FFLiCharInfo} The CharInfo of the model.
     * @public
     */
    public get charInfo(): FFLiCharInfo;
    /**
     * The faceline color for this CharModel.
     * @returns {THREE.Color} The faceline color.
     * @public
     */
    public get facelineColor(): THREE.Color;
    /** @private */
    private _facelineColor;
    /**
     * The favorite color for this CharModel.
     * @returns {THREE.Color} The favorite color.
     * @public
     */
    public get favoriteColor(): THREE.Color;
    /** @private */
    private _favoriteColor;
    /**
     * @returns {number} Gender as 0 = male, 1 = female
     * @public
     */
    public get gender(): number;
    /**
     * The parameters in which to transform hats and other accessories.
     * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
     * @public
     */
    public get partsTransform(): PartsTransform;
    /** @private */
    private _partsTransform;
    /**
     * @returns {THREE.Box3} The bounding box.
     * @public
     */
    public get boundingBox(): THREE.Box3;
    /** @private */
    private _boundingBox;
    /**
     * Gets a vector in which to scale the body model for this CharModel.
     * @param {BodyScaleMode} scaleMode - Mode in which to create the scale vector.
     * @returns {THREE.Vector3} Scale vector for the body model.
     * @throws {Error} Unexpected value for scaleMode
     * @public
     */
    public getBodyScale(scaleMode?: number): THREE.Vector3;
}
/**
 * Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
 * @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
 * @param {Module} module - Module to access the data and call FFL through.
 * @param {boolean} verifyName - Whether the name and creator name should be verified.
 * @returns {void} Returns nothing if verification passes.
 * @throws {FFLiVerifyReasonException} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
 * @public
 * @todo TODO: Should preferably return a custom error class.
 */
export function verifyCharInfo(data: Uint8Array | number, module: Module, verifyName?: boolean): void;
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 * @param {Module} module - The Emscripten module.
 * @param {FFLGender} gender - Gender of the character.
 * @param {FFLAge} age - Age of the character.
 * @param {FFLRace} race - Race of the character.
 * @returns {Uint8Array} The random FFLiCharInfo.
 * @todo TODO: Should this return FFLiCharInfo object?
 */
export function getRandomCharInfo(module: Module, gender?: FFLGender, age?: FFLAge, race?: FFLRace): Uint8Array;
/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * Use this whenever you need to describe which expression, or expressions, you want to be able to use in the CharModel.
 * @param {Array<number>|number} expressions - Either a single expression index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
export function makeExpressionFlag(expressions: Array<number> | number): Uint32Array;
export type PantsColor = number;
export namespace PantsColor {
    let GrayNormal: number;
    let BluePresent: number;
    let RedRegular: number;
    let GoldSpecial: number;
}
/**
 * @type {Object<PantsColor, THREE.Color>}
 */
export const pantsColors: any;
/**
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Input: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} The CharModelSource with the data specified.
 * @throws {Error} data must be Uint8Array or FFLiCharInfo object. Data must be a known type.
 * @package
 */
export function _allocateModelSource(data: Uint8Array | FFLiCharInfo, module: Module): FFLCharModelSource;
/**
 * Creates a CharModel from data and FFLCharModelDesc.
 * You must call initCharModelTextures afterwards to finish the process.
 * Don't forget to call dispose() on the CharModel when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Character data. Accepted types: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {FFLCharModelDesc|null} modelDesc - The model description. Default: {@link FFLCharModelDescDefault}
 * @param {function(new: THREE.Material, ...*): THREE.Material} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
 * @param {Module} module - The Emscripten module.
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The new CharModel instance.
 * @throws {FFLResultException|BrokenInitModel|FFLiVerifyReasonException|Error} Throws if `module`, `modelDesc` or `data` is invalid, CharInfo verification fails, or CharModel creation fails otherwise.
 */
export function createCharModel(data: Uint8Array | FFLiCharInfo, modelDesc: FFLCharModelDesc | null, materialClass: new (...args: any[]) => THREE.Material, module: Module, verify?: boolean): CharModel;
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer.
 * @param {FFLCharModelDesc|Array<number>|Uint32Array|null} descOrExpFlag - Either a new {@link FFLCharModelDesc}, an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The updated CharModel instance.
 * @throws {Error} Unexpected type for descOrExpFlag, newData is null
 * @todo  TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
 */
export function updateCharModel(charModel: CharModel, newData: Uint8Array | null, renderer: THREE.WebGLRenderer, descOrExpFlag?: FFLCharModelDesc | Array<number> | Uint32Array | null, verify?: boolean): CharModel;
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer.
 * @todo Should this just be called in createCharModel() or something? But it's the only function requiring renderer. Maybe if you pass in renderer to that?
 */
export function initCharModelTextures(charModel: CharModel, renderer: THREE.WebGLRenderer): void;
/**
 * Exports a render target's texture to a blob.
 * @param {THREE.RenderTarget} renderTarget - The render target.
 * @param {THREE.WebGLRenderer} renderer - The renderer (MUST be the same renderer used for the target).
 * @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {string} The data URL representing the RenderTarget's texture contents.
 */
export function renderTargetToDataURL(renderTarget: THREE.RenderTarget, renderer: THREE.WebGLRenderer, flipY?: boolean): string;
/**
 * Copies faceline and mask render targets from `src`
 * to the `dst` CharModel, disposing textures from `dst`
 * and disposing shapes from `src`, effectively transferring.
 * @param {CharModel} src - The source {@link CharModel} from which to copy textures from and dispose shapes.
 * @param {CharModel} dst - The destination {@link CharModel} receiving the textures.
 * @returns {CharModel} The final CharModel.
 * @todo TODO: Completely untested.
 */
export function transferCharModelTex(src: CharModel, dst: CharModel): CharModel;
export type ViewType = number;
export namespace ViewType {
    let Face: number;
    let MakeIcon: number;
    let IconFovy45: number;
}
/**
 * Creates an icon representing the CharModel's head,
 * using a render target and reading its pixels into a data URL.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {ViewType} viewType - The view type.
 * @param {number} width - Desired icon width.
 * @param {number} height - Desired icon height.
 * @returns {string} A data URL of the icon image.
 * @throws {Error} CharModel.meshes is null or undefined, it may have been disposed.
 */
export function createCharModelIcon(charModel: CharModel, renderer: THREE.WebGLRenderer, viewType?: ViewType, width?: number, height?: number): string;
/**
 * @typedef {Object} StudioCharInfo
 * @property {number} beardColor
 * @property {number} beardType
 * @property {number} build
 * @property {number} eyeAspect
 * @property {number} eyeColor
 * @property {number} eyeRotate
 * @property {number} eyeScale
 * @property {number} eyeType
 * @property {number} eyeX
 * @property {number} eyeY
 * @property {number} eyebrowAspect
 * @property {number} eyebrowColor
 * @property {number} eyebrowRotate
 * @property {number} eyebrowScale
 * @property {number} eyebrowType
 * @property {number} eyebrowX
 * @property {number} eyebrowY
 * @property {number} facelineColor
 * @property {number} facelineMake
 * @property {number} facelineType
 * @property {number} facelineWrinkle
 * @property {number} favoriteColor
 * @property {number} gender
 * @property {number} glassColor
 * @property {number} glassScale
 * @property {number} glassType
 * @property {number} glassY
 * @property {number} hairColor
 * @property {number} hairFlip
 * @property {number} hairType
 * @property {number} height
 * @property {number} moleScale
 * @property {number} moleType
 * @property {number} moleX
 * @property {number} moleY
 * @property {number} mouthAspect
 * @property {number} mouthColor
 * @property {number} mouthScale
 * @property {number} mouthType
 * @property {number} mouthY
 * @property {number} mustacheScale
 * @property {number} mustacheType
 * @property {number} mustacheY
 * @property {number} noseScale
 * @property {number} noseType
 * @property {number} noseY
 */
/**
 * Structure representing data from the studio.mii.nintendo.com site and API.
 * @type {_.StructInstance<StudioCharInfo>}
 */
export const StudioCharInfo: _.StructInstance<StudioCharInfo>;
/**
 * Creates an FFLiCharInfo object from StudioCharInfo.
 * @param {StudioCharInfo} src - The StudioCharInfo instance.
 * @returns {FFLiCharInfo} The FFLiCharInfo output.
 */
export function convertStudioCharInfoToFFLiCharInfo(src: StudioCharInfo): FFLiCharInfo;
/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Array<number>} data - The Uint8Array to convert. TODO: check if Uint8Array truly can be used
 * @returns {string} The Base64-encoded string.
 */
export function uint8ArrayToBase64(data: Array<number>): string;
/**
 * Parses a string contaning either hex or Base64 representation
 * of bytes into a Uint8Array, stripping spaces.
 * @param {string} text - The input string, which can be either hex or Base64.
 * @returns {Uint8Array} The parsed Uint8Array.
 */
export function parseHexOrB64ToUint8Array(text: string): Uint8Array;
type FFLCullMode = number;
declare namespace FFLCullMode {
    export let NONE: number;
    export let BACK: number;
    export let FRONT: number;
    let MAX_1: number;
    export { MAX_1 as MAX };
}
import * as THREE from 'three';
type FFLTextureFormat = number;
declare namespace FFLTextureFormat {
    export let R8_UNORM: number;
    export let R8_G8_UNORM: number;
    export let R8_G8_B8_A8_UNORM: number;
    let MAX_2: number;
    export { MAX_2 as MAX };
}
import * as _ from './struct-fu';
/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 */
declare class TextureManager {
    /**
     * Creates and allocates an {@link FFLTextureCallback} instance from callback function pointers.
     * @param {Module} module - The Emscripten module.
     * @param {number} createCallback - Function pointer for the create callback.
     * @param {number} deleteCallback - Function pointer for the delete callback.
     * @returns {number} Pointer to the {@link FFLTextureCallback}.
     * Note that you MUST free this after using it (done in {@link TextureManager.disposeCallback}).
     * @private
     */
    private static _allocateTextureCallback;
    /**
     * Constructs the TextureManager. This MUST be created after initializing FFL.
     * @param {Module} module - The Emscripten module.
     * @param {boolean} [setToFFLGlobal] - Whether or not to call FFLSetTextureCallback on the constructed callback.
     */
    constructor(module: Module, setToFFLGlobal?: boolean);
    /**
     * @type {Module}
     * @private
     */
    private _module;
    /**
     * @type {Map<number, THREE.Texture>}
     * @private
     */
    private _textures;
    /** @package */
    _textureCallbackPtr: number;
    /**
     * Controls whether or not the TextureManager
     * will log creations and deletions of textures
     * in order to better track memory allocations.
     * @public
     */
    public logging: boolean;
    /**
     * Creates the create/delete functions in Emscripten and allocates and sets
     * the {@link FFLTextureCallback} object as {@link TextureManager._textureCallbackPtr}.
     * @param {boolean} addDeleteCallback - Whether or not to bind the delete function to the texture callback.
     */
    _setTextureCallback(addDeleteCallback?: boolean): void;
    /** @private */
    private _createCallback;
    /** @private */
    private _deleteCallback;
    /**
     * @param {number} format - Enum value for FFLTextureFormat.
     * @returns {THREE.PixelFormat} Three.js texture format constant.
     * @throws {Error} Unexpected FFLTextureFormat value
     * Note that this function won't work on WebGL1Renderer in Three.js r137-r162 since R and RG textures need to use Luminance(Alpha)Format
     * (you'd somehow need to detect which renderer is used)
     * @private
     */
    private _getTextureFormat;
    /**
     * @param {number} _ - Originally pObj, unused here.
     * @param {number} textureInfoPtr - Pointer to {@link FFLTextureInfo}.
     * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
     * @private
     */
    private _textureCreateFunc;
    /**
     * @param {THREE.Texture} texture - Texture to upload mipmaps into.
     * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
     * @throws {Error} Throws if mipPtr is null.
     * @private
     */
    private _addMipmaps;
    /**
     * @param {number} _ - Originally pObj, unused here.
     * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
     * @private
     */
    private _textureDeleteFunc;
    /**
     * @param {number} id - ID assigned to the texture.
     * @returns {THREE.Texture|null|undefined} Returns the texture if it is found.
     * @public
     */
    public get(id: number): THREE.Texture | null | undefined;
    /**
     * @param {number} id - ID assigned to the texture.
     * @param {THREE.Texture} texture - Texture to add.
     * @public
     */
    public set(id: number, texture: THREE.Texture): void;
    /**
     * @param {number} id - ID assigned to the texture.
     * @public
     */
    public delete(id: number): void;
    /**
     * Disposes/frees the {@link FFLTextureCallback} along with
     * removing the created Emscripten functions.
     * @public
     */
    public disposeCallback(): void;
    /**
     * Disposes of all textures and frees the {@link FFLTextureCallback}.
     * @public
     */
    public dispose(): void;
}
export {};
