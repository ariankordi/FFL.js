import { FFLExpression, FFLResult } from "@/enums";

/**
 * Base exception type for all exceptions based on FFLResult.
 * https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs
 * https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 */
export class FFLResultException extends Error {
	public result: number | FFLResult;

	/**
	 * @param {number|FFLResult} result - The returned {@link FFLResult}.
	 * @param {string} [funcName] - The name of the function that was called.
	 * @param {string} [message] - An optional message for the exception.
	 */
	constructor(result: number | FFLResult, funcName: string, message: string) {
		if (!message) {
			if (funcName) {
				message = `${funcName} failed with FFLResult: ${result}`;
			} else {
				message = `From FFLResult: ${result}`;
			}
		}
		super(message);
		/** The stored {@link FFLResult} code. */
		this.result = result;
	}

	/**
	 * Throws an exception if the {@link FFLResult} is not OK.
	 * @param {number} result - The {@link FFLResult} from an FFL function.
	 * @param {string} [funcName] - The name of the function that was called.
	 * @throws {FFLResultException|FFLResultWrongParam|FFLResultBroken|FFLResultNotAvailable|FFLResultFatal}
	 */
	static handleResult(result: number, funcName: string) {
		switch (result) {
			case FFLResult.ERROR: // FFL_RESULT_WRONG_PARAM
				throw new FFLResultWrongParam(funcName);
			case FFLResult.FILE_INVALID: // FFL_RESULT_BROKEN
				throw new FFLResultBroken(funcName, '');
			case FFLResult.MANAGER_NOT_CONSTRUCT: // FFL_RESULT_NOT_AVAILABLE
				throw new FFLResultNotAvailable(funcName);
			case FFLResult.FILE_LOAD_ERROR: // FFL_RESULT_FATAL
				throw new FFLResultFatal(funcName);
			case FFLResult.OK: // FFL_RESULT_OK
				return; // All is OK.
			default:
				throw new FFLResultException(result, funcName, '');
		}
	}
}

/**
 * Exception reflecting FFL_RESULT_WRONG_PARAM / FFL_RESULT_ERROR.
 * This is the most common error thrown in FFL. It usually
 * means that input parameters are invalid.
 * So many cases this is thrown: parts index is out of bounds,
 * CharModelCreateParam is malformed, FFLDataSource is invalid, FFLInitResEx
 * parameters are null or invalid... Many different causes, very much an annoying error.
 */
export class FFLResultWrongParam extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName: string) {
		super(FFLResult.ERROR, funcName, `${funcName} returned FFL_RESULT_WRONG_PARAM. This usually means parameters going into that function were invalid.`);
	}
}

/** Exception reflecting FFL_RESULT_BROKEN / FFL_RESULT_FILE_INVALID. */
export class FFLResultBroken extends FFLResultException {
	/**
	 * @param {string} [funcName] - Name of the function where the result originated.
	 * @param {string} [message] - An optional message for the exception.
	 */
	constructor(funcName: string, message: string) {
		super(FFLResult.FILE_INVALID, funcName, message ? message : `${funcName} returned FFL_RESULT_BROKEN. This usually indicates invalid underlying data.`);
	}
}

/** Exception when resource header verification fails. */
export class BrokenInitRes extends FFLResultBroken {
	constructor() {
		super('FFLInitRes', 'The header for the FFL resource is probably invalid. Check the version and magic, should be "FFRA" or "ARFF".');
	}
}

/**
 * Thrown when: CRC16 fails, CharInfo verification fails, or failing to fetch from a database (impossible here)
 */
export class BrokenInitModel extends FFLResultBroken {
	constructor() {
		super('FFLInitCharModelCPUStep', 'FFLInitCharModelCPUStep failed probably because your data failed CRC or CharInfo verification (FFLiVerifyCharInfoWithReason).');
	}
}

/**
 * Exception reflecting FFL_RESULT_NOT_AVAILABLE / FFL_RESULT_MANAGER_NOT_CONSTRUCT.
 * This is seen when FFLiManager is not constructed, which it is not when FFLInitResEx fails
 * or was never called to begin with.
 */
export class FFLResultNotAvailable extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName: string) {
		super(FFLResult.MANAGER_NOT_CONSTRUCT, funcName, `Tried to call FFL function ${funcName} when FFLManager is not constructed (FFL is not initialized properly).`);
	}
}

/**
 * Exception reflecting FFL_RESULT_FATAL / FFL_RESULT_FILE_LOAD_ERROR.
 * This error indicates database file load errors or failures from FFLiResourceLoader (decompression? misalignment?)
 */
export class FFLResultFatal extends FFLResultException {
	/** @param {string} [funcName] - Name of the function where the result originated. */
	constructor(funcName: string) {
		super(FFLResult.FILE_LOAD_ERROR, funcName, `Failed to uncompress or load a specific asset from the FFL resource file during call to ${funcName}`);
	}
}

/**
 * Exception thrown by the result of FFLiVerifyCharInfoWithReason.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
 */
export class FFLiVerifyReasonException extends Error {
	public result: number;

	/** @param {number} result - The FFLiVerifyReason code from FFLiVerifyCharInfoWithReason. */
	constructor(result: number) {
		super(`FFLiVerifyCharInfoWithReason (CharInfo verification) failed with result: ${result}`);
		/** The stored FFLiVerifyReason code. */
		this.result = result;
	}
}

/**
 * Exception thrown when the mask is set to an expression that
 * the {@link CharModel} was never initialized to, which can't happen
 * because that mask texture does not exist on the {@link CharModel}.
 * @augments {Error}
 */
export class ExpressionNotSet extends Error {
	public expression: FFLExpression;

	/** @param {FFLExpression} expression - The attempted expression. */
	constructor(expression: FFLExpression) {
		super(`Attempted to set expression ${expression}, but the mask for that expression does not exist. You must reinitialize the CharModel with this expression in the expression flags before using it.`);
		this.expression = expression;
	}
}
