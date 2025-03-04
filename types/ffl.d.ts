/**
 * Loads data from TypedArray or fetch response directly into Emscripten heap.
 * If passed a fetch response, it streams it directly into memory and avoids copying.
 * @param {Uint8Array|Response} resource - The resource data. Use a Fetch response to stream directly, or a Uint8Array if you only have the raw bytes.
 * @param {Module} module - The Emscripten module instance.
 * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
 * @throws {Error} resource must be a Uint8Array or fetch that is streamable and has Content-Length.
 * @private
 */
declare function _loadDataIntoHeap(resource: Uint8Array | Response, module: Module): Promise<{
    pointer: number;
    size: number;
}>;
/**
 * Initializes FFL by copying the resource into heap and calling FFLInitRes.
 * It will first wait for the Emscripten module to be ready.
 * @param {Uint8Array|Response} resource - The FFL resource data. Use a Uint8Array if you have the raw bytes, or a fetch response containing the FFL resource file.
 * @param {Module|Promise<Module>|function(): Promise<Module>} moduleOrPromise - The Emscripten module by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1), or as a function returning a promise (window.Module when MODULARIZE=1).
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when FFL is fully initialized, returning the final Emscripten {@link Module} instance and the {@link FFLResourceDesc} object that can later be passed into {@link exitFFL}.
 */
declare function initializeFFL(resource: Uint8Array | Response, moduleOrPromise: Module | Promise<Module> | (() => Promise<Module>)): Promise<{
    module: Module;
    resourceDesc: FFLResourceDesc;
}>;
/**
 * Fetches the FFL resource from the specified path or the "content"
 * attribute of this HTML element: meta[itemprop=ffl-js-resource-fetch-path]
 * It then calls {@link initializeFFL} on the specified module.
 * @param {Module|Promise<Module>|function(): Promise<Module>} module - The Emscripten module by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1), or as a function returning a promise (window.Module when MODULARIZE=1).
 * @param {string|null} resourcePath - The URL for the FFL resource.
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when fetch is finished and initializeFFL returns, returning the final Emscripten {@link Module} instance and the {@link FFLResourceDesc} object that can later be passed into {@link exitFFL}.
 * @throws {Error} resourcePath must be a URL string, or, an HTML element with FFL resource must exist and have content.
 */
declare function initializeFFLWithResource(module: Module | Promise<Module> | (() => Promise<Module>), resourcePath: string | null): Promise<{
    module: Module;
    resourceDesc: FFLResourceDesc;
}>;
/**
 * Frees all pData pointers within {@link FFLResourceDesc}.
 * @param {FFLResourceDesc|null} desc - {@link FFLResourceDesc} to free pointers from.
 * @param {Module} module - Emscripten module to call _free on.
 * @package
 */
declare function _freeResourceDesc(desc: FFLResourceDesc | null, module: Module): void;
/**
 * @param {Module} module - Emscripten module.
 * @param {FFLResourceDesc} resourceDesc - The FFLResourceDesc received from {@link initializeFFL}.
 * @public
 * @todo TODO: Needs to somehow destroy Emscripten instance.
 */
declare function exitFFL(module: Module, resourceDesc: FFLResourceDesc): void;
/**
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Input: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} The CharModelSource with the data specified.
 * @throws {Error} data must be Uint8Array or FFLiCharInfo object. Data must be a known type.
 * @package
 */
declare function _allocateModelSource(data: Uint8Array | FFLiCharInfo, module: Module): FFLCharModelSource;
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
declare function verifyCharInfo(data: Uint8Array | number, module: Module, verifyName?: boolean): void;
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 * @param {Module} module - The Emscripten module.
 * @param {FFLGender} gender - Gender of the character.
 * @param {FFLAge} age - Age of the character.
 * @param {FFLRace} race - Race of the character.
 * @returns {Uint8Array} The random FFLiCharInfo.
 * @todo TODO: Should this return FFLiCharInfo object?
 */
declare function getRandomCharInfo(module: Module, gender?: FFLGender, age?: FFLAge, race?: FFLRace): Uint8Array;
/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * Use this whenever you need to describe which expression, or expressions, you want to be able to use in the CharModel.
 * @param {Array<number>|number} expressions - Either a single expression index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
declare function makeExpressionFlag(expressions: Array<number> | number): Uint32Array;
/**
 * Creates a CharModel from data and FFLCharModelDesc.
 * You must call initCharModelTextures afterwards to finish the process.
 * Don't forget to call dispose() on the CharModel when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Character data. Accepted types: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {FFLCharModelDesc|null} modelDesc - The model description. Default: {@link FFLCharModelDescDefault}
 * @param {function(new: import('three').Material, ...*): import('three').Material} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
 * @param {Module} module - The Emscripten module.
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The new CharModel instance.
 * @throws {FFLResultException|BrokenInitModel|FFLiVerifyReasonException|Error} Throws if `module`, `modelDesc` or `data` is invalid, CharInfo verification fails, or CharModel creation fails otherwise.
 */
declare function createCharModel(data: Uint8Array | FFLiCharInfo, modelDesc: FFLCharModelDesc | null, materialClass: new (...args: any[]) => import("three").Material, module: Module, verify?: boolean): CharModel;
/**
 * Updates the given CharModel with new data and a new ModelDesc or expression flag.
 * If `descOrExpFlag` is an array, it is treated as the new expression flag while inheriting the rest
 * of the ModelDesc from the existing CharModel.
 * @param {CharModel} charModel - The existing CharModel instance.
 * @param {Uint8Array|null} newData - The new raw charInfo data, or null to use the original.
 * @param {import('three').WebGLRenderer} renderer - The Three.js renderer.
 * @param {FFLCharModelDesc|Array<number>|Uint32Array|null} descOrExpFlag - Either a new {@link FFLCharModelDesc}, an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {boolean} verify - Whether the CharInfo provided should be verified.
 * @returns {CharModel} The updated CharModel instance.
 * @throws {Error} Unexpected type for descOrExpFlag, newData is null
 * @todo  TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
 */
