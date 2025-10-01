export type FFLResourceDesc = {
    pData: Array<number>;
    size: Array<number>;
};
export type FFLiCharInfo = {
    miiVersion: number;
    faceType: number;
    faceColor: number;
    faceTex: number;
    faceMake: number;
    hairType: number;
    hairColor: number;
    hairFlip: number;
    eyeType: number;
    eyeColor: number;
    eyeScale: number;
    eyeAspect: number;
    eyeRotate: number;
    eyeX: number;
    eyeY: number;
    eyebrowType: number;
    eyebrowColor: number;
    eyebrowScale: number;
    eyebrowAspect: number;
    eyebrowRotate: number;
    eyebrowX: number;
    eyebrowY: number;
    noseType: number;
    noseScale: number;
    noseY: number;
    mouthType: number;
    mouthColor: number;
    mouthScale: number;
    mouthAspect: number;
    mouthY: number;
    beardMustache: number;
    beardType: number;
    beardColor: number;
    beardScale: number;
    beardY: number;
    glassType: number;
    glassColor: number;
    glassScale: number;
    glassY: number;
    moleType: number;
    moleScale: number;
    moleX: number;
    moleY: number;
    height: number;
    build: number;
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
    createID: Array<number>;
    padding_0: number;
    authorType: number;
    authorID: Array<number>;
};
export type FFLCharModelDesc = {
    /**
     * - Texture resolution for faceline/mask. It's recommended to only use powers of two.
     */
    resolution: number;
    /**
     * - Expression flag, created by {@link makeExpressionFlag}
     */
    allExpressionFlag: Uint32Array;
    modelFlag: FFLModelFlag;
    resourceType: FFLResourceType;
};
export type FFLCharModelSource = {
    dataSource: FFLDataSource;
    pBuffer: number;
    /**
     * - Only for default, official, MiddleDB; unneeded for raw data
     */
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
export type _ = {
    struct(name: string | Array<Field>, fields?: Array<Field | StructInstance<any>> | number, count?: number): StructInstance<any>;
    padTo(off: number): Field & {
        _padTo: number;
        _id?: string;
    };
    bool(name?: string, count?: number): Field;
    ubit: (name?: string | undefined, width?: number | undefined, count?: number | undefined) => _Import.Field;
    ubitLE: (name?: string | undefined, width?: number | undefined, count?: number | undefined) => _Import.Field;
    sbit: (name?: string | undefined, width?: number | undefined, count?: number | undefined) => _Import.Field;
    byte: (name: string | number, size?: number | undefined, count?: number | undefined) => _Import.Field & _Import.ByteTransform;
    char: (name: string | number, size?: number | undefined, count?: number | undefined) => _Import.Field & _Import.ByteTransform;
    char16le: (name: string | number, size?: number | undefined, count?: number | undefined) => _Import.Field & _Import.ByteTransform;
    char16be: (name: string | number, size?: number | undefined, count?: number | undefined) => _Import.Field & _Import.ByteTransform;
    uint8: (arg0: (string | number), arg1?: number | undefined) => Field;
    uint16: (arg0: (string | number), arg1?: number | undefined) => Field;
    uint32: (arg0: (string | number), arg1?: number | undefined) => Field;
    uint16le: (arg0: (string | number), arg1?: number | undefined) => Field;
    uint32le: (arg0: (string | number), arg1?: number | undefined) => Field;
    int8: (arg0: (string | number), arg1?: number | undefined) => Field;
    int16: (arg0: (string | number), arg1?: number | undefined) => Field;
    int32: (arg0: (string | number), arg1?: number | undefined) => Field;
    int16le: (arg0: (string | number), arg1?: number | undefined) => Field;
    int32le: (arg0: (string | number), arg1?: number | undefined) => Field;
    float32: (arg0: (string | number), arg1?: number | undefined) => Field;
    float64: (arg0: (string | number), arg1?: number | undefined) => Field;
    float32le: (arg0: (string | number), arg1?: number | undefined) => Field;
    float64le: (arg0: (string | number), arg1?: number | undefined) => Field;
    derive(orig: Field, pack: (arg0: any) => any, unpack: (arg0: any) => any): (arg0: (string | number) | undefined, arg1: number | undefined) => Field;
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
    _FFLpGetCharInfoFromMiiDataOfficialRFL: (arg0: number, arg1: number) => any;
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
    attributeBuffers: Array<FFLAttributeBuffer>;
    modulateParam: FFLModulateParam;
    cullMode: FFLCullMode;
    primitiveParam: FFLPrimitiveParam;
};
export type FFLiMaskTexturesTempObject = {
    pRawMaskDrawParam: Array<number>;
};
export type FFLiTextureTempObject = {
    maskTextures: FFLiMaskTexturesTempObject;
    facelineTexture: Array<FFLDrawParam>;
};
export type CharModelDescOrExpressionFlag = FFLCharModelDesc | Array<FFLExpression> | FFLExpression | Uint32Array | null;
export type FFLPartsTransform = {
    [x: string]: FFLVec3;
};
/**
 * PartsTransform with THREE.Vector3 type.
 */
export type PartsTransform = {
    [x: string]: THREE.Vector3;
};
/**
 * Internal representation within FFL for the created CharModel.
 */
export type FFLiCharModel = {
    charInfo: FFLiCharInfo;
    charModelDesc: FFLCharModelDesc;
    expression: FFLExpression;
    pTextureTempObject: number;
    drawParam: Array<FFLDrawParam>;
    pMaskRenderTextures: Array<number>;
    partsTransform: FFLPartsTransform;
    /**
     * - FFLModelType
     */
    modelType: number;
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
export type MaterialConstructor = new (...args: any[]) => import("three").Material;
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
/**
 * Reference: https://github.com/ariankordi/ffl/blob/nsmbu-win-port-linux64/include/nn/ffl/FFLExpression.h
 */
export type FFLExpression = number;
export namespace FFLExpression {
    let NORMAL: number;
    let SMILE: number;
    let ANGER: number;
    let SORROW: number;
    let PUZZLED: number;
    let SURPRISE: number;
    let SURPRISED: number;
    let BLINK: number;
    let OPEN_MOUTH: number;
    let SMILE_OPEN_MOUTH: number;
    let HAPPY: number;
    let ANGER_OPEN_MOUTH: number;
    let SORROW_OPEN_MOUTH: number;
    let SURPRISE_OPEN_MOUTH: number;
    let BLINK_OPEN_MOUTH: number;
    let WINK_LEFT: number;
    let WINK_RIGHT: number;
    let WINK_LEFT_OPEN_MOUTH: number;
    let WINK_RIGHT_OPEN_MOUTH: number;
    let LIKE_WINK_LEFT: number;
    let LIKE: number;
    let LIKE_WINK_RIGHT: number;
    let FRUSTRATED: number;
    let BORED: number;
    let BORED_OPEN_MOUTH: number;
    let SIGH_MOUTH_STRAIGHT: number;
    let SIGH: number;
    let DISGUSTED_MOUTH_STRAIGHT: number;
    let DISGUSTED: number;
    let LOVE: number;
    let LOVE_OPEN_MOUTH: number;
    let DETERMINED_MOUTH_STRAIGHT: number;
    let DETERMINED: number;
    let CRY_MOUTH_STRAIGHT: number;
    let CRY: number;
    let BIG_SMILE_MOUTH_STRAIGHT: number;
    let BIG_SMILE: number;
    let CHEEKY: number;
    let CHEEKY_DUPLICATE: number;
    let JOJO_EYES_FUNNY_MOUTH: number;
    let JOJO_EYES_FUNNY_MOUTH_OPEN: number;
    let SMUG: number;
    let SMUG_OPEN_MOUTH: number;
    let RESOLVE: number;
    let RESOLVE_OPEN_MOUTH: number;
    let UNBELIEVABLE: number;
    let UNBELIEVABLE_DUPLICATE: number;
    let CUNNING: number;
    let CUNNING_DUPLICATE: number;
    let RASPBERRY: number;
    let RASPBERRY_DUPLICATE: number;
    let INNOCENT: number;
    let INNOCENT_DUPLICATE: number;
    let CAT: number;
    let CAT_DUPLICATE: number;
    let DOG: number;
    let DOG_DUPLICATE: number;
    let TASTY: number;
    let TASTY_DUPLICATE: number;
    let MONEY_MOUTH_STRAIGHT: number;
    let MONEY: number;
    let SPIRAL_MOUTH_STRAIGHT: number;
    let CONFUSED: number;
    let CHEERFUL_MOUTH_STRAIGHT: number;
    let CHEERFUL: number;
    let BLANK_61: number;
    let BLANK_62: number;
    let GRUMBLE_MOUTH_STRAIGHT: number;
    let GRUMBLE: number;
    let MOVED_MOUTH_STRAIGHT: number;
    let MOVED: number;
    let SINGING_MOUTH_SMALL: number;
    let SINGING: number;
    let STUNNED: number;
    let MAX: number;
}
/**
 * Model flags modify how the head model is created. These are
 * used in the `modelFlag` property of {@link FFLCharModelDesc}.
 */
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
export type FFLResourceType = number;
export namespace FFLResourceType {
    export let MIDDLE: number;
    export let HIGH: number;
    let MAX_1: number;
    export { MAX_1 as MAX };
}
/**
 * @typedef {Object} FFLResourceDesc
 * @property {Array<number>} pData
 * @property {Array<number>} size
 */
/** @type {import('./struct-fu').StructInstance<FFLResourceDesc>} */
export const FFLResourceDesc: import("./struct-fu").StructInstance<FFLResourceDesc>;
/**
 * @typedef {Object} FFLiCharInfo
 * @property {number} miiVersion
 * @property {number} faceType
 * @property {number} faceColor
 * @property {number} faceTex
 * @property {number} faceMake
 * @property {number} hairType
 * @property {number} hairColor
 * @property {number} hairFlip
 * @property {number} eyeType
 * @property {number} eyeColor
 * @property {number} eyeScale
 * @property {number} eyeAspect
 * @property {number} eyeRotate
 * @property {number} eyeX
 * @property {number} eyeY
 * @property {number} eyebrowType
 * @property {number} eyebrowColor
 * @property {number} eyebrowScale
 * @property {number} eyebrowAspect
 * @property {number} eyebrowRotate
 * @property {number} eyebrowX
 * @property {number} eyebrowY
 * @property {number} noseType
 * @property {number} noseScale
 * @property {number} noseY
 * @property {number} mouthType
 * @property {number} mouthColor
 * @property {number} mouthScale
 * @property {number} mouthAspect
 * @property {number} mouthY
 * @property {number} beardMustache
 * @property {number} beardType
 * @property {number} beardColor
 * @property {number} beardScale
 * @property {number} beardY
 * @property {number} glassType
 * @property {number} glassColor
 * @property {number} glassScale
 * @property {number} glassY
 * @property {number} moleType
 * @property {number} moleScale
 * @property {number} moleX
 * @property {number} moleY
 * @property {number} height
 * @property {number} build
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
 * @property {Array<number>} createID
 * @property {number} padding_0
 * @property {number} authorType
 * @property {Array<number>} authorID
 */
/** @type {import('./struct-fu').StructInstance<FFLiCharInfo>} */
export const FFLiCharInfo: import("./struct-fu").StructInstance<FFLiCharInfo>;
/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution - Texture resolution for faceline/mask. It's recommended to only use powers of two.
 * @property {Uint32Array} allExpressionFlag - Expression flag, created by {@link makeExpressionFlag}
 * @property {FFLModelFlag} modelFlag
 * @property {FFLResourceType} resourceType
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelDesc>} */
export const FFLCharModelDesc: import("./struct-fu").StructInstance<FFLCharModelDesc>;
/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @readonly
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
 * @property {FFLDataSource} dataSource
 * @property {number} pBuffer
 * @property {number} index - Only for default, official, MiddleDB; unneeded for raw data
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelSource>} */
export const FFLCharModelSource: import("./struct-fu").StructInstance<FFLCharModelSource>;
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
 * Initializes FFL by copying the resource into heap and calling FFLInitRes.
 * It will first wait for the Emscripten module to be ready.
 * @param {Uint8Array|Response} resource - The FFL resource data. Use a Uint8Array
 * if you have the raw bytes, or a fetch response containing the FFL resource file.
 * @param {Module|Promise<Module>|function(): Promise<Module>} moduleOrPromise - The Emscripten module
 * by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1),
 * or as a function returning a promise (window.Module when MODULARIZE=1).
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when FFL is fully initialized,
 * returning the final Emscripten {@link Module} instance and the {@link FFLResourceDesc} object
 * that can later be passed into {@link exitFFL}.
 */
