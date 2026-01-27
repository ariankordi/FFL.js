export type FFLCharModelSource = {
    /**
     * - Originally FFLDataSource enum.
     */
    dataSource: number;
    pBuffer: number;
    /**
     * - Only for default, official, MiddleDB; unneeded for raw data
     */
    index: number;
};
/**
 * NOTE: FFLResourceType has been removed from here.
 */
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
};
/**
 * Generic type for both types of Three.js renderers.
 */
export type Renderer = import("three/webgpu").Renderer | THREE.WebGLRenderer;
/**
 * Emscripten "Module" type.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
 * This lists common Emscripten methods for interacting with memory,
 * as well as functions used in the FFL library itself.
 */
export type Module = {
    onRuntimeInitialized: () => void;
    destroy: (arg0: object) => void;
    /**
     * // USE_TYPED_ARRAYS == 2
     */
    calledRun: boolean | null;
    HEAPU8: Uint8Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
    /**
     * - Used for some vertex attributes.
     */
    HEAP8: Int8Array;
    /**
     * - Used for index buffer.
     * Runtime methods:
     */
    HEAPU16: Uint16Array;
    _malloc: (arg0: number) => number;
    _free: (arg0: number) => void;
    addFunction: (arg0: (...args: any[]) => any, arg1: string | undefined) => number;
    removeFunction: (arg0: number) => void;
    /**
     * - Only included with a certain Emscripten linker flag.
     *
     * ------------------------------- FFL Bindings -------------------------------
     * Utilized functions:
     */
    _exit: undefined | (() => void);
    _FFLInitCharModelCPUStepWithCallback: (arg0: number, arg1: number, arg2: number, arg3: number) => any;
    _FFLDeleteCharModel: (arg0: number) => any;
    _FFLiGetRandomCharInfo: (arg0: number, arg1: number, arg2: number, arg3: number) => any;
    _FFLpGetCharInfoFromStoreData: (arg0: number, arg1: number) => any;
    _FFLpGetCharInfoFromMiiDataOfficialRFL: (arg0: number, arg1: number) => any;
    _FFLInitRes: (arg0: number, arg1: number) => any;
    _FFLInitResGPUStep: () => any;
    _FFLExit: () => any;
    _FFLGetFavoriteColor: (arg0: number, arg1: number) => any;
    _FFLGetFacelineColor: (arg0: number, arg1: number) => any;
    _FFLSetTextureFlipY: (arg0: boolean) => any;
    _FFLSetNormalIsSnorm8_8_8_8: (arg0: boolean) => any;
    _FFLSetFrontCullForFlipX: (arg0: boolean) => any;
    _FFLSetTextureCallback: (arg0: number) => any;
    _FFLiDeleteTextureTempObject: (arg0: number) => any;
    _FFLiDeleteTempObjectMaskTextures: (arg0: number, arg1: number, arg2: number) => any;
    _FFLiDeleteTempObjectFacelineTexture: (arg0: number, arg1: number, arg2: number) => any;
    _FFLiInvalidateTempObjectFacelineTexture: (arg0: number) => any;
    _FFLiInvalidateRawMask: (arg0: number) => any;
    /**
     * These functions are NOT called directly:
     */
    _FFLiVerifyCharInfoWithReason: (arg0: number, arg1: boolean) => any;
    _FFLiiGetEyeRotateOffset: (arg0: number) => any;
    _FFLiiGetEyebrowRotateOffset: (arg0: number) => any;
    _FFLSetLinearGammaMode: (arg0: number) => any;
    _FFLpGetStoreDataFromCharInfo: (arg0: number, arg1: number) => any;
    /**
     * -
     * This isn't used and can't be used without a decoding method (with bitfields),
     * but to get "additional info" would be nice in general.
     */
    _FFLGetAdditionalInfo: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: boolean) => any;
};
export type FFLiCharInfo = ReturnType<typeof _unpackFFLiCharInfo>;
export type MaterialConstructor = new (...args: any[]) => THREE.Material;
export type CharModelDescOrExpressionFlag = FFLCharModelDesc | Array<FFLExpression> | FFLExpression | Uint32Array | null;
/**
 * *
 */
