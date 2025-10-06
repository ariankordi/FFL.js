// --------- createCharModel(data, modelDesc, materialClass, module) ---------

import { _allocateModelSource, makeExpressionFlag, verifyCharInfo } from "./CharInfo";
import CharModel, { MaterialConstructor } from "./CharModel";
import CharModelDescOrExpressionFlag from "./CharModelDescOrExpressionFlag";
import { _setFaceline, initCharModelTextures } from "./CharModelTextures";
import { FFLModelFlag, FFLResult } from "./enums";
import { BrokenInitModel, FFLResultException } from "./Exceptions";
import Module from "./Module";
import Renderer from "./renderer";
import { FFLCharModelDesc, FFLCharModelDescDefault, FFLCharModelSource, FFLiCharInfo, FFLiCharModel } from "./StructFFLiCharModel";
import TextureManager from "./TextureManager";

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
export function createCharModel(data: Uint8Array | ReturnType<typeof FFLiCharInfo.unpack>, descOrExpFlag: CharModelDescOrExpressionFlag, materialClass: MaterialConstructor, module: Module, verify = true): CharModel {
	// Verify arguments.
	if (!module || !module._malloc) {
		throw new Error('createCharModel: module is null or not initialized properly (cannot find ._malloc).');
	}
	if (!data) {
		throw new Error('createCharModel: data is null or undefined.');
	}

	// Allocate memory for model source, description, char model, and char info.
	const modelSourcePtr = module._malloc(FFLCharModelSource.size);
	const modelDescPtr = module._malloc(FFLCharModelDesc.size);
	const charModelPtr = module._malloc(FFLiCharModel.size);

	// data = getRandomCharInfo(module, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE);
	// console.debug('getRandomCharInfo result:', FFLiCharInfo.unpack(data));
	// Get FFLCharModelSource. This converts and allocates CharInfo.
	const modelSource = _allocateModelSource(data, module);
	/** Get pBuffer to free it later. */
	const charInfoPtr = modelSource.pBuffer;

	const modelSourceBuffer = FFLCharModelSource.pack(modelSource);
	module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);

	const modelDesc = _descOrExpFlagToModelDesc(descOrExpFlag);
	// Set field to enable new expressions. This field
	// exists because some callers would leave the other
	// bits undefined but this does not so no reason to not enable
	modelDesc.modelFlag |= FFLModelFlag.NEW_EXPRESSIONS;

	const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);
	module.HEAPU8.set(modelDescBuffer, modelDescPtr);

	/** Local TextureManager instance. */
	let textureManager;
	try {
		// Verify CharInfo before creating.
		if (verify) {
			verifyCharInfo(charInfoPtr, module, false); // Don't verify name.
		}

		// Create TextureManager instance for this CharModel.
		textureManager = new TextureManager(module, false);

		// Call FFLInitCharModelCPUStep and check the result.
		// const result = module._FFLInitCharModelCPUStep(charModelPtr, modelSourcePtr, modelDescPtr);
		const result = module._FFLInitCharModelCPUStepWithCallback(charModelPtr,
			modelSourcePtr, modelDescPtr, textureManager._textureCallbackPtr);
		if (result === FFLResult.FILE_INVALID) { // FFL_RESULT_BROKEN
			throw new BrokenInitModel();
		}
		FFLResultException.handleResult(result, 'FFLInitCharModelCPUStep');
	} catch (error) {
		if (textureManager) {
			textureManager.dispose();
		}
		// Free CharModel prematurely.
		module._free(charModelPtr);
		throw error;
	} finally {
		// Free temporary allocations.
		module._free(modelSourcePtr);
		module._free(modelDescPtr);
		module._free(charInfoPtr);
		// Callback itself is longer read by FFL.
		if (textureManager) {
			textureManager.disposeCallback();
		}
	}

	// Create the CharModel instance.
	const charModel = new CharModel(charModelPtr, module, materialClass, textureManager);
	// The constructor will populate meshes from the FFLiCharModel instance.
	charModel._data = data; // Store original data passed to function.

	console.debug(`createCharModel: Initialized for "${charModel._model.charInfo.name}", ptr =`, charModelPtr);
	return charModel;
}