export function initializeFFL(resource: Uint8Array | Response, moduleOrPromise: Module | Promise<Module> | (() => Promise<Module>)): Promise<{
    module: Module;
    resourceDesc: FFLResourceDesc;
}>;
/**
 * Sets the state for whether WebGL 1.0 or WebGPU is being used.
 * Otherwise, textures will appear wrong when not using WebGL 2.0.
 * @param {Object} renderer - The WebGLRenderer or WebGPURenderer.
 * @param {Module} module - The module. Must be initialized along with the renderer.
 */
export function setRendererState(renderer: Object, module: Module): void;
/**
 * @param {Module} module - Emscripten module.
 * @param {FFLResourceDesc} resourceDesc - The FFLResourceDesc received from {@link initializeFFL}.
 * @public
 * @todo TODO: Needs to somehow destroy Emscripten instance.
 */
export function exitFFL(module: Module, resourceDesc: FFLResourceDesc): void;
/** @typedef {function(new: import('three').Material, ...*): import('three').Material} MaterialConstructor */
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
     * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
     * @param {Module} module - The Emscripten module.
     * @param {MaterialConstructor} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
     * @param {TextureManager} texManager - The {@link TextureManager} instance for this CharModel.
     */
    constructor(ptr: number, module: Module, materialClass: MaterialConstructor, texManager: TextureManager);
    /** @package */
    _module: Module;
    /**
     * The data used to construct the CharModel, set in {@link createCharModel} and used in {@link updateCharModel}.
     * @type {*}
     * @package
     */
    _data: any;
    /**
     * @type {MaterialConstructor}
     * @public
     */
    public _materialClass: MaterialConstructor;
    /**
     * Material class used to initialize textures specifically.
     * @type {MaterialConstructor}
     * @public
     */
    public _materialTextureClass: MaterialConstructor;
    /** @package */
    _textureManager: TextureManager;
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
     * @type {import('three').RenderTarget|null}
     * @package
     */
    _facelineTarget: import("three").RenderTarget | null;
    /**
     * @type {Array<import('three').RenderTarget|null>}
     * @package
     */
    _maskTargets: Array<import("three").RenderTarget | null>;
    /**
     * List of enabled expressions that can be set with {@link CharModel.setExpression}.
     * @type {Array<FFLExpression>}
     */
    expressions: Array<FFLExpression>;
    /**
     * Group of THREE.Mesh objects representing the CharModel.
     * @type {import('three').Group}
     * @public
     */
    public meshes: import("three").Group;
    /**
     * This is the method that populates meshes
     * from the internal FFLiCharModel instance.
     * @param {Module} module - Module to pass to drawParamToMesh to access mesh data.
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
     * Accesses partsTransform in FFLiCharModel,
     * converting every FFLVec3 to THREE.Vector3.
     * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
     * @private
     */
    private _getPartsTransform;
    /**
     * @returns {import('three').Color} The faceline color as THREE.Color.
     * @private
     */
    private _getFacelineColor;
    /**
     * @returns {import('three').Color} The favorite color as THREE.Color.
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
     * Calculates the bounding box from the meshes.
     * @returns {import('three').Box3} The bounding box.
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
     * Returns the value for whether the CharModel was created without shapes.
     * @returns {boolean} Whether the CharModel was created without shapes.
     * @package
     */
    _isTexOnly(): boolean;
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
    public disposeTargets(): void;
    /**
     * Disposes the CharModel and removes all associated resources.
     * - Disposes materials and geometries.
     * - Deletes faceline texture if it exists.
     * - Deletes all mask textures.
     * - Removes all meshes from the scene.
     * @param {boolean} disposeTargets - Whether or not to dispose of mask and faceline render targets.
     * @public
     */
    public dispose(disposeTargets?: boolean): void;
    /**
     * Serializes the CharModel data to FFLStoreData.
     * @returns {Uint8Array} The exported FFLStoreData.
     * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo
     * returns false, usually when CharInfo verification fails.
     * @public
     */
    public getStoreData(): Uint8Array;
    /**
     * Sets the expression for this CharModel and updates the corresponding mask texture.
     * @param {FFLExpression} expression - The new expression index.
     * @throws {Error} CharModel must have been initialized with the
     * expression enabled in the flag and have XLU_MASK in meshes.
     * @public
     */
    public setExpression(expression: FFLExpression): void;
    /**
     * Gets the faceline texture, or the texture that wraps around
     * the faceline shape (opaque, the one hair is placed atop).
     * Not to be confused with the texture containing facial features
     * such as eyes, mouth, etc. which is the mask.
     * The faceline texture may not exist if it is not needed, in which
     * case the faceline color is used directly, see property {@link facelineColor}.
     * @returns {import('three').RenderTarget|null} The faceline render target, or null if it does not exist,
     * in which case {@link facelineColor} should be used. Access .texture on this object to
     * get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
     */
    getFaceline(): import("three").RenderTarget | null;
    /**
     * Gets the mask texture, or the texture containing facial
     * features such as eyes, mouth, eyebrows, etc. This is wrapped
     * around the mask shape, which is a transparent shape
     * placed in front of the head model.
     * @param {FFLExpression} expression - The desired expression, or the current expression.
     * @returns {import('three').RenderTarget|null} The mask render target for the given expression,
     * or null if the CharModel was not initialized with that expression.
     * Access .texture on this object to get a {@link THREE.Texture} from it.
     * It becomes invalid if the CharModel is disposed.
     */
    getMask(expression?: FFLExpression): import("three").RenderTarget | null;
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
     * @returns {import('three').Color} The faceline color.
     * @public
     */
    public get facelineColor(): import("three").Color;
    /** @private */
    private _facelineColor;
    /**
     * The favorite color for this CharModel.
     * @returns {import('three').Color} The favorite color.
     * @public
     */
    public get favoriteColor(): import("three").Color;
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
     * @returns {import('three').Box3} The bounding box.
     * @public
     */
    public get boundingBox(): import("three").Box3;
    /** @private */
    private _boundingBox;
    /**
     * Gets the ColorInfo object needed for SampleShaderMaterial.
     * @param {boolean} isSpecial - Determines the pants color, gold if special or gray otherwise.
     * @returns {import('./SampleShaderMaterial').SampleShaderMaterialColorInfo}
     * The colorInfo object needed by SampleShaderMaterial.
     * @public
     */
    public getColorInfo(isSpecial?: boolean): import("./SampleShaderMaterial").SampleShaderMaterialColorInfo;
    /**
     * Gets a vector in which to scale the body model for this CharModel.
     * @returns {import('three').Vector3Like} Scale vector for the body model.
     * @public
     */
    public getBodyScale(): import("three").Vector3Like;
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
 * Use this whenever you need to describe which expression,
 * or expressions, you want to be able to use in the CharModel.
 * @param {Array<FFLExpression>|FFLExpression} expressions - Either a single expression
 * index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
