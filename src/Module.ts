/**
 * Emscripten "Module" type.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
 */
export default interface Module {
	onRuntimeInitialized: () => void;
	destroy: (object: any) => void;
	calledRun: boolean | null;

	// USE_TYPED_ARRAYS == 2
	HEAP8: Int8Array;
	HEAPU8: Uint8Array;
	HEAPU16: Uint16Array;
	HEAPU32: Uint32Array;
	HEAPF32: Float32Array;

	// Runtime methods
	_malloc: (size: number) => number;
	_free: (ptr: number) => void;
	addFunction: (func: (...args: any[]) => any, signature?: string) => number;
	removeFunction: (ptr: number) => void;

	// ------------------------------- FFL Bindings -------------------------------
	_FFLInitCharModelCPUStepWithCallback: (arg1: number, arg2: number, arg3: number, arg4: number) => any;
	_FFLInitCharModelCPUStep: (arg1: number, arg2: number, arg3: number) => any;
	_FFLDeleteCharModel: (arg: number) => any;
	_FFLGetDrawParamOpaFaceline: (arg: number) => any;
	_FFLGetDrawParamOpaBeard: (arg: number) => any;
	_FFLGetDrawParamOpaNose: (arg: number) => any;
	_FFLGetDrawParamOpaForehead: (arg: number) => any;
	_FFLGetDrawParamOpaHair: (arg: number) => any;
	_FFLGetDrawParamOpaCap: (arg: number) => any;
	_FFLGetDrawParamXluMask: (arg: number) => any;
	_FFLGetDrawParamXluNoseLine: (arg: number) => any;
	_FFLGetDrawParamXluGlass: (arg: number) => any;
	_FFLSetExpression: (arg1: number, arg2: number) => any;
	_FFLGetExpression: (arg: number) => any;
	_FFLSetViewModelType: (arg1: number, arg2: number) => any;
	_FFLGetBoundingBox: (arg1: number, arg2: number) => any;
	_FFLIsAvailableExpression: (arg1: number, arg2: number) => any;
	_FFLSetCoordinate: (arg1: number, arg2: number) => any;
	_FFLSetScale: (arg: number) => any;
	_FFLiGetRandomCharInfo: (arg1: number, arg2: number, arg3: number, arg4: number) => any;
	_FFLpGetStoreDataFromCharInfo: (arg1: number, arg2: number) => any;
	_FFLpGetCharInfoFromStoreData: (arg1: number, arg2: number) => any;
	_FFLpGetCharInfoFromMiiDataOfficialRFL: (arg1: number, arg2: number) => any;
	_FFLGetAdditionalInfo: (arg1: number, arg2: number, arg3: number, arg4: number, arg5: boolean) => any;
	_FFLInitRes: (arg1: number, arg2: number) => any;
	_FFLInitResGPUStep: () => any;
	_FFLExit: () => any;
	_FFLIsAvailable: () => any;
	_FFLGetFavoriteColor: (arg1: number, arg2: number) => any;
	_FFLSetLinearGammaMode: (arg: number) => any;
	_FFLGetFacelineColor: (arg1: number, arg2: number) => any;
	_FFLSetTextureFlipY: (arg: boolean) => any;
	_FFLSetNormalIsSnorm8_8_8_8: (arg: boolean) => any;
	_FFLSetFrontCullForFlipX: (arg: boolean) => any;
	_FFLSetTextureCallback: (arg: number) => any;
	_FFLiDeleteTextureTempObject: (arg: number) => any;
	_FFLiDeleteTempObjectMaskTextures: (arg1: number, arg2: number, arg3: number) => any;
	_FFLiDeleteTempObjectFacelineTexture: (arg1: number, arg2: number, arg3: number) => any;
	_FFLiiGetEyeRotateOffset: (arg: number) => any;
	_FFLiiGetEyebrowRotateOffset: (arg: number) => any;
	_FFLiInvalidateTempObjectFacelineTexture: (arg: number) => any;
	_FFLiInvalidatePartsTextures: (arg: number) => any;
	_FFLiInvalidateRawMask: (arg: number) => any;
	_FFLiVerifyCharInfoWithReason: (arg1: number, arg2: boolean) => any;
	_exit: () => void;
}
