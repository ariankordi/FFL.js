var FFLjs = (function(exports, three) {

//#region rolldown:runtime
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
three = __toESM(three);

//#region ffl.js
/*!
	* Bindings for FFL, a Mii renderer, in JavaScript.
	* Uses the FFL decompilation by aboood40091.
	* https://github.com/ariankordi/FFL.js
	* @author Arian Kordi <https://github.com/ariankordi>
	*/
	/**
	* Generic type for both types of Three.js renderers.
	* @typedef {import('three/webgpu').Renderer|THREE.WebGLRenderer} Renderer
	*/
	/**
	* Emscripten "Module" type.
	* https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c03bddd4d3c7774d00fa256a9e165d68c7534ccc/types/emscripten/index.d.ts#L26
	* This lists common Emscripten methods for interacting with memory,
	* as well as functions used in the FFL library itself.
	* @typedef {Object} Module
	* @property {function(): void} onRuntimeInitialized
	* @property {function(object): void} destroy
	* @property {boolean|null} calledRun
	* // USE_TYPED_ARRAYS == 2
	* @property {Uint8Array} HEAPU8
	* @property {Uint32Array} HEAPU32
	* @property {Float32Array} HEAPF32
	* @property {Int8Array} HEAP8 - Used for some vertex attributes.
	* @property {Uint16Array} HEAPU16 - Used for index buffer.
	* Runtime methods:
	* @property {function(number): number} _malloc
	* @property {function(number): void} _free
	* @property {function((...args: *[]) => *, string=): number} addFunction
	* @property {function(number): void} removeFunction
	* @property {undefined|function(): void} _exit - Only included with a certain Emscripten linker flag.
	*
	* ------------------------------- FFL Bindings -------------------------------
	* Utilized functions:
	* @property {function(number, number, number, number): *} _FFLInitCharModelCPUStepWithCallback
	* @property {function(number): *} _FFLDeleteCharModel
	* @property {function(number, number, number, number): *} _FFLiGetRandomCharInfo
	* @property {function(number, number): *} _FFLpGetCharInfoFromStoreData
	* @property {function(number, number): *} _FFLpGetCharInfoFromMiiDataOfficialRFL
	* @property {function(number, number): *} _FFLInitRes
	* @property {function(): *} _FFLInitResGPUStep
	* @property {function(): *} _FFLExit
	* @property {function(number, number): *} _FFLGetFavoriteColor
	* @property {function(number, number): *} _FFLGetFacelineColor
	* @property {function(boolean): *} _FFLSetTextureFlipY
	* @property {function(boolean): *} _FFLSetNormalIsSnorm8_8_8_8
	* @property {function(boolean): *} _FFLSetFrontCullForFlipX
	* @property {function(number): *} _FFLSetTextureCallback
	* @property {function(number): *} _FFLiDeleteTextureTempObject
	* @property {function(number, number, number): *} _FFLiDeleteTempObjectMaskTextures
	* @property {function(number, number, number): *} _FFLiDeleteTempObjectFacelineTexture
	* @property {function(number): *} _FFLiInvalidateTempObjectFacelineTexture
	* @property {function(number): *} _FFLiInvalidateRawMask
	* @property {function(number, boolean): *} _FFLiVerifyCharInfoWithReason
	* These functions are NOT called directly:
	* @property {function(number): *} _FFLiiGetEyeRotateOffset
	* @property {function(number): *} _FFLiiGetEyebrowRotateOffset
	* @property {function(number): *} _FFLSetLinearGammaMode
	* @property {function(number, number): *} _FFLpGetStoreDataFromCharInfo
	* @property {function(number, number, number, number, boolean): *} _FFLGetAdditionalInfo -
	* This isn't used and can't be used without a decoding method (with bitfields),
	* but to get "additional info" would be nice in general.
	* @package
	*/
	/**
	* Result type for Face Library functions (not the real FFL enum).
	* Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
	* @enum {number}
	* @package
	*/
	const FFLResult = {
		OK: 0,
		ERROR: 1,
		HDB_EMPTY: 2,
		FILE_INVALID: 3,
		MANAGER_NOT_CONSTRUCT: 4,
		FILE_LOAD_ERROR: 5,
		FILE_SAVE_ERROR: 7,
		RES_FS_ERROR: 9,
		ODB_EMPTY: 10,
		OUT_OF_MEMORY: 12,
		UNKNOWN_17: 17,
		FS_ERROR: 18,
		FS_NOT_FOUND: 19,
		MAX: 20
	};
	/**
	* Indicates how the shape should be colored by the fragment shader.
	* @enum {number}
	* @public
	*/
	const FFLModulateMode = {
		CONSTANT: 0,
		TEXTURE_DIRECT: 1,
		RGB_LAYERED: 2,
		ALPHA: 3,
		LUMINANCE_ALPHA: 4,
		ALPHA_OPA: 5
	};
	/**
	* This is the type of shape to be rendered.
	* It's separated into: opaque, translucent,
	* and past SHAPE_MAX is for faceline/mask.
	* @enum {number}
	* @public
	*/
	const FFLModulateType = {
		SHAPE_FACELINE: 0,
		SHAPE_BEARD: 1,
		SHAPE_NOSE: 2,
		SHAPE_FOREHEAD: 3,
		SHAPE_HAIR: 4,
		SHAPE_CAP: 5,
		SHAPE_MASK: 6,
		SHAPE_NOSELINE: 7,
		SHAPE_GLASS: 8,
		MUSTACHE: 9,
		MOUTH: 10,
		EYEBROW: 11,
		EYE: 12,
		MOLE: 13,
		FACE_MAKE: 14,
		FACE_LINE: 15,
		FACE_BEARD: 16,
		FILL: 17,
		SHAPE_MAX: 9
	};
	/**
	* IDs corresponding to expressions.
	* Reference: https://github.com/ariankordi/ffl/blob/nsmbu-win-port-linux64/include/nn/ffl/FFLExpression.h
	* @enum {number}
	* @public
	*/
	const FFLExpression = {
		NORMAL: 0,
		SMILE: 1,
		ANGER: 2,
		SORROW: 3,
		PUZZLED: 3,
		SURPRISE: 4,
		SURPRISED: 4,
		BLINK: 5,
		OPEN_MOUTH: 6,
		SMILE_OPEN_MOUTH: 7,
		HAPPY: 7,
		ANGER_OPEN_MOUTH: 8,
		SORROW_OPEN_MOUTH: 9,
		SURPRISE_OPEN_MOUTH: 10,
		BLINK_OPEN_MOUTH: 11,
		WINK_LEFT: 12,
		WINK_RIGHT: 13,
		WINK_LEFT_OPEN_MOUTH: 14,
		WINK_RIGHT_OPEN_MOUTH: 15,
		LIKE_WINK_LEFT: 16,
		LIKE: 16,
		LIKE_WINK_RIGHT: 17,
		FRUSTRATED: 18,
		BORED: 19,
		BORED_OPEN_MOUTH: 20,
		SIGH_MOUTH_STRAIGHT: 21,
		SIGH: 22,
		DISGUSTED_MOUTH_STRAIGHT: 23,
		DISGUSTED: 24,
		LOVE: 25,
		LOVE_OPEN_MOUTH: 26,
		DETERMINED_MOUTH_STRAIGHT: 27,
		DETERMINED: 28,
		CRY_MOUTH_STRAIGHT: 29,
		CRY: 30,
		BIG_SMILE_MOUTH_STRAIGHT: 31,
		BIG_SMILE: 32,
		CHEEKY: 33,
		CHEEKY_DUPLICATE: 34,
		JOJO_EYES_FUNNY_MOUTH: 35,
		JOJO_EYES_FUNNY_MOUTH_OPEN: 36,
		SMUG: 37,
		SMUG_OPEN_MOUTH: 38,
		RESOLVE: 39,
		RESOLVE_OPEN_MOUTH: 40,
		UNBELIEVABLE: 41,
		UNBELIEVABLE_DUPLICATE: 42,
		CUNNING: 43,
		CUNNING_DUPLICATE: 44,
		RASPBERRY: 45,
		RASPBERRY_DUPLICATE: 46,
		INNOCENT: 47,
		INNOCENT_DUPLICATE: 48,
		CAT: 49,
		CAT_DUPLICATE: 50,
		DOG: 51,
		DOG_DUPLICATE: 52,
		TASTY: 53,
		TASTY_DUPLICATE: 54,
		MONEY_MOUTH_STRAIGHT: 55,
		MONEY: 56,
		SPIRAL_MOUTH_STRAIGHT: 57,
		CONFUSED: 58,
		CHEERFUL_MOUTH_STRAIGHT: 59,
		CHEERFUL: 60,
		BLANK_61: 61,
		BLANK_62: 62,
		GRUMBLE_MOUTH_STRAIGHT: 63,
		GRUMBLE: 64,
		MOVED_MOUTH_STRAIGHT: 65,
		MOVED: 66,
		SINGING_MOUTH_SMALL: 67,
		SINGING: 68,
		STUNNED: 69,
		MAX: 70
	};
	/**
	* Flags that modify how the head model is created.
	* These go in {@link FFLCharModelDesc.modelFlag}.
	* @enum {number}
	* @public
	*/
	const FFLModelFlag = {
		NORMAL: 1,
		HAT: 2,
		FACE_ONLY: 4,
		FLATTEN_NOSE: 8,
		NEW_EXPRESSIONS: 16,
		NEW_MASK_ONLY: 32
	};
	/** @enum {number} */
	const FFLGender = {
		MALE: 0,
		FEMALE: 1,
		ALL: 2
	};
	/** @enum {number} */
	const FFLAge = {
		CHILD: 0,
		ADULT: 1,
		ELDER: 2,
		ALL: 3
	};
	/** @enum {number} */
	const FFLRace = {
		BLACK: 0,
		WHITE: 1,
		ASIAN: 2,
		ALL: 3
	};
	const FFLiCharInfo_size = 288;
	/**
	* @param {Uint8Array} u8 - module.HEAPU8
	* @param {number} ptr - Pointer to the type.
	* @returns Object form of FFLiCharInfo.
	* @package
	*/
	function _unpackFFLiCharInfo(u8, ptr) {
		const view = new DataView(u8.buffer, ptr);
		const name = new TextDecoder("utf-16le").decode(new Uint16Array(u8.buffer, ptr + 180, 11));
		const creator = new TextDecoder("utf-16le").decode(new Uint16Array(u8.buffer, ptr + 202, 11));
		const createID = new Uint8Array(u8.buffer, 264, 10);
		const authorID = new Uint8Array(u8.buffer, 280, 8);
		return {
			miiVersion: view.getInt32(0, true),
			faceType: view.getInt32(4, true),
			faceColor: view.getInt32(8, true),
			faceTex: view.getInt32(12, true),
			faceMake: view.getInt32(16, true),
			hairType: view.getInt32(20, true),
			hairColor: view.getInt32(24, true),
			hairFlip: view.getInt32(28, true),
			eyeType: view.getInt32(32, true),
			eyeColor: view.getInt32(36, true),
			eyeScale: view.getInt32(40, true),
			eyeAspect: view.getInt32(44, true),
			eyeRotate: view.getInt32(48, true),
			eyeX: view.getInt32(52, true),
			eyeY: view.getInt32(56, true),
			eyebrowType: view.getInt32(60, true),
			eyebrowColor: view.getInt32(64, true),
			eyebrowScale: view.getInt32(68, true),
			eyebrowAspect: view.getInt32(72, true),
			eyebrowRotate: view.getInt32(76, true),
			eyebrowX: view.getInt32(80, true),
			eyebrowY: view.getInt32(84, true),
			noseType: view.getInt32(88, true),
			noseScale: view.getInt32(92, true),
			noseY: view.getInt32(96, true),
			mouthType: view.getInt32(100, true),
			mouthColor: view.getInt32(104, true),
			mouthScale: view.getInt32(108, true),
			mouthAspect: view.getInt32(112, true),
			mouthY: view.getInt32(116, true),
			beardMustache: view.getInt32(120, true),
			beardType: view.getInt32(124, true),
			beardColor: view.getInt32(128, true),
			beardScale: view.getInt32(132, true),
			beardY: view.getInt32(136, true),
			glassType: view.getInt32(140, true),
			glassColor: view.getInt32(144, true),
			glassScale: view.getInt32(148, true),
			glassY: view.getInt32(152, true),
			moleType: view.getInt32(156, true),
			moleScale: view.getInt32(160, true),
			moleX: view.getInt32(164, true),
			moleY: view.getInt32(168, true),
			height: view.getInt32(172, true),
			build: view.getInt32(176, true),
			name,
			creator,
			gender: view.getInt32(224, true),
			birthMonth: view.getInt32(228, true),
			birthDay: view.getInt32(232, true),
			favoriteColor: view.getInt32(236, true),
			favorite: view.getUint8(240),
			copyable: view.getUint8(241),
			ngWord: view.getUint8(242),
			localonly: view.getUint8(243),
			regionMove: view.getInt32(244, true),
			fontRegion: view.getInt32(248, true),
			roomIndex: view.getInt32(252, true),
			positionInRoom: view.getInt32(256, true),
			birthPlatform: view.getInt32(260, true),
			createID,
			padding_0: view.getUint16(274, true),
			authorType: view.getInt32(276, true),
			authorID
		};
	}
	/** @typedef {ReturnType<_unpackFFLiCharInfo>} FFLiCharInfo */
	/**
	* Size of FFLStoreData, the 3DS/Wii U Mii data format. (Not included)
	* @public
	*/
	/** sizeof(FFLStoreData) */
	const FFLStoreData_size = 96;
	/**
	* Validates the input CharInfo by calling FFLiVerifyCharInfoWithReason.
	* @param {Uint8Array|number} data - FFLiCharInfo structure as bytes or pointer.
	* @param {FFL} ffl - FFL module/resource state.
	* @param {boolean} verifyName - Whether the name and creator name should be verified.
	* @returns {void} Returns nothing if verification passes.
	* @throws {FFLiVerifyReasonException} Throws if the result is not 0 (FFLI_VERIFY_REASON_OK).
	* @public
	*/
	function verifyCharInfo(data, ffl, verifyName = false) {
		const mod = ffl.module;
		let charInfoPtr = 0;
		let charInfoAllocated = false;
		if (typeof data === "number") {
			charInfoPtr = data;
			charInfoAllocated = false;
		} else {
			charInfoAllocated = true;
			charInfoPtr = mod._malloc(FFLiCharInfo_size);
			mod.HEAPU8.set(data, charInfoPtr);
		}
		const result = mod._FFLiVerifyCharInfoWithReason(charInfoPtr, verifyName);
		if (charInfoAllocated) mod._free(charInfoPtr);
		if (result !== 0) throw new FFLiVerifyReasonException(result);
	}
	/**
	* Generates a random FFLiCharInfo instance calling FFLiGetRandomCharInfo.
	* @param {FFL} ffl - FFL module/resource state.
	* @param {FFLGender} gender - Gender of the character.
	* @param {FFLAge} age - Age of the character.
	* @param {FFLRace} race - Race of the character.
	* @returns {Uint8Array} The random FFLiCharInfo.
	*/
	function getRandomCharInfo(ffl, gender = FFLGender.ALL, age = FFLAge.ALL, race = FFLRace.ALL) {
		const mod = ffl.module;
		const ptr = mod._malloc(FFLiCharInfo_size);
		mod._FFLiGetRandomCharInfo(ptr, gender, age, race);
		const result = mod.HEAPU8.slice(ptr, ptr + FFLiCharInfo_size);
		mod._free(ptr);
		return result;
	}
	/** @package */
	const commonColorEnableMask = 1 << 31;
	/**
	* Applies (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
	* to a common color index to indicate to FFL which color table it should use.
	* @param {number} color - The color index to flag.
	* @returns {number} The flagged color index to use in FFLiCharinfo.
	*/
	const commonColorMask = (color) => color | commonColorEnableMask;
	/**
	* Removes (unofficial) mask: FFLI_NN_MII_COMMON_COLOR_ENABLE_MASK
	* to a common color index to reveal the original common color index.
	* @param {number} color - The flagged color index.
	* @returns {number} The original color index before flagging.
	*/
	/**
	* Manages THREE.Texture objects created via FFL.
	* Must be instantiated after FFL is fully initialized.
	* @package
	*/
	var TextureManager = class TextureManager {
		/**
		* Global that controls if texture creation should be changed
		* to account for WebGL 1.0. (Shapes should be fine)
		* @public
		*/
		static isWebGL1 = false;
		/**
		* Constructs the TextureManager. This MUST be created after initializing FFL.
		* @param {Module} module - The Emscripten module.
		* @param {boolean} [setToFFLGlobal] - Whether or not to call FFLSetTextureCallback on the constructed callback.
		*/
		constructor(module, setToFFLGlobal = false) {
			/**
			* @type {Module}
			* @private
			*/
			this._module = module;
			/**
			* Internal map of texture ID to THREE.Texture.
			* @type {Map<number, THREE.Texture>}
			* @private
			*/
			this._textures = /* @__PURE__ */ new Map();
			/** @public */
			this.callbackPtr = 0;
			this._setTextureCallback();
			if (setToFFLGlobal) module._FFLSetTextureCallback(this.callbackPtr);
		}
		/** @typedef {ReturnType<TextureManager._unpackFFLTextureInfo>} FFLTextureInfo */
		/**
		* @param {Uint8Array} u8 - module.HEAPU8
		* @param {number} ptr - Pointer to the type.
		* @returns Object form of FFLTextureInfo.
		* @private
		*/
		static _unpackFFLTextureInfo(u8, ptr) {
			const view = new DataView(u8.buffer, ptr);
			return {
				width: view.getUint16(0, true),
				height: view.getUint16(2, true),
				mipCount: view.getUint8(4),
				format: view.getUint8(5),
				imageSize: view.getUint32(8, true),
				imagePtr: view.getUint32(12, true),
				mipSize: view.getUint32(16, true),
				mipPtr: view.getUint32(20, true),
				mipLevelOffset: new Uint32Array(u8.buffer, ptr + 24, 13)
			};
		}
		/**
		* Allocates and packs an FFLTextureCallback instance from callback function pointers.
		* @param {Module} module - The Emscripten module.
		* @param {number} createCallback - Function pointer for the create callback.
		* @param {number} deleteCallback - Function pointer for the delete callback.
		* @returns {number} Pointer to the FFLTextureCallback.
		* Note that you MUST free this after using it (done in {@link TextureManager.disposeCallback}).
		* @private
		*/
		static _allocateTextureCallback(module, createCallback, deleteCallback) {
			const FFLTextureCallback_size = 16;
			const u8 = new Uint8Array(FFLTextureCallback_size);
			const view = new DataView(u8.buffer);
			view.setUint32(8, createCallback, true);
			view.setUint32(12, deleteCallback, true);
			const ptr = module._malloc(FFLTextureCallback_size);
			module.HEAPU8.set(u8, ptr);
			return ptr;
		}
		/**
		* Creates the create/delete functions in Emscripten and allocates and sets
		* the FFLTextureCallback object as {@link TextureManager.callbackPtr}.
		*/
		_setTextureCallback() {
			const mod = this._module;
			/** @private */
			this._createCallback = mod.addFunction(this._textureCreateFunc.bind(this), "vppp");
			this.callbackPtr = TextureManager._allocateTextureCallback(mod, this._createCallback, this._deleteCallback || 0);
		}
		/**
		* @param {number} format - Enum value for FFLTextureFormat.
		* @returns {THREE.PixelFormat} Three.js texture format constant.
		* Note that this function won't work on WebGL1Renderer in Three.js r137-r162
		* since R and RG textures need to use Luminance(Alpha)Format
		* (you'd somehow need to detect which renderer is used)
		* @private
		*/
		static _getTextureFormat(format) {
			const useGLES2Formats = Number(three.REVISION) <= 136 || TextureManager.isWebGL1;
			const dataFormat = [
				useGLES2Formats ? three.LuminanceFormat : three.RedFormat,
				useGLES2Formats ? three.LuminanceAlphaFormat : three.RGFormat,
				three.RGBAFormat
			][format];
			console.assert(dataFormat !== void 0, `_textureCreateFunc: Unexpected FFLTextureFormat value: ${format}`);
			return dataFormat;
		}
		/**
		* @param {number} _ - Originally pObj, unused here.
		* @param {number} textureInfoPtr - Pointer to {@link FFLTextureInfo}.
		* @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
		* @private
		*/
		_textureCreateFunc(_, textureInfoPtr, texturePtrPtr) {
			const textureInfo = TextureManager._unpackFFLTextureInfo(this._module.HEAPU8, textureInfoPtr);
			/** Resolve THREE.PixelFormat. */
			const format = TextureManager._getTextureFormat(textureInfo.format);
			const imageData = this._module.HEAPU8.slice(textureInfo.imagePtr, textureInfo.imagePtr + textureInfo.imageSize);
			/**
			* Determine whether mipmaps can be used at all.
			* Implemented in Three.js r137 and only works properly on r138.
			*
			* This is also disabled for WebGL 1.0, since there are some NPOT textures.
			* Those aren't supposed to have mipmaps e.g., glass, but I found that
			* while in GLES2, some textures that didn't wrap could have mips with
			* NPOT, this didn't work in WebGL 1.0.
			*/
			const canUseMipmaps = Number(three.REVISION) >= 138 && !TextureManager.isWebGL1;
			const useMipmaps = textureInfo.mipCount > 1 && canUseMipmaps;
			const texture = new three.DataTexture(useMipmaps ? null : imageData, textureInfo.width, textureInfo.height, format, three.UnsignedByteType);
			texture.magFilter = three.LinearFilter;
			texture.minFilter = three.LinearFilter;
			if (useMipmaps) {
				texture.mipmaps = [{
					data: imageData,
					width: textureInfo.width,
					height: textureInfo.height
				}];
				texture.minFilter = three.LinearMipmapLinearFilter;
				texture.generateMipmaps = false;
				this._addMipmaps(texture, textureInfo);
			}
			texture.needsUpdate = true;
			this.set(texture.id, texture);
			this._module.HEAPU32[texturePtrPtr / 4] = texture.id;
		}
		/**
		* @param {THREE.Texture} texture - Texture to upload mipmaps into.
		* @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
		* @private
		*/
		_addMipmaps(texture, textureInfo) {
			console.assert(textureInfo.mipPtr, "_addMipmaps: mipPtr is null, so the caller incorrectly assumed this texture has mipmaps");
			for (let mipLevel = 1; mipLevel < textureInfo.mipCount; mipLevel++) {
				const mipOffset = textureInfo.mipLevelOffset[mipLevel - 1];
				const mipWidth = Math.max(1, textureInfo.width >> mipLevel);
				const mipHeight = Math.max(1, textureInfo.height >> mipLevel);
				const nextMipOffset = textureInfo.mipLevelOffset[mipLevel] || textureInfo.mipSize;
				const end = textureInfo.mipPtr + nextMipOffset;
				const start = textureInfo.mipPtr + mipOffset;
				const mipData = this._module.HEAPU8.slice(start, end);
				texture.mipmaps.push({
					data: mipData,
					width: mipWidth,
					height: mipHeight
				});
			}
		}
		/**
		* @param {number} id - ID assigned to the texture.
		* @returns {THREE.Texture|null|undefined} Returns the texture if it is found.
		* @public
		*/
		get(id) {
			return this._textures.get(id);
		}
		/**
		* @param {number} id - ID assigned to the texture.
		* @param {THREE.Texture} texture - Texture to add.
		* @public
		*/
		set(id, texture) {
			const disposeReal = texture.dispose.bind(texture);
			texture.dispose = () => {
				disposeReal();
				this.delete(id);
			};
			this._textures.set(id, texture);
		}
		/**
		* @param {number} id - ID assigned to the texture.
		* @public
		*/
		delete(id) {
			const texture = this._textures.get(id);
			if (texture) {
				/** @type {Object<string, *>} */ texture.source = null;
				/** @type {Object<string, *>} */ texture.mipmaps = null;
				this._textures.delete(id);
			}
		}
		/**
		* Disposes/frees the FFLTextureCallback along with
		* removing the created Emscripten functions.
		* @public
		*/
		disposeCallback() {
			if (this.callbackPtr) {
				this._module._free(this.callbackPtr);
				this.callbackPtr = 0;
			}
			if (this._deleteCallback) {
				this._module.removeFunction(this._deleteCallback);
				this._deleteCallback = 0;
			}
			if (this._createCallback) {
				this._module.removeFunction(this._createCallback);
				this._createCallback = 0;
			}
		}
		/**
		* Disposes of all textures and frees the FFLTextureCallback.
		* @public
		*/
		dispose() {
			for (const tex of this._textures) tex[1].dispose();
			this._textures.clear();
			this.disposeCallback();
		}
	};
	/**
	* Base exception type for all exceptions based on FFLResult.
	* https://github.com/ariankordi/FFLSharp/blob/master/FFLSharp.FFLManager/FFLExceptions.cs
	* https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
	*/
	var FFLResultException = class FFLResultException extends Error {
		/**
		* @param {number|FFLResult} result - The returned {@link FFLResult}.
		* @param {string} [funcName] - The name of the function that was called.
		* @param {string} [message] - An optional message for the exception.
		*/
		constructor(result, funcName, message) {
			if (!message) message = funcName ? `${funcName} failed with FFLResult: ${result}` : `From FFLResult: ${result}`;
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
		static handleResult(result, funcName) {
			switch (result) {
				case FFLResult.ERROR: throw new FFLResultWrongParam(funcName);
				case FFLResult.FILE_INVALID: throw new FFLResultBroken(funcName);
				case FFLResult.MANAGER_NOT_CONSTRUCT: throw new FFLResultNotAvailable(funcName);
				case FFLResult.FILE_LOAD_ERROR: throw new FFLResultFatal(funcName);
				case FFLResult.OK: return;
				default: throw new FFLResultException(result, funcName);
			}
		}
	};
	/**
	* Exception reflecting FFL_RESULT_WRONG_PARAM / FFL_RESULT_ERROR.
	* This is the most common error thrown in FFL. It usually
	* means that input parameters are invalid.
	* So many cases this is thrown: parts index is out of bounds,
	* CharModelCreateParam is malformed, FFLDataSource is invalid, FFLInitResEx
	* parameters are null or invalid... Many different causes, very much an annoying error.
	*/
	var FFLResultWrongParam = class extends FFLResultException {
		/** @param {string} [funcName] - Name of the function where the result originated. */
		constructor(funcName) {
			super(FFLResult.ERROR, funcName, `${funcName} returned FFL_RESULT_WRONG_PARAM. This usually means parameters going into that function were invalid.`);
		}
	};
	/** Exception reflecting FFL_RESULT_BROKEN / FFL_RESULT_FILE_INVALID. */
	var FFLResultBroken = class extends FFLResultException {
		/**
		* @param {string} [funcName] - Name of the function where the result originated.
		* @param {string} [message] - An optional message for the exception.
		*/
		constructor(funcName, message) {
			super(FFLResult.FILE_INVALID, funcName, message || `${funcName} returned FFL_RESULT_BROKEN. This usually indicates invalid underlying data.`);
		}
	};
	/** Exception when resource header verification fails. */
	var BrokenInitRes = class extends FFLResultBroken {
		constructor() {
			super("FFLInitRes", "The header for the FFL resource is probably invalid. Check the version and magic, should be \"FFRA\" or \"ARFF\".");
		}
	};
	/**
	* Exception reflecting FFL_RESULT_NOT_AVAILABLE / FFL_RESULT_MANAGER_NOT_CONSTRUCT.
	* This is seen when FFLiManager is not constructed, which it is not when FFLInitResEx fails
	* or was never called to begin with.
	*/
	var FFLResultNotAvailable = class extends FFLResultException {
		/** @param {string} [funcName] - Name of the function where the result originated. */
		constructor(funcName) {
			super(FFLResult.MANAGER_NOT_CONSTRUCT, funcName, `Tried to call FFL function ${funcName} when FFLManager is not constructed (FFL is not initialized properly).`);
		}
	};
	/**
	* Exception reflecting FFL_RESULT_FATAL / FFL_RESULT_FILE_LOAD_ERROR.
	* This error indicates database file load errors or failures from FFLiResourceLoader (decompression? misalignment?)
	*/
	var FFLResultFatal = class extends FFLResultException {
		/** @param {string} [funcName] - Name of the function where the result originated. */
		constructor(funcName) {
			super(FFLResult.FILE_LOAD_ERROR, funcName, `Failed to uncompress or load a specific asset from the FFL resource file during call to ${funcName}`);
		}
	};
	/**
	* Exception thrown by the result of FFLiVerifyCharInfoWithReason.
	* Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/detail/FFLiCharInfo.h#L90
	*/
	var FFLiVerifyReasonException = class extends Error {
		/** @param {number} result - The FFLiVerifyReason code from FFLiVerifyCharInfoWithReason. */
		constructor(result) {
			super(`FFLiVerifyCharInfoWithReason (CharInfo verification) failed with result: ${result}`);
			/** The stored FFLiVerifyReason code. */
			this.result = result;
		}
	};
	/**
	* Exception thrown when the mask is set to an expression that
	* the {@link CharModel} was never initialized to, which can't happen
	* because that mask texture does not exist on the {@link CharModel}.
	* @augments {Error}
	*/
	var ExpressionNotSet = class extends Error {
		/** @param {FFLExpression} expression - The attempted expression. */
		constructor(expression) {
			super(`Attempted to set expression ${expression}, but the mask for that expression does not exist. You must reinitialize the CharModel with this expression in the expression flags before using it.`);
			this.expression = expression;
		}
	};
	/**
	* Class for initializing FFL.js.
	* The instance of this class is meant to be passed when creating
	* CharModels or to functions that need the {@link Module}.
	*/
	var FFL = class FFL {
		/**
		* Resource type to load single resource into = FFL_RESOURCE_TYPE_HIGH
		* @package
		*/
		static singleResourceType = 1;
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
		static async initWithResource(resource, moduleOrPromise) {
			/**
			* Pointer to the FFLResourceDesc structure to free when FFLInitRes call is done.
			* @type {number}
			*/
			let resourceDescPtr = 0;
			/**
			* The Emscripten Module instance to set and return at the end.
			* @type {Module}
			*/
			let module;
			if (typeof moduleOrPromise === "function") moduleOrPromise = moduleOrPromise();
			module = moduleOrPromise instanceof Promise ? module = await moduleOrPromise : module = moduleOrPromise;
			if (!module.calledRun && !module.onRuntimeInitialized) await new Promise((resolve) => {
				/** If onRuntimeInitialized is not defined on module, add it. */
				module.onRuntimeInitialized = () => {
					resolve(null);
				};
			});
			/** @type {FFLResourceDesc|null} */
			let desc = null;
			try {
				if (resource instanceof Promise) resource = await resource;
				const { pointer: heapPtr, size: heapSize } = await this._loadDataIntoHeap(resource, module);
				desc = {
					pData: [0, 0],
					size: [0, 0]
				};
				desc.pData[FFL.singleResourceType] = heapPtr;
				desc.size[FFL.singleResourceType] = heapSize;
				const resourceDescData = this._packFFLResourceDesc(desc);
				resourceDescPtr = module._malloc(this.FFLResourceDesc_size);
				module.HEAPU8.set(resourceDescData, resourceDescPtr);
				const result = module._FFLInitRes(0, resourceDescPtr);
				if (result === FFLResult.FILE_INVALID) throw new BrokenInitRes();
				FFLResultException.handleResult(result, "FFLInitRes");
				module._FFLInitResGPUStep();
				module._FFLSetNormalIsSnorm8_8_8_8(true);
				module._FFLSetTextureFlipY(true);
			} catch (error) {
				this._freeResource(desc, module);
				resourceDescPtr && module._free(resourceDescPtr);
				console.error("FFL.initWithResource failed:", error);
				throw error;
			} finally {
				resourceDescPtr && module._free(resourceDescPtr);
			}
			return new FFL(module, desc);
		}
		/**
		* @typedef {Object} FFLResourceDesc
		* @property {Array<number>} pData
		* @property {Array<number>} size
		* @private
		*/
		static FFLResourceDesc_size = 16;
		/**
		* @param {FFLResourceDesc} obj - Object form of FFLResourceDesc.
		* @returns {Uint8Array} Byte form of FFLResourceDesc.
		* @private
		*/
		static _packFFLResourceDesc(obj) {
			const u8 = new Uint8Array(this.FFLResourceDesc_size);
			const view = new DataView(u8.buffer);
			view.setUint32(0, obj.pData[0], true);
			view.setUint32(4, obj.pData[1], true);
			view.setUint32(8, obj.size[0], true);
			view.setUint32(12, obj.size[1], true);
			return u8;
		}
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
		static async _loadDataIntoHeap(resource, module) {
			let heapSize;
			let heapPtr;
			try {
				if (resource instanceof ArrayBuffer) resource = new Uint8Array(resource);
				if (resource instanceof Uint8Array) {
					heapSize = resource.length;
					heapPtr = module._malloc(heapSize);
					module.HEAPU8.set(resource, heapPtr);
				} else if (resource instanceof Response) {
					if (!resource.ok) throw new Error(`_loadDataIntoHeap: Failed to fetch resource at URL = ${resource.url}, response code = ${resource.status}`);
					if (!resource.body) throw new Error(`_loadDataIntoHeap: Fetch response body is null (resource.body = ${resource.body})`);
					const contentLength = resource.headers.get("Content-Length");
					if (!contentLength) {
						console.debug("_loadDataIntoHeap: Fetch response is missing Content-Length, falling back to reading as ArrayBuffer.");
						return this._loadDataIntoHeap(await resource.arrayBuffer(), module);
					}
					heapSize = Number.parseInt(contentLength, 10);
					heapPtr = module._malloc(heapSize);
					const reader = resource.body.getReader();
					let offset = heapPtr;
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						module.HEAPU8.set(value, offset);
						offset += value.length;
					}
				} else throw new TypeError("loadDataIntoHeap: type is not Uint8Array or Response");
				return {
					pointer: heapPtr,
					size: heapSize
				};
			} catch (error) {
				if (heapPtr) module._free(heapPtr);
				throw error;
			}
		}
		/**
		* Frees all pData pointers within FFLResourceDesc.
		* @param {FFLResourceDesc|null} desc - Resource description containing pointers.
		* @param {Module} module - Emscripten module to call _free on.
		* @private
		*/
		static _freeResource(desc, module) {
			if (!desc) return;
			for (let i = 0; i < 2; i++) {
				const p = desc.pData[i];
				if (p) {
					module._free(p);
					desc.pData[i] = 0;
				}
			}
		}
		/**
		* @param {Module} module - Emscripten module.
		* @param {FFLResourceDesc} resourceDesc - FFLResourceDesc to free later.
		* @private
		*/
		constructor(module, resourceDesc) {
			/** @package */
			this.module = module;
			/** @package */
			this.resourceDesc = resourceDesc;
		}
		/**
		* Frees the FFL resource from WASM memory.
		* @public
		*/
		dispose() {
			const result = this.module._FFLExit();
			FFLResultException.handleResult(result, "FFLExit");
			FFL._freeResource(this.resourceDesc, this.module);
			if (this.module._exit) this.module._exit();
		}
		/**
		* Sets the state for whether WebGL 1.0 or WebGPU is being used.
		* Otherwise, textures will appear wrong when not using WebGL 2.0.
		* @param {Renderer} renderer - The WebGLRenderer or WebGPURenderer.
		* @public
		*/
		setRenderer(renderer) {
			console.assert(renderer && this.module, `setRendererState: The renderer and module must both be valid.`);
			if ("capabilities" in renderer && !renderer.capabilities.isWebGL2) TextureManager.isWebGL1 = true;
			else if (_isWebGPU(renderer)) this.module._FFLSetTextureFlipY(false);
		}
	};
	/** @typedef {function(new: THREE.Material, ...*): THREE.Material} MaterialConstructor */
	/** @package */ const FFLColor_size = 16;
	/** @package */ const FFLAdditionalInfo_size = 80;
	/**
	* Converts an FFLColor pointer to a THREE.Color.
	* @param {Float32Array} f32 - HEAPF32 buffer view within {@link Module}.
	* @param {number} colorPtr - The pointer to the color.
	* @returns {THREE.Color} The RGB color.
	* @package
	*/
	const _getFFLColor = (f32, colorPtr) => new three.Color().fromArray(f32, colorPtr / 4);
	/**
	* Class for creating and maintaining a Mii head model,
	* also known as the "CharModel". Once constructed, a Three.js
	* model group is provided in {@link CharModel.meshes}.
	* @public
	*/
	var CharModel = class CharModel {
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
		constructor(ffl, data, descOrExpFlag, materialClass, renderer, verify = true) {
			if (!ffl || !ffl.module || !ffl.module._malloc) throw new Error("CharModel: Invalid `ffl` parameter passed in.");
			if (!data) throw new Error("CharModel: data is null or undefined.");
			/** @private */
			this._module = ffl.module;
			/**
			* The data used to construct the CharModel.
			* @type {ConstructorParameters<typeof CharModel>[1]}
			* @private
			*/
			this._data = data;
			/**
			* @type {MaterialConstructor}
			* @package
			*/
			this._materialClass = materialClass;
			const modelSourcePtr = this._module._malloc(FFLCharModelSource_size);
			const modelDescPtr = this._module._malloc(CharModel.FFLCharModelDesc_size);
			/**
			* Pointer to the FFLiCharModel in memory, set to null when deleted.
			* @private
			*/
			this._ptr = this._module._malloc(CharModel.FFLiCharModel_size);
			const modelSource = _allocateModelSource(this._data, this._module);
			/** Get pBuffer to free it later. */
			const charInfoPtr = modelSource.pBuffer;
			const modelSourceBuffer = CharModel._packFFLCharModelSource(modelSource);
			this._module.HEAPU8.set(modelSourceBuffer, modelSourcePtr);
			/** @private */
			this._modelDesc = CharModel._descOrExpFlagToModelDesc(descOrExpFlag);
			this._modelDesc.modelFlag |= FFLModelFlag.NEW_EXPRESSIONS;
			const modelDescBuffer = CharModel._packFFLCharModelDesc(this._modelDesc);
			this._module.HEAPU8.set(modelDescBuffer, modelDescPtr);
			try {
				if (verify) verifyCharInfo(charInfoPtr, ffl, false);
				/**
				* Local per-model TextureManager instance.
				* @private
				*/
				this._textureManager = new TextureManager(this._module, false);
				const result = this._module._FFLInitCharModelCPUStepWithCallback(this._ptr, modelSourcePtr, modelDescPtr, this._textureManager.callbackPtr);
				FFLResultException.handleResult(result, "FFLInitCharModelCPUStep");
			} catch (error) {
				this._textureManager && this._textureManager.dispose();
				this._module._free(this._ptr);
				throw error;
			} finally {
				this._module._free(modelSourcePtr);
				this._module._free(modelDescPtr);
				this._module._free(charInfoPtr);
				this._textureManager && this._textureManager.disposeCallback();
			}
			/**
			* Representation of the underlying FFLCharModel instance.
			* @private
			*/
			this._model = new CharModelAccessor(this._module, this._ptr, this._modelDesc);
			/** @private */
			this._isTexOnly = this._model.isTexOnly();
			/**
			* @type {THREE.RenderTarget|null}
			* @private
			*/
			this._facelineTarget = null;
			/**
			* Array of RenderTargets for mask textures.
			* Accessible for debugging (see demo-basic).
			* @type {Array<THREE.RenderTarget|null>}
			* @package
			*/
			this._maskTargets = Array.from({ length: FFLExpression.MAX }).fill(null);
			/**
			* List of enabled expressions that can be set with {@link CharModel.setExpression}.
			* @type {Uint32Array}
			* @public
			*/
			this.expressions = this._model.getMaskRenderTextures().map((val, idx) => val === 0 ? FFLExpression.MAX : idx).filter((i) => i !== FFLExpression.MAX);
			/** @private */
			this._expression = this._model.getExpression();
			/**
			* Skin/face color for this model.
			* @type {THREE.Color}
			* @readonly
			* @public
			*/
			this.facelineColor = /* @__PURE__ */ new three.Color();
			/**
			* Contains the CharInfo of the model.
			* Changes to this will not be reflected whatsoever.
			* @readonly
			* @returns {FFLiCharInfo} The CharInfo of the model.
			* @public
			*/
			this.charInfo = this._model.getCharInfo();
			/**
			* Group of THREE.Mesh objects representing the CharModel.
			* @type {THREE.Group}
			* @readonly
			* @public
			*/
			this.meshes = new three.Group();
			this._addCharModelMeshes(this._module);
			const addlPtr = this._module._malloc(FFLAdditionalInfo_size);
			if (this._module._FFLGetAdditionalInfo(addlPtr, 6, this._ptr, 0, false) === FFLResult.OK) this.facelineColor.fromArray(this._module.HEAPF32, (addlPtr + 56) / 4);
			this._module._free(addlPtr);
			/**
			* Favorite color, also used for hats and body.
			* @readonly
			* @public
			*/
			this.favoriteColor = this._getFavoriteColor();
			/**
			* The parameters in which to transform hats and other accessories.
			* @readonly
			* @public
			*/
			this.partsTransform = this._model.getPartsTransform();
			/**
			* Bounding box of the model.
			* Please use this instead of Three.js's built-in methods to get
			* the bounding box, since this excludes invisible shapes.
			* @public
			*/
			this.boundingBox = this._getBoundingBox();
			if (renderer) this.initTextures(renderer, this._materialTextureClass);
		}
		/** @typedef {THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>} MeshWithTexture */
		/**
		* Initializes textures (faceline and mask) for a CharModel.
		* Calling this is not necessary, unless you haven't provided
		* renderer to the constructor (e.g. you want them to be separate).
		* This ends up drawing faceline and mask textures.
		* @param {Renderer} renderer - The Three.js renderer.
		* @param {MaterialConstructor} materialClass - The material class (e.g., FFLShaderMaterial).
		*/
		initTextures(renderer, materialClass = this._materialClass) {
			console.assert(this._materialTextureClass === void 0, "CharModel.initTextures: This has already run. Avoid calling it twice. This will also get called automatically if renderer is passed to the constructor.");
			/**
			* Material class used to initialize textures specifically.
			* @type {MaterialConstructor}
			* @private
			*/
			this._materialTextureClass = materialClass;
			const faceTarget = CharModelTextures.initialize(this._model, renderer, this._module, this._textureManager, this._materialTextureClass, this._maskTargets, this.facelineColor);
			faceTarget && this._setFaceline(faceTarget);
			this._finalizeCharModel();
			this.setExpression(this.expression);
			if (!matSupportsFFL(this._materialClass)) if (matSupportsFFL(this._materialTextureClass)) ModelTexturesConverter.convModelTexturesToRGBA(this, renderer, this._materialTextureClass);
			else console.error("CharModel._materialClass does not support modulateMode (no getter), but the _materialTextureClass is either the same or also does not support modulateMode. as a result, textures will have wrong colors");
		}
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
		static update(charModel, newData, renderer, descOrExpFlag = null, { texOnly = false, verify = true, materialTextureClass = null } = {}) {
			newData = newData || charModel._data;
			if (!newData) throw new Error("updateCharModel: newData is null.");
			/** The new or updated CharModelDesc with the new expression specified. */
			const newModelDesc = this._descOrExpFlagToModelDesc(descOrExpFlag, charModel._modelDesc);
			if (texOnly) newModelDesc.modelFlag |= FFLModelFlag.NEW_MASK_ONLY;
			else charModel.dispose();
			const newCharModel = new CharModel({ module: charModel._module }, newData, newModelDesc, charModel._materialClass, void 0, verify);
			newCharModel.initTextures(renderer, materialTextureClass || charModel._materialTextureClass);
			if (texOnly) {
				charModel.disposeTargets();
				charModel._facelineTarget = newCharModel._facelineTarget;
				charModel._maskTargets = newCharModel._maskTargets;
				charModel._model = newCharModel._model;
				charModel._modelDesc = newModelDesc;
				charModel.expressions = newCharModel.expressions;
				charModel._expression = newCharModel._expression;
				if (newCharModel._facelineTarget) charModel._setFaceline(newCharModel._facelineTarget);
				charModel.setExpression(newCharModel.expression);
				return charModel;
			}
			return newCharModel;
		}
		/**
		* Disposes the CharModel and removes all associated resources.
		* @param {boolean} [disposeTargets] - Whether or not to dispose of mask and faceline render targets.
		* @public
		*/
		dispose(disposeTargets = true) {
			this._finalizeCharModel();
			if (this.meshes) {
				this._facelineMesh = null;
				this._maskMesh = null;
				_disposeMany(this.meshes);
				this.meshes = null;
			}
			if (disposeTargets) this.disposeTargets();
			if (this._textureManager) {
				this._textureManager.dispose();
				this._textureManager = null;
			}
		}
		/**
		* Disposes RenderTargets for textures created by the CharModel.
		* @public
		*/
		disposeTargets() {
			if (this._facelineTarget) {
				this._facelineTarget.dispose();
				this._facelineTarget = null;
			}
			for (const [i, target] of this._maskTargets.entries()) if (target) {
				target.dispose();
				this._maskTargets[i] = null;
			}
		}
		/**
		* Sets the expression for this CharModel and updates the corresponding mask texture.
		* @param {FFLExpression} expression - The new expression index.
		* @throws {Error} CharModel must have been initialized with the
		* expression enabled in the flag and have XLU_MASK in meshes.
		* @public
		*/
		setExpression(expression) {
			/** or getMaskTexture()? */
			const targ = this._maskTargets[expression];
			if (!targ || !targ.texture) throw new ExpressionNotSet(expression);
			/** @private */
			this._expression = expression;
			if (this._isTexOnly) return;
			const mesh = this._maskMesh;
			if (!mesh) {
				if (expression === FFLExpression.BLANK_61 || expression === FFLExpression.BLANK_62) return;
				throw new Error("setExpression: mask mesh does not exist, cannot set expression on it");
			}
			/** @type {THREE.Texture & {_target:THREE.RenderTarget}} */
			targ.texture._target = targ;
			mesh.material.map = targ.texture;
			mesh.material.needsUpdate = true;
		}
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
		getFaceline() {
			if (this._facelineTarget) return this._facelineTarget;
			return null;
		}
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
		getMask(expression = this.expression) {
			if (this._maskTargets && this._maskTargets[expression]) return this._maskTargets[expression];
			return null;
		}
		/**
		* Gets a vector in which to scale the body model for this CharModel.
		* @returns {THREE.Vector3Like} Scale vector for the body model.
		* @public
		*/
		getBodyScale() {
			const build = this.charInfo.build;
			const height = this.charInfo.height;
			const m = 128;
			const x = build * (height * (.47 / m) + .4) / m + height * (.23 / m) + .4;
			return {
				x,
				y: height * (.77 / m) + .5,
				z: x
			};
		}
		/**
		* Gets the ColorInfo object needed for SampleShaderMaterial.
		* @param {boolean} isSpecial - Determines the pants color, gold if special or gray otherwise.
		* @returns {import('./materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo}
		* The colorInfo object needed by SampleShaderMaterial.
		* @public
		*/
		getColorInfo(isSpecial = false) {
			return {
				facelineColor: this.charInfo.faceColor,
				favoriteColor: this.charInfo.favoriteColor,
				hairColor: this.charInfo.hairColor,
				beardColor: this.charInfo.beardColor,
				pantsColor: isSpecial ? PantsColor.GoldSpecial : PantsColor.GrayNormal
			};
		}
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
		get expression() {
			return this._expression;
		}
		/**
		* @returns {FFLGender} Gender as 0 = male, 1 = female
		* @public
		*/
		get gender() {
			return this.charInfo.gender;
		}
		/** @private */
		static FFLiCharModel_size = 2156;
		/** @private */
		static FFLCharModelDesc_size = 24;
		/**
		* Used to index DrawParam array in FFLiCharModel.
		* @private
		*/
		static FFLiShapeType = {
			OPA_BEARD: 0,
			OPA_FACELINE: 1,
			OPA_HAIR_NORMAL: 2,
			OPA_FOREHEAD_NORMAL: 3,
			XLU_MASK: 4,
			XLU_NOSELINE: 5,
			OPA_NOSE: 6,
			OPA_HAT_NORMAL: 7,
			XLU_GLASS: 8,
			OPA_HAIR_CAP: 9,
			OPA_FOREHEAD_CAP: 10,
			OPA_HAT_CAP: 11,
			MAX: 12
		};
		/**
		* @param {FFLCharModelDesc} obj - Object form of FFLCharModelDesc.
		* @returns {Uint8Array} Byte form of FFLCharModelDesc.
		* @private
		*/
		static _packFFLCharModelDesc(obj) {
			const u8 = new Uint8Array(this.FFLCharModelDesc_size);
			const view = new DataView(u8.buffer);
			view.setUint32(0, obj.resolution, true);
			const flag = obj.allExpressionFlag;
			view.setUint32(4, flag[0], true);
			view.setUint32(8, flag[1], true);
			view.setUint32(12, flag[2], true);
			view.setUint32(16, obj.modelFlag, true);
			view.setUint32(20, FFL.singleResourceType, true);
			return u8;
		}
		/**
		* @param {FFLCharModelSource} obj - Object form of FFLCharModelSource.
		* @returns {Uint8Array} Byte form of FFLCharModelSource.
		* @private
		*/
		static _packFFLCharModelSource(obj) {
			const u8 = new Uint8Array(FFLCharModelSource_size);
			const view = new DataView(u8.buffer);
			view.setUint32(0, obj.dataSource >>> 0, true);
			view.setUint32(4, obj.pBuffer, true);
			return u8;
		}
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
		static _descOrExpFlagToModelDesc(descOrExpFlag, defaultDesc = FFLCharModelDescDefault) {
			if (!descOrExpFlag && typeof descOrExpFlag !== "number") return defaultDesc;
			if (typeof descOrExpFlag === "number" || Array.isArray(descOrExpFlag)) descOrExpFlag = makeExpressionFlag(descOrExpFlag);
			/** Shallow clone of {@link defaultDesc}. */
			let newModelDesc = Object.assign({}, defaultDesc);
			if (descOrExpFlag instanceof Uint32Array) newModelDesc.allExpressionFlag = descOrExpFlag;
			else if (typeof descOrExpFlag === "object") newModelDesc = descOrExpFlag;
			else throw new TypeError("Unexpected type for descOrExpFlag");
			return newModelDesc;
		}
		/**
		* This is the method that populates meshes
		* from the internal FFLiCharModel instance.
		* @param {Module} module - Module to pass to DrawParam.toMesh to access mesh data.
		* @private
		*/
		_addCharModelMeshes(module) {
			console.assert(this.meshes, "_addCharModelMeshes: this.meshes is null or undefined, was this CharModel disposed?");
			/** @type {import('./materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo|null} */
			let colorInfo = null;
			if ("colorInfo" in this._materialClass.prototype) colorInfo = this.getColorInfo();
			for (let shapeType = 0; shapeType < CharModel.FFLiShapeType.MAX; shapeType++) {
				const ptr = this._model.getDrawParamPtr(shapeType);
				const drawParam = new DrawParam(module.HEAPU8, ptr);
				if (!drawParam.primitiveParam.indexCount) continue;
				const mesh = drawParam.toMesh(this._materialClass, module, this._textureManager);
				mesh.renderOrder = drawParam.modulateParam.type + 1;
				if ("colorInfo" in mesh.material) mesh.material.colorInfo = colorInfo;
				switch (shapeType) {
					case CharModel.FFLiShapeType.OPA_FACELINE:
						/** @private */
						this._facelineMesh = mesh;
						break;
					case CharModel.FFLiShapeType.XLU_MASK:
						/** @private */
						this._maskMesh = mesh;
						break;
				}
				this.meshes.add(mesh);
			}
		}
		/**
		* Calculates the bounding box from the meshes.
		* @returns {THREE.Box3} The bounding box.
		* @private
		*/
		_getBoundingBox() {
			const excludeFromBox = /* @__PURE__ */ new Set([FFLModulateType.SHAPE_MASK, FFLModulateType.SHAPE_GLASS]);
			const box = /* @__PURE__ */ new three.Box3();
			for (const child of this.meshes.children) {
				if (excludeFromBox.has(child.geometry.userData.modulateType)) continue;
				box.expandByObject(child);
			}
			return box;
		}
		/**
		* @returns {THREE.Color} The favorite color as THREE.Color.
		* @private
		*/
		_getFavoriteColor() {
			const mod = this._module;
			const favoriteColor = this.charInfo.favoriteColor;
			/** Allocate return pointer. */
			const colorPtr = mod._malloc(FFLColor_size);
			mod._FFLGetFavoriteColor(colorPtr, favoriteColor);
			const color = _getFFLColor(mod.HEAPF32, colorPtr);
			mod._free(colorPtr);
			return color;
		}
		/**
		* Frees and deletes the FFLCharModel, which can be done after rendering textures.
		* This is not the same as `dispose()` which cleans up the scene.
		* @private
		*/
		_finalizeCharModel() {
			if (this._ptr) {
				this._module._FFLDeleteCharModel(this._ptr);
				this._module._free(this._ptr);
				this._ptr = 0;
			}
			this._model = null;
		}
		/**
		* Sets the faceline texture from the RenderTarget.
		* @param {THREE.RenderTarget} target - RenderTarget for the faceline texture.
		* @throws {Error} CharModel must be initialized with OPA_FACELINE in meshes.
		* @private
		*/
		_setFaceline(target) {
			console.assert(target && target.texture, "_setFaceline: passed in RenderTarget is invalid");
			this._facelineTarget = target;
			if (this._isTexOnly) return;
			const mesh = this._facelineMesh;
			console.assert(mesh, "_setFaceline: faceline shape does not exist");
			/** @type {THREE.Texture & {_target: THREE.RenderTarget}} */ target.texture._target = target;
			mesh.material.map = target.texture;
			mesh.material.needsUpdate = true;
		}
	};
	/** @enum {number} */
	const PantsColor = {
		GrayNormal: 0,
		BluePresent: 1,
		RedRegular: 2,
		GoldSpecial: 3
	};
	/** @type {Object<PantsColor, THREE.Color>} */
	const pantsColors = {
		[PantsColor.GrayNormal]: /* @__PURE__ */ new three.Color(4212558),
		[PantsColor.BluePresent]: /* @__PURE__ */ new three.Color(2637946),
		[PantsColor.RedRegular]: /* @__PURE__ */ new three.Color(7348245),
		[PantsColor.GoldSpecial]: /* @__PURE__ */ new three.Color(12623920)
	};
	/** @package */
	const FFLDrawParam_size = 104;
	/** @package */
	var CharModelAccessor = class {
		/**
		* @param {Module} module - The Emscripten module.
		* @param {number} ptr - Pointer to the type.
		* @param {FFLCharModelDesc} desc - FFLCharModelDesc
		*/
		constructor(module, ptr, desc) {
			/** @private */
			this._module = module;
			/** @private */
			this._dv = new DataView(module.HEAPU8.buffer, ptr);
			/** @public */
			this.ptr = ptr;
			/** @public */
			this.modelDesc = desc;
		}
		getCharInfo() {
			return _unpackFFLiCharInfo(this._module.HEAPU8, this.ptr);
		}
		/**
		* Get the texture resolution.
		* @returns {number} The texture resolution.
		* @package
		*/
		getResolution() {
			return this.modelDesc.resolution & 1073741823;
		}
		/**
		* @returns {number} Pointer to charModelDesc.allExpressionFlag.
		* @public
		*/
		getExpressionFlagPtr() {
			return this.ptr + 288 + 4;
		}
		/**
		* Returns the value for whether the CharModel was created without shapes.
		* @returns {boolean} Whether the CharModel was created without shapes.
		* @package
		*/
		isTexOnly() {
			return (this.modelDesc.modelFlag & FFLModelFlag.NEW_MASK_ONLY) !== 0;
		}
		/**
		* @returns {number} The current expression for this CharModel.
		* @public
		*/
		getExpression() {
			return this._dv.getUint32(312, true);
		}
		getTempObjectPtr() {
			return this._dv.getUint32(316, true);
		}
		/**
		* @returns {number} Pointer to pTextureTempObject->facelineTexture.
		* @public
		*/
		getFacelineTempObjectPtr() {
			return this.getTempObjectPtr() + 904;
		}
		/**
		* @returns {number} Pointer to pTextureTempObject->maskTextures.
		* @public
		*/
		getMaskTempObjectPtr() {
			return this.getTempObjectPtr();
		}
		/**
		* @returns {Uint32Array} Array of pointers to DrawParams for each expression's mask.
		* @public
		*/
		getMaskDrawParamPtrs() {
			/** offset = maskTextures (0)->pRawMaskDrawParam */
			const ptr = this.getTempObjectPtr() + 340;
			return new Uint32Array(this._module.HEAPU8.buffer, ptr, FFLExpression.MAX);
		}
		/**
		* @param {number} shapeType - FFLiShapeType
		* @returns {number} Pointer to the FFLDrawParam.
		*/
		getDrawParamPtr(shapeType) {
			return this.ptr + 320 + FFLDrawParam_size * shapeType;
		}
		/**
		* @returns {Uint32Array} Pointers to FFLiRenderTexture for each mask's expression.
		* @public
		*/
		getMaskRenderTextures() {
			const pRenderTextures = new Uint32Array(FFLExpression.MAX);
			for (let i = 0; i < FFLExpression.MAX; i++) pRenderTextures[i] = this._dv.getUint32(1644 + 4 * i, true);
			return pRenderTextures;
		}
		/**
		* PartsTransform with THREE.Vector3 type.
		* @typedef {Object<string, THREE.Vector3>} PartsTransform
		* @property {THREE.Vector3} hatTranslate
		* @property {THREE.Vector3} headFrontRotate
		* @property {THREE.Vector3} headFrontTranslate
		* @property {THREE.Vector3} headSideRotate
		* @property {THREE.Vector3} headSideTranslate
		* @property {THREE.Vector3} headTopRotate
		* @property {THREE.Vector3} headTopTranslate
		* @public
		*/
		/**
		* Accesses partsTransform in FFLiCharModel,
		* converting every FFLVec3 to THREE.Vector3.
		* @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
		* @public
		*/
		getPartsTransform() {
			const array = new Float32Array(this._module.HEAPU8.buffer, this.ptr + 1960);
			const getVec3 = (offset) => new three.Vector3().fromArray(array, offset);
			return {
				hatTranslate: getVec3(0),
				headFrontRotate: getVec3(3),
				headFrontTranslate: getVec3(6),
				headSideRotate: getVec3(9),
				headSideTranslate: getVec3(12),
				headTopRotate: getVec3(15),
				headTopTranslate: getVec3(18)
			};
		}
	};
	/** @typedef {FFLCharModelDesc|Array<FFLExpression>|FFLExpression|Uint32Array|null} CharModelDescOrExpressionFlag */
	const FFLCharModelSource_size = 10;
	/**
	* @typedef {Object} FFLCharModelSource
	* @property {number} dataSource - Originally FFLDataSource enum.
	* @property {number} pBuffer
	* @property {number} index - Only for default, official, MiddleDB; unneeded for raw data
	*/
	/**
	* NOTE: FFLResourceType has been removed from here.
	* @typedef {Object} FFLCharModelDesc
	* @property {number} resolution - Texture resolution for faceline/mask. It's recommended to only use powers of two.
	* @property {Uint32Array} allExpressionFlag - Expression flag, created by {@link makeExpressionFlag}
	* @property {FFLModelFlag} modelFlag
	*/
	/**
	* Converts the input data and allocates it into FFLCharModelSource.
	* Note that this allocates pBuffer so you must free it when you are done.
	* @param {ConstructorParameters<typeof CharModel>[1]} data - Data input.
	* @param {Module} module - Module to allocate and access the buffer through.
	* @returns {FFLCharModelSource} The CharModelSource with the data specified.
	* @throws {Error} data must be Uint8Array. Data must be a known type.
	* @package
	* @todo TODO: This used to support FFLiCharInfo as an object. Should it still do so?
	*/
	function _allocateModelSource(data, module) {
		/** Allocate maximum size. */
		const bufferPtr = module._malloc(FFLiCharInfo_size);
		const modelSource = {
			dataSource: 6,
			pBuffer: bufferPtr,
			index: 0
		};
		/** @param {Uint8Array} src - Source data in StudioCharInfo format. */
		function setStudioData(src) {
			const charInfoData = _studioToFFLiCharInfo(src);
			module.HEAPU8.set(charInfoData, bufferPtr);
		}
		/**
		* Gets CharInfo from calling a function.
		* @param {Uint8Array} data - The input data.
		* @param {number} size - The size to allocate.
		* @param {string} funcName - The function on the module to call.
		* @throws {Error} Throws if the function returned false.
		* @private
		*/
		function callGetCharInfoFunc(data, size, funcName) {
			const dataPtr = module._malloc(size);
			module.HEAPU8.set(data, dataPtr);
			const result = module[funcName](bufferPtr, dataPtr);
			module._free(dataPtr);
			if (!result) {
				module._free(bufferPtr);
				throw new Error(`_allocateModelSource: call to ${funcName} returned false, CharInfo verification probably failed`);
			}
		}
		switch (data.length) {
			case FFLStoreData_size:
				callGetCharInfoFunc(data, FFLStoreData_size, "_FFLpGetCharInfoFromStoreData");
				break;
			case 74:
			case 76:
				callGetCharInfoFunc(data, 74, "_FFLpGetCharInfoFromMiiDataOfficialRFL");
				break;
			case FFLiCharInfo_size:
				module.HEAPU8.set(data, bufferPtr);
				break;
			case 47:
				data = _studioURLObfuscationDecode(data);
				setStudioData(data);
				break;
			case 46:
				setStudioData(data);
				break;
			case 88: throw new Error("_allocateModelSource: NX CharInfo is not supported.");
			case 48:
			case 68: throw new Error("_allocateModelSource: NX CoreData/StoreData is not supported.");
			case 92:
			case 72: throw new Error("_allocateModelSource: Input needs to be padded to 96 bytes with checksum (FFLStoreData).");
			default:
				module._free(bufferPtr);
				throw new Error(`_allocateModelSource: Unknown length for character data: ${data.length}`);
		}
		return modelSource;
	}
	/**
	* Static default for FFLCharModelDesc.
	* @type {FFLCharModelDesc}
	* @readonly
	* @public
	*/
	const FFLCharModelDescDefault = {
		resolution: 512,
		allExpressionFlag: new Uint32Array([
			1,
			0,
			0
		]),
		modelFlag: FFLModelFlag.NORMAL
	};
	/**
	* Creates an expression flag to be used in FFLCharModelDesc.
	* Use this whenever you need to describe which expression,
	* or expressions, you want to be able to use in the CharModel.
	* @param {Array<FFLExpression>|FFLExpression} expressions - Either a single expression
	* index or an array of expression indices. See {@link FFLExpression} for min/max.
	* @returns {Uint32Array} FFLAllExpressionFlag type of three 32-bit integers.
	* @throws {Error} expressions must be in range and less than {@link FFLExpression.MAX}.
	*/
	function makeExpressionFlag(expressions) {
		/**
		* @param {FFLExpression} i - Expression index to check.
		* @throws {Error} input out of range
		*/
		function checkRange(i) {
			if (i >= FFLExpression.MAX) throw new Error(`makeExpressionFlag: input out of range: got ${i}, max: ${FFLExpression.MAX}`);
		}
		/** FFLAllExpressionFlag */
		const flags = /* @__PURE__ */ new Uint32Array([
			0,
			0,
			0
		]);
		let checkForChangeShapes = true;
		if (typeof expressions === "number") {
			expressions = [expressions];
			checkForChangeShapes = false;
		} else if (!Array.isArray(expressions)) throw new TypeError("makeExpressionFlag: expected array or single number");
		for (const index of expressions) {
			checkRange(index);
			if (checkForChangeShapes) checkExpressionChangesShapes(index, true);
			/** Determine which 32-bit block. */
			const part = Math.floor(index / 32);
			/** Determine the bit within the block. */
			const bitIndex = index % 32;
			flags[part] |= 1 << bitIndex;
		}
		return flags;
	}
	/**
	* Checks if the expression index disables any shapes in the
	* CharModel, meant to be used when setting multiple indices.
	* @param {FFLExpression} i - Expression index to check.
	* @param {boolean} [warn] - Whether to log using {@link console.warn}.
	* @returns {boolean} Whether the expression changes shapes.
	*/
	function checkExpressionChangesShapes(i, warn = false) {
		/** Expressions disabling nose: dog/cat, blank */
		const expressionsDisablingNose = /* @__PURE__ */ new Set([
			49,
			50,
			51,
			52,
			61,
			62
		]);
		/** Expressions disabling mask: blank */
		const expressionsDisablingMask = /* @__PURE__ */ new Set([61, 62]);
		const prefix = `checkExpressionChangesShapes: An expression was enabled (${i}) that is meant to disable nose or mask shape for the entire CharModel, so it is only recommended to set this as a single expression rather than as one of multiple.`;
		if (expressionsDisablingMask.has(i)) {
			warn && console.warn(`${prefix} (in this case, MASK SHAPE so there is supposed to be NO FACE)`);
			return true;
		}
		if (expressionsDisablingNose.has(i)) {
			warn && console.warn(`${prefix} (nose shape)`);
			return true;
		}
		return false;
	}
	/**
	* @param {Function} material - Class constructor for the material to test.
	* @returns {boolean} Whether or not the material class supports FFL swizzled (modulateMode) textures.
	* @public
	*/
	const matSupportsFFL = (material) => "modulateMode" in material.prototype;
	/**
	* Interprets and converts FFLDrawParam, which
	* represents a mesh/draw call, for use with Three.js.
	* @package
	*/
	var DrawParam = class DrawParam {
		/** @private */
		static FFLAttributeBufferType = {
			POSITION: 0,
			TEXCOORD: 1,
			NORMAL: 2,
			TANGENT: 3,
			COLOR: 4,
			MAX: 5
		};
		/**
		* @typedef {Object} FFLAttributeBuffer
		* @property {number} size
		* @property {number} stride
		* @property {number} ptr
		*/
		/**
		* @typedef {Object} FFLModulateParam
		* @property {FFLModulateMode} mode
		* @property {FFLModulateType} type
		* @property {number} pColorR - Pointer to FFLColor
		* @property {number} pColorG - Pointer to FFLColor
		* @property {number} pColorB - Pointer to FFLColor
		* @property {number} pTexture2D
		*/
		/**
		* @typedef {Object} FFLPrimitiveParam
		* @property {number} primitiveType
		* @property {number} indexCount
		* @property {number} pAdjustMatrix
		* @property {number} pIndexBuffer
		*/
		/**
		* @typedef {Object} FFLDrawParam
		* @property {Array<FFLAttributeBuffer>} attributeBuffers
		* @property {FFLModulateParam} modulateParam
		* @property {number} cullMode
		* @property {FFLPrimitiveParam} primitiveParam
		* @private
		*/
		/**
		* @param {Uint8Array} u8 - module.HEAPU8
		* @param {number} ptr - Pointer to the FFLDrawParam.
		*/
		constructor(u8, ptr) {
			const view = new DataView(u8.buffer, ptr);
			const FFLAttributeBuffer_size = 12;
			this.attributeBuffers = Array.from({ length: DrawParam.FFLAttributeBufferType.MAX });
			for (let i = 0; i < this.attributeBuffers.length; i++) this.attributeBuffers[i] = {
				size: view.getUint32(i * FFLAttributeBuffer_size + 0, true),
				stride: view.getUint32(i * FFLAttributeBuffer_size + 4, true),
				ptr: view.getUint32(i * FFLAttributeBuffer_size + 8, true)
			};
			this.modulateParam = {
				mode: view.getUint32(60, true),
				type: view.getUint32(64, true),
				pColorR: view.getUint32(68, true),
				pColorG: view.getUint32(72, true),
				pColorB: view.getUint32(76, true),
				pTexture2D: view.getUint32(80, true)
			};
			this.primitiveParam = {
				primitiveType: view.getUint32(88, true),
				indexCount: view.getUint32(92, true),
				pAdjustMatrix: view.getUint32(96, true),
				pIndexBuffer: view.getUint32(100, true)
			};
			this.cullMode = view.getUint32(84, true);
		}
		/**
		* Converts FFLDrawParam into a THREE.Mesh.
		* Binds geometry, texture, and material parameters.
		* @param {MaterialConstructor} materialClass - Class for the material (constructor).
		* @param {Module} module - The Emscripten module.
		* @param {TextureManager} texManager - The {@link TextureManager} instance
		* for which to look for textures referenced by the DrawParam.
		* @returns {THREE.Mesh} The THREE.Mesh instance.
		* @public
		*/
		toMesh(materialClass, module, texManager) {
			console.assert(texManager, "DrawParam.toMesh: Passed in TextureManager is null or undefined, is it constructed?");
			console.assert(typeof materialClass === "function", "DrawParam.toMesh: materialClass is unexpectedly not a function.");
			console.assert(this.primitiveParam.indexCount, "DrawParam.toMesh: Index count is 0, indicating shape is empty. Check that before it gets passed into this function.");
			const geometry = DrawParam._bindDrawParamGeometry(this.attributeBuffers, this.primitiveParam, module);
			if ("modifyBufferGeometry" in materialClass && typeof materialClass.modifyBufferGeometry === "function") materialClass.modifyBufferGeometry(this, geometry);
			const side = [
				three.DoubleSide,
				three.FrontSide,
				three.BackSide,
				three.DoubleSide
			][this.cullMode];
			console.assert(side !== void 0, `DrawParam.toMesh: Unexpected value for FFLCullMode: ${this.cullMode}`);
			const texture = DrawParam._getTextureFromModulateParam(this.modulateParam, texManager);
			const isFFLMaterial = matSupportsFFL(materialClass);
			const params = DrawParam._applyModulateParam(this.modulateParam, module, isFFLMaterial);
			const materialParam = {
				side,
				map: texture,
				...params
			};
			if (geometry.attributes.tangent === void 0 && "useSpecularModeBlinn" in materialClass.prototype)
 /** @type {import('./materials/FFLShaderMaterial.js').FFLShaderMaterialParameters} */
			materialParam.useSpecularModeBlinn = true;
			const material = new materialClass(materialParam);
			const mesh = new three.Mesh(geometry, material);
			const pMtx = this.primitiveParam.pAdjustMatrix;
			if (pMtx !== 0) DrawParam._applyAdjustMatrixToMesh(pMtx, mesh, module.HEAPF32);
			if (mesh.geometry.userData) {
				mesh.geometry.userData.modulateMode = this.modulateParam.mode;
				mesh.geometry.userData.modulateType = this.modulateParam.type;
				mesh.geometry.userData.modulateColor = params.color instanceof three.Color ? [
					params.color.r,
					params.color.g,
					params.color.b,
					1
				] : [
					1,
					1,
					1,
					1
				];
				mesh.geometry.userData.cullMode = this.cullMode;
			}
			return mesh;
		}
		/**
		* Binds attributes from DrawParam into a new THREE.BufferGeometry.
		* @param {Array<FFLAttributeBuffer>} attributes - {@link FFLDrawParam.attributeBuffers}
		* @param {FFLPrimitiveParam} primitiveParam - {@link FFLDrawParam.primitiveParam}
		* @param {Module} module - The Emscripten module from which to read the heap.
		* @returns {THREE.BufferGeometry} The geometry.
		* @private
		* @todo Does not yet handle color stride = 0
		*/
		static _bindDrawParamGeometry(attributes, primitiveParam, module) {
			/**
			* @param {string} typeStr - The type of the attribute.
			* @param {number} stride - The stride to display.
			* @returns {void}
			*/
			const unexpectedStride = (typeStr, stride) => console.assert(false, `_bindDrawParamGeometry: Unexpected stride for attribute ${typeStr}: ${stride}`);
			const positionBuffer = attributes[this.FFLAttributeBufferType.POSITION];
			console.assert(positionBuffer.size, "_bindDrawParamGeometry: Position buffer must not have size of 0");
			const vertexCount = positionBuffer.size / positionBuffer.stride;
			/** Create BufferGeometry. */
			const geometry = new three.BufferGeometry();
			const indexPtr = primitiveParam.pIndexBuffer / 2;
			const indexCount = primitiveParam.indexCount;
			const indices = module.HEAPU16.slice(indexPtr, indexPtr + indexCount);
			geometry.setIndex(new three.Uint16BufferAttribute(indices, 1));
			for (const typeStr in attributes) {
				const buffer = attributes[typeStr];
				const type = Number.parseInt(typeStr);
				if (buffer.size === 0) continue;
				switch (type) {
					case this.FFLAttributeBufferType.POSITION:
						if (buffer.stride === 16) {
							/** float data type */
							const ptr = buffer.ptr / 4;
							const data = module.HEAPF32.slice(ptr, ptr + vertexCount * 4);
							const interleavedBuffer = new three.InterleavedBuffer(data, 4);
							geometry.setAttribute("position", new three.InterleavedBufferAttribute(interleavedBuffer, 3, 0));
						} else if (buffer.stride === 6) {
							/** half-float data type */
							const ptr = buffer.ptr / 2;
							const data = module.HEAPU16.slice(ptr, ptr + vertexCount * 3);
							geometry.setAttribute("position", new three.Float16BufferAttribute(data, 3));
						} else unexpectedStride(typeStr, buffer.stride);
						break;
					case this.FFLAttributeBufferType.NORMAL: {
						const data = module.HEAP8.slice(buffer.ptr, buffer.ptr + buffer.size);
						geometry.setAttribute("normal", new three.Int8BufferAttribute(data, buffer.stride, true));
						break;
					}
					case this.FFLAttributeBufferType.TANGENT: {
						const data = module.HEAP8.slice(buffer.ptr, buffer.ptr + buffer.size);
						geometry.setAttribute("tangent", new three.Int8BufferAttribute(data, buffer.stride, true));
						break;
					}
					case this.FFLAttributeBufferType.TEXCOORD:
						if (buffer.stride === 8) {
							/** float data type */
							const ptr = buffer.ptr / 4;
							const data = module.HEAPF32.slice(ptr, ptr + vertexCount * 2);
							geometry.setAttribute("uv", new three.Float32BufferAttribute(data, 2));
						} else if (buffer.stride === 4) {
							/** half-float data type */
							const ptr = buffer.ptr / 2;
							const data = module.HEAPU16.slice(ptr, ptr + vertexCount * 2);
							geometry.setAttribute("uv", new three.Float16BufferAttribute(data, 2));
						} else unexpectedStride(typeStr, buffer.stride);
						break;
					case this.FFLAttributeBufferType.COLOR: {
						if (buffer.stride === 0) break;
						const data = module.HEAPU8.slice(buffer.ptr, buffer.ptr + buffer.size);
						geometry.setAttribute("_color", new three.Uint8BufferAttribute(data, buffer.stride, true));
						break;
					}
				}
			}
			return geometry;
		}
		/**
		* Retrieves a texture from ModulateParam.
		* Does not assign texture for faceline or mask types.
		* @param {FFLModulateParam} modulateParam - drawParam.modulateParam.
		* @param {TextureManager} textureManager - The {@link TextureManager} instance
		* for which to look for the texture referenced.
		* @returns {THREE.Texture|null} The texture if found.
		* @private
		*/
		static _getTextureFromModulateParam(modulateParam, textureManager) {
			if (!modulateParam.pTexture2D || modulateParam.pTexture2D === 1) return null;
			const texturePtr = modulateParam.pTexture2D;
			const texture = textureManager.get(texturePtr);
			console.assert(texture, `_getTextureFromModulateParam: Texture not found for ${texturePtr}.`);
			if ((/* @__PURE__ */ new Set([
				FFLModulateType.SHAPE_FACELINE,
				FFLModulateType.SHAPE_CAP,
				FFLModulateType.SHAPE_GLASS
			])).has(modulateParam.type)) {
				texture.wrapS = three.MirroredRepeatWrapping;
				texture.wrapT = three.MirroredRepeatWrapping;
				texture.needsUpdate = true;
			}
			return texture;
		}
		/**
		* Retrieves blending parameters based on the FFLModulateType.
		* Will only actually return anything for mask and faceline shapes.
		* @param {FFLModulateType} modulateType - The modulate type.
		* @param {FFLModulateMode} [modulateMode] - The modulate mode, used to
		* differentiate body/pants modulate types from mask modulate types.
		* @returns An object containing blending parameters for
		* the Three.js material constructor, or an empty object.
		* @throws {Error} Unknown modulate type
		* @private
		*/
		static _getBlendOptionsFromModulateType(modulateType, modulateMode) {
			if (modulateMode !== 0 && modulateType >= FFLModulateType.SHAPE_MAX && modulateType <= FFLModulateType.MOLE) return {
				blending: three.CustomBlending,
				blendSrc: three.OneMinusDstAlphaFactor,
				blendSrcAlpha: three.SrcAlphaFactor,
				blendDst: three.DstAlphaFactor
			};
			else if (modulateMode !== 0 && modulateType >= FFLModulateType.FACE_MAKE && modulateType <= FFLModulateType.FILL) return {
				blending: three.CustomBlending,
				blendSrc: three.SrcAlphaFactor,
				blendDst: three.OneMinusSrcAlphaFactor,
				blendSrcAlpha: three.OneFactor,
				blendDstAlpha: three.OneFactor
			};
			return {};
		}
		/**
		* Returns an object of parameters for a Three.js material constructor, based on {@link FFLModulateParam}.
		* @param {FFLModulateParam} modulateParam - Property `modulateParam` of FFLDrawParam.
		* @param {Module} module - The Emscripten module for accessing color pointers in heap.
		* @param {boolean} [forFFLMaterial] - Whether or not to include
		* modulateMode/Type parameters for material parameters.
		* @returns Parameters for creating a Three.js material.
		* @private
		*/
		static _applyModulateParam(modulateParam, module, forFFLMaterial = true) {
			/** @type {THREE.Color|Array<THREE.Color>|null} */
			let color = null;
			const f32 = module.HEAPF32;
			if (modulateParam.pColorG !== 0 && modulateParam.pColorB !== 0) color = [
				_getFFLColor(f32, modulateParam.pColorR),
				_getFFLColor(f32, modulateParam.pColorG),
				_getFFLColor(f32, modulateParam.pColorB)
			];
			else if (modulateParam.pColorR !== 0) color = _getFFLColor(f32, modulateParam.pColorR);
			const opacity = modulateParam.type === FFLModulateType.FILL ? 0 : 1;
			const transparent = modulateParam.type >= FFLModulateType.SHAPE_MASK;
			const lightEnable = !(modulateParam.type >= FFLModulateType.SHAPE_MAX && modulateParam.mode !== FFLModulateMode.CONSTANT);
			/** Do not include the parameters if forFFLMaterial is false. */
			const modulateModeType = forFFLMaterial ? {
				modulateMode: modulateParam.mode,
				modulateType: modulateParam.type
			} : {};
			const param = Object.assign(modulateModeType, {
				color,
				opacity,
				transparent,
				depthWrite: !transparent,
				...this._getBlendOptionsFromModulateType(modulateParam.type, modulateParam.mode)
			});
			if (!lightEnable)
 /** @type {Object<string, *>} */ param.lightEnable = lightEnable;
			return param;
		}
		/**
		* Applies transformations in pAdjustMatrix within a FFLDrawParam to a mesh.
		* @param {number} pMtx - Pointer to rio::Matrix34f.
		* @param {THREE.Object3D} mesh - The mesh to apply transformations to.
		* @param {Float32Array} heapf32 - HEAPF32 buffer view within {@link Module}.
		* @private
		*/
		static _applyAdjustMatrixToMesh(pMtx, mesh, heapf32) {
			const m = new Float32Array(heapf32.buffer, pMtx, 12);
			mesh.scale.set(m[0], m[5], m[10]);
			mesh.position.set(m[3], m[7], m[11]);
		}
	};
	/** @package */
	const CharModelTextures = {
		initialize(charModel, renderer, module, texMgr, matTexClass, maskTargets, faceColor) {
			console.assert(renderer.render !== void 0, "CharModelTextures: renderer is an unexpected type (cannot find .render).");
			const pRawMaskDrawParam = charModel.getMaskDrawParamPtrs();
			const faceTarget = this._drawFacelineTexture(charModel, renderer, module, texMgr, faceColor, matTexClass);
			const clearAlpha = renderer.getClearAlpha();
			clearAlpha !== 0 && renderer.setClearAlpha(0);
			this._drawMaskTextures(charModel, pRawMaskDrawParam, maskTargets, renderer, module, texMgr, matTexClass);
			clearAlpha !== 0 && renderer.setClearAlpha(clearAlpha);
			return faceTarget;
		},
		FacelinePartCount: 3,
		MaskPartCount: 8,
		_unpackDrawParamArray(u8, ptr, count) {
			const params = Array.from({ length: count });
			for (let type = 0; type < count; type++) params[type] = new DrawParam(u8, ptr + FFLDrawParam_size * type);
			return params;
		},
		_drawFacelineTexture(charModel, renderer, module, texMgr, color, materialClass) {
			const facelineTempObjectPtr = charModel.getFacelineTempObjectPtr();
			module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr);
			const drawParams = this._unpackDrawParamArray(module.HEAPU8, facelineTempObjectPtr, this.FacelinePartCount).filter((dp) => dp && dp.modulateParam.pTexture2D !== 0);
			if (drawParams.length === 0) return null;
			const offscreenScene = new three.Scene();
			offscreenScene.background = color;
			for (const param of drawParams) offscreenScene.add(param.toMesh(materialClass, module, texMgr));
			if ("needsFacelineAlpha" in materialClass && materialClass.needsFacelineAlpha) {
				const mesh = _getBGClearMesh(color);
				mesh.renderOrder = -1;
				offscreenScene.add(mesh);
			}
			const height = charModel.getResolution();
			const width = height / 2;
			const options = {
				depthBuffer: false,
				stencilBuffer: false,
				wrapS: three.MirroredRepeatWrapping,
				wrapT: three.MirroredRepeatWrapping
			};
			const target = createAndRenderToTarget(offscreenScene, _getIdentCamera(), renderer, width, height, options);
			module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModel.ptr, FFL.singleResourceType);
			_disposeMany(offscreenScene);
			return target;
		},
		_drawMaskTextures(charModel, maskParamPtrs, targets, renderer, module, texMgr, materialClass) {
			const maskTempObjectPtr = charModel.getMaskTempObjectPtr();
			const expressionFlagPtr = charModel.getExpressionFlagPtr();
			/** @type {Array<THREE.Scene>} */
			const scenes = [];
			for (let i = 0; i < maskParamPtrs.length; i++) {
				if (maskParamPtrs[i] === 0) continue;
				const maskParamPtr = maskParamPtrs[i];
				const rawMaskDrawParam = this._unpackDrawParamArray(module.HEAPU8, maskParamPtr, this.MaskPartCount);
				module._FFLiInvalidateRawMask(maskParamPtr);
				const res = charModel.getResolution();
				const { target, scene } = this._drawMaskTexture(res, rawMaskDrawParam, renderer, module, texMgr, materialClass);
				targets[i] = target;
				scenes.push(scene);
			}
			for (const scene of scenes) _disposeMany(scene);
			module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, FFL.singleResourceType);
			module._FFLiDeleteTextureTempObject(charModel.ptr);
		},
		_drawMaskTexture(resolution, rawMaskParam, renderer, module, texMgr, materialClass) {
			const drawParams = rawMaskParam.filter((dp) => dp && dp.primitiveParam.indexCount !== 0);
			console.assert(drawParams.length, "_drawMaskTexture: All DrawParams are empty.");
			const options = {
				depthBuffer: false,
				stencilBuffer: false
			};
			const offscreenScene = new three.Scene();
			offscreenScene.background = null;
			for (const param of drawParams) offscreenScene.add(param.toMesh(materialClass, module, texMgr));
			return {
				target: createAndRenderToTarget(offscreenScene, _getIdentCamera(), renderer, resolution, resolution, options),
				scene: offscreenScene
			};
		}
	};
	/**
	* Gets a plane whose color and opacity can be set.
	* This can be used to simulate background clear, or specifically
	* to set the background's color to a value but alpha to 0.
	* @param {THREE.Color} color - The color of the plane.
	* @param {number} [opacity] - The opacity of the plane, default is transparent.
	* @returns {THREE.Mesh} The plane with the color and opacity specified.
	* @package
	*/
	const _getBGClearMesh = (color, opacity = 0) => new three.Mesh(new three.PlaneGeometry(2, 2), new three.MeshBasicMaterial({
		color,
		opacity,
		transparent: true,
		blending: three.NoBlending
	}));
	/**
	* Utilities for converting textures within a CharModel.
	* {@link ModelTexturesConverter.convModelTexturesToRGBA} adds colors to textures so
	* they can be used with any material, or a model export.
	* {@link ModelTexturesConverter.convModelTargetsToDataTex} adds texture data by converting
	* render targets to {@link THREE.DataTexture}, allowing exports.
	*/
	const ModelTexturesConverter = {
		convModelTexturesToRGBA(charModel, renderer, materialTextureClass) {
			const convertTextureForTypes = /* @__PURE__ */ new Set([
				FFLModulateType.SHAPE_CAP,
				FFLModulateType.SHAPE_NOSELINE,
				FFLModulateType.SHAPE_GLASS
			]);
			for (const mesh of charModel.meshes.children) if (mesh.geometry.userData.modulateType !== void 0 && mesh.material.map && convertTextureForTypes.has(mesh.geometry.userData.modulateType)) {
				const target = this._texDrawRGBATarget(renderer, mesh.material, mesh.geometry.userData, materialTextureClass);
				charModel._maskTargets.push(target);
			}
		},
		_texDrawRGBATarget(renderer, material, userData, materialTextureClass) {
			const scene = new three.Scene();
			const bgClearRGBMesh = _getBGClearMesh(material.color);
			scene.add(bgClearRGBMesh);
			console.assert(material.map, "_texDrawRGBATarget: material.map is null or undefined");
			/** Shortcut to the existing texture. */
			const tex = material.map;
			const texMat = new materialTextureClass({
				map: tex,
				modulateMode: userData.modulateMode,
				color: material.color,
				side: three.DoubleSide,
				lightEnable: false
			});
			texMat.blending = three.NoBlending;
			texMat.transparent = true;
			const plane = new three.PlaneGeometry(2, 2);
			const textureMesh = new three.Mesh(plane, texMat);
			scene.add(textureMesh);
			const target = createAndRenderToTarget(scene, _getIdentCamera(_isWebGPU(renderer)), renderer, tex.image.width, tex.image.height, {
				wrapS: tex.wrapS,
				wrapT: tex.wrapT,
				depthBuffer: false,
				stencilBuffer: false
			});
			/** @type {THREE.Texture & {_target: THREE.RenderTarget}} */
			target.texture._target = target;
			/** @type {THREE.Texture} */ material.map.dispose();
			material.map = target.texture;
			material.color = /* @__PURE__ */ new three.Color(1, 1, 1);
			userData.modulateMode = 1;
			return target;
		},
		async convModelTargetsToDataTex(charModel, renderer) {
			for (const mesh of charModel.meshes.children) {
				const tex = mesh.material.map;
				if (!tex) continue;
				console.assert(tex.format === three.RGBAFormat, "convModelTargetsToDataTex: found a texture that is not of format THREE.RGBAFormat, but, this function is only meant to be used if all textures in CharModel meshes are RGBA (so render targets)...");
				const target = tex._target;
				console.assert(target, "convModelTargetsToDataTex: mesh.material.map (texture)._target is null or undefined.");
				const data = _isWebGPU(renderer) ? await renderer.readRenderTargetPixelsAsync(target, 0, 0, tex.image.width, tex.image.height) : await renderer.readRenderTargetPixelsAsync(target, 0, 0, tex.image.width, tex.image.height, new Uint8Array(tex.image.width * tex.image.height * 4));
				const dataTex = new three.DataTexture(data, tex.image.width, tex.image.height, three.RGBAFormat, three.UnsignedByteType);
				dataTex.wrapS = tex.wrapS;
				dataTex.wrapT = tex.wrapT;
				dataTex.minFilter = tex.minFilter;
				dataTex.magFilter = tex.magFilter;
				dataTex.needsUpdate = true;
				mesh.material.map = dataTex;
			}
			charModel.disposeTargets();
		}
	};
	/**
	* A material class that renders FFL swizzled (modulateMode) textures.
	* Has no lighting whatsoever, just meant to render 2D planes.
	* @augments {THREE.ShaderMaterial}
	*/
	var TextureShaderMaterial = class extends three.ShaderMaterial {
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
		constructor(options = {}) {
			/** @type {Object<string, THREE.IUniform>} */
			const uniforms = { opacity: { value: 1 } };
			const blankMatrix3 = { value: /* @__PURE__ */ new three.Matrix3() };
			if (Number(three.REVISION) < 151) uniforms.uvTransform = blankMatrix3;
			else uniforms.mapTransform = blankMatrix3;
			super({
				vertexShader: `
				#include <common>
				#include <uv_pars_vertex>

				void main() {
					#include <begin_vertex>
					#include <uv_vertex>
					#include <project_vertex>
				}`,
				fragmentShader: `
				#include <common>
				#include <uv_pars_fragment>
				#include <map_pars_fragment>
				uniform vec3 diffuse;
				uniform float opacity;
				uniform int modulateMode;
				uniform vec3 color1;
				uniform vec3 color2;

				void main() {
					vec4 diffuseColor = vec4( diffuse, opacity );

					#include <map_fragment>
					#include <alphamap_fragment>
				#ifdef USE_MAP
					if (modulateMode == 2) { // FFL_MODULATE_MODE_RGB_LAYERED
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r +
				      color1.rgb * sampledDiffuseColor.g +
				      color2.rgb * sampledDiffuseColor.b,
				      sampledDiffuseColor.a
				    );
				  } else if (modulateMode == 3) { // FFL_MODULATE_MODE_ALPHA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r,
				      sampledDiffuseColor.r
				    );
				  } else if (modulateMode == 4) { // FFL_MODULATE_MODE_LUMINANCE_ALPHA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.g,
				      sampledDiffuseColor.r
				    );
				  } else if (modulateMode == 5) { // FFL_MODULATE_MODE_ALPHA_OPA
				    diffuseColor = vec4(
				      diffuse.rgb * sampledDiffuseColor.r,
				      1.0
				    );
				  }
				#endif

				  // avoids little outline around mask elements
				  if (modulateMode != 0 && diffuseColor.a == 0.0) { // FFL_MODULATE_MODE_CONSTANT
				      discard;
				  }

					gl_FragColor = diffuseColor;
					//#include <colorspace_fragment>
				}`,
				uniforms
			});
			this.lightEnable = false;
			this.modulateType = 0;
			this.setValues(options);
		}
		/**
		* Gets the constant color (diffuse) uniform as THREE.Color.
		* @returns {THREE.Color|null} The constant color, or null if it is not set.
		*/
		get color() {
			return this.uniforms.diffuse ? this.uniforms.diffuse.value : null;
		}
		/**
		* Sets the constant color uniforms from THREE.Color.
		* @param {THREE.Color|Array<THREE.Color>} value -
		* The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
		*/
		set color(value) {
			if (Array.isArray(value)) {
				this.uniforms.diffuse = { value: value[0] };
				this.uniforms.color1 = { value: value[1] };
				this.uniforms.color2 = { value: value[2] };
				return;
			}
			const color3 = value || new three.Color(1, 1, 1);
			/**
			* @type {THREE.Color}
			* @private
			*/
			this._color3 = color3;
			this.uniforms.diffuse = { value: color3 };
		}
		/** @returns {FFLModulateMode|null}The modulateMode value, or null if it is unset. */
		get modulateMode() {
			return this.uniforms.modulateMode ? this.uniforms.modulateMode.value : null;
		}
		/** @param {FFLModulateMode} value - The new modulateMode value. */
		set modulateMode(value) {
			this.uniforms.modulateMode = { value };
		}
		/** @returns {THREE.Texture|null} The texture map, or null if it is unset. */
		get map() {
			return this.uniforms.map ? this.uniforms.map.value : null;
		}
		/** @param {THREE.Texture} value - The new texture map. */
		set map(value) {
			this.uniforms.map = { value };
		}
	};
	const GeometryConversion = {
		convertForGLTF(geometry) {
			if (!(geometry instanceof three.BufferGeometry) || !geometry.attributes) throw new TypeError("convGeometryToGLTFCompatible: geometry is not BufferGeometry with attributes.");
			for (const [key, attr] of Object.entries(geometry.attributes)) {
				const bufferAttribute = attr instanceof three.InterleavedBufferAttribute ? this._interleavedToBufferAttribute(attr) : attr;
				const array = bufferAttribute.array;
				const originalItemSize = bufferAttribute.itemSize;
				const count = bufferAttribute.count;
				/**
				* Size of the target attribute. Force vec3 for "normal".
				* @type {number}
				*/
				const targetItemSize = key.toLowerCase() === "normal" ? 3 : originalItemSize;
				/** @type {Float32Array|Uint8Array} */ let newArray;
				/** Whether the value is normalized. False by default for float attributes. */
				let normalized = false;
				if (array instanceof Float32Array) newArray = targetItemSize === originalItemSize ? array : this._copyFloat32Reduced(array, count, originalItemSize, targetItemSize);
				else if (array instanceof Uint16Array) {
					const float32Full = this._halfArrayToFloat(array);
					newArray = targetItemSize === originalItemSize ? float32Full : this._copyFloat32Reduced(float32Full, count, originalItemSize, targetItemSize);
				} else if (array instanceof Int8Array) newArray = this._snormToFloat(array, count, originalItemSize, targetItemSize);
				else if (array instanceof Uint8Array) {
					newArray = array;
					normalized = true;
				} else throw new TypeError(`convGeometryToGLTFCompatible: Unsupported attribute data type for ${key}: ${array.constructor.name}`);
				geometry.setAttribute(key, new three.BufferAttribute(newArray, targetItemSize, normalized));
			}
		},
		_interleavedToBufferAttribute(attr) {
			const { itemSize, count } = attr;
			const dest = new attr.array.constructor(count * itemSize);
			for (let i = 0; i < count; i++) for (let j = 0; j < itemSize; j++) dest[i * itemSize + j] = attr.getComponent(i, j);
			return new three.BufferAttribute(dest, itemSize);
		},
		_copyFloat32Reduced(src, count, srcItemSize, targetItemSize) {
			const dst = new Float32Array(count * targetItemSize);
			for (let i = 0; i < count; i++) for (let j = 0; j < targetItemSize; j++) dst[i * targetItemSize + j] = src[i * srcItemSize + j];
			return dst;
		},
		_halfToFloat(half) {
			const sign = (half & 32768) >> 15;
			const exponent = (half & 31744) >> 10;
			const mantissa = half & 1023;
			if (exponent === 0) return (sign ? -1 : 1) * Math.pow(2, -14) * (mantissa / Math.pow(2, 10));
			else if (exponent === 31) return mantissa ? NaN : (sign ? -1 : 1) * Infinity;
			return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + mantissa / 1024);
		},
		_halfArrayToFloat(halfArray) {
			const floatArray = new Float32Array(halfArray.length);
			for (let i = 0; i < halfArray.length; i++) floatArray[i] = this._halfToFloat(halfArray[i]);
			return floatArray;
		},
		_snormToFloat(src, count, srcItemSize, targetItemSize) {
			const dst = new Float32Array(count * targetItemSize);
			for (let i = 0; i < count; i++) {
				const baseIn = i * srcItemSize;
				const baseOut = i * targetItemSize;
				if (targetItemSize === 4 && srcItemSize === 4) {
					const x = src[baseIn] / 127;
					const y = src[baseIn + 1] / 127;
					const z = src[baseIn + 2] / 127;
					const w = src[baseIn + 3] / 127;
					const mag = Math.hypot(x, y, z) || 1;
					dst[baseOut] = x / mag;
					dst[baseOut + 1] = y / mag;
					dst[baseOut + 2] = z / mag;
					dst[baseOut + 3] = w;
				} else for (let j = 0; j < targetItemSize; j++) {
					const val = src[baseIn + j];
					dst[baseOut + j] = val < 0 ? val / 128 : val / 127;
				}
			}
			return dst;
		}
	};
	/**
	* @param {Renderer} renderer - The input renderer.
	* @returns {boolean} Whether the renderer is THREE.WebGPURenderer.
	* @package
	*/
	const _isWebGPU = (renderer) => "isWebGPURenderer" in renderer;
	/**
	* Returns an ortho camera that is effectively the same as
	* if you used identity MVP matrix, for rendering 2D planes.
	* @param {boolean} flipY - Flip the Y axis. Default is oriented for OpenGL.
	* @returns {THREE.OrthographicCamera} The orthographic camera.
	* @package
	*/
	function _getIdentCamera(flipY = false) {
		const camera = new three.OrthographicCamera(-1, 1, flipY ? -1 : 1, flipY ? 1 : -1, .1, 10);
		camera.position.z = 1;
		return camera;
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
	function createAndRenderToTarget(scene, camera, renderer, width, height, targetOptions = {}) {
		const options = {
			minFilter: three.LinearFilter,
			magFilter: three.LinearFilter,
			...targetOptions
		};
		const renderTarget = _isWebGPU(renderer) ? new three.RenderTarget(width, height, options) : new three.WebGLRenderTarget(width, height, options);
		const prevTarget = renderer.getRenderTarget();
		/** @type {import('three/webgpu').Renderer} */ renderer.setRenderTarget(renderTarget);
		renderer.render(scene, camera);
		/** @type {import('three/webgpu').Renderer} */ renderer.setRenderTarget(prevTarget);
		return renderTarget;
	}
	/**
	* Disposes meshes in a {@link THREE.Object3D} and removes them from the {@link THREE.Scene} specified.
	* @param {THREE.Scene|THREE.Object3D} group - The scene or group to dispose meshes from.
	* @param {THREE.Scene} [scene] - The scene to remove the meshes from, if provided.
	* @package
	*/
	function _disposeMany(group, scene) {
		/**
		* Disposes a single material along with its texture map.
		* @param {THREE.MeshBasicMaterial} material - The material with `map` property to dispose.
		*/
		function disposeMaterial(material) {
			if (material.map) material.map.dispose();
			material.dispose();
		}
		group.traverse((child) => {
			if (!(child instanceof three.Mesh)) return;
			if (child.geometry) child.geometry.dispose();
			if (child.material) if (Array.isArray(child.material)) for (const material of child.material) disposeMaterial(material);
			else disposeMaterial(child.material);
		});
		if (scene && scene instanceof three.Scene) scene.remove(group);
		group.children = [];
	}
	const ModelIcon = {
		create(charModel, renderer, options = {}) {
			let { width = 256, height = 256, scene, camera, canvas } = options;
			if (!scene) {
				scene = new three.Scene();
				scene.background = null;
			}
			scene.add(charModel.meshes.clone());
			if (!camera) camera = this.getCamera();
			const state = this._saveRendererState(renderer);
			renderer.setRenderTarget(null);
			renderer.setSize(width, height, false);
			renderer.render(scene, camera);
			canvas = this._copyRendererToCanvas(renderer, canvas);
			this._restoreRendererState(renderer, state);
			return canvas;
		},
		getCamera() {
			const camera = new three.PerspectiveCamera(9.8762, 1, 500, 1e3);
			camera.position.set(0, 34.5, 600);
			return camera;
		},
		textureToCanvas(texture, renderer, { flipY = true, canvas } = {}) {
			const scene = new three.Scene();
			scene.background = null;
			const material = new three.MeshBasicMaterial({
				side: three.DoubleSide,
				map: texture,
				transparent: true
			});
			/** Full-screen quad. */
			const plane = new three.PlaneGeometry(2, 2);
			const mesh = new three.Mesh(plane, material);
			scene.add(mesh);
			/** Ortho camera filling whole screen. */
			const camera = _getIdentCamera(flipY);
			const state = this._saveRendererState(renderer);
			renderer.setRenderTarget(null);
			const { width, height } = texture.image;
			renderer.setSize(width, height, false);
			renderer.outputColorSpace = three.ColorManagement ? three.ColorManagement.workingColorSpace : "";
			renderer.render(scene, camera);
			canvas = this._copyRendererToCanvas(renderer, canvas);
			material.dispose();
			plane.dispose();
			scene.remove(mesh);
			this._restoreRendererState(renderer, state);
			return canvas;
		},
		_saveRendererState(renderer) {
			const size = /* @__PURE__ */ new three.Vector2();
			renderer.getSize(size);
			return {
				target: renderer.getRenderTarget(),
				colorSpace: renderer.outputColorSpace,
				size
			};
		},
		_restoreRendererState(renderer, state) {
			/** @type {import('three/webgpu').Renderer} */ renderer.setRenderTarget(state.target);
			renderer.outputColorSpace = state.colorSpace;
			renderer.setSize(state.size.x, state.size.y, false);
		},
		_copyRendererToCanvas(renderer, canvas) {
			const sourceCanvas = renderer.domElement;
			if (canvas !== void 0 && !(canvas instanceof HTMLCanvasElement)) throw new Error("copyRendererToCanvas: canvas is neither a valid canvas nor undefined.");
			const targetCanvas = canvas || document.createElement("canvas");
			targetCanvas.width = sourceCanvas.width;
			targetCanvas.height = sourceCanvas.height;
			/** @type {CanvasRenderingContext2D} */ targetCanvas.getContext("2d").drawImage(sourceCanvas, 0, 0);
			return targetCanvas;
		}
	};
	/**
	* Converts StudioCharInfo to FFLiCharInfo type needed by FFL internally.
	* @param {Uint8Array} src - The raw, unobfuscated StudioCharInfo data.
	* @returns {Uint8Array} Byte form of FFLiCharInfo.
	* @package
	*/
	function _studioToFFLiCharInfo(src) {
		const dst = new Uint8Array(FFLiCharInfo_size);
		const view = new DataView(dst.buffer);
		view.setUint32(128, commonColorMask(src[0]), true);
		dst[124] = src[1];
		dst[176] = src[2];
		dst[44] = src[3];
		view.setUint32(36, commonColorMask(src[4]), true);
		dst[48] = src[5];
		dst[40] = src[6];
		dst[32] = src[7];
		dst[52] = src[8];
		dst[56] = src[9];
		dst[72] = src[10];
		view.setUint32(64, commonColorMask(src[11]), true);
		dst[76] = src[12];
		dst[68] = src[13];
		dst[60] = src[14];
		dst[80] = src[15];
		dst[84] = src[16];
		dst[8] = src[17];
		dst[16] = src[18];
		dst[4] = src[19];
		dst[12] = src[20];
		dst[236] = src[21];
		dst[224] = src[22];
		view.setUint32(144, commonColorMask(src[23]), true);
		dst[148] = src[24];
		dst[140] = src[25];
		dst[152] = src[26];
		view.setUint32(24, commonColorMask(src[27]), true);
		dst[28] = src[28];
		dst[20] = src[29];
		dst[172] = src[30];
		dst[160] = src[31];
		dst[156] = src[32];
		dst[164] = src[33];
		dst[168] = src[34];
		dst[112] = src[35];
		view.setUint32(104, commonColorMask(src[36]), true);
		dst[108] = src[37];
		dst[100] = src[38];
		dst[116] = src[39];
		dst[132] = src[40];
		dst[120] = src[41];
		dst[136] = src[42];
		dst[92] = src[43];
		dst[88] = src[44];
		dst[96] = src[45];
		dst[260] = 3;
		return dst;
	}
	/**
	* @param {Uint8Array} data - Obfuscated Studio URL data.
	* @returns {Uint8Array} Decoded Uint8Array representing CharInfoStudio.
	* @package
	*/
	function _studioURLObfuscationDecode(data) {
		const decodedData = new Uint8Array(data);
		let previous = decodedData[0];
		for (let i = 1; i < 48; i++) {
			const encodedByte = decodedData[i];
			const original = (encodedByte - 7 + 256) % 256;
			decodedData[i - 1] = original ^ previous;
			previous = encodedByte;
		}
		return decodedData.slice(0, 46);
	}

//#endregion
exports.CharModel = CharModel;
exports.ExpressionNotSet = ExpressionNotSet;
exports.FFL = FFL;
exports.FFLAge = FFLAge;
exports.FFLCharModelDescDefault = FFLCharModelDescDefault;
exports.FFLExpression = FFLExpression;
exports.FFLGender = FFLGender;
exports.FFLModelFlag = FFLModelFlag;
exports.FFLModulateMode = FFLModulateMode;
exports.FFLModulateType = FFLModulateType;
exports.FFLRace = FFLRace;
exports.FFLResultException = FFLResultException;
exports.FFLiVerifyReasonException = FFLiVerifyReasonException;
exports.GeometryConversion = GeometryConversion;
exports.ModelIcon = ModelIcon;
exports.ModelTexturesConverter = ModelTexturesConverter;
exports.PantsColor = PantsColor;
exports.TextureShaderMaterial = TextureShaderMaterial;
exports.checkExpressionChangesShapes = checkExpressionChangesShapes;
exports.createAndRenderToTarget = createAndRenderToTarget;
exports.getRandomCharInfo = getRandomCharInfo;
exports.makeExpressionFlag = makeExpressionFlag;
exports.matSupportsFFL = matSupportsFFL;
exports.pantsColors = pantsColors;
exports.verifyCharInfo = verifyCharInfo;
return exports;
})({}, THREE);