export function makeExpressionFlag(expressions: Array<FFLExpression> | FFLExpression): Uint32Array;
/**
 * Checks if the expression index disables any shapes in the
 * CharModel, meant to be used when setting multiple indices.
 * @param {FFLExpression} i - Expression index to check.
 * @param {boolean} [warn] - Whether to log using {@link console.warn}.
 * @returns {boolean} Whether the expression changes shapes.
 */
export function checkExpressionChangesShapes(i: FFLExpression, warn?: boolean): boolean;
export type PantsColor = number;
export namespace PantsColor {
    let GrayNormal: number;
    let BluePresent: number;
    let RedRegular: number;
    let GoldSpecial: number;
}
/** @type {Object<PantsColor, import('three').Color>} */
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
 * @param {Uint8Array|FFLiCharInfo} data - Character data. Accepted types:
 * FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {CharModelDescOrExpressionFlag} descOrExpFlag - Either a new {@link FFLCharModelDesc},
 * an array of expressions, a single expression, or an
 * expression flag (Uint32Array). Default: {@link FFLCharModelDescDefault}
 * @param {MaterialConstructor} materialClass - Class for the material (constructor). It must be compatible
 * with FFL, so if your material isn't, try: {@link TextureShaderMaterial}, FFL/LUTShaderMaterial
 * @param {Module} module - The Emscripten module.
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The new CharModel instance.
 * @throws {FFLResultException|BrokenInitModel|FFLiVerifyReasonException|Error} Throws if `module`, `modelDesc`,
 * or `data` is invalid, CharInfo verification fails, or CharModel creation fails otherwise.
 */