export type FFLModulateMode = number;
export namespace FFLModulateMode {
    let CONSTANT: number;
    let TEXTURE_DIRECT: number;
    let RGB_LAYERED: number;
    let ALPHA: number;
    let LUMINANCE_ALPHA: number;
    let ALPHA_OPA: number;
}
/**
 * *
 */
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
 * *
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
 * *
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
/**
 * Base exception type for all exceptions based on FFLResult.
 * https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs
 * https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 */
export class FFLResultException extends Error {
    /**
     * Throws an exception if the {@link FFLResult} is not OK.
     * @param {number} result - The {@link FFLResult} from an FFL function.
     * @param {string} [funcName] - The name of the function that was called.
     * @throws {FFLResultException|FFLResultWrongParam|FFLResultBroken|FFLResultNotAvailable|FFLResultFatal}
     */
    static handleResult(result: number, funcName?: string): void;
    /**
     * @param {number|FFLResult} result - The returned {@link FFLResult}.
     * @param {string} [funcName] - The name of the function that was called.
     * @param {string} [message] - An optional message for the exception.
     */
    constructor(result: number | FFLResult, funcName?: string, message?: string);
    /** The stored {@link FFLResult} code. */
    result: number;
}
/**
 * Exception thrown by the result of FFLiVerifyCharInfoWithReason.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
 */
export class FFLiVerifyReasonException extends Error {
    /** @param {number} result - The FFLiVerifyReason code from FFLiVerifyCharInfoWithReason. */
    constructor(result: number);
    /** The stored FFLiVerifyReason code. */
    result: number;
}
/**
 * Exception thrown when the mask is set to an expression that
 * the {@link CharModel} was never initialized to, which can't happen
 * because that mask texture does not exist on the {@link CharModel}.
 * @augments {Error}
 */
export class ExpressionNotSet extends Error {
    /** @param {FFLExpression} expression - The attempted expression. */
    constructor(expression: FFLExpression);
    expression: number;
}
/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @readonly
 * @public
 */
export const FFLCharModelDescDefault: FFLCharModelDesc;
/**
 * Class for initializing FFL.js.
 * The instance of this class is meant to be passed when creating
 * CharModels or to functions that need the {@link Module}.
 */
export class FFL {
    /**
     * Resource type to load single resource into = FFL_RESOURCE_TYPE_HIGH
     * @package
     */
    static singleResourceType: number;
    /**
     * Initializes FFL by copying the resource into heap and calling FFLInitRes.
     * It will first wait for the Emscripten module to be ready.
     * @param {Uint8Array|Response} resource - The FFL resource data. Use a Uint8Array
     * if you have the raw bytes, or a fetch response containing the FFL resource file.
     * @param {Module|Promise<Module>|function(): Promise<Module>} moduleOrPromise - The Emscripten module
     * by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1),
     * or as a function returning a promise (window.Module when MODULARIZE=1).
     * @returns {Promise<FFL>} Resolves when FFL is fully initialized.
     * returning the final Emscripten {@link Module} instance and the FFLResourceDesc buffer
     * that can later be passed into `FFL.dispose()`.
     * @public
     */
    public static initWithResource(resource: Uint8Array | Response, moduleOrPromise: Module | Promise<Module> | (() => Promise<Module>)): Promise<FFL>;
    /**
     * @typedef {Object} FFLResourceDesc
     * @property {Array<number>} pData
     * @property {Array<number>} size
     * @private
     */
    private static FFLResourceDesc_size;
    /**
     * @param {FFLResourceDesc} obj - Object form of FFLResourceDesc.
     * @returns {Uint8Array} Byte form of FFLResourceDesc.
     * @private
     */
    private static _packFFLResourceDesc;
    /**
     * Loads data from TypedArray or fetch response directly into Emscripten heap.
     * If passed a fetch response, it streams it directly into memory and avoids copying.
     * @param {ArrayBuffer|Uint8Array|Response} resource - The resource data.
     * Use a Fetch response to stream directly, or a Uint8Array if you only have the raw bytes.
     * @param {Module} module - The Emscripten module instance.
     * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
     * @throws {Error} resource must be a Uint8Array or fetch that is streamable and has Content-Length.
     * @private
     */
    private static _loadDataIntoHeap;
    /**
     * Frees all pData pointers within FFLResourceDesc.
     * @param {FFLResourceDesc|null} desc - Resource description containing pointers.
     * @param {Module} module - Emscripten module to call _free on.
     * @private
     */
    private static _freeResource;
    /**
     * @param {Module} module - Emscripten module.
     * @param {FFLResourceDesc} resourceDesc - FFLResourceDesc to free later.
     * @private
     */
    private constructor();
    /** @package */
    module: Module;
    /** @package */
    resourceDesc: {
        pData: Array<number>;
        size: Array<number>;
    };
    /**
     * Frees the FFL resource from WASM memory.
     * @public
     */
    public dispose(): void;
    /**
     * Sets the state for whether WebGL 1.0 or WebGPU is being used.
     * Otherwise, textures will appear wrong when not using WebGL 2.0.
     * @param {Renderer} renderer - The WebGLRenderer or WebGPURenderer.
     * @public
     */
    public setRenderer(renderer: Renderer): void;
}
/**
 * Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
 * @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
 * @param {FFL} ffl - FFL module/resource state.
 * @param {boolean} verifyName - Whether the name and creator name should be verified.
 * @returns {void} Returns nothing if verification passes.
 * @throws {FFLiVerifyReasonException} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
 * @public
 */
