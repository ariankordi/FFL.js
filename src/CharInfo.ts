import { Module } from '@/Module';
import { FFLExpression } from "@/enums";
import { FFLiVerifyReasonException } from "@/Exceptions";
import { FFLAge, FFLDataSource, FFLGender, FFLiCharInfo, FFLRace, FFLStoreData_size, FFLCharModelSource } from "@/StructFFLiCharModel";
import { convertStudioCharInfoToFFLiCharInfo, StudioCharInfo, studioURLObfuscationDecode } from '@/StudioCharInfo';
import {  } from '@/StructFFLiCharModel'

/**
 * Converts the input data and allocates it into FFLCharModelSource.
 * Note that this allocates pBuffer so you must free it when you are done.
 * @param {Uint8Array|FFLiCharInfo} data - Input: FFLStoreData, FFLiCharInfo (as Uint8Array and object), StudioCharInfo
 * @param {Module} module - Module to allocate and access the buffer through.
 * @returns {FFLCharModelSource} The CharModelSource with the data specified.
 * @throws {Error} data must be Uint8Array or FFLiCharInfo object. Data must be a known type.
 * @package
 */
export function _allocateModelSource(data: Uint8Array | typeof FFLiCharInfo, module: Module): ReturnType<typeof FFLCharModelSource.unpack> {
	/** Maximum size. */
	const bufferPtr = module._malloc(FFLiCharInfo.size);

	// Create modelSource.
	const modelSource = {
		// FFLDataSource.BUFFER = copies and verifies
		// FFLDataSource.DIRECT_POINTER = use without verification.
		dataSource: FFLDataSource.DIRECT_POINTER, // Assumes CharInfo by default.
		pBuffer: bufferPtr,
		index: 0 // unneeded for raw data
	};

	// module._FFLiGetRandomCharInfo(bufferPtr, FFLGender.FEMALE, FFLAge.ALL, FFLRace.WHITE); return modelSource;

	// Check type of data.
	if (!(data instanceof Uint8Array)) {
		try {
			if (typeof data !== 'object') {
				throw new Error('_allocateModelSource: data passed in is not FFLiCharInfo object or Uint8Array');
			}
			// Assume that this is FFLiCharInfo as an object.
			// Deserialize to Uint8Array.
			data = FFLiCharInfo.pack(data);
		} catch (e) {
			module._free(bufferPtr);
			throw e;
		}
	}

	/** @param {Uint8Array} src - Source data in {@link StudioCharInfo} format. */
	function setStudioData(src: Uint8Array): void {
		// studio raw, decode it to charinfo
		const studio = StudioCharInfo.unpack(src);
		const charInfo = convertStudioCharInfoToFFLiCharInfo(studio);
		data = FFLiCharInfo.pack(charInfo);
		module.HEAPU8.set(data, bufferPtr);
	}

	/**
	 * Gets CharInfo from calling a function.
	 * @param {Uint8Array} data - The input data.
	 * @param {number} size - The size to allocate.
	 * @param {string} funcName - The function on the module to call.
	 * @throws {Error} Throws if the function returned false.
	 * @private
	 */
	function callGetCharInfoFunc(data: Uint8Array, size: number, funcName: string): void {
		const dataPtr = module._malloc(size);
		module.HEAPU8.set(data, dataPtr);
		// @ts-ignore - Module cannot be indexed by string. NOTE: The function MUST exist.
		const result = module[funcName](bufferPtr, dataPtr);
		module._free(dataPtr);
		if (!result) {
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: call to ${funcName} returned false, CharInfo verification probably failed`);
		}
	}

	// data should be Uint8Array at this point.

	// Enumerate through supported data types.
	switch (data.length) {
		case FFLStoreData_size: { // sizeof(FFLStoreData)
			// modelSource.dataSource = FFLDataSource.STORE_DATA;
			// Convert FFLStoreData to FFLiCharInfo instead.
			callGetCharInfoFunc(data, FFLStoreData_size, '_FFLpGetCharInfoFromStoreData');
			break;
		}
		case 74: // sizeof(RFLCharData)
		case 76: { // sizeof(RFLStoreData)
			callGetCharInfoFunc(data, 74, '_FFLpGetCharInfoFromMiiDataOfficialRFL');
			break;
		}
		case FFLiCharInfo.size:
			// modelSource.dataSource = FFLDataSource.BUFFER; // Default option.
			module.HEAPU8.set(data, bufferPtr); // Copy data into heap.
			break;
		case StudioCharInfo.size + 1: {
			// studio data obfuscated
			data = studioURLObfuscationDecode(data);
			setStudioData(data);
			break;
		}
		case StudioCharInfo.size: {
			// studio data raw
			setStudioData(data);
			break;
		}
		// Unsupported types.
		case 88:
			throw new Error('_allocateModelSource: NX CharInfo is not supported.');
		case 48:
		case 68:
			throw new Error('_allocateModelSource: NX CoreData/StoreData is not supported.');
		case 92:
		case 72:
			throw new Error('_allocateModelSource: Please convert your FFLiMiiDataOfficial/FFLiMiiDataCore to FFLStoreData (add a checksum).');
		default: {
			module._free(bufferPtr);
			throw new Error(`_allocateModelSource: Unknown length for character data: ${data.length}`);
		}
	}

	return modelSource; // NOTE: pBuffer must be freed.
}

// ----------------- verifyCharInfo(data, module, verifyName) -----------------
/**
 * Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
 * @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
 * @param {Module} module - Module to access the data and call FFL through.
 * @param {boolean} verifyName - Whether the name and creator name should be verified.
 * @returns {void} Returns nothing if verification passes.
 * @throws {FFLiVerifyReasonException} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
 * @public
 */
export function verifyCharInfo(data: Uint8Array | number, module: Module, verifyName = false): void {
	// Resolve charInfoPtr as pointer to CharInfo.
	let charInfoPtr = 0;
	let charInfoAllocated = false;
	// Assume that number means pointer.
	if (typeof data === 'number') {
		charInfoPtr = data;
		charInfoAllocated = false;
	} else {
		// Assume everything else means Uint8Array. TODO: untested
		charInfoAllocated = true;
		// Allocate and copy CharInfo.
		charInfoPtr = module._malloc(FFLiCharInfo.size);
		module.HEAPU8.set(data, charInfoPtr);
	}
	const result = module._FFLiVerifyCharInfoWithReason(charInfoPtr, verifyName);
	// Free CharInfo as soon as the function returns.
	if (charInfoAllocated) {
		module._free(charInfoPtr);
	}

	if (result !== 0) {
		// Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
		throw new FFLiVerifyReasonException(result);
	}
}

// --------------- getRandomCharInfo(module, gender, age, race) ---------------
/**
 * Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
 * @param {Module} module - The Emscripten module.
 * @param {FFLGender} gender - Gender of the character.
 * @param {FFLAge} age - Age of the character.
 * @param {FFLRace} race - Race of the character.
 * @returns {Uint8Array} The random FFLiCharInfo.
 * @todo TODO: Should this return FFLiCharInfo object?
 */
export function getRandomCharInfo(module: Module, gender = FFLGender.ALL, age = FFLAge.ALL, race = FFLRace.ALL): Uint8Array {
	const ptr = module._malloc(FFLiCharInfo.size);
	module._FFLiGetRandomCharInfo(ptr, gender, age, race);
	const result = module.HEAPU8.slice(ptr, ptr + FFLiCharInfo.size);
	module._free(ptr);
	return result;
}

/**
 * Checks if the expression index disables any shapes in the
 * CharModel, meant to be used when setting multiple indices.
 * @param {FFLExpression} i - Expression index to check.
 * @param {boolean} [warn] - Whether to log using {@link console.warn}.
 * @returns {boolean} Whether the expression changes shapes.
 */
export function checkExpressionChangesShapes(i: number, warn = false): boolean {
	/** Expressions disabling nose: dog/cat, blank */
	const expressionsDisablingNose = [49, 50, 51, 52, 61, 62];
	/** Expressions disabling mask: blank */
	const expressionsDisablingMask = [61, 62];

	const prefix = `checkExpressionChangesShapes: An expression was enabled (${i}) that is meant to disable nose or mask shape for the entire CharModel, so it is only recommended to set this as a single expression rather than as one of multiple.`;
	if (expressionsDisablingMask.indexOf(i) !== -1) {
		warn && console.warn(`${prefix} (in this case, MASK SHAPE so there is supposed to be NO FACE)`);
		return true;
	}
	if (expressionsDisablingNose.indexOf(i) !== -1) {
		warn && console.warn(`${prefix} (nose shape)`);
		return true;
	}

	return false;
}

// --------------------- makeExpressionFlag(expressions) ----------------------
/**
 * Creates an expression flag to be used in FFLCharModelDesc.
 * Use this whenever you need to describe which expression,
 * or expressions, you want to be able to use in the CharModel.
 * @param {Array<FFLExpression>|FFLExpression} expressions - Either a single expression
 * index or an array of expression indices. See {@link FFLExpression} for min/max.
 * @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
 * @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
 */
export function makeExpressionFlag(expressions: FFLExpression | FFLExpression[]): Uint32Array {
	/**
	 * @param {FFLExpression} i - Expression index to check.
	 * @throws {Error} input out of range
	 */
	function checkRange(i: FFLExpression): void {
		if (i >= FFLExpression.MAX) {
			throw new Error(`makeExpressionFlag: input out of range: got ${i}, max: ${FFLExpression.MAX}`);
		}
	}

	/** FFLAllExpressionFlag */
	const flags = new Uint32Array([0, 0, 0]);
	let checkForChangeShapes = true;

	// Set single expression.
	if (typeof expressions === 'number') {
		// Make expressions into an array.
		expressions = [expressions];
		checkForChangeShapes = false; // Single expression, do not check this
		// Fall-through.
	} else if (!Array.isArray(expressions)) {
		throw new Error('makeExpressionFlag: expected array or single number');
	}

	// Set multiple expressions in an array.
	for (const index of expressions) {
		checkRange(index);
		if (checkForChangeShapes) {
			checkExpressionChangesShapes(index, true); // Warn if the expression changes shapes.
		}
		/** Determine which 32-bit block. */
		const part = Math.floor(index / 32);
		/** Determine the bit within the block. */
		const bitIndex = index % 32;

		flags[part] |= (1 << bitIndex); // Set the bit.
	}
	return flags;
}