export function createCharModel(data: Uint8Array | FFLiCharInfo, descOrExpFlag: CharModelDescOrExpressionFlag, materialClass: MaterialConstructor, module: Module, verify?: boolean): CharModel;
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @param {import('three').WebGLRenderer} renderer - The Three.js renderer.
 * @param {CharModelDescOrExpressionFlag} [descOrExpFlag] - Either a new {@link FFLCharModelDesc},
 * an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {Object} [options] - Options for updating the model.
 * @param {boolean} [options.texOnly] - Whether to only update the mask and faceline textures in the CharModel.
 * @param {boolean} [options.verify] - Whether the CharInfo provided should be verified.
 * @param {MaterialConstructor|null} [options.materialTextureClass] - The new materialTextureClass to change to.
 * @returns {CharModel} The updated CharModel instance.
 * @throws {Error} Unexpected type for descOrExpFlag, newData is null
 * @todo  TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
 */
export function updateCharModel(charModel: CharModel, newData: Uint8Array | null, renderer: import("three").WebGLRenderer, descOrExpFlag?: CharModelDescOrExpressionFlag, { texOnly, verify, materialTextureClass }?: {
    texOnly?: boolean | undefined;
    verify?: boolean | undefined;
    materialTextureClass?: MaterialConstructor | null | undefined;
}): CharModel;
/**
 * Creates a Three.js RenderTarget, renders the scene with
 * the given camera, and returns the render target.
 * @param {import('three').Scene} scene - The scene to render.
 * @param {import('three').Camera} camera - The camera to use.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {number} width - Desired width of the target.
 * @param {number} height - Desired height of the target.
 * @param {Object} [targetOptions] - Optional options for the render target.
 * @returns {import('three').RenderTarget} The render target (which contains .texture).
 */