export function verifyCharInfo(data: Uint8Array | number, ffl: FFL, verifyName?: boolean): void;
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 * @param {FFL} ffl - FFL module/resource state.
 * @param {FFLGender} gender - Gender of the character.
 * @param {FFLAge} age - Age of the character.
 * @param {FFLRace} race - Race of the character.
 * @returns {Uint8Array} The random FFLiCharInfo.
 */
export function getRandomCharInfo(ffl: FFL, gender?: FFLGender, age?: FFLAge, race?: FFLRace): Uint8Array;
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
/**
 * Class for creating and maintaining a Mii head model,
 * also known as the "CharModel". Once constructed, a Three.js
 * model group is provided in {@link CharModel.meshes}.
 * @public
 */
export class CharModel {
    /**
     * Updates the given CharModel with new data and a new ModelDesc or expression flag.
     * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
     * of the ModelDesc from the existing CharModel.
     * @param {CharModel} charModel - The existing CharModel instance.
     * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
     * @param {Renderer} renderer - The Three.js renderer.
     * @param {CharModelDescOrExpressionFlag} [descOrExpFlag] - Either a new {@link FFLCharModelDesc},
     * an array of expressions, a single expression, or an expression flag (Uint32Array).
     * @param {Object} [options] - Options for updating the model.
     * @param {boolean} [options.texOnly] - Whether to only update the mask and faceline textures in the CharModel.
     * @param {boolean} [options.verify] - Whether the CharInfo provided should be verified.
     * @param {MaterialConstructor|null} [options.materialTextureClass] - The new materialTextureClass to change to.
     * @returns {CharModel} The updated CharModel instance.
     * @throws {Error} Unexpected type for descOrExpFlag, newData is null
     * @todo TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
     */
    static update(charModel: CharModel, newData: Uint8Array | null, renderer: Renderer, descOrExpFlag?: CharModelDescOrExpressionFlag, { texOnly, verify, materialTextureClass }?: {
        texOnly?: boolean | undefined;
        verify?: boolean | undefined;
        materialTextureClass?: MaterialConstructor | null | undefined;
    }): CharModel;
    /** @private */
    private static FFLiCharModel_size;
    /** @private */
    private static FFLCharModelDesc_size;
    /**
     * Used to index DrawParam array in FFLiCharModel.
     * @private
     */
    private static FFLiShapeType;
    /**
     * @param {FFLCharModelDesc} obj - Object form of FFLCharModelDesc.
     * @returns {Uint8Array} Byte form of FFLCharModelDesc.
     * @private
     */
    private static _packFFLCharModelDesc;
    /**
     * @param {FFLCharModelSource} obj - Object form of FFLCharModelSource.
     * @returns {Uint8Array} Byte form of FFLCharModelSource.
     * @private
     */
    private static _packFFLCharModelSource;
    /**
     * Converts an expression flag, expression, array of expressions, or object to {@link FFLCharModelDesc}.
     * Uses the `defaultDesc` as a fallback to return if input is null or applies expression to it.
     * @param {CharModelDescOrExpressionFlag} [descOrExpFlag] - Either a new {@link FFLCharModelDesc},
     * an array of expressions, a single expression, or an expression flag (Uint32Array).
     * @param {FFLCharModelDesc} [defaultDesc] - Fallback if descOrExpFlag is null or expression flag only.
     * @returns {FFLCharModelDesc} The CharModelDesc with the expression applied, or the default.
     * @throws {TypeError} Throws if `descOrExpFlag` is an unexpected type.
     * @private
     */
    private static _descOrExpFlagToModelDesc;
    /**
     * Creates a CharModel from data and FFLCharModelDesc.
     * Don't forget to call `dispose()` on the CharModel when you are done with it.
     * @param {FFL} ffl - FFL module/resource state.
     * @param {Uint8Array} data - Character data. Accepted types:
     * FFLStoreData, RFLCharData, StudioCharInfo, FFLiCharInfo as Uint8Array
     * @param {CharModelDescOrExpressionFlag} descOrExpFlag - Either a new {@link FFLCharModelDesc},
     * an array of expressions, a single expression, or an
     * expression flag (Uint32Array). Default: {@link FFLCharModelDescDefault}
     * @param {MaterialConstructor} materialClass - Class for the material (constructor). It must be compatible
     * with FFL, so if your material isn't, try: {@link TextureShaderMaterial}, FFL/LUTShaderMaterial
     * @param {Renderer} [renderer] - The Three.js renderer used for the render textures.
     * If this is not provided, you must call {@link CharModel.initTextures}.
     * @param {boolean} [verify] - Whether the CharInfo provided should be verified.
     * @throws {FFLResultException|FFLiVerifyReasonException|Error} Throws if `module`, `modelDesc`,
     * or `data` is invalid, CharInfo verification fails, or CharModel creation fails otherwise.
     */
    constructor(ffl: FFL, data: Uint8Array, descOrExpFlag: CharModelDescOrExpressionFlag, materialClass: MaterialConstructor, renderer?: Renderer, verify?: boolean);
    /** @private */
    private _module;
    /**
     * The data used to construct the CharModel.
     * @type {ConstructorParameters<typeof CharModel>[1]}
     * @private
     */
    private _data;
    /**
     * @type {MaterialConstructor}
     * @package
     */
    _materialClass: MaterialConstructor;
    /**
     * Pointer to the FFLiCharModel in memory, set to null when deleted.
     * @private
     */
    private _ptr;
    /** @private */
    private _modelDesc;
    /**
     * Local per-model TextureManager instance.
     * @private
     */
    private _textureManager;
    /**
     * Representation of the underlying FFLCharModel instance.
     * @private
     */
    private _model;
    /** @private */
    private _isTexOnly;
    /**
     * @type {THREE.RenderTarget|null}
     * @private
     */
    private _facelineTarget;
    /**
     * Array of RenderTargets for mask textures.
     * Accessible for debugging (see demo-basic).
     * @type {Array<THREE.RenderTarget|null>}
     * @package
     */
    _maskTargets: Array<THREE.RenderTarget | null>;
    /**
     * List of enabled expressions that can be set with {@link CharModel.setExpression}.
     * @type {Uint32Array}
     * @public
     */
    public expressions: Uint32Array;
    /** @private */
    private _expression;
    /**
     * Skin/face color for this model.
     * @type {THREE.Color}
     * @readonly
     * @public
     */
    public readonly facelineColor: THREE.Color;
    /**
     * Contains the CharInfo of the model.
     * Changes to this will not be reflected whatsoever.
     * @readonly
     * @returns {FFLiCharInfo} The CharInfo of the model.
     * @public
     */
    public readonly charInfo: {
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
        createID: Uint8Array<ArrayBufferLike>;
        padding_0: number;
        authorType: number;
        authorID: Uint8Array<ArrayBufferLike>;
    };
    /**
     * Group of THREE.Mesh objects representing the CharModel.
     * @type {THREE.Group}
     * @readonly
     * @public
     */
    public readonly meshes: THREE.Group;
    /**
     * Favorite color, also used for hats and body.
     * @readonly
     * @public
     */
    public readonly favoriteColor: THREE.Color;
    /**
     * The parameters in which to transform hats and other accessories.
     * @readonly
     * @public
     */
    public readonly partsTransform: {
        [x: string]: THREE.Vector3;
    };
    /**
     * Bounding box of the model.
     * Please use this instead of Three.js's built-in methods to get
     * the bounding box, since this excludes invisible shapes.
     * @public
     */
    public boundingBox: THREE.Box3;
    /** @typedef {THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>} MeshWithTexture */
    /**
     * Initializes textures (faceline and mask) for a CharModel.
     * Calling this is not necessary, unless you haven't provided
     * renderer to the constructor (e.g. you want them to be separate).
     * This ends up drawing faceline and mask textures.
     * @param {Renderer} renderer - The Three.js renderer.
     * @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
     */
    initTextures(renderer: Renderer, materialClass?: MaterialConstructor): void;
    /**
     * Material class used to initialize textures specifically.
     * @type {MaterialConstructor}
     * @private
     */
    private _materialTextureClass;
    /**
     * Disposes the CharModel and removes all associated resources.
     * @param {boolean} [disposeTargets] - Whether or not to dispose of mask and faceline render targets.
     * @public
     */
    public dispose(disposeTargets?: boolean): void;
    _facelineMesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap> | null | undefined;
    _maskMesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap> | null | undefined;
    /**
     * Disposes RenderTargets for textures created by the CharModel.
     * @public
     */
    public disposeTargets(): void;
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
     * case the faceline color is used directly, see property CharModel.facelineColor.
     * @returns {THREE.RenderTarget|null} The faceline render target, or null if it does not exist,
     * in which case CharModel.facelineColor should be used. Access .texture on this object to
     * get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
     */
    getFaceline(): THREE.RenderTarget | null;
    /**
     * Gets the mask texture, or the texture containing facial
     * features such as eyes, mouth, eyebrows, etc. This is wrapped
     * around the mask shape, which is a transparent shape
     * placed in front of the head model.
     * @param {FFLExpression} expression - The desired expression, or the current expression.
     * @returns {THREE.RenderTarget|null} The mask render target for the given expression,
     * or null if the CharModel was not initialized with that expression.
     * Access .texture on this object to get a {@link THREE.Texture} from it.
     * It becomes invalid if the CharModel is disposed.
     */
    getMask(expression?: FFLExpression): THREE.RenderTarget | null;
    /**
     * Gets a vector in which to scale the body model for this CharModel.
     * @returns {THREE.Vector3Like} Scale vector for the body model.
     * @public
     */
    public getBodyScale(): THREE.Vector3Like;
    /**
     * Gets the ColorInfo object needed for SampleShaderMaterial.
     * @param {boolean} isSpecial - Determines the pants color, gold if special or gray otherwise.
     * @returns {import('./materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo}
     * The colorInfo object needed by SampleShaderMaterial.
     * @public
     */
    public getColorInfo(isSpecial?: boolean): import("./materials/SampleShaderMaterial.js").SampleShaderMaterialColorInfo;
    /**
     * Serializes the CharModel data to FFLStoreData.
     * @returns {Uint8Array} The exported FFLStoreData.
     * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo
     * returns false, usually when CharInfo verification fails.
     * @public
     * @todo TODO: Can they edit the CharInfo to justify this method so they can get it out?
     */
    /**
     * The current expression for this CharModel.
     * Read-only. Use setExpression to set the expression.
     * @returns {FFLExpression} The current expression.
     * @public
     */
    public get expression(): FFLExpression;
    /**
     * @returns {FFLGender} Gender as 0 = male, 1 = female
     * @public
     */
    public get gender(): FFLGender;
    /**
     * This is the method that populates meshes
     * from the internal FFLiCharModel instance.
     * @param {Module} module - Module to pass to DrawParam.toMesh to access mesh data.
     * @private
     */
    private _addCharModelMeshes;
    /**
     * Calculates the bounding box from the meshes.
     * @returns {THREE.Box3} The bounding box.
     * @private
     */
    private _getBoundingBox;
    /**
     * @returns {THREE.Color} The favorite color as THREE.Color.
     * @private
     */
    private _getFavoriteColor;
    /**
     * Frees and deletes the FFLCharModel, which can be done after rendering textures.
     * This is not the same as `dispose()` which cleans up the scene.
     * @private
     */
    private _finalizeCharModel;
    /**
     * Sets the faceline texture from the RenderTarget.
     * @param {THREE.RenderTarget} target - RenderTarget for the faceline texture.
     * @throws {Error} CharModel must be initialized with OPA_FACELINE in meshes.
     * @private
     */
    private _setFaceline;
}
/**
 * Creates a Three.js RenderTarget, renders the scene with
 * the given camera, and returns the render target.
 * @param {THREE.Scene} scene - The scene to render.
 * @param {THREE.Camera} camera - The camera to use.
 * @param {Renderer} renderer - The renderer.
 * @param {number} width - Desired width of the target.
 * @param {number} height - Desired height of the target.
 * @param {Object} [targetOptions] - Optional options for the render target.
 * @returns {THREE.RenderTarget} The render target (which contains .texture).
 */