declare function updateCharModel(charModel: CharModel, newData: Uint8Array | null, renderer: import("three").WebGLRenderer, descOrExpFlag?: FFLCharModelDesc | Array<number> | Uint32Array | null, verify?: boolean): CharModel;
/**
 * Copies faceline and mask render targets from `src`
 * to the `dst` CharModel, disposing textures from `dst`
 * and disposing shapes from `src`, effectively transferring.
 * @param {CharModel} src - The source {@link CharModel} from which to copy textures from and dispose shapes.
 * @param {CharModel} dst - The destination {@link CharModel} receiving the textures.
 * @returns {CharModel} The final CharModel.
 * @todo TODO: Completely untested.
 */
declare function transferCharModelTex(src: CharModel, dst: CharModel): CharModel;
/**
 * Converts FFLDrawParam into a THREE.Mesh.
 * Binds geometry, texture, and material parameters.
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {function(new: import('three').Material, ...*): import('three').Material} materialClass - Class for the material (constructor).
 * @param {Module} module - The Emscripten module.
 * @param {TextureManager|null} texManager - The {@link TextureManager} instance for which to look for textures referenced by the DrawParam.
 * @returns {import('three').Mesh|null} The THREE.Mesh instance, or null if the index count is 0 indicating no shape data.
 * @throws {Error} drawParam may be null, Unexpected value for FFLCullMode, Passed in TextureManager is invalid
 */
declare function drawParamToMesh(drawParam: FFLDrawParam, materialClass: new (...args: any[]) => import("three").Material, module: Module, texManager: TextureManager | null): import("three").Mesh | null;
/**
 * Binds geometry attributes from drawParam into a THREE.BufferGeometry.
 * @param {FFLDrawParam} drawParam - The DrawParam representing the mesh.
 * @param {Module} module - The Emscripten module from which to read the heap.
 * @returns {import('three').BufferGeometry} The geometry.
 * @throws {Error} Position buffer must not have size of 0
 * @package
 * @todo Does not yet handle color stride = 0
 */
declare function _bindDrawParamGeometry(drawParam: FFLDrawParam, module: Module): import("three").BufferGeometry;
/**
 * Retrieves a texture from ModulateParam.
 * Does not assign texture for faceline or mask types.
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam.
 * @param {TextureManager} textureManager - The {@link TextureManager} instance for which to look for the texture referenced.
 * @returns {import('three').Texture|null} The texture if found.
 * @throws {Error} Throws if pTexture2D refers to a texture that was not found in the TextureManager
 * @package
 */
declare function _getTextureFromModulateParam(modulateParam: FFLModulateParam, textureManager: TextureManager): import("three").Texture | null;
/**
 * Returns an object of material parameters based on ModulateParam.
 * @param {FFLModulateParam} modulateParam - drawParam.modulateParam
 * @param {Module} module - The Emscripten module for accessing color pointers via heap.
 * @returns {Object} Parameters for material creation.
 * @package
 */
declare function _applyModulateParam(modulateParam: FFLModulateParam, module: Module): Object;
/**
 * Converts a pointer to FFLColor into a THREE.Vector4.
 * @param {number} colorPtr - The pointer to the color.
 * @param {Module} module - The Emscripten module.
 * @returns {import('three').Vector4} The converted Vector4.
 */
declare function _getVector4FromFFLColorPtr(colorPtr: number, module: Module): import("three").Vector4;
/**
 * Applies transformations in pAdjustMatrix within a {@link FFLDrawParam} to a mesh.
 * @param {number} pMtx - Pointer to rio::Matrix34f.
 * @param {import('three').Object3D} mesh - The mesh to apply transformations to.
 * @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
 * @package
 */
declare function _applyAdjustMatrixToMesh(pMtx: number, mesh: import("three").Object3D, heapf32: Float32Array): void;
/**
 * Initializes textures (faceline and mask) for a CharModel.
 * Calls private functions to draw faceline and mask textures.
 * At the end, calls setExpression to update the mask texture.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').WebGLRenderer} renderer - The Three.js renderer.
 * @todo Should this just be called in createCharModel() or something? But it's the only function requiring renderer. Maybe if you pass in renderer to that?
 */
declare function initCharModelTextures(charModel: CharModel, renderer: import("three").WebGLRenderer): void;
/**
 * Draws and applies the faceline texture for the CharModel.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The FFLiTextureTempObject containing faceline DrawParams.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @package
 */
declare function _drawFacelineTexture(charModel: CharModel, textureTempObject: FFLiTextureTempObject, renderer: import("three").WebGLRenderer, module: Module): void;
/**
 * Iterates through mask textures and draws each mask texture.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiTextureTempObject} textureTempObject - The temporary texture object.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @package
 */