export function createAndRenderToTarget(scene: import("three").Scene, camera: import("three").Camera, renderer: import("three").WebGLRenderer, width: number, height: number, targetOptions?: Object): import("three").RenderTarget;
/**
 * @param {Function} material - Class constructor for the material to test.
 * @returns {boolean} Whether or not the material class supports FFL swizzled (modulateMode) textures.
 */
export function matSupportsFFL(material: Function): boolean;
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 * Note that this is a separate function due to needing renderer parameter.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').WebGLRenderer} renderer - The Three.js renderer.
 * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
 */
export function initCharModelTextures(charModel: CharModel, renderer: import("three").WebGLRenderer, materialClass?: MaterialConstructor): void;
/**
 * Renders a texture to a canvas. If no canvas is provided, a new one is created.
 * @param {import('three').Texture} texture - The texture to render.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Object} [options] - Options for canvas output.
 * @param {boolean} [options.flipY] - Flip the Y axis. Default is oriented for OpenGL.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas to draw into.
 * Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the rendered texture.
 */
export function textureToCanvas(texture: import("three").Texture, renderer: import("three").WebGLRenderer, { flipY, canvas }?: {
    flipY?: boolean | undefined;
    canvas?: HTMLCanvasElement | undefined;
}): HTMLCanvasElement;
/**
 * A material class that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 * @augments {THREE.ShaderMaterial}
 */