export function createAndRenderToTarget(scene: THREE.Scene, camera: THREE.Camera, renderer: Renderer, width: number, height: number, targetOptions?: Object): THREE.RenderTarget;
/**
 * @param {Function} material - Class constructor for the material to test.
 * @returns {boolean} Whether or not the material class supports FFL swizzled (modulateMode) textures.
 * @public
 */
export function matSupportsFFL(material: Function): boolean;
export namespace ModelIcon {
    /**
     * Creates an icon of the CharModel with the specified view type.
     * @param {CharModel} charModel - The CharModel instance.
     * @param {Renderer} renderer - The renderer.
     * @param {Object} [options] - Optional settings for rendering the icon.
     * @param {number} [options.width] - Desired icon width in pixels.
     * @param {number} [options.height] - Desired icon height in pixels.
     * @param {THREE.Scene} [options.scene] - Optional scene
     * if you want to provide your own (e.g., with background, or models).
     * @param {THREE.Camera} [options.camera] - Optional camera
     * to use instead of the default.
     * @param {HTMLCanvasElement} [options.canvas] - Optional canvas
     * to draw into. Creates a new canvas if this does not exist.
     * @returns {HTMLCanvasElement} The canvas containing the icon.
     * @public
     */
    function create(charModel: CharModel, renderer: Renderer, options?: {
        width?: number | undefined;
        height?: number | undefined;
        scene?: THREE.Scene | undefined;
        camera?: THREE.Camera | undefined;
        canvas?: HTMLCanvasElement | undefined;
    }): HTMLCanvasElement;
    /** @returns {THREE.PerspectiveCamera} The camera for FFLMakeIcon. */
    function getCamera(): THREE.PerspectiveCamera;
    /**
     * Generic utility for rendering a texture to a canvas.
     * The canvas can then further be converted to bytes via dataURL or Blob.
     * If no canvas is provided, a new one is created.
     * @param {THREE.Texture} texture - The texture to render.
     * @param {Renderer} renderer - The renderer.
     * @param {Object} [options] - Options for canvas output.
     * @param {boolean} [options.flipY] - Flip the Y axis. Default is oriented for OpenGL.
     * @param {HTMLCanvasElement} [options.canvas] - Optional canvas to draw into.
     * Creates a new canvas if this does not exist.
     * @returns {HTMLCanvasElement} The canvas containing the rendered texture.
     * @public
     */
    function textureToCanvas(texture: THREE.Texture, renderer: Renderer, { flipY, canvas }?: {
        flipY?: boolean | undefined;
        canvas?: HTMLCanvasElement | undefined;
    }): HTMLCanvasElement;
    /**
     * Saves the current renderer state and returns an object to restore it later.
     * @param {Renderer} renderer - The renderer to save state from.
     * @returns {{target: THREE.RenderTarget|THREE.WebGLRenderTarget|null,
     * colorSpace: THREE.ColorSpace, size: THREE.Vector2}}
     * The saved state object.
     * @private
     */
    function _saveRendererState(renderer: Renderer): {
        target: THREE.RenderTarget | THREE.WebGLRenderTarget | null;
        colorSpace: THREE.ColorSpace;
        size: THREE.Vector2;
    };
    /**
     * Restores a renderer's state from a saved state object.
     * @param {Renderer} renderer - The renderer to restore state to.
     * @param {ReturnType<typeof this._saveRendererState>} state -
     * The saved state object.
     * @private
     */
    function _restoreRendererState(renderer: Renderer, state: ReturnType<typeof this._saveRendererState>): void;
    /**
     * Copies the renderer's swapchain to a canvas.
     * @param {Renderer} renderer - The renderer.
     * @param {HTMLCanvasElement} [canvas] - Optional target canvas. If not provided, a new one is created.
     * @returns {HTMLCanvasElement} The canvas containing the rendered output.
     * @throws {Error} Throws if the canvas is invalid, yet not undefined.
     * @private
     */
    function _copyRendererToCanvas(renderer: Renderer, canvas?: HTMLCanvasElement): HTMLCanvasElement;
}
export type PantsColor = number;
export namespace PantsColor {
    let GrayNormal: number;
    let BluePresent: number;
    let RedRegular: number;
    let GoldSpecial: number;
}
/** @type {Object<PantsColor, THREE.Color>} */
export const pantsColors: any;
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
 * A material class that renders FFL swizzled (modulateMode) textures.
 * Has no lighting whatsoever, just meant to render 2D planes.
 * @augments {THREE.ShaderMaterial}
 */