/**
 * Converts an expression flag, expression, array of expressions, or object to {@link FFLCharModelDesc}.
 * Uses the `defaultDesc` as a fallback to return if input is null or applies expression to it.
 * @param {CharModelDescOrExpressionFlag} [descOrExpFlag] - Either a new {@link FFLCharModelDesc},
 * an array of expressions, a single expression, or an expression flag (Uint32Array).
 * @param {FFLCharModelDesc} [defaultDesc] - Fallback if descOrExpFlag is null or expression flag only.
 * @returns {FFLCharModelDesc} The CharModelDesc with the expression applied, or the default.
 * @throws {Error} Throws if `descOrExpFlag` is an unexpected type.
 * @package
 */
export function _descOrExpFlagToModelDesc(descOrExpFlag: CharModelDescOrExpressionFlag, defaultDesc = FFLCharModelDescDefault): ReturnType<typeof FFLCharModelDesc.unpack> {
	if (!descOrExpFlag && typeof descOrExpFlag !== 'number') {
		return defaultDesc; // Use default if input is falsey.
	}

	// Convert descOrExpFlag to an expression flag if needed.
	if (typeof descOrExpFlag === 'number' || Array.isArray(descOrExpFlag)) {
		// Array of expressions or single expression was passed in.
		descOrExpFlag = makeExpressionFlag(descOrExpFlag);
	}

	/** Shallow clone of {@link defaultDesc}. */
	let newModelDesc = Object.assign({}, defaultDesc);

	// Process descOrExpFlag based on what it is.
	if (descOrExpFlag instanceof Uint32Array) {
		// If this is already an expression flag (Uint32Array),
		// or set to one previously, use it with existing CharModelDesc.
		newModelDesc.allExpressionFlag = descOrExpFlag;
	} else if (typeof descOrExpFlag === 'object') {
		// Assume that descOrExpFlag is a new FFLCharModelDesc.
		newModelDesc = /** @type {FFLCharModelDesc} */ (descOrExpFlag);
	} else {
		throw new Error('_descOrExpFlagToModelDesc: Unexpected type for descOrExpFlag');
	}

	return newModelDesc;
}

// ------- updateCharModel(charModel, newData, renderer, descOrExpFlag) -------
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
 * @todo  TODO: Should `newData` just pass the charInfo object instance instead of "_data"?
 */
export function updateCharModel(charModel: CharModel, newData: Uint8Array | null, renderer: Renderer,
	descOrExpFlag = null, {
		texOnly = false, verify = true,
		materialTextureClass = null
	} = {}) {
	newData = newData || charModel._data;
	if (!newData) {
		throw new Error('updateCharModel: newData is null. It should be retrieved from charModel._data which is set by createCharModel.');
	}

	/** The new or updated CharModelDesc with the new expression specified. */
	const newModelDesc = _descOrExpFlagToModelDesc(descOrExpFlag, charModel._model.charModelDesc);

	if (!texOnly) {
		// Dispose of the old CharModel.
		charModel.dispose();
	} else {
		// Updating textures only. Set respective flag.
		console.debug(`updateCharModel: Updating ONLY textures for model "${charModel._model.charInfo.name}", ptr =`, charModel._ptr);
		// NOTE: This flag will only take effect if your FFL is built with -DFFL_ENABLE_NEW_MASK_ONLY_FLAG=ON.
		newModelDesc.modelFlag |= FFLModelFlag.NEW_MASK_ONLY;
	}

	// Create a new CharModel with the new data and ModelDesc.
	const newCharModel = createCharModel(newData, newModelDesc,
		charModel._materialClass, charModel._module, verify);

	// Initialize its textures unconditionally.
	initCharModelTextures(newCharModel, renderer,
		materialTextureClass ? materialTextureClass : charModel._materialTextureClass);

	// Handle textures only case, where new CharModel has textures and old one has shapes.
	if (texOnly) {
		charModel.disposeTargets(); // Dispose textures on destination model (will be replaced).

		// Transfer faceline and mask targets.
		charModel._facelineTarget = newCharModel._facelineTarget;
		charModel._maskTargets = newCharModel._maskTargets;
		// Set new CharModel and unset texture only flag.
		// @ts-expect-error -- _model is supposed to be read-only.
		charModel._model = newCharModel._model;
		charModel._model.charModelDesc.modelFlag &= ~FFLModelFlag.NEW_MASK_ONLY;
		charModel.expressions = newCharModel.expressions;
		// Apply new faceline and mask to old shapes.
		newCharModel._facelineTarget && _setFaceline(charModel, newCharModel._facelineTarget);
		charModel.setExpression(newCharModel.expression);

		return charModel; // Source CharModel has new CharModel's textures.
	}

	return newCharModel; // Return new or modified CharModel.
}