export class TextureShaderMaterial extends THREE.ShaderMaterial {
    /**
     * @typedef {Object} TextureShaderMaterialParameters
     * @property {FFLModulateMode} [modulateMode] - Modulate mode.
     * @property {FFLModulateType} [modulateType] - Modulate type.
     * @property {import('three').Color|Array<import('three').Color>} [color] -
     * Constant color assigned to u_const1/2/3 depending on single or array.
     */
    /**
     * The material constructor.
     * @param {import('three').ShaderMaterialParameters & TextureShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: import("three").ShaderMaterialParameters & {
        /**
         * - Modulate mode.
         */
        modulateMode?: number | undefined;
        /**
         * - Modulate type.
         */
        modulateType?: number | undefined;
        /**
         * -
         * Constant color assigned to u_const1/2/3 depending on single or array.
         */
        color?: THREE.Color | THREE.Color[] | undefined;
    });
    lightEnable: boolean;
    modulateType: number;
    /**
     * Sets the constant color uniforms from THREE.Color.
     * @param {import('three').Color|Array<import('three').Color>} value -
     * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
     */
    set color(value: import("three").Color | Array<import("three").Color>);
    /**
     * Gets the constant color (diffuse) uniform as THREE.Color.
     * @returns {import('three').Color|null} The constant color, or null if it is not set.
     */
    get color(): import("three").Color | null;
    /** @type {import('three').Color} */
    _color3: THREE.Color | undefined;
    /** @param {FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: FFLModulateMode);
    /** @returns {FFLModulateMode|null}The modulateMode value, or null if it is unset. */
    get modulateMode(): FFLModulateMode | null;
    /** @param {import('three').Texture} value - The new texture map. */
    set map(value: import("three").Texture);
    /** @returns {import('three').Texture|null}The texture map, or null if it is unset. */
    get map(): import("three").Texture | null;
}
/**
 * Converts a CharModel's textures, including ones that may be using swizzled modulateMode
 * textures that are R/RG format, to RGBA and also applying colors, so that
 * the CharModel can be rendered without a material that supports modulateMode.
 * @param {CharModel} charModel - The CharModel whose textures to convert.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
 */