declare function _drawMaskTextures(charModel: CharModel, textureTempObject: FFLiTextureTempObject, renderer: import("three").WebGLRenderer, module: Module): void;
/**
 * Draws a single mask texture based on a RawMaskDrawParam.
 * Note that the caller needs to dispose meshes within the returned scene.
 * @param {CharModel} charModel - The CharModel.
 * @param {FFLiRawMaskDrawParam} rawMaskParam - The RawMaskDrawParam.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {Module} module - The Emscripten module.
 * @returns {{target: import('three').RenderTarget, scene: import('three').Scene}} The RenderTarget and scene of this mask texture.
 * @throws {Error} All DrawParams are empty.
 * @package
 */
declare function _drawMaskTexture(charModel: CharModel, rawMaskParam: FFLiRawMaskDrawParam, renderer: import("three").WebGLRenderer, module: Module): {
    target: import("three").RenderTarget;
    scene: import("three").Scene;
};
/**
 * Sets the faceline texture of the given CharModel from the RenderTarget.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').RenderTarget} target - RenderTarget for the faceline texture.
 * @throws {Error} target must be a valid THREE.RenderTarget with "texture" property and CharModel must be initialized with OPA_FACELINE in meshes.
 * @package
 */
declare function _setFaceline(charModel: CharModel, target: import("three").RenderTarget): void;
/**
 * Creates an THREE.Scene from an array of drawParams, converting each
 * to a new mesh. Used for one-time rendering of faceline/mask 2D planes.
 * @param {Array<FFLDrawParam>} drawParams - Array of FFLDrawParam.
 * @param {import('three').Color|null} bgColor - Optional background color.
 * @param {[function(new: import('three').Material, ...*): import('three').Material, Module, TextureManager|null]} drawParamArgs - Arguments to pass to drawParamToMesh.
 * @returns {{scene: import('three').Scene, meshes: Array<import('three').Mesh|null>}} An object containing the created scene and an array of meshes.
 */
declare function createSceneFromDrawParams(drawParams: Array<FFLDrawParam>, bgColor: import("three").Color | null, drawParamArgs_0: new (...arg1: any[]) => import("three").Material, drawParamArgs_1: Module, drawParamArgs_2: TextureManager | null): {
    scene: import("three").Scene;
    meshes: Array<import("three").Mesh | null>;
};
/**
 * Returns an ortho camera that is effectively the same as
 * if you used identity MVP matrix, for rendering 2D planes.
 * @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {import('three').OrthographicCamera} The orthographic camera.
 */
declare function getIdentCamera(flipY?: boolean): import("three").OrthographicCamera;
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
declare function createAndRenderToTarget(scene: import("three").Scene, camera: import("three").Camera, renderer: import("three").WebGLRenderer, width: number, height: number, targetOptions?: Object): import("three").RenderTarget;
/**
 * Disposes meshes in a {@link THREE.Object3D} and removes them from the {@link THREE.Scene} specified.
 * @param {import('three').Scene|import('three').Object3D} group - The scene or group to dispose meshes from.
 * @param {import('three').Scene} [scene] - The scene to remove the meshes from, if provided.
 * @todo TODO: Rename to disposeGroup/Scene or something
 */
declare function disposeMeshes(group: import("three").Scene | import("three").Object3D, scene?: import("three").Scene): void;
/**
 * Exports a render target's texture to a blob.
 * @param {import('three').RenderTarget} renderTarget - The render target.
 * @param {import('three').WebGLRenderer} renderer - The renderer (MUST be the same renderer used for the target).
 * @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
 * @returns {string} The data URL representing the RenderTarget's texture contents.
 */
declare function renderTargetToDataURL(renderTarget: import("three").RenderTarget, renderer: import("three").WebGLRenderer, flipY?: boolean): string;
/**
 * @param {ViewType} viewType - The {@link ViewType} enum value.
 * @param {number} width - Width of the view.
 * @param {number} height - Height of the view.
 * @returns {import('three').PerspectiveCamera} The camera representing the view type specified.
 * @throws {Error}
 */
declare function getCameraForViewType(viewType: ViewType, width?: number, height?: number): import("three").PerspectiveCamera;
/**
 * Creates an icon representing the CharModel's head,
 * using a render target and reading its pixels into a data URL.
 * @param {CharModel} charModel - The CharModel instance.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {ViewType} viewType - The view type.
 * @param {number} width - Desired icon width.
 * @param {number} height - Desired icon height.
 * @returns {string} A data URL of the icon image.
 * @throws {Error} CharModel.meshes is null or undefined, it may have been disposed.
 */
declare function createCharModelIcon(charModel: CharModel, renderer: import("three").WebGLRenderer, viewType?: ViewType, width?: number, height?: number): string;
/**
 * Creates an FFLiCharInfo object from StudioCharInfo.
 * @param {StudioCharInfo} src - The StudioCharInfo instance.
 * @returns {FFLiCharInfo} The FFLiCharInfo output.
 */
declare function convertStudioCharInfoToFFLiCharInfo(src: StudioCharInfo): FFLiCharInfo;
/**
 * @param {Uint8Array} data - Obfuscated Studio URL data.
 * @returns {Uint8Array} Decoded Uint8Array representing CharInfoStudio.
 */
declare function studioURLObfuscationDecode(data: Uint8Array): Uint8Array;
/**
 * Creates a StudioCharInfo object from FFLiCharInfo.
 * @param {FFLiCharInfo} src - The FFLiCharInfo instance.
 * @returns {StudioCharInfo} The StudioCharInfo output.
 * @todo TODO: Currently does NOT convert color indices
 * to CommonColor indices (ToVer3... etc)
 */
declare function convertFFLiCharInfoToStudioCharInfo(src: FFLiCharInfo): StudioCharInfo;
/**
 * Removes all spaces from a string.
 * @param {string} str - The input string.
 * @returns {string} The string without spaces.
 */