export class TextureShaderMaterial extends THREE.ShaderMaterial {
    /**
     * @typedef {Object} TextureShaderMaterialParameters
     * @property {FFLModulateMode} [modulateMode] - Modulate mode.
     * @property {FFLModulateType} [modulateType] - Modulate type.
     * @property {THREE.Color|Array<THREE.Color>} [color] -
     * Constant color assigned to u_const1/2/3 depending on single or array.
     */
    /**
     * The material constructor.
     * @param {THREE.ShaderMaterialParameters & TextureShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options?: THREE.ShaderMaterialParameters & {
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
     * @param {THREE.Color|Array<THREE.Color>} value -
     * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
     */
    set color(value: THREE.Color | Array<THREE.Color>);
    /**
     * Gets the constant color (diffuse) uniform as THREE.Color.
     * @returns {THREE.Color|null} The constant color, or null if it is not set.
     */
    get color(): THREE.Color | null;
    /**
     * @type {THREE.Color}
     * @private
     */
    private _color3;
    /** @param {FFLModulateMode} value - The new modulateMode value. */
    set modulateMode(value: FFLModulateMode);
    /** @returns {FFLModulateMode|null}The modulateMode value, or null if it is unset. */
    get modulateMode(): FFLModulateMode | null;
    /** @param {THREE.Texture} value - The new texture map. */
    set map(value: THREE.Texture);
    /** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
    get map(): THREE.Texture | null;
}
export namespace ModelTexturesConverter {
    /**
     * Converts a CharModel's textures, including ones that may be using swizzled modulateMode
     * textures that are R/RG format, to RGBA and also applying colors, so that
     * the CharModel can be rendered without a material that supports modulateMode.
     * @param {CharModel} charModel - The CharModel whose textures to convert.
     * @param {Renderer} renderer - The renderer.
     * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
     * @public
     */
    function convModelTexturesToRGBA(charModel: CharModel, renderer: Renderer, materialTextureClass: MaterialConstructor): void;
    /**
     * Takes the texture in `material` and draws it using `materialTextureClass`, using
     * the modulateMode property in `userData`, using the `renderer` and sets it back
     * in the `material`. So it converts a swizzled (using modulateMode) texture to RGBA.
     * NOTE: Does NOT handle mipmaps. But these textures
     * usually do not have mipmaps anyway so it's fine
     * @param {Renderer} renderer - The renderer.
     * @param {THREE.MeshBasicMaterial} material - The original material of the mesh.
     * @param {Object<string, *>} userData - The original mesh.geometry.userData to get modulateMode/Type from.
     * @param {MaterialConstructor} materialTextureClass - The material class that draws the new texture.
     * @returns {THREE.RenderTarget} The RenderTarget of the final RGBA texture.
     * @private
     */
    function _texDrawRGBATarget(renderer: Renderer, material: THREE.MeshBasicMaterial, userData: {
        [x: string]: any;
    }, materialTextureClass: MaterialConstructor): THREE.RenderTarget;
    /**
     * Converts all textures in the CharModel that are associated
     * with RenderTargets into THREE.DataTextures, so that the
     * CharModel can be exported using e.g., GLTFExporter.
     * @param {CharModel} charModel - The CharModel whose textures to convert.
     * @param {Renderer} renderer - The renderer.
     * @public
     */
    function convModelTargetsToDataTex(charModel: CharModel, renderer: Renderer): Promise<void>;
}
export namespace GeometryConversion {
    /**
     * Modifies a BufferGeometry in place to be compatible with glTF.
     * It currently: deinterleaves attributes, converts half-float to float,
     * and converts signed integer formats (not uint8 for color) to float.
     * Attributes named "normal" are reduced to three components.
     * @param {THREE.BufferGeometry} geometry - The BufferGeometry to modify in place.
     * @throws {TypeError} Throws if an unsupported attribute format is encountered.
     * @public
     */
    function convertForGLTF(geometry: THREE.BufferGeometry): void;
    /**
     * Deinterleaves an InterleavedBufferAttribute into a standalone BufferAttribute.
     * @param {THREE.InterleavedBufferAttribute} attr - The interleaved attribute.
     * @returns {THREE.BufferAttribute} A new BufferAttribute containing deinterleaved data.
     * @private
     */
    function _interleavedToBufferAttribute(attr: THREE.InterleavedBufferAttribute): THREE.BufferAttribute;
    /**
     * Creates a new Float32Array by copying only a subset of components per vertex.
     * @param {Float32Array} src - The source Float32Array.
     * @param {number} count - Number of vertices.
     * @param {number} srcItemSize - Original components per vertex.
     * @param {number} targetItemSize - Number of components to copy per vertex.
     * @returns {Float32Array} A new Float32Array with reduced component count.
     * @private
     */
    function _copyFloat32Reduced(src: Float32Array, count: number, srcItemSize: number, targetItemSize: number): Float32Array;
    /**
     * Converts a 16-bit half-float value to a 32-bit float.
     * @param {number} half - The half-float value.
     * @returns {number} The corresponding 32-bit float value.
     * @private
     */
    function _halfToFloat(half: number): number;
    /**
     * Converts a Uint16Array assumed to represent half-float values into a Float32Array.
     * @param {Uint16Array} halfArray - The Uint16Array of half-float values.
     * @returns {Float32Array} A Float32Array with converted float values.
     * @private
     */
    function _halfArrayToFloat(halfArray: Uint16Array): Float32Array;
    /**
     * Converts an Int8Array of SNORM values to a Float32Array.
     * If the targetItemSize is less than the original (e.g. for normals), only the first targetItemSize
     * components of each vertex are copied.
     * @param {Int8Array} src - The source Int8Array.
     * @param {number} count - Number of vertices.
     * @param {number} srcItemSize - Original number of components per vertex.
     * @param {number} targetItemSize - Number of components per vertex for the output.
     * @returns {Float32Array} A Float32Array with converted values.
     * @private
     */
    function _snormToFloat(src: Int8Array, count: number, srcItemSize: number, targetItemSize: number): Float32Array;
}
import * as THREE from 'three';
/**
 * @param {Uint8Array} u8 - module.HEAPU8
 * @param {number} ptr - Pointer to the type.
 * @returns Object form of FFLiCharInfo.
 * @package
 */
declare function _unpackFFLiCharInfo(u8: Uint8Array, ptr: number): {
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
    createID: Uint8Array<ArrayBufferLike>;
    padding_0: number;
    authorType: number;
    authorID: Uint8Array<ArrayBufferLike>;
};
/**
 * *
 */
type FFLResult = number;
declare namespace FFLResult {
    export let OK: number;
    export let ERROR: number;
    export let HDB_EMPTY: number;
    export let FILE_INVALID: number;
    export let MANAGER_NOT_CONSTRUCT: number;
    export let FILE_LOAD_ERROR: number;
    export let FILE_SAVE_ERROR: number;
    export let RES_FS_ERROR: number;
    export let ODB_EMPTY: number;
    export let OUT_OF_MEMORY: number;
    export let UNKNOWN_17: number;
    export let FS_ERROR: number;
    export let FS_NOT_FOUND: number;
    let MAX_1: number;
    export { MAX_1 as MAX };
}
export {};