export function convertModelTexturesToRGBA(charModel: CharModel, renderer: import("three").WebGLRenderer, materialTextureClass: MaterialConstructor): void;
/**
 * Converts all textures in the CharModel that are associated
 * with RenderTargets into THREE.DataTextures, so that the
 * CharModel can be exported using e.g., GLTFExporter.
 * @param {CharModel} charModel - The CharModel whose textures to convert.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 */
export function convModelTargetsToDataTex(charModel: CharModel, renderer: import("three").WebGLRenderer): void;
/**
 * Modifies a BufferGeometry in place to be compatible with glTF.
 * It currently: deinterleaves attributes, converts half-float to float,
 * and converts signed integer formats (not uint8 for color) to float.
 * Attributes named "normal" are reduced to three components.
 * @param {import('three').BufferGeometry} geometry - The BufferGeometry to modify in place.
 * @throws {Error} Throws if an unsupported attribute format is encountered.
 */
export function convGeometryToGLTFCompatible(geometry: import("three").BufferGeometry): void;
export type ViewType = number;
export namespace ViewType {
    let Face: number;
    let MakeIcon: number;
    let IconFovy45: number;
}
/**
 * @param {ViewType} viewType - The {@link ViewType} enum value.
 * @param {number} width - Width of the view.
 * @param {number} height - Height of the view.
 * @returns {import('three').PerspectiveCamera} The camera representing the view type specified.
 * @throws {Error} not implemented (ViewType.Face)
 */