declare function stripSpaces(str: string): string;
/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param {string} hex - The hexadecimal string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
declare function hexToUint8Array(hex: string): Uint8Array;
/**
 * Converts a Base64 or Base64-URL encoded string to a Uint8Array.
 * @param {string} base64 - The Base64-encoded string.
 * @returns {Uint8Array} The converted Uint8Array.
 */
declare function base64ToUint8Array(base64: string): Uint8Array;
/**
 * Converts a Uint8Array to a Base64 string.
 * @param {Array<number>} data - The Uint8Array to convert. TODO: check if Uint8Array truly can be used
 * @returns {string} The Base64-encoded string.
 */
declare function uint8ArrayToBase64(data: Array<number>): string;
/**
 * Parses a string contaning either hex or Base64 representation
 * of bytes into a Uint8Array, stripping spaces.
 * @param {string} text - The input string, which can be either hex or Base64.
 * @returns {Uint8Array} The parsed Uint8Array.
 */
declare function parseHexOrB64ToUint8Array(text: string): Uint8Array;
declare namespace FFLResult {
    let OK: number;
    let MAX: number;
}
type FFLiShapeType = number;
declare namespace FFLiShapeType {
    export let OPA_BEARD: number;
    export let OPA_FACELINE: number;
    export let OPA_HAIR_NORMAL: number;
    export let OPA_FOREHEAD_NORMAL: number;
    export let XLU_MASK: number;
    export let XLU_NOSELINE: number;
    export let OPA_NOSE: number;
    export let OPA_HAT_NORMAL: number;
    export let XLU_GLASS: number;
    export let OPA_HAIR_CAP: number;
    export let OPA_FOREHEAD_CAP: number;
    export let OPA_HAT_CAP: number;
    let MAX_1: number;
    export { MAX_1 as MAX };
}
type FFLAttributeBufferType = number;
declare namespace FFLAttributeBufferType {
    export let POSITION: number;
    export let TEXCOORD: number;
    export let NORMAL: number;
    export let TANGENT: number;
    export let COLOR: number;
    let MAX_2: number;
    export { MAX_2 as MAX };
}
type FFLCullMode = number;
declare namespace FFLCullMode {
    export let NONE: number;
    export let BACK: number;
    export let FRONT: number;
    let MAX_3: number;
    export { MAX_3 as MAX };
}
type FFLModulateMode = number;
declare namespace FFLModulateMode {
    let CONSTANT: number;
    let TEXTURE_DIRECT: number;
    let RGB_LAYERED: number;
    let ALPHA: number;
    let LUMINANCE_ALPHA: number;
    let ALPHA_OPA: number;
}
type FFLModulateType = number;
declare namespace FFLModulateType {
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
type FFLResourceType = number;
declare namespace FFLResourceType {
    export let MIDDLE: number;
    export let HIGH: number;
    let MAX_4: number;
    export { MAX_4 as MAX };
}
type FFLExpression = number;
declare namespace FFLExpression {
    let NORMAL_1: number;
    export { NORMAL_1 as NORMAL };
    let MAX_5: number;
    export { MAX_5 as MAX };
}
type FFLModelFlag = number;
declare namespace FFLModelFlag {
    let NORMAL_2: number;
    export { NORMAL_2 as NORMAL };
    export let HAT: number;
    export let FACE_ONLY: number;
    export let FLATTEN_NOSE: number;
    export let NEW_EXPRESSIONS: number;
    export let NEW_MASK_ONLY: number;
}
declare const _uintptr: (arg0: (string | number), arg1?: number | undefined) => Field;
type FFLAttributeBuffer = {
    size: number;
    stride: number;
    ptr: number;
};
/**
 * @typedef {Object} FFLAttributeBuffer
 * @property {number} size
 * @property {number} stride
 * @property {number} ptr
 */
/** @type {import('./struct-fu').StructInstance<FFLAttributeBuffer>} */
declare const FFLAttributeBuffer: import("./struct-fu").StructInstance<FFLAttributeBuffer>;
type FFLAttributeBufferParam = {
    attributeBuffers: Array<FFLAttributeBuffer>;
};
/**
 * @typedef {Object} FFLAttributeBufferParam
 * @property {Array<FFLAttributeBuffer>} attributeBuffers
 */
/** @type {import('./struct-fu').StructInstance<FFLAttributeBufferParam>} */
declare const FFLAttributeBufferParam: import("./struct-fu").StructInstance<FFLAttributeBufferParam>;
type FFLPrimitiveParam = {
    primitiveType: number;
    indexCount: number;
    pAdjustMatrix: number;
    pIndexBuffer: number;
};
/**
 * @typedef {Object} FFLPrimitiveParam
 * @property {number} primitiveType
 * @property {number} indexCount
 * @property {number} pAdjustMatrix
 * @property {number} pIndexBuffer
 */
/** @type {import('./struct-fu').StructInstance<FFLPrimitiveParam>} */
declare const FFLPrimitiveParam: import("./struct-fu").StructInstance<FFLPrimitiveParam>;
type FFLColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};
/**
 * @typedef {Object} FFLColor
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */
/** @type {import('./struct-fu').StructInstance<FFLColor>} */
declare const FFLColor: import("./struct-fu").StructInstance<FFLColor>;
type FFLVec3 = {
    x: number;
    y: number;
    z: number;
};
/**
 * @typedef {Object} FFLVec3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
/** @type {import('./struct-fu').StructInstance<FFLVec3>} */
declare const FFLVec3: import("./struct-fu").StructInstance<FFLVec3>;
type FFLModulateParam = {
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
/**
 * @typedef {Object} FFLModulateParam
 * @property {FFLModulateMode} mode
 * @property {FFLModulateType} type
 * @property {number} pColorR - Pointer to FFLColor
 * @property {number} pColorG - Pointer to FFLColor
 * @property {number} pColorB - Pointer to FFLColor
 * @property {number} pTexture2D
 */
/** @type {import('./struct-fu').StructInstance<FFLModulateParam>} */
declare const FFLModulateParam: import("./struct-fu").StructInstance<FFLModulateParam>;
type FFLDrawParam = {
    attributeBufferParam: FFLAttributeBufferParam;
    modulateParam: FFLModulateParam;
    cullMode: FFLCullMode;
    primitiveParam: FFLPrimitiveParam;
};
/**
 * @typedef {Object} FFLDrawParam
 * @property {FFLAttributeBufferParam} attributeBufferParam
 * @property {FFLModulateParam} modulateParam
 * @property {FFLCullMode} cullMode
 * @property {FFLPrimitiveParam} primitiveParam
 */
/** @type {import('./struct-fu').StructInstance<FFLDrawParam>} */
declare const FFLDrawParam: import("./struct-fu").StructInstance<FFLDrawParam>;
type FFLCreateID = {
    data: Array<number>;
};
/**
 * @typedef {Object} FFLCreateID
 * @property {Array<number>} data
 */
/** @type {import('./struct-fu').StructInstance<FFLCreateID>} */
declare const FFLCreateID: import("./struct-fu").StructInstance<FFLCreateID>;
type FFLiCharInfo = {
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
/** @type {import('./struct-fu').StructInstance<FFLiCharInfo>} */
declare const FFLiCharInfo: import("./struct-fu").StructInstance<FFLiCharInfo>;
/**
 * Size of FFLStoreData, a structure not included currently.
 * @public
 */
declare const FFLStoreData_size: 96;
/** @package */
declare const commonColorEnableMask: number;
/**
 * Applies (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to indicate to FFL which color table it should use.
 * @param {number} color - The color index to flag.
 * @returns {number} The flagged color index to use in FFLiCharinfo.
 */
declare function commonColorMask(color: number): number;
/**
 * Removes (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
 * to a common color index to reveal the original common color index.
 * @param {number} color - The flagged color index.
 * @returns {number} The original color index before flagging.
 */
declare function commonColorUnmask(color: number): number;
type FFLAdditionalInfo = {
    name: string;
    creator: string;
    createID: FFLCreateID;
    skinColor: FFLColor;
    flags: number;
    facelineType: number;
    hairType: number;
};
/**
 * @typedef {Object} FFLAdditionalInfo
 * @property {string} name
 * @property {string} creator
 * @property {FFLCreateID} createID
 * @property {FFLColor} skinColor
 * @property {number} flags
 * @property {number} facelineType
 * @property {number} hairType
 */
/** @type {import('./struct-fu').StructInstance<FFLAdditionalInfo>} */
declare const FFLAdditionalInfo: import("./struct-fu").StructInstance<FFLAdditionalInfo>;
declare const FFLiRenderTexture: import("./struct-fu").StructInstance<any>;
type FFLiFacelineTextureTempObject = {
    pTextureFaceLine: number;
    drawParamFaceLine: FFLDrawParam;
    pTextureFaceMake: number;
    drawParamFaceMake: FFLDrawParam;
    pTextureFaceBeard: number;
    drawParamFaceBeard: FFLDrawParam;
    pRenderTextureCompressorParam: Array<number>;
};
/**
 * @typedef {Object} FFLiFacelineTextureTempObject
 * @property {number} pTextureFaceLine
 * @property {FFLDrawParam} drawParamFaceLine
 * @property {number} pTextureFaceMake
 * @property {FFLDrawParam} drawParamFaceMake
 * @property {number} pTextureFaceBeard
 * @property {FFLDrawParam} drawParamFaceBeard
 * @property {Array<number>} pRenderTextureCompressorParam
 */
/** @type {import('./struct-fu').StructInstance<FFLiFacelineTextureTempObject>} */
declare const FFLiFacelineTextureTempObject: import("./struct-fu").StructInstance<FFLiFacelineTextureTempObject>;
type FFLiRawMaskDrawParam = {
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
/**
 * @typedef {Object} FFLiRawMaskDrawParam
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsEye - 2
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsEyebrow - 2
 * @property {FFLDrawParam} drawParamRawMaskPartsMouth
 * @property {Array<FFLDrawParam>} drawParamRawMaskPartsMustache - 2
 * @property {FFLDrawParam} drawParamRawMaskPartsMole
 * @property {FFLDrawParam} drawParamRawMaskPartsFill
 */
/** @type {import('./struct-fu').StructInstance<FFLiRawMaskDrawParam>} */
declare const FFLiRawMaskDrawParam: import("./struct-fu").StructInstance<FFLiRawMaskDrawParam>;
type FFLiMaskTexturesTempObject = {
    partsTextures: Array<number>;
    pRawMaskDrawParam: Array<number>;
    _remaining: Uint8Array;
};
/**
 * @typedef {Object} FFLiMaskTexturesTempObject
 * @property {Array<number>} partsTextures
 * @property {Array<number>} pRawMaskDrawParam
 * @property {Uint8Array} _remaining
 */
/** @type {import('./struct-fu').StructInstance<FFLiMaskTexturesTempObject>} */
declare const FFLiMaskTexturesTempObject: import("./struct-fu").StructInstance<FFLiMaskTexturesTempObject>;
type FFLiTextureTempObject = {
    maskTextures: FFLiMaskTexturesTempObject;
    facelineTexture: FFLiFacelineTextureTempObject;
};
/**
 * @typedef {Object} FFLiTextureTempObject
 * @property {FFLiMaskTexturesTempObject} maskTextures
 * @property {FFLiFacelineTextureTempObject} facelineTexture
 */
/** @type {import('./struct-fu').StructInstance<FFLiTextureTempObject>} */
declare const FFLiTextureTempObject: import("./struct-fu").StructInstance<FFLiTextureTempObject>;
type FFLiMaskTextures = {
    pRenderTextures: Array<number>;
};
/**
 * @typedef {Object} FFLiMaskTextures
 * @property {Array<number>} pRenderTextures
 */
/** @type {import('./struct-fu').StructInstance<FFLiMaskTextures>} */
declare const FFLiMaskTextures: import("./struct-fu").StructInstance<FFLiMaskTextures>;
/** @package */
declare const FFL_RESOLUTION_MASK: 1073741823;
type FFLCharModelDesc = {
    resolution: number;
    allExpressionFlag: Uint32Array;
    modelFlag: number;
    resourceType: number;
};
/**
 * @typedef {Object} FFLCharModelDesc
 * @property {number} resolution
 * @property {Uint32Array} allExpressionFlag
 * @property {number} modelFlag
 * @property {number} resourceType
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelDesc>} */
declare const FFLCharModelDesc: import("./struct-fu").StructInstance<FFLCharModelDesc>;
/**
 * Static default for FFLCharModelDesc.
 * @type {FFLCharModelDesc}
 * @public
 */
declare const FFLCharModelDescDefault: FFLCharModelDesc;
type FFLBoundingBox = {
    [x: string]: FFLVec3;
};
/**
 * @typedef {Object<string, FFLVec3>} FFLBoundingBox
 * @property {FFLVec3} min
 * @property {FFLVec3} max
 */
/** @type {import('./struct-fu').StructInstance<FFLBoundingBox>} */
declare const FFLBoundingBox: import("./struct-fu").StructInstance<FFLBoundingBox>;
type FFLPartsTransform = {
    [x: string]: FFLVec3;
};
/**
 * @typedef {Object<string, FFLVec3>} FFLPartsTransform
 * @property {FFLVec3} hatTranslate
 * @property {FFLVec3} headFrontRotate
 * @property {FFLVec3} headFrontTranslate
 * @property {FFLVec3} headSideRotate
 * @property {FFLVec3} headSideTranslate
 * @property {FFLVec3} headTopRotate
 * @property {FFLVec3} headTopTranslate
 */
/** @type {import('./struct-fu').StructInstance<FFLPartsTransform>} */
declare const FFLPartsTransform: import("./struct-fu").StructInstance<FFLPartsTransform>;
type FFLiCharModel = {
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
/**
 * PartsTransform with THREE.Vector3 type.
 * @typedef {Object<string, import('three').Vector3>} PartsTransform
 * @property {import('three').Vector3} hatTranslate
 * @property {import('three').Vector3} headFrontRotate
 * @property {import('three').Vector3} headFrontTranslate
 * @property {import('three').Vector3} headSideRotate
 * @property {import('three').Vector3} headSideTranslate
 * @property {import('three').Vector3} headTopRotate
 * @property {import('three').Vector3} headTopTranslate
 */
/**
 * @typedef {Object} FFLiCharModel
 * @property {FFLiCharInfo} charInfo
 * @property {FFLCharModelDesc} charModelDesc
 * @property {FFLExpression} expression
 * @property {number} pTextureTempObject
 * @property {Array<FFLDrawParam>} drawParam
 * @property {Array<number>} pShapeData
 * @property {Array<Object>} facelineRenderTexture
 * @property {Array<number>} pCapGlassNoselineTextures
 * @property {FFLiMaskTextures} maskTextures
 * @property {Array<FFLVec3>} beardHairFaceCenterPos
 * @property {FFLPartsTransform} partsTransform
 * @property {number} modelType
 * @property {Array<FFLBoundingBox>} boundingBox
 */
/** @type {import('./struct-fu').StructInstance<FFLiCharModel>} */
declare const FFLiCharModel: import("./struct-fu").StructInstance<FFLiCharModel>;
type FFLDataSource = number;
declare namespace FFLDataSource {
    let OFFICIAL: number;
    let DEFAULT: number;
    let MIDDLE_DB: number;
    let STORE_DATA_OFFICIAL: number;
    let STORE_DATA: number;
    let BUFFER: number;
    let DIRECT_POINTER: number;
}
type FFLCharModelSource = {
    dataSource: number;
    pBuffer: number;
    index: number;
};
/**
 * @typedef {Object} FFLCharModelSource
 * @property {number} dataSource
 * @property {number} pBuffer
 * @property {number} index
 */
/** @type {import('./struct-fu').StructInstance<FFLCharModelSource>} */
declare const FFLCharModelSource: import("./struct-fu").StructInstance<FFLCharModelSource>;
type FFLGender = number;
declare namespace FFLGender {
    let MALE: number;
    let FEMALE: number;
    let ALL: number;
}
type FFLAge = number;
declare namespace FFLAge {
    export let CHILD: number;
    export let ADULT: number;
    export let ELDER: number;
    let ALL_1: number;
    export { ALL_1 as ALL };
}
type FFLRace = number;
declare namespace FFLRace {
    export let BLACK: number;
    export let WHITE: number;
    export let ASIAN: number;
    let ALL_2: number;
    export { ALL_2 as ALL };
}
type FFLResourceDesc = {
    pData: Array<number>;
    size: Array<number>;
};
/**
 * @typedef {Object} FFLResourceDesc
 * @property {Array<number>} pData
 * @property {Array<number>} size
 */
/**
 * @type {import('./struct-fu').StructInstance<FFLResourceDesc>}
 */
declare const FFLResourceDesc: import("./struct-fu").StructInstance<FFLResourceDesc>;
type FFLTextureFormat = number;
declare namespace FFLTextureFormat {
    export let R8_UNORM: number;
    export let R8_G8_UNORM: number;
    export let R8_G8_B8_A8_UNORM: number;
    let MAX_6: number;
    export { MAX_6 as MAX };
}
type FFLTextureInfo = {
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
/**
 * @typedef {Object} FFLTextureInfo
 * @property {number} width
 * @property {number} height
 * @property {number} mipCount
 * @property {FFLTextureFormat} format
 * @property {number} isGX2Tiled
 * @property {number} imageSize
 * @property {number} imagePtr
 * @property {number} mipSize
 * @property {number} mipPtr
 * @property {Array<number>} mipLevelOffset
 */
/**
 * @type {import('./struct-fu').StructInstance<FFLTextureInfo>}
 */
declare const FFLTextureInfo: import("./struct-fu").StructInstance<FFLTextureInfo>;
declare const FFLTextureCallback: import("./struct-fu").StructInstance<any>;
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
     * @param {import('three').Texture} texture - Texture to upload mipmaps into.
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
/**
 * Base exception type for all exceptions based on FFLResult.
 * https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs
 * https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 */
declare class FFLResultException extends Error {
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
    constructor(result: number | {
        OK: number;
        MAX: number;
    }, funcName?: string, message?: string);
    /** The stored {@link FFLResult} code. */
    result: number | {
        OK: number;
        MAX: number;
    };
}
/**
 * Exception reflecting FFL_RESULT_WRONG_PARAM / FFL_RESULT_ERROR.
 * This is the most common error thrown in FFL. It usually
 * means that input parameters are invalid.
 * So many cases this is thrown: parts index is out of bounds,
 * CharModelCreateParam is malformed, FFLDataSource is invalid, FFLInitResEx
 * parameters are null or invalid... Many different causes, very much an annoying error.
 */
declare class FFLResultWrongParam extends FFLResultException {
    /**
     * @param {string} [funcName] - Name of the function where the result originated.
     */
    constructor(funcName?: string);
}
/**
 * Exception reflecting FFL_RESULT_BROKEN / FFL_RESULT_FILE_INVALID.
 */
declare class FFLResultBroken extends FFLResultException {
    /**
     * @param {string} [funcName] - Name of the function where the result originated.
     * @param {string} [message] - An optional message for the exception.
     */
    constructor(funcName?: string, message?: string);
}
/**
 * Exception when resource header verification fails.
 */
declare class BrokenInitRes extends FFLResultBroken {
    constructor();
}
/**
 * Thrown when: CRC16 fails, CharInfo verification fails, or failing to fetch from a database (impossible here)
 */
declare class BrokenInitModel extends FFLResultBroken {
    constructor();
}
/**
 * Exception reflecting FFL_RESULT_NOT_AVAILABLE / FFL_RESULT_MANAGER_NOT_CONSTRUCT.
 * This is seen when FFLiManager is not constructed, which it is not when FFLInitResEx fails
 * or was never called to begin with.
 */
declare class FFLResultNotAvailable extends FFLResultException {
    /**
     * @param {string} [funcName] - Name of the function where the result originated.
     */
    constructor(funcName?: string);
}
/**
 * Exception reflecting FFL_RESULT_FATAL / FFL_RESULT_FILE_LOAD_ERROR.
 * This error indicates database file load errors or failures from FFLiResourceLoader (decompression? misalignment?)
 */
declare class FFLResultFatal extends FFLResultException {
    /**
     * @param {string} [funcName] - Name of the function where the result originated.
     */
    constructor(funcName?: string);
}
/**
 * Exception thrown by the result of FFLiVerifyCharInfoWithReason.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
 */
declare class FFLiVerifyReasonException extends Error {
    /**
     * @param {number} result - The FFLiVerifyReason code from FFLiVerifyCharInfoWithReason.
     */
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
declare class ExpressionNotSet extends Error {
    /**
     * @param {FFLExpression} expression - The attempted expression.
     */
    constructor(expression: FFLExpression);
    expression: number;
}
/**
 * Represents an FFLCharModel, which is the head model.
 * Encapsulates a pointer to the underlying instance and provides helper methods.
 *
 * NOTE: This is a wrapper around CharModel. In order to create one,
 * either call createCharModel or pass the pointer of a manually created
 * CharModel in here. So *DO NOT* call this constructor directly!
 * @public
 */
declare class CharModel {
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
     * @param {function(new: import('three').Material, ...*): import('three').Material} materialClass - The material class (e.g., FFLShaderMaterial).
     * @param {TextureManager|null} texManager - The {@link TextureManager} instance for this CharModel.
     */
    constructor(ptr: number, module: Module, materialClass: new (...args: any[]) => import("three").Material, texManager: TextureManager | null);
    /** @package */
    _module: Module;
    /**
     * The data used to construct the CharModel, set in {@link createCharModel} and used in {@link updateCharModel}.
     * @type {*}
     * @package
     */
    _data: any;
    /**
     * @type {function(new: import('three').Material, ...*): import('three').Material}
     * @public
     */
    public _materialClass: new (...args: any[]) => import("three").Material;
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
     * Group of THREE.Mesh objects representing the CharModel.
     * @type {import('three').Group|null}
     * @public
     */
    public meshes: import("three").Group | null;
    /**
     * This is the method that populates meshes
     * from the internal FFLiCharModel instance.
     * @param {Module} module - Module to pass to drawParamToMesh to access mesh data.
     * @throws {Error} Throws if this.meshes is null or undefined.
     * @private
     */
    private _addCharModelMeshes;
    /** @package */
    _facelineMesh: import("three").Mesh<import("three").BufferGeometry<import("three").NormalBufferAttributes>, import("three").Material | import("three").Material[], import("three").Object3DEventMap> | null | undefined;
    /** @package */
    _maskMesh: import("three").Mesh<import("three").BufferGeometry<import("three").NormalBufferAttributes>, import("three").Material | import("three").Material[], import("three").Object3DEventMap> | null | undefined;
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
     * Either gets the boundingBox in the CharModel or calculates it from the meshes.
     * @returns {import('three').Box3} The bounding box.
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
     * @returns {import('three').RenderTarget|null} The faceline render target, or null if it does not exist, in which case {@link facelineColor} should be used. Access .texture on this object to get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
     */
    getFaceline(): import("three").RenderTarget | null;
    /**
     * Gets the mask texture, or the texture containing facial
     * features such as eyes, mouth, eyebrows, etc. This is wrapped
     * around the mask shape, which is a transparent shape
     * placed in front of the head model.
     * @param {FFLExpression} expression - The desired expression, or the current expression.
     * @returns {import('three').RenderTarget|null} The mask render target for the given expression, or null if the CharModel was not initialized with that expression. Access .texture on this object to get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
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
     * Gets a vector in which to scale the body model for this CharModel.
     * @param {BodyScaleMode} scaleMode - Mode in which to create the scale vector.
     * @returns {import('three').Vector3} Scale vector for the body model.
     * @throws {Error} Unexpected value for scaleMode
     * @public
     */
    public getBodyScale(scaleMode?: number): import("three").Vector3;
}
type PantsColor = number;
declare namespace PantsColor {
    let GrayNormal: number;
    let BluePresent: number;
    let RedRegular: number;
    let GoldSpecial: number;
}
/**
 * @type {Object<PantsColor, import('three').Color>}
 */
declare const pantsColors: any;
type ViewType = number;
declare namespace ViewType {
    let Face: number;
    let MakeIcon: number;
    let IconFovy45: number;
}
type StudioCharInfo = {
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
declare const StudioCharInfo: import("./struct-fu").StructInstance<StudioCharInfo>;
type THREE = typeof import("three");
type _ = {
    struct(name: string | Array<Field>, fields?: Array<Field | StructInstance<any>> | number, count?: number): StructInstance<any>;
    padTo(off: number): Field & {
        _padTo: number;
        _id?: string;
    };
    bool(name?: string, count?: number): Field;
    ubit: (name?: string | undefined, width?: number | undefined, count?: number | undefined) => import("./struct-fu").Field;
    ubitLE: (name?: string | undefined, width?: number | undefined, count?: number | undefined) => import("./struct-fu").Field;
    sbit: (name?: string | undefined, width?: number | undefined, count?: number | undefined) => import("./struct-fu").Field;
    byte: (name: string | number, size?: number | undefined, count?: number | undefined) => import("./struct-fu").Field & import("./struct-fu").ByteTransform;
    char: (name: string | number, size?: number | undefined, count?: number | undefined) => import("./struct-fu").Field & import("./struct-fu").ByteTransform;
    char16le: (name: string | number, size?: number | undefined, count?: number | undefined) => import("./struct-fu").Field & import("./struct-fu").ByteTransform;
    char16be: (name: string | number, size?: number | undefined, count?: number | undefined) => import("./struct-fu").Field & import("./struct-fu").ByteTransform;
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
type Module = {
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
type FFLiCharInfo_faceline = {
    type: number;
    color: number;
    texture: number;
    make: number;
};
type FFLiCharInfo_hair = {
    type: number;
    color: number;
    flip: number;
};
type FFLiCharInfo_eye = {
    type: number;
    color: number;
    scale: number;
    aspect: number;
    rotate: number;
    x: number;
    y: number;
};
type FFLiCharInfo_eyebrow = {
    type: number;
    color: number;
    scale: number;
    aspect: number;
    rotate: number;
    x: number;
    y: number;
};
type FFLiCharInfo_nose = {
    type: number;
    scale: number;
    y: number;
};
type FFLiCharInfo_mouth = {
    type: number;
    color: number;
    scale: number;
    aspect: number;
    y: number;
};
type FFLiCharInfo_beard = {
    mustache: number;
    type: number;
    color: number;
    scale: number;
    y: number;
};
type FFLiCharInfo_glass = {
    type: number;
    color: number;
    scale: number;
    y: number;
};
type FFLiCharInfo_mole = {
    type: number;
    scale: number;
    x: number;
    y: number;
};
type FFLiCharInfo_body = {
    height: number;
    build: number;
};
type FFLiCharInfo_personal = {
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
/**
 * PartsTransform with THREE.Vector3 type.
 */
type PartsTransform = {
    [x: string]: import("three").Vector3;
};
type BodyScaleMode = number;