export function getCameraForViewType(viewType: ViewType, width?: number, height?: number): import("three").PerspectiveCamera;
/**
 * Creates an icon of the CharModel with the specified view type.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Object} [options] - Optional settings for rendering the icon.
 * @param {ViewType} [options.viewType] - The view type that the camera derives from.
 * @param {number} [options.width] - Desired icon width in pixels.
 * @param {number} [options.height] - Desired icon height in pixels.
 * @param {import('three').Scene} [options.scene] - Optional scene
 * if you want to provide your own (e.g., with background, or models).
 * @param {import('three').Camera} [options.camera] - Optional camera
 * to use instead of the one derived from {@link ViewType}.
 * @param {HTMLCanvasElement} [options.canvas] - Optional canvas
 * to draw into. Creates a new canvas if this does not exist.
 * @returns {HTMLCanvasElement} The canvas containing the icon.
 */
export function makeIconFromCharModel(charModel: CharModel, renderer: import("three").WebGLRenderer, options?: {
    viewType?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    scene?: THREE.Scene | undefined;
    camera?: THREE.Camera | undefined;
    canvas?: HTMLCanvasElement | undefined;
}): HTMLCanvasElement;
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
 * @type {import('./struct-fu').StructInstance<StudioCharInfo>}
 */
export const StudioCharInfo: import("./struct-fu").StructInstance<StudioCharInfo>;
/**
 * Creates an FFLiCharInfo object from StudioCharInfo.
 * @param {StudioCharInfo} src - The StudioCharInfo instance.
 * @returns {FFLiCharInfo} The FFLiCharInfo output.
 */
export function convertStudioCharInfoToFFLiCharInfo(src: StudioCharInfo): FFLiCharInfo;
/**
 * Creates a StudioCharInfo object from FFLiCharInfo.
 * @param {FFLiCharInfo} src - The FFLiCharInfo instance.
 * @returns {StudioCharInfo} The StudioCharInfo output.
 * @todo TODO: Currently does NOT convert color indices
 * to CommonColor indices (ToVer3... etc)
 */
export function convertFFLiCharInfoToStudioCharInfo(src: FFLiCharInfo): StudioCharInfo;
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
import * as _Import from './struct-fu.js';
type FFLCullMode = number;
declare namespace FFLCullMode {
    export let NONE: number;
    export let BACK: number;
    export let FRONT: number;
    let MAX_2: number;
    export { MAX_2 as MAX };
}
import * as THREE from 'three';
type FFLTextureFormat = number;
declare namespace FFLTextureFormat {
    export let R8_UNORM: number;
    export let R8_G8_UNORM: number;
    export let R8_G8_B8_A8_UNORM: number;
    let MAX_3: number;
    export { MAX_3 as MAX };
}
/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 * @package
 */
declare class TextureManager {
    /**
     * Global that controls if texture creation should be changed
     * to account for WebGL 1.0. (Shapes should be fine)
     * @public
     */
    public static isWebGL1: boolean;
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
     * @type {Map<number, import('three').Texture>}
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
     * @returns {import('three').PixelFormat} Three.js texture format constant.
     * Note that this function won't work on WebGL1Renderer in Three.js r137-r162
     * since R and RG textures need to use Luminance(Alpha)Format
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
     * @param {import('three').Texture} texture - Texture to upload mipmaps into.
     * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
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
     * @returns {import('three').Texture|null|undefined} Returns the texture if it is found.
     * @public
     */
    public get(id: number): import("three").Texture | null | undefined;
    /**
     * @param {number} id - ID assigned to the texture.
     * @param {import('three').Texture} texture - Texture to add.
     * @public
     */
    public set(id: number, texture: import("three").Texture): void;
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
